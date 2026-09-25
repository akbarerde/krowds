# KROWDS-DES-001 — KROWDS Design System

This document defines the visual language, interaction patterns, layout rules, and quality standards for all KROWDS frontends. Product behavior and scope are defined in [PRODUCT-VISION.md](../01-product/PRODUCT-VISION.md).

| Field | Value |
| --- | --- |
| Document ID | `KROWDS-DES-001` |
| Version | `0.1` |
| Status | `Draft` |
| Last updated | `2026-09-25` |
| Owner | Design System Owner (`TBD`) |
| Applies to | `apps/*` and `packages/ui` |
| Source of truth | `packages/ui/src/styles/globals.css` and `packages/ui` |
| UI foundation | shadcn/ui `b2fA` preset: Nova, neutral, Geist, and Lucide |
| Supported themes | Light and dark tokens; runtime selector not implemented |

The design baseline is active for the current frontend scaffold; the document status remains `Draft` until role-based approval.

## 1. Purpose

KROWDS should feel clear, calm, capable, and dependable. The interface should help people understand where they are, what is happening, and what action is available next.

The design system is intentionally small. Shared primitives establish consistency; each application remains responsible for its own information architecture, page composition, and product-specific workflows.

Use this document when:

- creating a new page or application surface;
- adding or changing a shared component;
- choosing colors, typography, spacing, or motion;
- reviewing a frontend pull request;
- designing loading, empty, error, and success states.

## 2. Design principles

1. **Make the next action obvious.** Use hierarchy, labels, and placement to make the primary action easy to find.
2. **Prefer clarity over decoration.** Every visual treatment must support orientation, meaning, or feedback.
3. **Use shared foundations.** Start with the tokens and primitives in `@krowds/ui` before introducing a new local pattern.
4. **Keep interfaces calm.** Use whitespace, contrast, and hierarchy before adding shadows, gradients, or motion.
5. **Design for real work.** Loading, empty, error, permission, offline, and destructive states are part of the experience.
6. **Keep language human.** Use direct English sentences and specific labels rather than technical or promotional wording.
7. **Make accessibility inherent.** Keyboard access, visible focus, contrast, semantics, and reduced motion are requirements, not enhancements.

## 3. Visual language

KROWDS uses a neutral, editorial foundation with restrained accents:

- neutral surfaces and dark text provide a dependable base;
- rounded surfaces communicate approachability without becoming playful;
- spacing and alignment create hierarchy;
- color is reserved for emphasis, state, and feedback;
- icons support text and never replace essential labels;
- motion is short, purposeful, and unobtrusive.

Avoid visual styles that compete with the product content: excessive glass effects, long shadows, unrelated gradients, dense borders, and purely decorative animation should not become the default.

## 4. Color

### 4.1 Token-first rule

Use semantic tokens instead of raw colors in application components. The shared stylesheet currently exposes the following roles:

| Role | Token | Use |
| --- | --- | --- |
| Page surface | `background` / `foreground` | Main page background and default text |
| Raised surface | `card` / `card-foreground` | Cards and grouped content |
| Floating surface | `popover` / `popover-foreground` | Menus, dialogs, and floating panels |
| Primary action | `primary` / `primary-foreground` | Main action and selected state |
| Secondary action | `secondary` / `secondary-foreground` | Supporting action and grouped controls |
| Quiet surface | `muted` / `muted-foreground` | Subtle backgrounds, metadata, and helper text |
| Accent | `accent` / `accent-foreground` | Local emphasis without a strong brand fill |
| Destructive | `destructive` | Errors and irreversible actions |
| Boundary | `border`, `input` | Dividers, outlines, and form controls |
| Focus | `ring` | Keyboard focus and selection affordances |
| Data series | `chart-1` through `chart-5` | Charts and data visualization |
| Navigation | `sidebar-*` | Persistent navigation surfaces and states |

The light and dark palettes are defined with OKLCH values in `packages/ui/src/styles/globals.css`. Update the token definitions there when the palette changes; do not duplicate palette values in individual applications.

### 4.2 Usage rules

