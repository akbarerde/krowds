package application

import (
	"context"

	"github.com/krowds/krowds/services/internal/modules/system/domain"
)

// ReadinessChecker is an application port for checking runtime dependencies.
type ReadinessChecker interface {
	Check(ctx context.Context) error
}

// Service exposes system health use cases.
type Service struct {
	readiness ReadinessChecker
}

// NewService creates a system application service.
func NewService(readiness ReadinessChecker) *Service {
	return &Service{readiness: readiness}
}

// Live reports whether the process can serve requests.
func (s *Service) Live(_ context.Context) domain.Health {
	return domain.Health{Status: domain.HealthStatusUp}
}

// Ready reports whether required runtime dependencies are available.
func (s *Service) Ready(ctx context.Context) (domain.Health, error) {
	if err := s.readiness.Check(ctx); err != nil {
		return domain.Health{}, err
	}
	return domain.Health{Status: domain.HealthStatusUp}, nil
}
