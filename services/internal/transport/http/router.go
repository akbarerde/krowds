package http

import (
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/krowds/krowds/services/internal/config"
	"github.com/krowds/krowds/services/internal/platform/httpx"
)

// Module is the composition boundary implemented by each application module.
type Module interface {
	Name() string
	RegisterRoutes(router gin.IRouter)
}

// NewRouter creates the transport router and installs cross-cutting HTTP concerns.
func NewRouter(cfg config.Config, logger *slog.Logger, modules ...Module) (*gin.Engine, error) {
	gin.SetMode(cfg.GinMode)

	engine := gin.New()
	engine.HandleMethodNotAllowed = true

	if err := engine.SetTrustedProxies(nil); err != nil {
		return nil, err
	}

	engine.Use(
		httpx.RequestIDMiddleware(),
		httpx.AccessLogMiddleware(logger),
		httpx.RecoveryMiddleware(logger),
		cors.New(cors.Config{
			AllowOrigins:     cfg.CORS.AllowedOrigins,
			AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodDelete, http.MethodOptions},
			AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", httpx.RequestIDHeader},
			ExposeHeaders:    []string{httpx.RequestIDHeader},
			AllowCredentials: cfg.CORS.AllowCredentials,
			MaxAge:           12 * time.Hour,
		}),
	)

	moduleNames := make([]string, 0, len(modules))
	seenModuleNames := make(map[string]struct{}, len(modules))
	for _, module := range modules {
		if module == nil {
			return nil, fmt.Errorf("module must not be nil")
		}

		name := strings.TrimSpace(module.Name())
		if name == "" {
			return nil, fmt.Errorf("module name must not be empty")
		}
		if _, exists := seenModuleNames[name]; exists {
			return nil, fmt.Errorf("duplicate module name %q", name)
		}

		seenModuleNames[name] = struct{}{}
		moduleNames = append(moduleNames, name)
		module.RegisterRoutes(engine)
	}

	engine.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"name":        cfg.AppName,
			"version":     cfg.AppVersion,
			"environment": cfg.Environment,
			"modules":     moduleNames,
		})
	})

	engine.NoRoute(func(c *gin.Context) {
		httpx.WriteProblem(c, http.StatusNotFound, "route_not_found", "Not Found", "The requested resource does not exist.")
	})
	engine.NoMethod(func(c *gin.Context) {
		httpx.WriteProblem(c, http.StatusMethodNotAllowed, "method_not_allowed", "Method Not Allowed", "The HTTP method is not supported for this resource.")
	})

	return engine, nil
}