- Use one dominant primary action per region.
- Use `secondary` or `outline` for supporting actions.
- Reserve `destructive` for errors and actions that remove or permanently change data.
- Use `muted-foreground` for secondary information, not for disabled or unavailable text that must remain readable.
- Use status colors together with text, an icon, or a shape. Never communicate status with color alone.
- Keep chart colors distinguishable in both themes and provide labels or patterns where possible.
- Test text and interactive controls against the actual surface they use in both themes.
- Decorative accents may use a distinct color when necessary, but they must not replace semantic tokens for state or interaction.

### 4.3 Contrast

As a baseline, body text should meet WCAG AA contrast, and large text and essential non-text controls should meet the applicable AA thresholds. Do not rely on a design preview alone; verify the rendered light and dark states.

## 5. Typography

### 5.1 Font families

- **Geist Sans** (`--font-geist`) is the default family for interface text, headings, controls, and body copy.
- **Geist Mono** (`--font-geist-mono`) is used for ports, paths, IDs, code, and compact technical metadata.
- **Heading font** resolves to the sans family unless a deliberate product decision changes the token.

Every application should load Geist Sans and Geist Mono in its root layout with the same CSS variable names. Do not introduce a second display or body family without updating this document and reviewing the visual impact across all applications.

### 5.2 Hierarchy

Use a small, predictable type scale:

| Role | Recommended treatment |
| --- | --- |
| Display | Large, semibold heading with tight tracking; reserve it for a primary page statement |
| Page title | Semibold heading with a clear relationship to the page content |
| Section title | Medium or semibold heading that labels a group of content |
| Body | Regular weight, comfortable line height, and a readable measure |
| Metadata | Smaller text with muted foreground; do not use it for essential instructions |
| Technical | Geist Mono for stable values such as IDs, versions, paths, and ports |

Prefer `font-medium` and `font-semibold` for hierarchy. Avoid excessive weight changes, all-caps paragraphs, and long headings. Keep headings within a readable line length, normally between 45 and 75 characters per line.

Use sentence case for headings and labels. Use title case only for product names or established proper nouns.

## 6. Spacing and layout

### 6.1 Spacing rhythm

Use the Tailwind spacing scale and keep related spacing values consistent. The visual rhythm is based on a small 4px increment, with larger gaps created by combining the scale rather than by introducing arbitrary values.

- Use `gap-*` for space between related flex or grid children.
- Use `p-*` or `px-*`/`py-*` for container padding.
- Use `flex flex-col gap-*` for vertical flow when the children are part of one group.
- Use margins sparingly; layout gaps are usually clearer and less fragile.
- Prefer logical spacing utilities such as `ms-*` and `me-*` when supporting writing direction becomes necessary.

Cards use the shared spacing variable: `--spacing(4)` by default and `--spacing(3)` for compact cards. Do not copy those values into a new card implementation.

### 6.2 Page containers

A typical page shell follows this structure:

```tsx
<main className="min-h-dvh bg-background text-foreground">
  <div className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-10">
    <header />
    <main />
    <footer />
  </div>
</main>
```

Use `min-h-dvh` for full-viewport browser surfaces and `min-h-full` when the parent already controls height. Avoid `h-screen` for content that may grow, scroll, or be affected by mobile browser chrome.

Recommended content widths:

- broad application or marketing content: `max-w-6xl` (72rem);
- reading and long-form content: `max-w-3xl` (48rem);
- focused forms: `max-w-md` (28rem) or `max-w-xl` (36rem);
- narrow utility panels: use the smallest width that preserves comfortable reading and touch targets.

### 6.3 Layout principles

- Establish a clear header, content, and footer hierarchy.
- Align page edges with a shared container rather than centering each section independently.
- Use CSS grid for page-level composition and flexbox for local component arrangement.
- Keep the primary content column predictable; avoid changing its width between routes.
- Use cards for grouping related information, not as a substitute for page hierarchy.
- Keep page-specific composition in the application; keep reusable visual primitives in `packages/ui`.

## 7. Responsive behavior

Tailwind breakpoints are the default responsive scale:

| Prefix | Minimum width | Typical use |
| --- | ---: | --- |
| `sm` | 640px | Small adjustments and two-column summaries |
| `md` | 768px | Tablet navigation and medium layouts |
| `lg` | 1024px | Full application navigation and multi-column layouts |
| `xl` | 1280px | Wide content and larger data views |
| `2xl` | 1536px | Additional breathing room on very wide screens |

