package logging

import (
	"log/slog"
	"os"
	"strings"
)

// New creates a structured application logger.
func New(level, environment string) *slog.Logger {
	logLevel := parseLevel(level)
	handlerOptions := &slog.HandlerOptions{
		Level:     logLevel,
		AddSource: environment != "production",
	}

	return slog.New(slog.NewJSONHandler(os.Stdout, handlerOptions))
}

func parseLevel(level string) slog.Level {
	switch strings.ToLower(level) {
	case "debug":
		return slog.LevelDebug
	case "warn":
		return slog.LevelWarn
	case "error":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}
