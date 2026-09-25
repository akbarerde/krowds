package system

import (
	"log/slog"

	"github.com/gin-gonic/gin"
	"github.com/krowds/krowds/services/internal/modules/system/application"
	httpdelivery "github.com/krowds/krowds/services/internal/modules/system/delivery/http"
	"github.com/krowds/krowds/services/internal/modules/system/infrastructure/dependency"
)

// Module wires the system module and owns its HTTP routes.
type Module struct {
	handler *httpdelivery.Handler
}

// New creates the system module.
func New(logger *slog.Logger) *Module {
	checker := dependency.Readiness{}
	service := application.NewService(checker)
	handler := httpdelivery.NewHandler(service, logger)

	return &Module{handler: handler}
}

// Name identifies the module at the transport composition boundary.
func (m *Module) Name() string {
	return "system"
}

// RegisterRoutes registers the module's routes.
func (m *Module) RegisterRoutes(router gin.IRouter) {
	health := router.Group("/health")
	health.GET("/live", m.handler.Live)
	health.GET("/ready", m.handler.Ready)
}