Design mobile-first unless an existing flow clearly requires another order.

- Preserve the primary action at narrow widths; move secondary actions into a menu or stack when necessary.
- Avoid horizontal scrolling caused by fixed widths. Use `max-w-*`, `min-w-0`, and flexible grid tracks.
- Make tables and dense lists intentionally responsive: switch to stacked records, allow controlled horizontal scrolling, or provide a summary view.
- Keep tap targets comfortable on touch surfaces, especially for navigation and destructive actions.
- Test at narrow mobile, tablet, laptop, and wide desktop widths.

## 8. Shared UI building blocks

> **Mandatory component and style policy**
>
> 1. **Use shadcn/ui Components, Blocks, Charts, and Typeset.** Import and compose the official shadcn/ui building blocks for every visual UI need; do not reimplement them locally.
> 2. **Do not create custom components.** Do not add hand-built buttons, cards, badges, inputs, dialogs, navigation primitives, chart primitives, typography components, or a parallel component library.
> 3. **Follow the approved shadcn/ui style preset.** All styling decisions and additions must follow `--preset b2fA`; do not mix presets or introduce another style system.
> 4. **Extend through supported shadcn/ui mechanisms.** Use existing variants, composition, semantic tokens, and application layout before changing a shared primitive.
> 5. **Use the official shadcn/ui workflow.** When a component, block, chart, or typeset pattern is missing, add or update it in `packages/ui` and keep all application configuration consistent.
>
> These rules apply to visual UI. Non-visual framework integrations, such as service-worker registration, are not visual components.

### Approved style preset

`b2fA` is the only approved shadcn/ui style preset for KROWDS. It defines the Nova visual language, neutral base, Geist typography, Lucide icons, and the shared design tokens used by the applications.

Use the official preset command when applying or synchronizing the approved configuration:

```bash
pnpm dlx shadcn@4.21.0 apply --preset b2fA --cwd apps/web
```

After the preset is applied, use `shadcn add` to add components to the shared UI package. Do not combine components or styles from another preset, replace the shared tokens with a second theme, or hand-edit generated output to create a separate visual system.

### shadcn/ui building blocks

KROWDS uses the complete shadcn/ui design vocabulary. Choose the smallest official surface that solves the design problem:

| Surface | Use it for | KROWDS rule |
| --- | --- | --- |
| **Components** | Buttons, cards, badges, inputs, dialogs, navigation, and other UI primitives | Use the shared component from `@krowds/ui`; do not reimplement it |
| **Blocks** | Complete sections and page compositions such as dashboards, authentication layouts, sidebars, and empty states | Start from an official block and adapt it with KROWDS tokens; do not create a parallel block system |
| **Charts** | Charts, dashboards, metrics, and data visualization | Use the official chart patterns and `chart-1` through `chart-5` tokens; provide accessible labels and never communicate meaning by color alone |
| **Typeset** | Headings, prose, lists, code, and other typography patterns | Use the official typeset patterns with Geist and semantic HTML; do not create a custom typography component |

Blocks may compose Components, but they are not a replacement for the underlying primitives. Charts and Typeset are also part of the approved shadcn/ui system and must follow the same `b2fA` preset as every other visual surface.

### 8.1 Buttons

Use the shared `Button` from `@krowds/ui/components/button`.

| Variant | Use |
| --- | --- |
| `default` | Primary action |
| `outline` | Secondary action that needs a visible boundary |
| `secondary` | Supporting action in a group or panel |
| `ghost` | Low-emphasis action, such as an inline utility |
| `destructive` | Error or irreversible action |
| `link` | Text action that navigates or triggers a lightweight action |

Use the smallest size that remains comfortable for the context. The available sizes are `xs`, `sm`, `default`, `lg`, and icon-specific sizes. Keep icon buttons square and provide an accessible label through visible text or `aria-label`.

For loading actions, preserve the button width, mark the control busy, prevent duplicate submission, and keep the action label understandable. Do not communicate loading with a spinner alone.

### 8.2 Cards

