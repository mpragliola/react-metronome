import { Page, Locator } from '@playwright/test';

export class RampPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private rampPanel(): Locator {
    return this.page.locator('div').filter({ hasText: 'BPM Ramp' }).first();
  }

  // Shared start/target BPM inputs
  startBpmInput(): Locator {
    return this.rampPanel().locator('div').filter({ hasText: /^Start$/ }).locator('input[type="number"]');
  }

  targetBpmInput(): Locator {
    return this.rampPanel().locator('div').filter({ hasText: /^Target$/ }).locator('input[type="number"]');
  }

  // Status display — shows "Ready" or "Ramping: X → Y BPM"
  statusDisplay(): Locator {
    return this.rampPanel().locator('div').filter({ hasText: /^(Ready|Ramping:.*)$/ }).first();
  }

  // Linear ramp controls
  linearIncrementInput(): Locator {
    return this.rampPanel().locator('div').filter({ hasText: /^Inc$/ }).locator('input[type="number"]');
  }

  linearDurationInput(): Locator {
    return this.rampPanel().locator('div').filter({ hasText: /^Dur \(s\)$/ }).locator('input[type="number"]');
  }

  linearRampButton(): Locator {
    // First ramp start/stop button in the ramp panel (linear ramp section)
    return this.rampPanel().locator('button').filter({ hasText: /^(Start|Stop)$/ }).first();
  }

  // Alternating ramp controls
  alternatingMultiplierInput(): Locator {
    return this.rampPanel().locator('div').filter({ hasText: /^Mult$/ }).locator('input[type="number"]');
  }

  alternatingPositiveStepInput(): Locator {
    return this.rampPanel().locator('div').filter({ hasText: /^Step$/ }).locator('input[type="number"]');
  }

  alternatingNegativeStepInput(): Locator {
    return this.rampPanel().locator('div').filter({ hasText: /^-Step$/ }).locator('input[type="number"]');
  }

  alternatingMeasuresInput(): Locator {
    return this.rampPanel().locator('div').filter({ hasText: /^Meas$/ }).locator('input[type="number"]');
  }

  alternatingRampButton(): Locator {
    // Second ramp start/stop button in the ramp panel (alternating ramp section)
    return this.rampPanel().locator('button').filter({ hasText: /^(Start|Stop)$/ }).nth(1);
  }

  // Active sequence step highlights
  activeSequenceStep(): Locator {
    return this.page.locator('[data-active="true"]');
  }

  // Actions
  async setStartBpm(bpm: number): Promise<void> {
    await this.startBpmInput().fill(String(bpm));
    await this.startBpmInput().blur();
  }

  async setTargetBpm(bpm: number): Promise<void> {
    await this.targetBpmInput().fill(String(bpm));
    await this.targetBpmInput().blur();
  }

  async setLinearIncrement(value: number): Promise<void> {
    await this.linearIncrementInput().fill(String(value));
    await this.linearIncrementInput().blur();
  }

  async setLinearDuration(seconds: number): Promise<void> {
    await this.linearDurationInput().fill(String(seconds));
    await this.linearDurationInput().blur();
  }

  async startLinearRamp(): Promise<void> {
    await this.linearRampButton().click();
  }

  async stopLinearRamp(): Promise<void> {
    await this.linearRampButton().click();
  }

  async startAlternatingRamp(): Promise<void> {
    await this.alternatingRampButton().click();
  }

  async stopAlternatingRamp(): Promise<void> {
    await this.alternatingRampButton().click();
  }

  async getStatusText(): Promise<string> {
    return (await this.statusDisplay().textContent()) ?? '';
  }
}
