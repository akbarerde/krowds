package application_test

import (
	"context"
	"errors"
	"testing"

	"github.com/krowds/krowds/services/internal/modules/system/application"
	"github.com/krowds/krowds/services/internal/modules/system/domain"
)

type readinessChecker struct {
	err error
}

func (r readinessChecker) Check(context.Context) error {
	return r.err
}

func TestServiceLive(t *testing.T) {
	service := application.NewService(readinessChecker{})

	health := service.Live(context.Background())
	if health.Status != domain.HealthStatusUp {
		t.Fatalf("status = %q, want %q", health.Status, domain.HealthStatusUp)
	}
}

func TestServiceReady(t *testing.T) {
	service := application.NewService(readinessChecker{})

	health, err := service.Ready(context.Background())
	if err != nil {
		t.Fatalf("Ready() error = %v", err)
	}
	if health.Status != domain.HealthStatusUp {
		t.Fatalf("status = %q, want %q", health.Status, domain.HealthStatusUp)
	}
}

func TestServiceReadyPropagatesDependencyError(t *testing.T) {
	wantErr := errors.New("database unavailable")
	service := application.NewService(readinessChecker{err: wantErr})

	_, err := service.Ready(context.Background())
	if !errors.Is(err, wantErr) {
		t.Fatalf("Ready() error = %v, want %v", err, wantErr)
	}
}
