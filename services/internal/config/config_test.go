package config_test

import (
	"strings"
	"testing"
	"time"

	"github.com/krowds/krowds/services/internal/config"
)

func TestLoad(t *testing.T) {
	t.Setenv("APP_NAME", "test-services")
	t.Setenv("APP_VERSION", "1.2.3")
	t.Setenv("APP_ENV", "test")
	t.Setenv("GIN_MODE", "test")
	t.Setenv("LOG_LEVEL", "warn")
	t.Setenv("HTTP_HOST", "127.0.0.1")
	t.Setenv("HTTP_PORT", "9090")
	t.Setenv("HTTP_READ_TIMEOUT", "3s")
	t.Setenv("HTTP_WRITE_TIMEOUT", "4s")
	t.Setenv("HTTP_IDLE_TIMEOUT", "30s")
	t.Setenv("HTTP_SHUTDOWN_TIMEOUT", "7s")
	t.Setenv("HTTP_MAX_HEADER_BYTES", "2048")
	t.Setenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000, http://localhost:3001,http://localhost:3000")
	t.Setenv("CORS_ALLOW_CREDENTIALS", "true")

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}

	if cfg.AppName != "test-services" || cfg.AppVersion != "1.2.3" {
		t.Fatalf("unexpected app metadata: %+v", cfg)
	}
	if cfg.HTTP.Address() != "127.0.0.1:9090" {
		t.Fatalf("Address() = %q, want 127.0.0.1:9090", cfg.HTTP.Address())
	}
	if cfg.HTTP.ReadTimeout != 3*time.Second || cfg.HTTP.ShutdownTimeout != 7*time.Second {
		t.Fatalf("unexpected timeouts: %+v", cfg.HTTP)
	}
	if len(cfg.CORS.AllowedOrigins) != 2 {
		t.Fatalf("allowed origins = %v, want two unique origins", cfg.CORS.AllowedOrigins)
	}
}

func TestLoadRejectsInvalidPort(t *testing.T) {
	t.Setenv("HTTP_PORT", "70000")

	_, err := config.Load()
	if err == nil || !strings.Contains(err.Error(), "HTTP_PORT") {
		t.Fatalf("Load() error = %v, want HTTP_PORT validation error", err)
	}
}

func TestLoadRejectsWildcardWithCredentials(t *testing.T) {
	t.Setenv("CORS_ALLOWED_ORIGINS", "*")
	t.Setenv("CORS_ALLOW_CREDENTIALS", "true")

	_, err := config.Load()
	if err == nil || !strings.Contains(err.Error(), "CORS_ALLOW_CREDENTIALS") {
		t.Fatalf("Load() error = %v, want wildcard credentials validation error", err)
	}
}

func TestLoadRejectsOriginUserinfo(t *testing.T) {
	t.Setenv("CORS_ALLOWED_ORIGINS", "https://user:pass@example.com")

	_, err := config.Load()
	if err == nil || !strings.Contains(err.Error(), "userinfo") {
		t.Fatalf("Load() error = %v, want origin userinfo validation error", err)
	}
}

func TestLoadRejectsUnknownEnvironment(t *testing.T) {
	t.Setenv("APP_ENV", "prod")

	_, err := config.Load()
	if err == nil || !strings.Contains(err.Error(), "APP_ENV") {
		t.Fatalf("Load() error = %v, want APP_ENV validation error", err)
	}
}

func TestLoadUsesProductionDefaults(t *testing.T) {
	t.Setenv("APP_ENV", "production")
	t.Setenv("GIN_MODE", "")
	t.Setenv("LOG_LEVEL", "")

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}
	if cfg.GinMode != "release" {
		t.Fatalf("GinMode = %q, want release", cfg.GinMode)
	}
	if cfg.LogLevel != "info" {
		t.Fatalf("LogLevel = %q, want info", cfg.LogLevel)
	}
}

func TestLoadRejectsDebugProductionConfig(t *testing.T) {
	t.Setenv("APP_ENV", "production")
	t.Setenv("GIN_MODE", "debug")
	t.Setenv("LOG_LEVEL", "info")

	_, err := config.Load()
	if err == nil || !strings.Contains(err.Error(), "GIN_MODE") {
		t.Fatalf("Load() error = %v, want production GIN_MODE validation error", err)
	}
}
