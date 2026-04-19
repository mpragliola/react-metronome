// Run with: npx playwright test scripts/take-screenshots.ts --headed
// Or standalone: npx ts-node scripts/take-screenshots.ts
// Or via npm: npm run screenshots

import { chromium, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.resolve('docs/screenshots');

function ensureDir(dir: string) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function cleanOutputDir() {
    // Remove only image files, preserving PLAN.md and other non-image files
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
    console.log('Output directory cleaned and recreated.');
}

async function waitForApp(page: Page) {
    await page.waitForSelector('h1', { timeout: 10_000 });
    // Let fonts and icons load
    await page.waitForTimeout(500);
}

async function closeAnyModal(page: Page) {
    const overlay = page.locator('.help-modal-overlay');
    if (await overlay.isVisible()) {
        await overlay.click({ position: { x: 5, y: 5 } });
        await overlay.waitFor({ state: 'hidden' });
    }
}

async function openHelpModal(page: Page, nearText: string): Promise<void> {
    // Help icons near labelled text (BPM, Linear Ramp, Alternating Ramp):
    const container = page.locator('div', { hasText: nearText }).first();
    const helpBtn = container.locator('button[title="Show help"]').first();
    await helpBtn.click();
    await page.locator('.help-modal-content').waitFor({ state: 'visible' });
    await page.waitForTimeout(350);
}

async function openHelpModalByIndex(page: Page, index: number): Promise<void> {
    // For sections where the label text isn't in the DOM (Feel Mode, Subdivision),
    // click the nth help icon on the page.
    const helpBtn = page.locator('button[title="Show help"]').nth(index);
    await helpBtn.click();
    await page.locator('.help-modal-content').waitFor({ state: 'visible' });
    await page.waitForTimeout(350);
}

async function run() {
    cleanOutputDir();

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 900 },
    });
    const page = await context.newPage();

    page.on('pageerror', (err) => console.error('Page error:', err.message));
    page.on('console', (msg) => {
        if (msg.type() === 'error') console.error('Console error:', msg.text());
    });

    try {
        console.log('Navigating to', BASE_URL);
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        await waitForApp(page);

        // ── Overview: idle ──────────────────────────────────────────────────
        console.log('Taking: overview-idle.png');
        await page.screenshot({
            path: path.join(OUTPUT_DIR, 'overview-idle.png'),
            fullPage: true,
        });

        // ── Overview: running ───────────────────────────────────────────────
        console.log('Taking: overview-running.png');
        // Scope to the MetronomePanel (identified by its "Metronome" heading) to
        // avoid matching the similarly-labelled Start buttons in the Ramp panel.
        const metronomePanel = page.locator('div').filter({
            has: page.locator('h1', { hasText: 'Metronome' }),
        }).first();
        const toggleBtn = metronomePanel.getByRole('button', { name: /^[\s\S]*(Start|Stop)[\s\S]*$/ }).first();
        await toggleBtn.click();
        await page.waitForTimeout(400); // let visual indicator activate
        await page.screenshot({
            path: path.join(OUTPUT_DIR, 'overview-running.png'),
            fullPage: true,
        });
        // Stop metronome for subsequent shots
        await toggleBtn.click();
        await page.waitForTimeout(200);

        // ── Metronome Panel: BPM Control ────────────────────────────────────
        console.log('Taking: metronome/bpm-control.png');
        // The BPM control wraps the slider, value display, and +/- buttons.
        // It's the direct container of the "Beats Per Minute (BPM)" label row.
        const bpmSection = page.locator('div').filter({
            has: page.locator('div', { hasText: 'Beats Per Minute (BPM)' }),
        }).first();
        await bpmSection.screenshot({
            path: path.join(OUTPUT_DIR, 'metronome/bpm-control.png'),
        });

        // ── Metronome Panel: BPM Help Modal ─────────────────────────────────
        console.log('Taking: metronome/bpm-help-modal.png');
        await openHelpModal(page, 'Beats Per Minute (BPM)');
        await page.screenshot({
            path: path.join(OUTPUT_DIR, 'metronome/bpm-help-modal.png'),
            fullPage: true,
        });
        await closeAnyModal(page);

        // ── Metronome Panel: Feel Mode Buttons ──────────────────────────────
        console.log('Taking: metronome/feel-buttons.png');
        // Feel buttons section contains "1/2", "Normal", "x2"
        const feelSection = page.locator('div').filter({
            has: page.getByRole('button', { name: /normal/i }),
        }).filter({
            has: page.getByRole('button', { name: /x2/i }),
        }).first();
        await feelSection.screenshot({
            path: path.join(OUTPUT_DIR, 'metronome/feel-buttons.png'),
        });

        // ── Metronome Panel: Feel Help Modal ────────────────────────────────
        console.log('Taking: metronome/feel-help-modal.png');
        // "Feel Mode" text only exists inside the modal; use index-based click.
        // Help icon order in MetronomePanel: BPM(0), Accent(1), Feel(2), Subdivision(3)
        await openHelpModalByIndex(page, 2);
        await page.screenshot({
            path: path.join(OUTPUT_DIR, 'metronome/feel-help-modal.png'),
            fullPage: true,
        });
        await closeAnyModal(page);

        // ── Metronome Panel: Subdivision Buttons ────────────────────────────
        console.log('Taking: metronome/subdivision-buttons.png');
        const subdivSection = page.locator('div').filter({
            has: page.getByRole('button', { name: /8th/i }),
        }).filter({
            has: page.getByRole('button', { name: /16th/i }),
        }).first();
        await subdivSection.screenshot({
            path: path.join(OUTPUT_DIR, 'metronome/subdivision-buttons.png'),
        });

        // ── Metronome Panel: Subdivision Help Modal ─────────────────────────
        console.log('Taking: metronome/subdivision-help-modal.png');
        // "Subdivision" text only exists inside the modal; use index-based click.
        await openHelpModalByIndex(page, 3);
        await page.screenshot({
            path: path.join(OUTPUT_DIR, 'metronome/subdivision-help-modal.png'),
            fullPage: true,
        });
        await closeAnyModal(page);

        // ── Ramp Panel: Idle ────────────────────────────────────────────────
        console.log('Taking: ramp/ramp-panel-idle.png');
        // The ramp panel has the heading "BPM Ramp"
        const rampPanel = page.locator('div').filter({
            has: page.locator('h1', { hasText: 'BPM Ramp' }),
        }).first();
        await rampPanel.screenshot({
            path: path.join(OUTPUT_DIR, 'ramp/ramp-panel-idle.png'),
        });

        // ── Ramp Panel: Linear Ramp Help Modal ──────────────────────────────
        console.log('Taking: ramp/linear-ramp-help-modal.png');
        await openHelpModal(page, 'Linear Ramp');
        await page.screenshot({
            path: path.join(OUTPUT_DIR, 'ramp/linear-ramp-help-modal.png'),
            fullPage: true,
        });
        await closeAnyModal(page);

        // ── Ramp Panel: Alternating Ramp Sequence Preview ───────────────────
        console.log('Taking: ramp/alternating-ramp-sequence.png');
        // Default values (Mult=1, Step=4, -Step=2, Meas=4) already produce a
        // valid sequence preview — no interaction needed.
        // Locate the ramp panel and screenshot the lower half (alternating section)
        // by cropping below the "Alternating Ramp" section label text.
        const rampPanelForAlt = page.locator('div').filter({
            has: page.locator('h1', { hasText: 'BPM Ramp' }),
        }).first();
        await rampPanelForAlt.screenshot({
            path: path.join(OUTPUT_DIR, 'ramp/alternating-ramp-sequence.png'),
        });

        // ── Ramp Panel: Alternating Ramp Help Modal ──────────────────────────
        console.log('Taking: ramp/alternating-ramp-help-modal.png');
        await openHelpModal(page, 'Alternating Ramp');
        await page.screenshot({
            path: path.join(OUTPUT_DIR, 'ramp/alternating-ramp-help-modal.png'),
            fullPage: true,
        });
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
