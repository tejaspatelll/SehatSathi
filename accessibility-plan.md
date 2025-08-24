I'll scan your HTML, CSS, and JS to see current accessibility patterns (ARIA, focus styles, keyboard handling, landmarks, labels, alt text) so the plan can be specific to your app. Then I'll propose a prioritized, honest plan aligned to WCAG 2.2 AA.

[5 tools called]

Let me quickly scan key patterns in your HTML, CSS, and JS to tailor the accessibility plan to your app (landmarks, images/alt, focus styles, keyboard handling, modals, routing/page titles). I'll run several searches in parallel.

[5 tools called]

### What I saw in your code (quick scan)

- No ARIA roles/labels or `tabindex` found. Many interactions are `onclick` on non-semantic elements in `Sehat.html` (e.g., `.dashboard-card`, header icons, chips, modals).
- Some focus styles exist via `:focus-visible` for `.btn`, `.nav-item`, and `input`, but many rules use `outline: none` which can hide focus on other interactive elements.
- Little keyboard handling beyond one global `keydown` shortcut in `script.js`.
- Likely SPA-like “pages” switched with `switchPage(...)`; document titles and programmatic focus aren’t being updated.
- Icon-only buttons (SVG) likely need accessible names.

### Prioritized plan aligned to WCAG 2.2 AA

#### Phase 0: Baseline audit (half day)

- Run automated checks (Lighthouse, axe DevTools) and record issues.
- Manual keyboard-only pass across all “pages”: ensure all actions are reachable and operable; log gaps.
- Screen reader smoke test (VoiceOver on macOS) to inspect accessible names and focus order.

#### Phase 1: Quick, safe fixes (1–3 days)

- Add semantic landmarks:
  - Wrap main content in `<main id="main">`, keep existing `header`, `nav`, `footer` if present.
- Add a “Skip to content” link as the first focusable element:

```html
<a class="skip-link" href="#main">Skip to main content</a>
```

- Ensure a visible focus indicator for every focusable element:
  - Extend `:focus-visible` styles to all interactive classes used in `Sehat.html` (e.g., `.dashboard-card`, `.filter-chip`, `.emergency-filter-chip`, `.settings-action-btn`, `.completion-btn`, `.action-btn`, `.support-btn`, `.modal-close-btn`).
  - Remove or override `outline: none` for focusable controls that aren’t already covered.
- Name icon-only controls:
  - Add `aria-label` to icon-only buttons like notification bell, close icons, refresh/export, etc.
- Non-text content:
  - For decorative SVGs inside buttons, set `aria-hidden="true"` and `focusable="false"`.
- Status messaging foundation:
  - Add a visually hidden live region:

```html
<div id="a11y-status" aria-live="polite" class="sr-only"></div>
```

#### Phase 2: Keyboard operability and SPA semantics (3–7 days)

- Replace clickable non-controls with semantic `<button>`/`<a>`:
  - For items like cards and chips that trigger navigation, use `<button>` and dispatch the same function.
  - If it’s a navigation, prefer `<a href="#/route">` with JS enhancement.
- Remove inline `onclick` and bind events in JS:

```js
document.querySelectorAll('[data-action="switch-page"]').forEach((btn) => {
  btn.addEventListener("click", (e) => switchPage(btn.dataset.page, btn));
});
```

- SPA page title and focus management:
  - On `switchPage(view, trigger)`, set `document.title` to the current page’s title and move focus to the page `<h1>` or container with `tabindex="-1"`:

