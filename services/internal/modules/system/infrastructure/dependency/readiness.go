package dependency

import "context"

// Readiness is the initial dependency checker used before external infrastructure
// such as PostgreSQL or Redis is added. Replace it at the composition root when
// the application starts depending on those systems.
type Readiness struct{}

// Check implements application.ReadinessChecker.
func (Readiness) Check(context.Context) error {
	return nil
}
