package http

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/krowds/krowds/services/internal/modules/system/application"
	"github.com/krowds/krowds/services/internal/platform/httpx"
)

type healthResponse struct {
	Status string `json:"status"`
}

type Handler struct {
	service *application.Service
	logger  *slog.Logger
}

// NewHandler creates the system HTTP handler.
func NewHandler(service *application.Service, logger *slog.Logger) *Handler {
	return &Handler{service: service, logger: logger}
}

// Live handles the liveness probe.
func (h *Handler) Live(c *gin.Context) {
	health := h.service.Live(c.Request.Context())
	c.JSON(http.StatusOK, healthResponse{Status: string(health.Status)})
}

// Ready handles the readiness probe.
func (h *Handler) Ready(c *gin.Context) {
	health, err := h.service.Ready(c.Request.Context())
	if err != nil {
		h.logger.ErrorContext(c.Request.Context(), "readiness check failed", "error", err, "request_id", httpx.RequestID(c))
		httpx.WriteProblem(c, http.StatusServiceUnavailable, "service_unavailable", "Service Unavailable", "A required dependency is unavailable.")
		return
	}

	c.JSON(http.StatusOK, healthResponse{Status: string(health.Status)})
}
