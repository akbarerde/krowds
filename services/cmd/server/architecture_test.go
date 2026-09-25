package main

import (
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"io/fs"
	"os"
	"path/filepath"
	"regexp"
	"runtime"
	"strconv"
	"strings"
	"testing"
)

const (
	projectInternalPrefix = "github.com/krowds/krowds/services/internal/"
	projectModulesPrefix  = projectInternalPrefix + "modules/"
	projectContractsPath  = projectInternalPrefix + "contracts/"
	projectEventsPath     = projectInternalPrefix + "events/"
	projectPlatformPrefix = projectInternalPrefix + "platform/"
	projectHTTPXRoot      = projectPlatformPrefix + "httpx"
	projectHTTPXPath      = projectHTTPXRoot + "/"
	projectTransportPath  = projectInternalPrefix + "transport/"
	projectTransportHTTP  = projectTransportPath + "http"

	ginImportPath     = "github.com/gin-gonic/gin"
	ginCORSImportPath = "github.com/gin-contrib/cors"
)

var moduleNamePattern = regexp.MustCompile(`^[a-z][a-z0-9_]*$`)

type moduleSource struct {
	Composition bool
	Layer       string
}

// TestModularMonolithCleanArchitecture protects the dependency direction of every
// business module. Cross-module contracts belong in internal/contracts or
// internal/events, never in another module's implementation tree.
func TestModularMonolithCleanArchitecture(t *testing.T) {
	servicesRoot := resolveServicesRoot(t)
	modulesRoot := filepath.Join(servicesRoot, "internal", "modules")
	moduleNames := readBusinessModuleNames(t, modulesRoot)

	for _, moduleName := range moduleNames {
		checkModuleImports(t, modulesRoot, moduleName)
	}

	checkPureSharedPackages(t, servicesRoot)
	checkTechnicalPackageBoundaries(t, servicesRoot)
}

func TestModuleLayout(t *testing.T) {
	servicesRoot := resolveServicesRoot(t)
	modulesRoot := filepath.Join(servicesRoot, "internal", "modules")
	moduleNames := readBusinessModuleNames(t, modulesRoot)

	for _, moduleName := range moduleNames {
		moduleRoot := filepath.Join(modulesRoot, moduleName)
		entries, err := os.ReadDir(moduleRoot)
		if err != nil {
			t.Fatalf("read module %s: %v", moduleName, err)
		}

		allowedDirectories := map[string]struct{}{
			"application":    {},
			"delivery":       {},
			"domain":         {},
			"infrastructure": {},
		}
		hasModuleFile := false

		for _, entry := range entries {
			switch {
			case entry.Name() == "module.go" && !entry.IsDir():
				hasModuleFile = true
			case entry.IsDir():
				if _, ok := allowedDirectories[entry.Name()]; !ok {
					t.Errorf("module %s contains unrecognized top-level directory %q", moduleName, entry.Name())
				}
			default:
				t.Errorf("module %s contains unrecognized top-level entry %q", moduleName, entry.Name())
			}
		}

		if !hasModuleFile {
			t.Errorf("module %s is missing module.go", moduleName)
		} else {
			checkModuleConstructor(t, filepath.Join(moduleRoot, "module.go"), moduleName)
		}

		for directory := range allowedDirectories {
			path := filepath.Join(moduleRoot, directory)
			info, err := os.Stat(path)
			if err != nil || !info.IsDir() {
				t.Errorf("module %s is missing required directory %s", moduleName, directory)
			}
		}

		deliveryRoot := filepath.Join(moduleRoot, "delivery")
		deliveryEntries, err := os.ReadDir(deliveryRoot)
		if err != nil {
			t.Errorf("read delivery layer for module %s: %v", moduleName, err)
		} else {
			for _, entry := range deliveryEntries {
				if !entry.IsDir() || entry.Name() != "http" {
					t.Errorf("module %s delivery may only contain the http directory; found %s", moduleName, entry.Name())
				}
			}
		}

		deliveryHTTPDir := filepath.Join(deliveryRoot, "http")
		if info, err := os.Stat(deliveryHTTPDir); err != nil || !info.IsDir() {
			t.Errorf("module %s is missing required directory delivery/http", moduleName)
		}

		for _, directory := range []string{"application", "delivery/http", "domain", "infrastructure"} {
			if !containsProductionGoFile(filepath.Join(moduleRoot, filepath.FromSlash(directory))) {
				t.Errorf("module %s layer %s must contain production Go code", moduleName, directory)
			}
		}

		err = filepath.WalkDir(moduleRoot, func(path string, entry fs.DirEntry, walkErr error) error {
			if walkErr != nil {
				return walkErr
			}
			if !entry.IsDir() && entry.Name() == "go.mod" {
				relativePath, relErr := filepath.Rel(servicesRoot, path)
				if relErr != nil {
					return relErr
				}
				t.Errorf("nested Go module found at %s; modular monolith must remain one Go module", relativePath)
			}
			return nil
		})
		if err != nil {
			t.Fatalf("walk module %s: %v", moduleName, err)
		}
	}
}

