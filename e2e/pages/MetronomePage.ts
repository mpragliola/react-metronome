import { Page, Locator } from '@playwright/test';

export class MetronomePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private metronomePanel(): Locator {
    return this.page.locator('div').filter({ hasText: 'Beats Per Minute' }).first();
  }

  // BPM
  bpmDisplay(): Locator {
    return this.page.locator('div').filter({ hasText: /^\d{2,3}$/ }).first();
  }

  bpmSlider(): Locator {
    return this.metronomePanel().locator('input[type="range"]').first();
  }

  bpmAdjustButton(delta: number): Locator {
    return this.page.locator(`button[title="${delta > 0 ? 'Increase' : 'Decrease'} by ${Math.abs(delta)}"]`);
  }

  // Volume and Accent sliders
  volumeDisplay(): Locator {
    return this.metronomePanel().locator('div').filter({ hasText: /^\d+%$/ }).first();
  }

  volumeSlider(): Locator {
    return this.metronomePanel().locator('div').filter({ hasText: /^Volume$/ }).locator('input[type="range"]');
  }

  accentDisplay(): Locator {
    return this.metronomePanel().locator('div').filter({ hasText: /^Accent/ }).locator('div').filter({ hasText: /^\d+$/ }).first();
  }

  accentSlider(): Locator {
    return this.metronomePanel().locator('div').filter({ hasText: /^Accent/ }).locator('input[type="range"]');
  }

  // Feel radio buttons — labels: '1/2', 'Normal', 'x2'
  feelButton(label: '1/2' | 'Normal' | 'x2'): Locator {
    return this.metronomePanel().locator('button').filter({ hasText: new RegExp(`^${label.replace('/', '\\/')}$`) });
  }

  // Subdivision radio buttons
  subdivisionButton(label: 'No' | '8th' | '8th 3' | '16th' | '16th 5:4' | '16th 6:4'): Locator {
    return this.metronomePanel().locator('button').filter({ hasText: new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) });
  }

  // Visual indicator — the circular div used for tap tempo
  visualIndicator(): Locator {
    return this.page.locator('div').filter({ hasText: '●' }).first();
  }

  // Toggle button (Start/Stop)
  toggleButton(): Locator {
    return this.metronomePanel().locator('button').filter({ hasText: /^(Start|Stop)$/ }).first();
  }

  // Help icon buttons (title="Show help")
  helpButtons(): Locator {
    return this.page.locator('button[title="Show help"]');
  }

  helpButton(index: number): Locator {
    return this.page.locator('button[title="Show help"]').nth(index);
  }

  // Help modal
  helpModal(): Locator {
    return this.page.locator('.help-modal-content');
  }

  helpModalTitle(): Locator {
    return this.helpModal().locator('h2');
  }

  helpModalCloseButton(): Locator {
    return this.helpModal().locator('button[title="Close"]');
  }

  // Actions
  async clickToggle(): Promise<void> {
    await this.toggleButton().click();
  }

  async setBpmViaSlider(bpm: number): Promise<void> {
    await this.bpmSlider().fill(String(bpm));
    await this.bpmSlider().dispatchEvent('change');
  }

  async clickBpmAdjust(delta: number): Promise<void> {
    await this.bpmAdjustButton(delta).click();
  }

  async selectFeel(label: '1/2' | 'Normal' | 'x2'): Promise<void> {
    await this.feelButton(label).click();
  }

  async selectSubdivision(label: 'No' | '8th' | '8th 3' | '16th' | '16th 5:4' | '16th 6:4'): Promise<void> {
    await this.subdivisionButton(label).click();
  }

  async tapTempo(times: number, intervalMs = 300): Promise<void> {
    for (let i = 0; i < times; i++) {
      await this.visualIndicator().click();
      if (i < times - 1) {
        await this.page.waitForTimeout(intervalMs);
      }
    }
  }

  async openHelpModal(index: number): Promise<void> {
    await this.helpButton(index).click();
  }

  async closeHelpModal(): Promise<void> {
    await this.helpModalCloseButton().click();
  }

  async getBpmValue(): Promise<number> {
    const text = await this.bpmDisplay().textContent();
    return parseInt(text ?? '0', 10);
  }
}
