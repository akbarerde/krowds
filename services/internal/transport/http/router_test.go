package http_test

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/krowds/krowds/services/internal/config"
	"github.com/krowds/krowds/services/internal/modules/system"
	"github.com/krowds/krowds/services/internal/platform/httpx"
	httptransport "github.com/krowds/krowds/services/internal/transport/http"
)

func TestRouter(t *testing.T) {
	router := newTestRouter(t)

	tests := []struct {
		name        string
		method      string
		path        string
		wantStatus  int
		wantCode    string
		wantContent string
	}{
		{
			name:        "module metadata",
			method:      http.MethodGet,
			path:        "/",
			wantStatus:  http.StatusOK,
			wantContent: "application/json; charset=utf-8",
		},
		{
			name:        "liveness",
			method:      http.MethodGet,
			path:        "/health/live",
			wantStatus:  http.StatusOK,
			wantContent: "application/json; charset=utf-8",
		},
		{
			name:        "readiness",
			method:      http.MethodGet,
			path:        "/health/ready",
			wantStatus:  http.StatusOK,
			wantContent: "application/json; charset=utf-8",
		},
		{
			name:        "route not found",
			method:      http.MethodGet,
			path:        "/missing",
			wantStatus:  http.StatusNotFound,
			wantCode:    "route_not_found",
			wantContent: httpx.ContentTypeProblemJSON,
		},
		{
			name:        "method not allowed",
			method:      http.MethodPost,
			path:        "/health/live",
			wantStatus:  http.StatusMethodNotAllowed,
			wantCode:    "method_not_allowed",
			wantContent: httpx.ContentTypeProblemJSON,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			response := performRequest(router, test.method, test.path, "")

			if response.Code != test.wantStatus {
				t.Fatalf("status = %d, want %d; body = %s", response.Code, test.wantStatus, response.Body.String())
			}
			if got := response.Header().Get("Content-Type"); got != test.wantContent {
				t.Fatalf("Content-Type = %q, want %q", got, test.wantContent)
			}
			if response.Header().Get(httpx.RequestIDHeader) == "" {
				t.Fatal("X-Request-ID header is empty")
			}

			if test.wantCode != "" {
				var problem struct {
					Code string `json:"code"`
				}
				if err := json.Unmarshal(response.Body.Bytes(), &problem); err != nil {
					t.Fatalf("decode problem response: %v", err)
				}
				if problem.Code != test.wantCode {
					t.Fatalf("code = %q, want %q", problem.Code, test.wantCode)
				}
			}
		})
	}
}

func TestRouterReportsRegisteredModules(t *testing.T) {
	router := newTestRouter(t)
	response := performRequest(router, http.MethodGet, "/", "")

	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusOK)
	}

	var metadata struct {
		Modules []string `json:"modules"`
	}
	if err := json.Unmarshal(response.Body.Bytes(), &metadata); err != nil {
		t.Fatalf("decode module metadata: %v", err)
	}

	want := []string{"system"}
	if len(metadata.Modules) != len(want) {
		t.Fatalf("modules = %v, want %v", metadata.Modules, want)
	}
	for index := range want {
		if metadata.Modules[index] != want[index] {
			t.Fatalf("modules = %v, want %v", metadata.Modules, want)
		}
	}
}

func TestRouterPropagatesRequestID(t *testing.T) {
	router := newTestRouter(t)
	const requestID = "upstream-request-123"

	response := performRequest(router, http.MethodGet, "/health/live", requestID)
	if got := response.Header().Get(httpx.RequestIDHeader); got != requestID {
		t.Fatalf("X-Request-ID = %q, want %q", got, requestID)
	}
}

func TestRouterRecoversPanic(t *testing.T) {
	router := newTestRouter(t)
	router.GET("/test/panic", func(*gin.Context) {
		panic("test panic")
	})

	response := performRequest(router, http.MethodGet, "/test/panic", "")
	if response.Code != http.StatusInternalServerError {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusInternalServerError)
	}
	if got := response.Header().Get("Content-Type"); got != httpx.ContentTypeProblemJSON {
		t.Fatalf("Content-Type = %q, want %q", got, httpx.ContentTypeProblemJSON)
	}

	var problem struct {
		Code string `json:"code"`
	}
	if err := json.Unmarshal(response.Body.Bytes(), &problem); err != nil {
		t.Fatalf("decode problem response: %v", err)
	}
	if problem.Code != "internal_server_error" {
		t.Fatalf("code = %q, want internal_server_error", problem.Code)
	}
}

func TestRouterRejectsDuplicateModuleNames(t *testing.T) {
	logger := slog.New(slog.NewJSONHandler(io.Discard, nil))
	cfg := config.Config{
		GinMode: gin.TestMode,
		CORS:    config.CORSConfig{AllowedOrigins: []string{"http://localhost:3000"}},
	}

	_, err := httptransport.NewRouter(cfg, logger, testModule{name: "system"}, testModule{name: "system"})
	if err == nil || !strings.Contains(err.Error(), "duplicate module name") {
		t.Fatalf("NewRouter() error = %v, want duplicate module error", err)
	}
}

func TestRouterRejectsNilModule(t *testing.T) {
	logger := slog.New(slog.NewJSONHandler(io.Discard, nil))
	cfg := config.Config{
		GinMode: gin.TestMode,
		CORS:    config.CORSConfig{AllowedOrigins: []string{"http://localhost:3000"}},
	}

	_, err := httptransport.NewRouter(cfg, logger, nil)
	if err == nil || !strings.Contains(err.Error(), "module must not be nil") {
		t.Fatalf("NewRouter() error = %v, want nil module error", err)
	}
}

type testModule struct {
	name string
}

func (m testModule) Name() string {
	return m.name
}

func (testModule) RegisterRoutes(gin.IRouter) {}

func newTestRouter(t *testing.T) *gin.Engine {
	t.Helper()

	logger := slog.New(slog.NewJSONHandler(io.Discard, nil))
	cfg := config.Config{
		AppName:     "test-services",
		AppVersion:  "test",
		Environment: "test",
		GinMode:     gin.TestMode,
		CORS: config.CORSConfig{
			AllowedOrigins:   []string{"http://localhost:3000"},
			AllowCredentials: true,
		},
	}

	router, err := httptransport.NewRouter(cfg, logger, system.New(logger))
	if err != nil {
		t.Fatalf("NewRouter() error = %v", err)
	}
	return router
}

func performRequest(handler http.Handler, method, path, requestID string) *httptest.ResponseRecorder {
	request := httptest.NewRequest(method, path, nil)
	if requestID != "" {
		request.Header.Set(httpx.RequestIDHeader, requestID)
	}
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	return response
}