func TestSingleDeployable(t *testing.T) {
	servicesRoot := resolveServicesRoot(t)
	expectedEntrypoint := filepath.Join(servicesRoot, "cmd", "server", "main.go")
	goModuleCount := 0
	mainPackageDirectories := map[string]struct{}{}
	mainFunctionCount := 0

	err := filepath.WalkDir(servicesRoot, func(path string, entry fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if entry.IsDir() {
			return nil
		}

		if entry.Name() == "go.mod" {
			goModuleCount++
			if filepath.Clean(path) != filepath.Join(servicesRoot, "go.mod") {
				t.Errorf("unexpected Go module at %s", path)
			}
		}

		if filepath.Ext(path) != ".go" || strings.HasSuffix(entry.Name(), "_test.go") {
			return nil
		}

		file, parseErr := parser.ParseFile(token.NewFileSet(), path, nil, 0)
		if parseErr != nil {
			return parseErr
		}
		if file.Name.Name == "main" {
			relativeDirectory, relErr := filepath.Rel(servicesRoot, filepath.Dir(path))
			if relErr != nil {
				return relErr
			}
			mainPackageDirectories[filepath.ToSlash(relativeDirectory)] = struct{}{}
		}
		for _, declaration := range file.Decls {
			function, ok := declaration.(*ast.FuncDecl)
			if ok && function.Recv == nil && function.Name.Name == "main" {
				mainFunctionCount++
				if filepath.Clean(path) != expectedEntrypoint {
					t.Errorf("func main must only exist in %s", expectedEntrypoint)
				}
			}
		}
		return nil
	})
	if err != nil {
		t.Fatalf("walk services: %v", err)
	}

	if goModuleCount != 1 {
		t.Errorf("Go module count = %d, want 1", goModuleCount)
	}
	if len(mainPackageDirectories) != 1 {
		t.Errorf("production main package directories = %v, want only cmd/server", mainPackageDirectories)
	}
	if _, ok := mainPackageDirectories[filepath.ToSlash(filepath.Join("cmd", "server"))]; !ok {
		t.Errorf("cmd/server must be the only production main package; found %v", mainPackageDirectories)
	}
	if mainFunctionCount != 1 {
		t.Errorf("production func main count = %d, want 1", mainFunctionCount)
	}

	commandEntries, err := os.ReadDir(filepath.Join(servicesRoot, "cmd"))
	if err != nil {
		t.Fatalf("read services/cmd: %v", err)
	}
	for _, entry := range commandEntries {
		if !entry.IsDir() || entry.Name() != "server" {
			t.Errorf("services/cmd may only contain the server directory; found %s", entry.Name())
		}
	}
}

