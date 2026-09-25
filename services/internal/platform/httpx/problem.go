package httpx

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
)

const (
	ContentTypeProblemJSON = "application/problem+json"
	RequestIDHeader        = "X-Request-ID"
)

// Problem is an RFC 9457 problem details response with an application error code.
type Problem struct {
	Type      string `json:"type"`
	Title     string `json:"title"`
	Status    int    `json:"status"`
	Detail    string `json:"detail,omitempty"`
	Instance  string `json:"instance,omitempty"`
	Code      string `json:"code"`
	RequestID string `json:"request_id,omitempty"`
}

// WriteProblem writes a problem details response.
func WriteProblem(c *gin.Context, status int, code, title, detail string) {
	if title == "" {
		title = http.StatusText(status)
	}

	problem := Problem{
		Type:      "about:blank",
		Title:     title,
		Status:    status,
		Detail:    detail,
		Instance:  c.Request.URL.Path,
		Code:      code,
		RequestID: RequestID(c),
	}

	body, err := json.Marshal(problem)
	if err != nil {
		c.String(http.StatusInternalServerError, "internal server error")
		c.Abort()
		return
	}

	c.Data(status, ContentTypeProblemJSON, body)
	c.Abort()
}