```js
function announceView(title) {
  document.title = `Sehat Sathi – ${title}`;
  const h1 = document.querySelector(`#${currentView} h1`);
  if (h1) h1.setAttribute("tabindex", "-1"), h1.focus();
}
```

- Modal dialogs:
  - Add `role="dialog" aria-modal="true" aria-labelledby="modalTitleId"`.
  - Trap focus inside the modal; close on Esc; restore focus to the opener after close.
- Filter chips, toggles:
  - If exclusive, use a radiogroup pattern; if multi-select, use `aria-pressed` buttons and update state on Space/Enter.

#### Phase 3: WCAG 2.2-specific updates (2–5 days)

- Focus not obscured:
  - Ensure sticky headers/overlays don’t cover focused elements; add `scroll-margin-top` to heading anchors or first focusable in each section; avoid clipping via `overflow: hidden` in focus paths.
- Target size minimum:
  - Ensure all interactive targets are at least 24×24 CSS px, or provide adequate spacing.
  - Update chip/button padding and hit areas; verify on mobile.
- Dragging movements:
  - If any feature relies on drag, provide a single-pointer alternative (e.g., click to start/stop, increment/decrement).
- Consistent help & redundant entry:
  - If there’s help/support, keep its location and label consistent across views.
  - Persist user inputs within multistep flows; don’t require re-entering the same data.
- Accessible authentication:
  - If auth exists, support copy/paste and password managers; avoid cognitive tests.

#### Phase 4: Visual design and layout (1–2 weeks, needs design input)

- Text contrast:
  - Verify 4.5:1 for body text, 3:1 for large text; adjust CSS variables/tokens.
- Non-text contrast:
  - Ensure 3:1 for interactive component boundaries, focus styles, and essential graphics.
- Reflow/Zoom at 400%:
  - Audit containers for fixed widths and overflow; prefer fluid grids/flex with wrapping.
  - Ensure no loss of content/functionality at 320px CSS width.
- Motion/animation:
  - Respect `prefers-reduced-motion`; provide user control for intensive effects.

### Concrete examples to guide edits

- Replace clickable `div` with a real button and add a label:

```12:16:Sehat.html
<div class="dashboard-card smart-card" onclick="switchPage('patients-page', this)" data-priority="high">
    <div class="card-glow"></div>
    <!-- ... -->
</div>
```

A better structure:

```html
<button
  class="dashboard-card smart-card"
  data-action="switch-page"
  data-page="patients-page"
  aria-label="Open Patients"
>
  <span class="card-glow" aria-hidden="true"></span>
  <!-- content -->
</button>
```

- Ensure icon-only actions have names:

```html
<button
  class="header-icon"
  id="actionIcon"
  type="button"
  aria-label="Notifications"
>
  <!-- svg aria-hidden="true" -->
</button>
```

- Visible focus for all interactive elements:

```css
.dashboard-card:focus-visible,
.filter-chip:focus-visible,
.emergency-filter-chip:focus-visible,
.settings-action-btn:focus-visible,
.completion-btn:focus-visible,
.action-btn:focus-visible,
.support-btn:focus-visible,
.modal-close-btn:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}
```

- Live status updates when actions complete:

```js
function announce(msg) {
  const r = document.getElementById("a11y-status");
  if (r) r.textContent = msg;
}
// e.g.
announce("Alerts refreshed");
```

- Prevent focus being hidden by sticky header:

```css
[id] {
  scroll-margin-top: 72px;
} /* match header height */
```

### Testing workflow to adopt

- Keyboard-only traversal across all views; verify no traps and visible focus at all times.
- Screen reader checks (VoiceOver on macOS; NVDA/JAWS on Windows if available) to confirm names/roles/states.
- Contrast audits with axe and manual token review.
- Android Accessibility Scanner for target sizes; test zoom at 400% in desktop browsers.

### What can be done quickly vs. what’s harder

- Can do quickly:

  - Landmarks and skip link.
  - Add/extend focus-visible styles and remove `outline: none` overrides.
  - Add aria-labels to icon-only controls.
  - Add live region and announce key status changes.
  - Convert the most-used clickable elements to `<button>`/`<a>` and move event handlers into JS.

- Requires more effort/risk:
  - Converting all clickable `div`s (there are many) to semantic controls across `Sehat.html`; feasible but time-consuming.
  - Full 400% zoom reflow; may need layout refactors.
  - Systematic color token changes to meet text and non-text contrast; may affect brand visuals.
  - Dialog focus trapping and all interactive widgets aligned to ARIA patterns; careful QA needed.
  - Ensuring all small chips/actions meet 24×24 min target without crowding; may require layout/readability trade-offs.

### Rough timeline

- Phase 0–1: 1–3 days
- Phase 2: 3–7 days
- Phase 3: 2–5 days
- Phase 4: 1–2 weeks (overlaps with design review)

If you want, I can start with Phase 1 changes in `Sehat.html`, `style.css`, and `script.js` (skip link, landmarks, focus styles, aria-labels, and wiring a couple of representative components to semantic buttons) and then proceed iteratively.

- We’ll add a skip link and landmarks; extend focus-visible to all interactive classes; add aria-labels to icon-only controls; and set up a live region.
- Converting all `onclick` divs to real buttons/links and handling SPA titles/focus will be the next chunk.