func TestAllModulesComposed(t *testing.T) {
	servicesRoot := resolveServicesRoot(t)
	moduleNames := readBusinessModuleNames(t, filepath.Join(servicesRoot, "internal", "modules"))
	knownModulePaths := make(map[string]struct{}, len(moduleNames))
	for _, moduleName := range moduleNames {
		knownModulePaths[projectModulesPrefix+moduleName] = struct{}{}
	}
	entrypoint := filepath.Join(servicesRoot, "cmd", "server", "main.go")
	file, err := parser.ParseFile(token.NewFileSet(), entrypoint, nil, 0)
	if err != nil {
		t.Fatalf("parse entrypoint: %v", err)
	}

	moduleAliases := make(map[string]string, len(moduleNames))
	transportAlias := ""
	for _, importSpec := range file.Imports {
		importPath, importErr := strconv.Unquote(importSpec.Path.Value)
		if importErr != nil {
			t.Fatalf("parse import in %s: %v", entrypoint, importErr)
		}

		alias := ""
		if importSpec.Name != nil {
			alias = importSpec.Name.Name
		}

		if strings.HasPrefix(importPath, projectModulesPrefix) {
			if _, known := knownModulePaths[importPath]; !known {
				t.Errorf("composition root imports unknown module path %s", importPath)
			}
		}

		for _, moduleName := range moduleNames {
			if importPath == projectModulesPrefix+moduleName {
				if alias == "" {
					alias = moduleName
				}
				moduleAliases[moduleName] = alias
			}
		}
		if importPath == projectTransportHTTP {
			transportAlias = alias
			if transportAlias == "" {
				transportAlias = "http"
			}
		}
	}

	instances := moduleInstancesByAlias(file, moduleAliases)
	routerArguments := routerModuleArguments(file, transportAlias)

	for _, moduleName := range moduleNames {
		alias, ok := moduleAliases[moduleName]
		if !ok {
			t.Errorf("module %s is not imported by the composition root", moduleName)
			continue
		}
		instance, ok := instances[alias]
		if !ok {
			t.Errorf("module %s is imported but not constructed by the composition root", moduleName)
			continue
		}
		if !routerArguments[instance] {
			t.Errorf("module instance %s for %s is not passed to transport.NewRouter", instance, moduleName)
		}
	}

	if len(moduleAliases) != len(moduleNames) {
		t.Errorf("composition root imports %d modules, want %d", len(moduleAliases), len(moduleNames))
	}
	for argument := range routerArguments {
		if !containsValue(t, instances, argument) {
			t.Errorf("transport.NewRouter receives unknown module instance %s", argument)
		}
	}
}

func TestModuleImportPolicy(t *testing.T) {
	tests := []struct {
		name       string
		source     moduleSource
		moduleName string
		importPath string
		allowed    bool
	}{
		{name: "domain rejects database/sql", source: moduleSource{Layer: "domain"}, moduleName: "system", importPath: "database/sql", allowed: false},
		{name: "domain rejects Gin", source: moduleSource{Layer: "domain"}, moduleName: "system", importPath: ginImportPath, allowed: false},
		{name: "domain rejects platform", source: moduleSource{Layer: "domain"}, moduleName: "system", importPath: projectHTTPXPath + "problem", allowed: false},
		{name: "domain allows own domain", source: moduleSource{Layer: "domain"}, moduleName: "system", importPath: projectModulesPrefix + "system/domain", allowed: true},
		{name: "application rejects net/http", source: moduleSource{Layer: "application"}, moduleName: "system", importPath: "net/http", allowed: false},
		{name: "application rejects Gin", source: moduleSource{Layer: "application"}, moduleName: "system", importPath: ginImportPath, allowed: false},
		{name: "application allows context", source: moduleSource{Layer: "application"}, moduleName: "system", importPath: "context", allowed: true},
		{name: "application allows own domain", source: moduleSource{Layer: "application"}, moduleName: "system", importPath: projectModulesPrefix + "system/domain", allowed: true},
		{name: "application rejects delivery", source: moduleSource{Layer: "application"}, moduleName: "system", importPath: projectModulesPrefix + "system/delivery/http", allowed: false},
		{name: "application rejects infrastructure", source: moduleSource{Layer: "application"}, moduleName: "system", importPath: projectModulesPrefix + "system/infrastructure/dependency", allowed: false},
		{name: "application rejects another module", source: moduleSource{Layer: "application"}, moduleName: "system", importPath: projectModulesPrefix + "billing/domain", allowed: false},
		{name: "delivery allows Gin", source: moduleSource{Layer: "delivery"}, moduleName: "system", importPath: ginImportPath, allowed: true},
		{name: "delivery allows application", source: moduleSource{Layer: "delivery"}, moduleName: "system", importPath: projectModulesPrefix + "system/application", allowed: true},
		{name: "delivery allows HTTP platform", source: moduleSource{Layer: "delivery"}, moduleName: "system", importPath: projectHTTPXPath + "problem", allowed: true},
		{name: "delivery rejects infrastructure", source: moduleSource{Layer: "delivery"}, moduleName: "system", importPath: projectModulesPrefix + "system/infrastructure/dependency", allowed: false},
		{name: "infrastructure allows application", source: moduleSource{Layer: "infrastructure"}, moduleName: "system", importPath: projectModulesPrefix + "system/application", allowed: true},
		{name: "infrastructure allows external adapter", source: moduleSource{Layer: "infrastructure"}, moduleName: "system", importPath: "github.com/lib/pq", allowed: true},
		{name: "infrastructure rejects Gin", source: moduleSource{Layer: "infrastructure"}, moduleName: "system", importPath: ginImportPath, allowed: false},
		{name: "infrastructure rejects delivery", source: moduleSource{Layer: "infrastructure"}, moduleName: "system", importPath: projectModulesPrefix + "system/delivery/http", allowed: false},
		{name: "composition allows own layers", source: moduleSource{Composition: true}, moduleName: "system", importPath: projectModulesPrefix + "system/infrastructure/dependency", allowed: true},
		{name: "composition rejects config", source: moduleSource{Composition: true}, moduleName: "system", importPath: projectInternalPrefix + "config", allowed: false},
		{name: "domain allows pure shared contract", source: moduleSource{Layer: "domain"}, moduleName: "system", importPath: projectContractsPath + "identity", allowed: true},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			violation := importPolicyViolation(test.moduleName, test.source, test.importPath)
			if test.allowed && violation != "" {
				t.Fatalf("expected import to be allowed, got %q", violation)
			}
			if !test.allowed && violation == "" {
				t.Fatal("expected import to be rejected")
			}
		})
	}
}

