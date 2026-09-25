package domain

// HealthStatus represents the state of a runtime component.
type HealthStatus string

const (
	HealthStatusUp HealthStatus = "up"
)

// Health is the domain result of a health check.
type Health struct {
	Status HealthStatus
}
