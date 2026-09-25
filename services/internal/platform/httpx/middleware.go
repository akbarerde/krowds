package httpx

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

const requestIDContextKey = "krowds.request_id"

// RequestIDMiddleware creates or propagates a safe request ID.
func RequestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader(RequestIDHeader)
		if !isValidRequestID(requestID) {
			requestID = newRequestID()
		}

		c.Set(requestIDContextKey, requestID)
		c.Header(RequestIDHeader, requestID)
		c.Next()
	}
}

// AccessLogMiddleware writes one structured log entry for each request.
func AccessLogMiddleware(logger *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		startedAt := time.Now()
		c.Next()

		status := c.Writer.Status()
		level := slog.LevelInfo
		if status >= http.StatusInternalServerError {
			level = slog.LevelError
		} else if status >= http.StatusBadRequest {
			level = slog.LevelWarn
		}

		path := c.Request.URL.Path
		if rawQuery := c.Request.URL.RawQuery; rawQuery != "" {
			path += "?" + rawQuery
		}

		logger.Log(
			c.Request.Context(),
			level,
			"http request",
			"method", c.Request.Method,
			"path", path,
			"status", status,
			"latency_ms", time.Since(startedAt).Milliseconds(),
			"client_ip", c.ClientIP(),
			"request_id", RequestID(c),
			"handler_errors", len(c.Errors),
		)
	}
}

// RecoveryMiddleware converts an unexpected panic into a problem details response.
func RecoveryMiddleware(logger *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			recovered := recover()
			if recovered == nil {
				return
			}

			logger.ErrorContext(
				c.Request.Context(),
				"panic recovered",
				"error", fmt.Sprint(recovered),
				"method", c.Request.Method,
				"path", c.Request.URL.Path,
				"request_id", RequestID(c),
			)
			WriteProblem(
				c,
				http.StatusInternalServerError,
				"internal_server_error",
				"Internal Server Error",
				"An unexpected error occurred.",
			)
		}()

		c.Next()
	}
}

// RequestID returns the current request ID.
func RequestID(c *gin.Context) string {
	value, exists := c.Get(requestIDContextKey)
	if !exists {
		return ""
	}

	requestID, _ := value.(string)
	return requestID
}

func newRequestID() string {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return fmt.Sprintf("fallback-%d", time.Now().UnixNano())
	}
	return hex.EncodeToString(bytes)
}

func isValidRequestID(requestID string) bool {
	if requestID == "" || len(requestID) > 128 {
		return false
	}

	for _, character := range requestID {
		if character < 33 || character > 126 {
			return false
		}
	}
	return true
}