func TestModuleSourceClassification(t *testing.T) {
	tests := []struct {
		path        string
		wantLayer   string
		composition bool
		allowed     bool
	}{
		{path: "module.go", composition: true, allowed: true},
		{path: "domain/health.go", wantLayer: "domain", allowed: true},
		{path: "application/service.go", wantLayer: "application", allowed: true},
		{path: "delivery/http/handler.go", wantLayer: "delivery", allowed: true},
		{path: "infrastructure/dependency/readiness.go", wantLayer: "infrastructure", allowed: true},
		{path: "delivery/worker.go", allowed: false},
		{path: "usecases/order.go", allowed: false},
		{path: "helpers.go", allowed: false},
	}

	for _, test := range tests {
		t.Run(test.path, func(t *testing.T) {
			source, ok := classifyModuleSource(test.path)
			if ok != test.allowed {
				t.Fatalf("allowed = %v, want %v", ok, test.allowed)
			}
			if ok && (source.Layer != test.wantLayer || source.Composition != test.composition) {
				t.Fatalf("source = %#v, want layer=%q composition=%v", source, test.wantLayer, test.composition)
			}
		})
	}
}

func resolveServicesRoot(t *testing.T) string {
	t.Helper()
	_, currentFile, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("resolve architecture test path")
	}
	return filepath.Clean(filepath.Join(filepath.Dir(currentFile), "..", ".."))
}

func readBusinessModuleNames(t *testing.T, modulesRoot string) []string {
	t.Helper()
	entries, err := os.ReadDir(modulesRoot)
	if err != nil {
		t.Fatalf("read modules directory: %v", err)
	}

	moduleNames := make([]string, 0, len(entries))
	for _, entry := range entries {
		if !entry.IsDir() {
			t.Errorf("internal/modules may only contain module directories; found %q", entry.Name())
			continue
		}
		if !moduleNamePattern.MatchString(entry.Name()) {
			t.Errorf("module name %q must match %s", entry.Name(), moduleNamePattern)
			continue
		}
		moduleNames = append(moduleNames, entry.Name())
	}
	if len(moduleNames) == 0 {
		t.Fatal("expected at least one business module")
	}
	return moduleNames
}

func checkModuleConstructor(t *testing.T, path, moduleName string) {
	t.Helper()
	file, err := parser.ParseFile(token.NewFileSet(), path, nil, 0)
	if err != nil {
		t.Fatalf("parse %s: %v", path, err)
	}
	if file.Name.Name != moduleName {
		t.Errorf("%s package = %q, want %q", path, file.Name.Name, moduleName)
	}
	for _, declaration := range file.Decls {
		function, ok := declaration.(*ast.FuncDecl)
		if ok && function.Recv == nil && function.Name.Name == "New" {
			return
		}
	}
	t.Errorf("%s must expose a module constructor named New", path)
}

