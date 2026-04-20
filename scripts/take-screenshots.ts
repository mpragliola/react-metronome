// Run with: npm run screenshots (requires dev server: npm run dev)

import { chromium, Locator, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.resolve('docs/screenshots');
const PADDING = 12; // px to add around cropped elements

function ensureDir(dir: string) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function cleanOutputDir() {
    if (fs.existsSync(OUTPUT_DIR)) {
        for (const entry of fs.readdirSync(OUTPUT_DIR, { recursive: true, withFileTypes: true }) as fs.Dirent[]) {
            if (entry.isFile() && entry.name.endsWith('.png')) {
                fs.rmSync(path.join(entry.parentPath ?? (entry as any).path, entry.name));
            }
        }
    }
    ensureDir(OUTPUT_DIR);
    ensureDir(path.join(OUTPUT_DIR, 'metronome'));
    ensureDir(path.join(OUTPUT_DIR, 'ramp'));
    console.log('Output directory cleaned.');
}

async function cropShot(page: Page, locator: Locator, outPath: string) {
    const box = await locator.boundingBox();
    if (!box) throw new Error(`Element not found for ${outPath}`);
    await page.screenshot({
        path: outPath,
        clip: {
            x: Math.max(0, box.x - PADDING),
            y: Math.max(0, box.y - PADDING),
            width: box.width + PADDING * 2,
            height: box.height + PADDING * 2,
        },
    });
}

async function waitForApp(page: Page) {
    await page.waitForSelector('h1', { timeout: 10_000 });
    await page.waitForTimeout(600);
}

async function closeAnyModal(page: Page) {
    const overlay = page.locator('.help-modal-overlay');
    if (await overlay.isVisible()) {
        await overlay.click({ position: { x: 5, y: 5 } });
        await overlay.waitFor({ state: 'hidden' });
    }
}

async function openHelpModalNth(page: Page, index: number): Promise<void> {
    await page.locator('button[title="Show help"]').nth(index).click();
    await page.locator('.help-modal-content').waitFor({ state: 'visible' });
    await page.waitForTimeout(350);
}

async function run() {
    cleanOutputDir();

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();

    page.on('pageerror', (err) => console.error('Page error:', err.message));
    page.on('console', (msg) => { if (msg.type() === 'error') console.error('Console:', msg.text()); });

    try {
        console.log('Navigating to', BASE_URL);
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        await waitForApp(page);

        // ── Overview: idle ──────────────────────────────────────────────────
        console.log('Taking: overview-idle.png');
        await page.screenshot({ path: path.join(OUTPUT_DIR, 'overview-idle.png'), fullPage: true });

        // ── Overview: running ───────────────────────────────────────────────
        console.log('Taking: overview-running.png');
        // ToggleButton has no type="button" (uses default button behaviour) and
        // is not disabled, unlike the ramp Start buttons. Use the fa-play icon class
        // to uniquely identify the main toggle — it's the only full-size primary button.
        // Fallback: click the first visible Start button that is NOT inside the ramp panel.
        const rampHeadingCheck = page.locator('h1').filter({ hasText: 'BPM Ramp' });
        const rampPanelDivCheck = rampHeadingCheck.locator('xpath=ancestor::div[1]');
        // All "Start" buttons NOT inside the ramp panel
        const allStartBtns = page.getByRole('button', { name: /start/i });
        const toggleBtn = allStartBtns.filter({ hasNot: rampPanelDivCheck }).first();
        await toggleBtn.click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(OUTPUT_DIR, 'overview-running.png'), fullPage: true });
        await toggleBtn.click();
        await page.waitForTimeout(200);

        // ── Metronome Panel: BPM Control ────────────────────────────────────
        // BPMControl renders a ref'd div containing the label, value, slider, and buttons.
        // Identify it by the slider input + the BPM value display together.
        console.log('Taking: metronome/bpm-control.png');
        const bpmSlider = page.locator('input[type="range"]').first();
        const bpmControlDiv = bpmSlider.locator('xpath=ancestor::div[2]');
        await cropShot(page, bpmControlDiv, path.join(OUTPUT_DIR, 'metronome/bpm-control.png'));

        // ── Metronome Panel: BPM Help Modal ─────────────────────────────────
        // Help icon order: BPM(0), Accent(1), Feel(2), Subdivision(3), Linear Ramp(4), Alt Ramp(5)
        console.log('Taking: metronome/bpm-help-modal.png');
        await openHelpModalNth(page, 0);
        await page.screenshot({ path: path.join(OUTPUT_DIR, 'metronome/bpm-help-modal.png'), fullPage: true });
        await closeAnyModal(page);

        // ── Metronome Panel: Feel Mode Buttons ──────────────────────────────
        console.log('Taking: metronome/feel-buttons.png');
        // The feel buttons div is the immediate parent of the flex row with 1/2, Normal, x2.
        const normalBtn = page.getByRole('button', { name: 'Normal' });
        const feelRowDiv = normalBtn.locator('xpath=ancestor::div[2]');
        await cropShot(page, feelRowDiv, path.join(OUTPUT_DIR, 'metronome/feel-buttons.png'));

        // ── Metronome Panel: Feel Help Modal ────────────────────────────────
        console.log('Taking: metronome/feel-help-modal.png');
        await openHelpModalNth(page, 2);
        await page.screenshot({ path: path.join(OUTPUT_DIR, 'metronome/feel-help-modal.png'), fullPage: true });
        await closeAnyModal(page);

        // ── Metronome Panel: Subdivision Buttons ────────────────────────────
        console.log('Taking: metronome/subdivision-buttons.png');
        // "8th" button is unique to the subdivision row (not present in feel row).
        // Go up to the outer wrapper that also contains the help icon (position:relative div).
        const eighthBtn = page.getByRole('button', { name: '8th' }).first();
        const subdivRowDiv = eighthBtn.locator('xpath=ancestor::div[3]');
        await cropShot(page, subdivRowDiv, path.join(OUTPUT_DIR, 'metronome/subdivision-buttons.png'));

        // ── Metronome Panel: Subdivision Help Modal ─────────────────────────
        console.log('Taking: metronome/subdivision-help-modal.png');
        await openHelpModalNth(page, 3);
        await page.screenshot({ path: path.join(OUTPUT_DIR, 'metronome/subdivision-help-modal.png'), fullPage: true });
        await closeAnyModal(page);

        // ── Ramp Panel: Idle ────────────────────────────────────────────────
        console.log('Taking: ramp/ramp-panel-idle.png');
        const rampHeading = page.locator('h1').filter({ hasText: 'BPM Ramp' });
        const rampPanelDiv = rampHeading.locator('xpath=ancestor::div[1]');
        await cropShot(page, rampPanelDiv, path.join(OUTPUT_DIR, 'ramp/ramp-panel-idle.png'));

        // ── Ramp Panel: Linear Ramp Help Modal ──────────────────────────────
        console.log('Taking: ramp/linear-ramp-help-modal.png');
        await openHelpModalNth(page, 4);
        await page.screenshot({ path: path.join(OUTPUT_DIR, 'ramp/linear-ramp-help-modal.png'), fullPage: true });
        await closeAnyModal(page);

        // ── Ramp Panel: Alternating Ramp — Sequence Preview ─────────────────
        // Same as ramp panel idle but taken after linear ramp shot to confirm
        // the sequence preview (Mult=1, Step=4, -Step=2, Meas=4) is visible.
        console.log('Taking: ramp/alternating-ramp-sequence.png');
        await cropShot(page, rampPanelDiv, path.join(OUTPUT_DIR, 'ramp/alternating-ramp-sequence.png'));

        // ── Ramp Panel: Alternating Ramp Help Modal ──────────────────────────
        console.log('Taking: ramp/alternating-ramp-help-modal.png');
        await openHelpModalNth(page, 5);
        await page.screenshot({ path: path.join(OUTPUT_DIR, 'ramp/alternating-ramp-help-modal.png'), fullPage: true });
        await closeAnyModal(page);

        console.log('\nAll screenshots saved to', OUTPUT_DIR);
    } catch (err) {
        console.error('\nFailed:', err);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

run();
