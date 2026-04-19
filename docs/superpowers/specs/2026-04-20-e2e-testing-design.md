# E2E Testing Suite Design

**Date:** 2026-04-20  
**Scope:** Comprehensive Playwright E2E test suite for the react-metronome app

---

## Summary

A comprehensive Playwright E2E suite using the Page Object Model pattern. Audio is mocked via `addInitScript` to avoid Web Audio API user-gesture requirements. Tests are integrated into the existing CI GitHub Actions workflow as a separate job.

---

## Architecture

### Page Objects

**`e2e/pages/MetronomePage.ts`**  
Encapsulates all selectors and interaction helpers for the left panel:
- BPM control (type, mouse wheel)
- Volume and Accent sliders
- Feel radio buttons (normal, x2, 1/2)
- Subdivision radio buttons (no, 8th, 8th-3, 16th, 16th-3, quintuplet)
- Visual indicator
- Toggle button (start/stop)
- Tap tempo (via visual indicator clicks)
- Help icons

**`e2e/pages/RampPage.ts`**  
Encapsulates all selectors and interaction helpers for the right panel:
- Start BPM and Target BPM number inputs
- Status display text
- Linear ramp controls (increment, duration, start button)
- Alternating ramp controls (multiplier, +step, -step, measures, start button)
- Active step highlight detection

### Fixtures

**`e2e/fixtures.ts`**  
A custom Playwright fixture that:
1. Injects the `AudioContext` stub via `page.addInitScript` before page load
2. Navigates to `http://localhost:8080`
3. Instantiates and returns `MetronomePage` and `RampPage`

### Audio Mock

Injected before page load via `page.addInitScript`. Replaces `window.AudioContext` with a stub that no-ops all methods (createOscillator, createGain, destination, etc.) so the metronome's `start()` resolves immediately without real audio or a user gesture.

### Test Files

```
e2e/
  fixtures.ts
  pages/
    MetronomePage.ts
    RampPage.ts
  tests/
    metronome-panel.spec.ts
    ramp-panel.spec.ts
    keyboard.spec.ts
```

### Playwright Config

**`playwright.config.ts`** at project root:
- `baseURL`: `http://localhost:8080`
- `webServer`: runs `npm run build && vite preview` on port 8080
- Browser: Chromium only (sufficient for this app)
- `testDir`: `./e2e/tests`
- Timeout: 10s per test

---

## Test Coverage

### `metronome-panel.spec.ts`

| Test | Description |
|------|-------------|
| Default state | BPM=120, volume=50%, accent=4, feel=normal, subdivision=no, stopped |
| Start/stop toggle | Button label changes; ramp panel inputs disabled while running |
| BPM — type value | Enter a value, verify it's reflected |
| BPM — mouse wheel | Scroll up/down, verify increment/decrement |
| BPM — boundary clamping | Values below 40 clamp to 40, above 280 clamp to 280 |
| Volume slider | Drag to min and max, verify displayed value |
| Accent slider | Drag through range, verify value |
| Feel — all options | Select normal, x2, 1/2; verify each is selected |
| Subdivision — all options | Select no, 8th, 8th-3, 16th, 16th-3, quintuplet; verify each |
| Visual indicator | Receives `active` state on beat when metronome is running |
| Tap tempo | 4 taps in quick succession update the BPM |
| Help icons | Each help icon opens a tooltip/popover with expected content |

### `ramp-panel.spec.ts`

| Test | Description |
|------|-------------|
| Default state | Start=120, Target=180, status="Ready" |
| Start BPM input | Change value, verify clamping to [40, 280] |
| Target BPM input | Change value, verify clamping to [40, 280] |
| Linear ramp — start | Configure increment+duration, start, verify status shows "Ramping: X → Y BPM" |
| Linear ramp — cancel | Cancel mid-ramp, verify status returns to "Ready", inputs re-enabled |
| Linear ramp — completes | Wait for completion, verify status resets to "Ready" |
| Alternating ramp — start | Configure all 4 params, start, verify status and step highlighting |
| Alternating ramp — step highlight | Active step index advances during ramp |
| Alternating ramp — cancel | Cancel mid-ramp, verify reset |
| Inputs disabled while ramping | All ramp inputs and BPM fields are disabled during an active ramp |

### `keyboard.spec.ts`

| Test | Description |
|------|-------------|
| Space — toggle start | Press Space, metronome starts; press again, stops |
| Enter — toggle start | Same as Space |
| `t` — tap tempo | Press `t` repeatedly, BPM updates |
| `T` — tap tempo | Same as `t` (uppercase) |
| `+`/`=` — BPM +1 | BPM increments by 1 |
| Shift+`+` — BPM +2 | BPM increments by 2 |
| `-`/`_` — BPM -1 | BPM decrements by 1 |
| Shift+`-` — BPM -2 | BPM decrements by 2 |
| BPM keyboard clamping | Keyboard increment/decrement respects min/max bounds |
| Input focused — no shortcuts | When a number input is focused, keyboard shortcuts are ignored |

---

## CI Integration

A new job `e2e` is added to `.github/workflows/test.yml`, running after the existing `test` job:

```yaml
e2e:
  runs-on: ubuntu-latest
  needs: test
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: npm
    - run: npm ci
    - run: npx playwright install --with-deps chromium
    - run: npm run build
    - run: npx playwright test
```

The `e2e` job failing does not block the `test` job — they are independent jobs, with `e2e` depending on `test` succeeding first.

---

## npm Scripts

Two new scripts added to `package.json`:
- `"test:e2e"`: `playwright test`
- `"test:e2e:ui"`: `playwright test --ui` (for local interactive use)

The existing `"test"` script will be wired to run unit tests (vitest) — currently missing, needs to be added as part of implementation.
