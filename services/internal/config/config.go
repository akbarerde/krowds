package config

import (
	"fmt"
	"net"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"
)

const (
	defaultAppName      = "krowds-services"
	defaultAppVersion   = "dev"
	defaultHTTPHost     = "0.0.0.0"
	defaultHTTPPort     = 8080
	defaultReadTimeout  = 5 * time.Second
	defaultWriteTimeout = 15 * time.Second
	defaultIdleTimeout  = 60 * time.Second
	defaultShutdownTime = 10 * time.Second
	defaultMaxHeader    = 1 << 20
)

var defaultAllowedOrigins = []string{
	"http://localhost:3000",
	"http://localhost:3001",
	"http://localhost:3002",
	"http://localhost:3003",
	"http://localhost:3004",
}

// Config contains all runtime configuration for the services process.
type Config struct {
	AppName     string
	AppVersion  string
	Environment string
	GinMode     string
	LogLevel    string
	HTTP        HTTPConfig
	CORS        CORSConfig
}

// HTTPConfig contains the HTTP server settings.
type HTTPConfig struct {
	Host            string
	Port            int
	ReadTimeout     time.Duration
	WriteTimeout    time.Duration
	IdleTimeout     time.Duration
	ShutdownTimeout time.Duration
	MaxHeaderBytes  int
}

// Address returns the address passed to net/http.Server.
func (h HTTPConfig) Address() string {
	return net.JoinHostPort(h.Host, strconv.Itoa(h.Port))
}

// CORSConfig contains browser cross-origin settings.
type CORSConfig struct {
	AllowedOrigins   []string
	AllowCredentials bool
}

// Load reads configuration from environment variables and validates the result.
func Load() (Config, error) {
	appName := envOrDefault("APP_NAME", defaultAppName)
	appVersion := envOrDefault("APP_VERSION", defaultAppVersion)
	environment := strings.ToLower(envOrDefault("APP_ENV", "development"))
	ginMode := envOrDefault("GIN_MODE", defaultGinMode(environment))
	logLevel := strings.ToLower(envOrDefault("LOG_LEVEL", defaultLogLevel(environment)))

	port, err := intEnv("HTTP_PORT", defaultHTTPPort)
	if err != nil {
		return Config{}, err
	}

	readTimeout, err := durationEnv("HTTP_READ_TIMEOUT", defaultReadTimeout)
	if err != nil {
		return Config{}, err
	}

	writeTimeout, err := durationEnv("HTTP_WRITE_TIMEOUT", defaultWriteTimeout)
	if err != nil {
		return Config{}, err
	}

	idleTimeout, err := durationEnv("HTTP_IDLE_TIMEOUT", defaultIdleTimeout)
	if err != nil {
		return Config{}, err
	}

	shutdownTimeout, err := durationEnv("HTTP_SHUTDOWN_TIMEOUT", defaultShutdownTime)
	if err != nil {
		return Config{}, err
	}

	maxHeaderBytes, err := intEnv("HTTP_MAX_HEADER_BYTES", defaultMaxHeader)
	if err != nil {
		return Config{}, err
	}

	allowCredentials, err := boolEnv("CORS_ALLOW_CREDENTIALS", true)
	if err != nil {
		return Config{}, err
	}

	allowedOrigins := splitAndTrim(envOrDefault("CORS_ALLOWED_ORIGINS", strings.Join(defaultAllowedOrigins, ",")))

	cfg := Config{
		AppName:     appName,
		AppVersion:  appVersion,
		Environment: environment,
		GinMode:     ginMode,
		LogLevel:    logLevel,
		HTTP: HTTPConfig{
			Host:            envOrDefault("HTTP_HOST", defaultHTTPHost),
			Port:            port,
			ReadTimeout:     readTimeout,
			WriteTimeout:    writeTimeout,
			IdleTimeout:     idleTimeout,
			ShutdownTimeout: shutdownTimeout,
			MaxHeaderBytes:  maxHeaderBytes,
		},
		CORS: CORSConfig{
			AllowedOrigins:   allowedOrigins,
			AllowCredentials: allowCredentials,
		},
	}

	if err := cfg.Validate(); err != nil {
		return Config{}, err
	}

	return cfg, nil
}

