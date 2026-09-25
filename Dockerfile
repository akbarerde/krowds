FROM golang:1.27.1-alpine AS build

WORKDIR /src

COPY go.work ./
COPY services/go.mod services/go.sum ./services/
WORKDIR /src/services
RUN go mod download

COPY services/ ./
RUN CGO_ENABLED=0 GOOS=linux go build \
    -buildvcs=false \
    -trimpath \
    -ldflags="-s -w" \
    -o /out/services \
    ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot

ENV APP_ENV=production \
    GIN_MODE=release \
    LOG_LEVEL=info

COPY --from=build /out/services /services
EXPOSE 8080
ENTRYPOINT ["/services"]