func containsProductionGoFile(root string) bool {
	found := false
	_ = filepath.WalkDir(root, func(path string, entry fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if !entry.IsDir() && filepath.Ext(path) == ".go" && !strings.HasSuffix(entry.Name(), "_test.go") {
			found = true
			return fs.SkipAll
		}
		return nil
	})
	return found
}

func checkModuleImports(t *testing.T, modulesRoot, moduleName string) {
	t.Helper()
	moduleRoot := filepath.Join(modulesRoot, moduleName)

	err := filepath.WalkDir(moduleRoot, func(path string, entry fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if entry.IsDir() || filepath.Ext(path) != ".go" || strings.HasSuffix(entry.Name(), "_test.go") {
			return nil
		}

		relativePath, relErr := filepath.Rel(moduleRoot, path)
		if relErr != nil {
			return relErr
		}
		source, ok := classifyModuleSource(relativePath)
		if !ok {
			t.Errorf("%s/%s is outside the required module layers", moduleName, filepath.ToSlash(relativePath))
			return nil
		}

		file, parseErr := parser.ParseFile(token.NewFileSet(), path, nil, parser.ImportsOnly)
		if parseErr != nil {
			return fmt.Errorf("parse %s: %w", relativePath, parseErr)
		}
		for _, importSpec := range file.Imports {
			importPath, unquoteErr := strconv.Unquote(importSpec.Path.Value)
			if unquoteErr != nil {
				return fmt.Errorf("parse import in %s: %w", relativePath, unquoteErr)
			}
			if violation := importPolicyViolation(moduleName, source, importPath); violation != "" {
				t.Errorf("%s/%s: %s", moduleName, filepath.ToSlash(relativePath), violation)
			}
		}
		return nil
	})
	if err != nil {
		t.Fatalf("walk module %s: %v", moduleName, err)
	}
}

func classifyModuleSource(relativePath string) (moduleSource, bool) {
	slashPath := filepath.ToSlash(relativePath)
	if slashPath == "module.go" {
		return moduleSource{Composition: true}, true
	}

	parts := strings.Split(slashPath, "/")
	if len(parts) < 2 {
		return moduleSource{}, false
	}
	switch parts[0] {
	case "domain", "application", "infrastructure":
		return moduleSource{Layer: parts[0]}, true
	case "delivery":
		if parts[1] == "http" {
			return moduleSource{Layer: "delivery"}, true
		}
	}
	return moduleSource{}, false
}