// Validate checks whether the configuration can be used safely.
func (c Config) Validate() error {
	if strings.TrimSpace(c.AppName) == "" {
		return fmt.Errorf("APP_NAME must not be empty")
	}
	if strings.TrimSpace(c.AppVersion) == "" {
		return fmt.Errorf("APP_VERSION must not be empty")
	}
	if strings.TrimSpace(c.Environment) == "" {
		return fmt.Errorf("APP_ENV must not be empty")
	}
	if !validEnvironment(c.Environment) {
		return fmt.Errorf("APP_ENV must be one of development, test, or production")
	}
	if c.GinMode != "debug" && c.GinMode != "release" && c.GinMode != "test" {
		return fmt.Errorf("GIN_MODE must be one of debug, release, or test")
	}
	if !validLogLevel(c.LogLevel) {
		return fmt.Errorf("LOG_LEVEL must be one of debug, info, warn, or error")
	}
	if c.Environment == "production" && c.GinMode != "release" {
		return fmt.Errorf("GIN_MODE must be release in production")
	}
	if c.Environment == "production" && c.LogLevel == "debug" {
		return fmt.Errorf("LOG_LEVEL must not be debug in production")
	}
	if strings.TrimSpace(c.HTTP.Host) == "" {
		return fmt.Errorf("HTTP_HOST must not be empty")
	}
	if c.HTTP.Port < 1 || c.HTTP.Port > 65535 {
		return fmt.Errorf("HTTP_PORT must be between 1 and 65535")
	}
	if c.HTTP.ReadTimeout <= 0 || c.HTTP.WriteTimeout <= 0 || c.HTTP.IdleTimeout <= 0 || c.HTTP.ShutdownTimeout <= 0 {
		return fmt.Errorf("HTTP timeouts must be greater than zero")
	}
	if c.HTTP.MaxHeaderBytes <= 0 {
		return fmt.Errorf("HTTP_MAX_HEADER_BYTES must be greater than zero")
	}

	for _, origin := range c.CORS.AllowedOrigins {
		if origin == "*" {
			if c.CORS.AllowCredentials {
				return fmt.Errorf("CORS_ALLOW_CREDENTIALS must be false when CORS_ALLOWED_ORIGINS contains *")
			}
			continue
		}
		if err := validateOrigin(origin); err != nil {
			return fmt.Errorf("invalid CORS origin %q: %w", origin, err)
		}
	}

	return nil
}

func envOrDefault(key, fallback string) string {
	value, ok := os.LookupEnv(key)
	if !ok || strings.TrimSpace(value) == "" {
		return fallback
	}
	return strings.TrimSpace(value)
}

func intEnv(key string, fallback int) (int, error) {
	value, ok := os.LookupEnv(key)
	if !ok || strings.TrimSpace(value) == "" {
		return fallback, nil
	}

	parsed, err := strconv.Atoi(strings.TrimSpace(value))
	if err != nil {
		return 0, fmt.Errorf("%s must be an integer: %w", key, err)
	}
	return parsed, nil
}

func boolEnv(key string, fallback bool) (bool, error) {
	value, ok := os.LookupEnv(key)
	if !ok || strings.TrimSpace(value) == "" {
		return fallback, nil
	}

	parsed, err := strconv.ParseBool(strings.TrimSpace(value))
	if err != nil {
		return false, fmt.Errorf("%s must be a boolean: %w", key, err)
	}
	return parsed, nil
}

func durationEnv(key string, fallback time.Duration) (time.Duration, error) {
	value, ok := os.LookupEnv(key)
	if !ok || strings.TrimSpace(value) == "" {
		return fallback, nil
	}

	parsed, err := time.ParseDuration(strings.TrimSpace(value))
	if err != nil {
		return 0, fmt.Errorf("%s must be a Go duration: %w", key, err)
	}
	return parsed, nil
}

func splitAndTrim(value string) []string {
	if strings.TrimSpace(value) == "" {
		return []string{}
	}

	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	seen := make(map[string]struct{}, len(parts))

	for _, part := range parts {
		origin := strings.TrimSpace(part)
		if origin == "" {
			continue
		}
		if _, exists := seen[origin]; exists {
			continue
		}
		seen[origin] = struct{}{}
		result = append(result, origin)
	}

	return result
}

func validateOrigin(origin string) error {
	parsed, err := url.Parse(origin)
	if err != nil {
		return err
	}
	if parsed.Scheme != "http" && parsed.Scheme != "https" {
		return fmt.Errorf("scheme must be http or https")
	}
	if parsed.Host == "" {
		return fmt.Errorf("host must not be empty")
	}
	if parsed.User != nil {
		return fmt.Errorf("origin must not contain userinfo")
	}
	if (parsed.Path != "" && parsed.Path != "/") || parsed.RawQuery != "" || parsed.Fragment != "" {
		return fmt.Errorf("origin must not contain a path, query, or fragment")
	}
	return nil
}

func validEnvironment(environment string) bool {
	switch environment {
	case "development", "test", "production":
		return true
	default:
		return false
	}
}

func defaultGinMode(environment string) string {
	if environment == "production" {
		return "release"
	}
	if environment == "test" {
		return "test"
	}
	return "debug"
}

func defaultLogLevel(environment string) string {
	if environment == "production" {
		return "info"
	}
	return "debug"
}

func validLogLevel(level string) bool {
	switch level {
	case "debug", "info", "warn", "error":
		return true
	default:
		return false
	}
}