Compose cards with `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, and `CardFooter`.

- Use `CardTitle` for the primary label.
- Use `CardDescription` for supporting context.
- Place a single related action in `CardAction`.
- Use `CardFooter` for metadata or a clear group-level action.
- Choose `size="sm"` for compact summaries; use the default size for normal content.
- Do not nest cards solely to create visual depth.

### 8.3 Badges

Use `Badge` for compact status, category, or environment labels. It is not a button. Choose a variant that reflects meaning, and pair color with readable text. Use monospace text only when the value is technical.

### 8.4 Component ownership

- Put shadcn/ui primitives, variants, and visual tokens in `packages/ui`.
- Keep Blocks, Charts, and Typeset aligned with the same `b2fA` preset and shared tokens.
- Put page-specific composition in the owning application under `apps/<app>` without creating a parallel visual component system.
- Use `@krowds/ui` imports instead of copying components between applications.
- Use `cn()` from `@krowds/ui/lib/utils` for conditional class composition.
- Add or update a shared primitive only through the official shadcn/ui workflow and when the pattern is genuinely reusable across applications.
- Do not introduce custom visual components; solve product-specific presentation with shadcn/ui Components, Blocks, Charts, Typeset, variants, tokens, and layout.

### 8.5 Shared shell and navigation

- `KrowdsBrand` is the shared KROWDS wordmark composition. It uses the official `Button` primitive and Lucide icon; pass the Base UI `render` prop when an application needs its framework link component.
- `AppShell` is the small server-renderable page shell for a brand, optional primary navigation, optional actions, and page content. It establishes only shared orientation; applications own their information architecture and content width.
- Use the official `NavigationMenu` composition for public or header navigation. Use `SidebarProvider`, `Sidebar`, `SidebarInset`, and the `SidebarMenu` family for persistent organization and KREW workspaces. The sidebar supplies its responsive mobile `Sheet`; provide `TooltipProvider` in the owning workspace when sidebar tooltips are used.
- Keep navigation state and route decisions in the owning Next.js application. Shared navigation components receive links and active state; they do not fetch routes or call the backend.

### 8.6 Forms, feedback, and system states

- Compose forms with `FieldSet`, `FieldGroup`, `Field`, `FieldLabel`, `FieldDescription`, and `FieldError`. Add `data-invalid` to `Field` and `aria-invalid` to the control; add `data-disabled` to the field and `disabled` to the control.
- Use `Input`, `Textarea`, `Checkbox`, and `Switch` for the MVP's basic text, choice, and settings controls. Add another official shadcn form primitive only when an approved application flow requires it.
- Use `Alert` for inline warnings, errors, and confirmations; `Spinner` for short operations; `Skeleton` for shape-preserving placeholders; and `Empty` for a real empty result with a recovery action.
- Use `Tabs` only for peer sections of the same context. Use `Separator` for semantic visual division rather than raw border markup.
- Button loading state is composed with `Spinner`, `data-icon="inline-start"`, `disabled`, and an unchanged action label. Visual components do not own submission or business-state rules.

### 8.7 Frontend fixtures and data authority

`createFrontendFixtureClient` from `@krowds/api/fixtures` is a typed, read-only source for synthetic frontend development and tests. It is deliberately not a `KrowdsApiClient`: it performs no network request, handles no mutation, stores no credential, and exposes only registered fixture keys. Create it only with `mode: "development"` or `mode: "test"`, label fixture-backed UI as synthetic where users could confuse it with real data, and fail visibly when a requested fixture is missing.

Fixture data is never authority for authentication, authorization, identity, organization scope, payment, ticket, wristband, activation, shipping, or gate decisions. Real frontends use `createApiClient` from `@krowds/api`; the Go backend remains authoritative for every business fact and transition. Do not add production fallback data, provider calls, or a fixture implementation of the real API client.

## 9. Application layout patterns

### Product surface mapping

| Application | Primary KROWDS surface |
| --- | --- |
| `web` | Public discovery, event browsing, ticket purchase, and e-ticket access |
| `auth` | Registration, login, Google authentication, OTP, and account recovery |
| `org` | Organization onboarding, team, catalog, ticket sales, orders, and organization reporting |
| `krew` | Internal verification, production, quality control, fulfillment, and operational oversight |
| `pwa` | E-ticket, wristband status, and registered access flows |

### Public web

Use a clear brand header, a focused primary statement, a short supporting description, and progressive disclosure. Keep decorative background elements behind the content and out of the reading path.

### Authentication

Use a centered, single-column flow with a concise title, clear field labels, visible validation, and a predictable primary action. Avoid navigation or secondary content that competes with sign-in or registration.

### Workspace and organization tools

Use a persistent navigation model with a responsive drawer or compact navigation for small screens. Keep page title, primary action, filters, and content hierarchy consistent. Prefer tables or lists with clear status and ownership context.

### PWA

Treat standalone and browser display modes as equivalent states. Respect safe-area insets, keep the primary action reachable, and provide clear online, offline, update, and install feedback. Do not hide essential controls behind browser-specific UI.

## 10. Feedback and system states

Every meaningful flow must define these states:

| State | Requirement |
| --- | --- |
| Loading | Preserve context, show progress near the affected content, and avoid unnecessary layout shifts |
| Empty | Explain why the view is empty and offer the next useful action when one exists |
| Error | Say what happened in plain language and provide a recovery path |
| Success | Confirm the completed action near the result and update the relevant view |
| Disabled | Explain why an action is unavailable when the reason is not obvious |
| Offline | Distinguish unavailable network data from an empty result |
| Destructive | Confirm irreversible actions and provide a clear cancellation path |

Use skeleton or placeholder content only when it reflects the shape of the real result. Prefer a concise spinner for short operations and progress indicators for operations with measurable duration.

## 11. Motion and animation

Motion should explain a change, preserve context, or confirm an action. It should not compete with reading or make the interface feel slower.

### 11.1 Timing

| Interaction | Suggested duration | Guidance |
| --- | ---: | --- |
| Hover and press feedback | 100–150ms | Immediate, subtle response |
| Focus, selection, and disclosure | 150–200ms | Smooth state change |
| Small entrance or exit | 200–300ms | Use for content entering the viewport |
| Large layout transition | 300–400ms | Use only when the spatial change is meaningful |

Prefer `ease-out` for entrances and `ease-in` for exits unless the interaction calls for a standard transition. Animate `transform`, `opacity`, `color`, `background-color`, `border-color`, and `box-shadow` rather than properties that cause layout recalculation.

### 11.2 Rules

- Keep transitions short and interruptible.
- Avoid continuous decorative animation in primary work areas.
- Do not animate a loading state so strongly that it distracts from the content being loaded.
- Use `transition-colors`, `transition-transform`, or another specific transition for new UI instead of broad transitions when possible.
- Use list staggering sparingly; a small delay is usually more effective than a long sequence.
- Provide a reduced-motion path for every non-essential animation.
- Never hide important state changes behind animation.

The shared stylesheet includes `tw-animate-css`. Reuse its animation utilities and established component patterns instead of introducing a second animation system.

### 11.3 Reduced motion

Honor `prefers-reduced-motion: reduce`. Reduced motion should remove unnecessary movement while preserving state changes, focus visibility, and progress feedback. Avoid replacing an animation with a sudden visual jump when a short fade or immediate state update is clearer.

## 12. Accessibility

- Use semantic HTML before adding ARIA attributes.
- Give every form control a visible label and associate descriptions and errors programmatically.
- Keep a visible `:focus-visible` state for keyboard users.
- Ensure the full flow works with keyboard alone; do not make hover the only way to reveal an action.
- Use `aria-current`, `aria-expanded`, `aria-selected`, or `aria-busy` when the corresponding state is not conveyed visually.
- Do not use color as the only indicator of error, success, selection, or status.
- Give icon-only controls an accessible name.
- Use polite announcements for background updates and assertive announcements only for urgent interruptions.
- Check zoom, text resizing, keyboard order, focus visibility, contrast, and screen-reader output.
- Test light and dark themes, reduced motion, touch input, and narrow viewports.

## 13. Icons

Use Lucide icons from `lucide-react` unless a product requirement calls for a custom brand mark.

- The default interface size is 16px (`size-4`).
- Use 12–14px for compact metadata and 20–24px for feature or empty-state emphasis.
- Keep the default stroke consistent and allow icons to inherit `currentColor`.
- Use an icon plus text when the meaning is not universally obvious.
- Do not use an icon as the only label for a critical action.
- Keep decorative icons out of the accessibility tree when they add no information.

## 14. Content and voice

- Write in English by default and use plain, direct language.
- Use sentence case for headings, buttons, and labels.
- Start buttons with a clear verb, such as `Create workspace` or `Save changes`.
- Use specific error messages that explain the correction needed.
- Avoid jargon, filler, excessive exclamation marks, and vague labels such as `Submit` when a more precise action is available.
- Keep headings descriptive and make button text independent of surrounding context.
- Use consistent capitalization for product names, environment names, and technical values.
- Keep dates, times, numbers, and units unambiguous.

## 15. PWA and device details

The PWA must remain usable in browser and installed modes.

- Use the existing PWA viewport and theme configuration as the starting point.
- Apply `env(safe-area-inset-*)` when fixed controls or edge-to-edge layouts need safe spacing.
- Provide a visible way to install or explain installation availability when appropriate.
- Make offline and update states understandable without assuming network access.
- Keep touch targets large enough for one-handed use, even when the desktop design uses compact controls.
- Do not rely on hover, native context menus, or browser chrome for essential actions.
- The service worker is registered only in production; design states should work in both development and installed builds.

## 16. Implementation rules

1. Use official shadcn/ui Components, Blocks, Charts, and Typeset for every visual UI need.
2. Do not create custom visual components, chart primitives, typography components, or a parallel component library.
3. Apply the approved shadcn/ui style preset `--preset b2fA` to all styling and additions.
4. Do not mix presets or introduce another style system.
5. Import shared shadcn/ui primitives from `@krowds/ui`.
6. Load the shared stylesheet once in each application root layout.
7. Use semantic CSS variables instead of copying raw palette values.
8. Keep page layouts in the application and shared shadcn/ui primitives in `packages/ui`.
9. Use the shared `cn()` utility for conditional classes.
10. Add or update any visual building block only through the official shadcn/ui workflow after checking whether an existing pattern covers the behavior.
11. Keep shadcn/ui additions routed to the shared UI package and update all application component configuration consistently.
12. Keep the English-first content and design language consistent across all five frontends.
13. Do not put backend data access, authentication logic, or business rules in visual components.
14. Review the rendered result in both themes before marking a visual change complete.

### 16.1 Shared-package validation

Run the narrowest relevant checks while iterating. Before completing a shared frontend foundation change, run:

```bash
pnpm --filter @krowds/ui lint
pnpm --filter @krowds/ui typecheck
pnpm --filter @krowds/ui build
pnpm --filter @krowds/api lint
pnpm --filter @krowds/api typecheck
pnpm --filter @krowds/api build
pnpm --filter @krowds/types lint
pnpm --filter @krowds/types typecheck
pnpm --filter @krowds/types build
pnpm --filter @krowds/hooks lint
pnpm --filter @krowds/hooks typecheck
pnpm --filter @krowds/hooks build
```

A passing TypeScript build validates source-first exports; it does not replace rendered light/dark, responsive, keyboard, or fixture-boundary review.

## 17. Review checklist

Use this checklist for design-related changes:

- [ ] The change uses the appropriate shadcn/ui Component, Block, Chart, or Typeset pattern and does not introduce a custom visual component.
- [ ] The styling follows the approved shadcn/ui preset `--preset b2fA`.
- [ ] The change uses shared tokens and primitives where applicable.
- [ ] The page has a clear content hierarchy and primary action.
- [ ] Light and dark themes have been checked.
- [ ] Text and controls meet contrast requirements.
- [ ] Keyboard navigation and visible focus work.
- [ ] Loading, empty, error, success, offline, and destructive states are considered.
- [ ] The layout works at mobile, tablet, and desktop widths.
- [ ] Touch targets are comfortable where relevant.
- [ ] Motion is purposeful and respects reduced-motion preferences.
- [ ] Icons have accessible names or are correctly hidden when decorative.
- [ ] Content is concise, specific, and written in English.
- [ ] No reusable primitive was duplicated inside an application.

## 18. Changing the design system

For a system-wide change:

1. document the user or product problem;
2. identify affected components and themes;
3. update the shared token or primitive rather than individual screens where possible;
4. review light, dark, responsive, keyboard, and reduced-motion states;
5. update this document when the rule or workflow changes;
6. run the relevant frontend validation tasks before review.

Changes that affect all applications should be evaluated in every frontend, not only in the application where the change was first noticed.