func importPolicyViolation(moduleName string, source moduleSource, importPath string) string {
	if strings.HasPrefix(importPath, projectModulesPrefix) {
		importedLayer, ownModule := ownModuleImportLayer(moduleName, importPath)
		if !ownModule {
			return fmt.Sprintf("module %s must not import another module: %s", moduleName, importPath)
		}
		if source.Composition {
			if importedLayer == "" {
				return fmt.Sprintf("module composition must not import its own package root: %s", importPath)
			}
			return ""
		}
		if importedLayer == "" {
			return fmt.Sprintf("inner layer must not import the module composition root: %s", importPath)
		}
	} else if strings.HasPrefix(importPath, projectInternalPrefix) && source.Composition {
		return fmt.Sprintf("module composition must not depend on shared technical wiring: %s", importPath)
	}

	if isPureSharedImport(importPath) {
		return ""
	}

	if source.Composition {
		return ""
	}

	switch source.Layer {
	case "domain":
		if isDomainTechnicalStandardImport(importPath) {
			return fmt.Sprintf("domain must not depend on technical standard-library package: %s", importPath)
		}
		if isStandardLibraryImport(importPath) {
			return ""
		}
		if layer, ownModule := ownModuleImportLayer(moduleName, importPath); ownModule && layer == "domain" {
			return ""
		}
		return fmt.Sprintf("domain must remain framework-independent: %s", importPath)

	case "application":
		if isApplicationTechnicalStandardImport(importPath) {
			return fmt.Sprintf("application must not depend on technical standard-library package: %s", importPath)
		}
		if isStandardLibraryImport(importPath) {
			return ""
		}
		if layer, ownModule := ownModuleImportLayer(moduleName, importPath); ownModule && (layer == "application" || layer == "domain") {
			return ""
		}
		return fmt.Sprintf("application may depend only on its domain, application, and pure shared contracts: %s", importPath)

	case "delivery":
		if isStandardLibraryImport(importPath) || importPath == ginImportPath || importPath == ginCORSImportPath {
			return ""
		}
		if layer, ownModule := ownModuleImportLayer(moduleName, importPath); ownModule && (layer == "application" || layer == "domain") {
			return ""
		}
		if importPath == projectHTTPXRoot || strings.HasPrefix(importPath, projectHTTPXPath) {
			return ""
		}
		return fmt.Sprintf("delivery must use application ports and approved HTTP adapters only: %s", importPath)

	case "infrastructure":
		if isStandardLibraryImport(importPath) {
			return ""
		}
		if layer, ownModule := ownModuleImportLayer(moduleName, importPath); ownModule && (layer == "application" || layer == "domain") {
			return ""
		}
		if strings.HasPrefix(importPath, projectInternalPrefix) {
			return fmt.Sprintf("infrastructure must not depend on delivery, transport, or technical wiring: %s", importPath)
		}
		if importPath == ginImportPath || importPath == ginCORSImportPath {
			return fmt.Sprintf("infrastructure must not depend on the delivery framework: %s", importPath)
		}
		return ""
	}

	return fmt.Sprintf("unclassified module source cannot import %s", importPath)
}

func ownModuleImportLayer(moduleName, importPath string) (string, bool) {
	moduleRoot := projectModulesPrefix + moduleName
	if importPath == moduleRoot {
		return "", true
	}
	if !strings.HasPrefix(importPath, moduleRoot+"/") {
		return "", false
	}
	remainder := strings.TrimPrefix(importPath, moduleRoot+"/")
	parts := strings.Split(remainder, "/")
	return parts[0], true
}

func isPureSharedImport(importPath string) bool {
	return strings.HasPrefix(importPath, projectContractsPath) || strings.HasPrefix(importPath, projectEventsPath)
}

func isStandardLibraryImport(importPath string) bool {
	firstSegment := importPath
	if index := strings.Index(importPath, "/"); index >= 0 {
		firstSegment = importPath[:index]
	}
	return !strings.Contains(firstSegment, ".")
}

func isDomainTechnicalStandardImport(importPath string) bool {
	if importPath == "context" || importPath == "os" || strings.HasPrefix(importPath, "os/") ||
		importPath == "runtime" || importPath == "sync" || strings.HasPrefix(importPath, "sync/") ||
		strings.HasPrefix(importPath, "database/") || strings.HasPrefix(importPath, "net/") {
		return true
	}
	return false
}

func isApplicationTechnicalStandardImport(importPath string) bool {
	return strings.HasPrefix(importPath, "database/") || strings.HasPrefix(importPath, "net/") ||
		importPath == "os" || strings.HasPrefix(importPath, "os/") || importPath == "runtime"
}

func checkPureSharedPackages(t *testing.T, servicesRoot string) {
	t.Helper()
	for _, relativeRoot := range []string{"internal/contracts", "internal/events"} {
		root := filepath.Join(servicesRoot, filepath.FromSlash(relativeRoot))
		if _, err := os.Stat(root); os.IsNotExist(err) {
			continue
		} else if err != nil {
			t.Fatalf("stat %s: %v", relativeRoot, err)
		}

		err := filepath.WalkDir(root, func(path string, entry fs.DirEntry, walkErr error) error {
			if walkErr != nil {
				return walkErr
			}
			if entry.IsDir() || filepath.Ext(path) != ".go" || strings.HasSuffix(entry.Name(), "_test.go") {
				return nil
			}
			file, parseErr := parser.ParseFile(token.NewFileSet(), path, nil, parser.ImportsOnly)
			if parseErr != nil {
				return parseErr
			}
			relativePath, relErr := filepath.Rel(servicesRoot, path)
			if relErr != nil {
				return relErr
			}
			for _, importSpec := range file.Imports {
				importPath, unquoteErr := strconv.Unquote(importSpec.Path.Value)
				if unquoteErr != nil {
					return unquoteErr
				}
				if isStandardLibraryImport(importPath) || isPureSharedImport(importPath) {
					continue
				}
				t.Errorf("%s must remain a pure contract/event package; forbidden import %s", filepath.ToSlash(relativePath), importPath)
			}
			return nil
		})
		if err != nil {
			t.Fatalf("walk %s: %v", relativeRoot, err)
		}
	}
}

