# Screenshot Plan — React Metronome

**Output dir:** `/docs/screenshots`
**App type:** web (Vite + React 18, single-page)

---

## Overview

### Full App — Idle
- **What it shows:** Both panels side by side with the metronome stopped
- **Capture:** full page
- **Filename:** `overview-idle.png`
- **Setup:** Load page, wait for React to render

### Full App — Running
- **What it shows:** App with metronome running, Start/Stop button in active state
- **Capture:** full page
- **Filename:** `overview-running.png`
- **Setup:** Click the Start/Stop toggle button, wait for running state

---

## Metronome Panel

### BPM Control
- **What it shows:** BPM slider, large BPM value display, and ±1/±10 adjustment buttons
- **Capture:** element crop (BPM control container)
- **Filename:** `metronome/bpm-control.png`
- **Setup:** Navigate to page; default state is sufficient

### BPM Help Modal
- **What it shows:** Help overlay explaining BPM range and controls
- **Capture:** full page
- **Filename:** `metronome/bpm-help-modal.png`
- **Setup:** Click the help icon (?) next to the "Beats Per Minute (BPM)" label

### Feel Mode Buttons
- **What it shows:** Normal / x2 / 1/2 radio button group
- **Capture:** element crop (feel radio buttons container)
- **Filename:** `metronome/feel-buttons.png`
- **Setup:** Default state (Normal selected)

### Feel Help Modal
- **What it shows:** Help overlay explaining feel mode options
- **Capture:** full page
- **Filename:** `metronome/feel-help-modal.png`
- **Setup:** Click the help icon next to "Feel Mode" (3rd help icon in page order)

### Subdivision Buttons
- **What it shows:** No / 8th / 8th 3 / 16th / 16th 5:4 / 16th 6:4 subdivision options
- **Capture:** element crop (subdivision radio buttons container)
- **Filename:** `metronome/subdivision-buttons.png`
- **Setup:** Default state (No subdivision selected)

### Subdivision Help Modal
- **What it shows:** Help overlay explaining subdivision modes
- **Capture:** full page
- **Filename:** `metronome/subdivision-help-modal.png`
- **Setup:** Click the help icon next to "Subdivision" (4th help icon in page order)

---

## BPM Ramp Panel

### Ramp Panel — Idle
- **What it shows:** Start/Target BPM inputs, Linear Ramp and Alternating Ramp sections at rest
- **Capture:** element crop (ramp panel container)
- **Filename:** `ramp/ramp-panel-idle.png`
- **Setup:** Default state

### Linear Ramp Help Modal
- **What it shows:** Help overlay explaining linear ramp parameters (Inc, Dur)
- **Capture:** full page
- **Filename:** `ramp/linear-ramp-help-modal.png`
- **Setup:** Click the help icon next to "Linear Ramp"

### Alternating Ramp — Sequence Preview
- **What it shows:** Ramp panel including alternating ramp controls with sequence visualization
- **Capture:** element crop (ramp panel container)
- **Filename:** `ramp/alternating-ramp-sequence.png`
- **Setup:** Default values (Mult=1, Step=4, -Step=2, Meas=4) produce a valid sequence preview automatically

### Alternating Ramp Help Modal
- **What it shows:** Help overlay explaining alternating ramp parameters
- **Capture:** full page
- **Filename:** `ramp/alternating-ramp-help-modal.png`
- **Setup:** Click the help icon next to "Alternating Ramp"