func checkTechnicalPackageBoundaries(t *testing.T, servicesRoot string) {
	t.Helper()
	for _, relativeRoot := range []string{"internal/config", "internal/platform", "internal/transport"} {
		root := filepath.Join(servicesRoot, filepath.FromSlash(relativeRoot))
		if _, err := os.Stat(root); os.IsNotExist(err) {
			continue
		} else if err != nil {
			t.Fatalf("stat %s: %v", relativeRoot, err)
		}

		err := filepath.WalkDir(root, func(path string, entry fs.DirEntry, walkErr error) error {
			if walkErr != nil {
				return walkErr
			}
			if entry.IsDir() || filepath.Ext(path) != ".go" || strings.HasSuffix(entry.Name(), "_test.go") {
				return nil
			}
			file, parseErr := parser.ParseFile(token.NewFileSet(), path, nil, parser.ImportsOnly)
			if parseErr != nil {
				return parseErr
			}
			relativePath, relErr := filepath.Rel(servicesRoot, path)
			if relErr != nil {
				return relErr
			}
			for _, importSpec := range file.Imports {
				importPath, unquoteErr := strconv.Unquote(importSpec.Path.Value)
				if unquoteErr != nil {
					return unquoteErr
				}
				if strings.HasPrefix(importPath, projectModulesPrefix) {
					t.Errorf("technical package %s must not import business module implementation %s", filepath.ToSlash(relativePath), importPath)
				}
			}
			return nil
		})
		if err != nil {
			t.Fatalf("walk %s: %v", relativeRoot, err)
		}
	}
}

func moduleInstancesByAlias(file *ast.File, moduleAliases map[string]string) map[string]string {
	instances := make(map[string]string, len(moduleAliases))
	for _, alias := range moduleAliases {
		instances[alias] = ""
	}

	ast.Inspect(file, func(node ast.Node) bool {
		assignment, ok := node.(*ast.AssignStmt)
		if !ok || len(assignment.Lhs) != len(assignment.Rhs) {
			return true
		}
		for index, expression := range assignment.Rhs {
			call, ok := expression.(*ast.CallExpr)
			if !ok {
				continue
			}
			selector, ok := call.Fun.(*ast.SelectorExpr)
			if !ok || selector.Sel.Name != "New" {
				continue
			}
			identifier, ok := selector.X.(*ast.Ident)
			if !ok {
				continue
			}
			moduleName := ""
			for candidate, alias := range moduleAliases {
				if alias == identifier.Name {
					moduleName = candidate
					break
				}
			}
			if moduleName == "" {
				continue
			}
			if target, ok := assignment.Lhs[index].(*ast.Ident); ok {
				instances[identifier.Name] = target.Name
			}
		}
		return true
	})
	return instances
}

func routerModuleArguments(file *ast.File, transportAlias string) map[string]bool {
	arguments := map[string]bool{}
	if transportAlias == "" {
		return arguments
	}

	ast.Inspect(file, func(node ast.Node) bool {
		call, ok := node.(*ast.CallExpr)
		if !ok || len(call.Args) < 3 {
			return true
		}
		selector, ok := call.Fun.(*ast.SelectorExpr)
		if !ok || selector.Sel.Name != "NewRouter" {
			return true
		}
		identifier, ok := selector.X.(*ast.Ident)
		if !ok || identifier.Name != transportAlias {
			return true
		}
		for _, argument := range call.Args[2:] {
			if argumentIdentifier, ok := argument.(*ast.Ident); ok {
				arguments[argumentIdentifier.Name] = true
			}
		}
		return true
	})
	return arguments
}

func containsValue(t *testing.T, values map[string]string, expected string) bool {
	t.Helper()
	for _, value := range values {
		if value == expected {
			return true
		}
	}
	return false
}
