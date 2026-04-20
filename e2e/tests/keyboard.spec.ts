import { test, expect } from '../../e2e/fixtures.js';

test.describe('Keyboard Shortcuts', () => {

  test('Space toggles start/stop', async ({ metronome }) => {
    await expect(metronome.toggleButton()).toHaveText(/Start/);
    await metronome.page.keyboard.press('Space');
    await expect(metronome.toggleButton()).toHaveText(/Stop/);
    await metronome.page.keyboard.press('Space');
    await expect(metronome.toggleButton()).toHaveText(/Start/);
  });

  test('Enter toggles start/stop', async ({ metronome }) => {
    await expect(metronome.toggleButton()).toHaveText(/Start/);
    await metronome.page.keyboard.press('Enter');
    await expect(metronome.toggleButton()).toHaveText(/Stop/);
    await metronome.page.keyboard.press('Enter');
    await expect(metronome.toggleButton()).toHaveText(/Start/);
  });

  test('t key triggers tap tempo', async ({ metronome }) => {
    const initialBpm = await metronome.getBpmValue();
    for (let i = 0; i < 4; i++) {
      await metronome.page.keyboard.press('t');
      if (i < 3) await metronome.page.waitForTimeout(300);
    }
    const newBpm = await metronome.getBpmValue();
    expect(newBpm).not.toBe(initialBpm);
    expect(newBpm).toBeGreaterThanOrEqual(40);
    expect(newBpm).toBeLessThanOrEqual(280);
  });

  test('T key triggers tap tempo', async ({ metronome }) => {
    const initialBpm = await metronome.getBpmValue();
    for (let i = 0; i < 4; i++) {
      await metronome.page.keyboard.press('T');
      if (i < 3) await metronome.page.waitForTimeout(300);
    }
    const newBpm = await metronome.getBpmValue();
    expect(newBpm).not.toBe(initialBpm);
  });

  test('+ increments BPM by 1', async ({ metronome }) => {
    await metronome.setBpmViaSlider(120);
    await metronome.page.keyboard.press('+');
    await expect(metronome.bpmDisplay()).toHaveText('121');
  });

  test('= increments BPM by 1', async ({ metronome }) => {
    await metronome.setBpmViaSlider(120);
    await metronome.page.keyboard.press('=');
    await expect(metronome.bpmDisplay()).toHaveText('121');
  });

  test('Shift+= increments BPM by 2', async ({ metronome }) => {
    await metronome.setBpmViaSlider(120);
    await metronome.page.keyboard.press('Shift+=');
    await expect(metronome.bpmDisplay()).toHaveText('122');
  });

  test('- decrements BPM by 1', async ({ metronome }) => {
    await metronome.setBpmViaSlider(120);
    await metronome.page.keyboard.press('-');
    await expect(metronome.bpmDisplay()).toHaveText('119');
  });

  test('_ decrements BPM by 1', async ({ metronome }) => {
    await metronome.setBpmViaSlider(120);
    await metronome.page.keyboard.press('_');
    await expect(metronome.bpmDisplay()).toHaveText('119');
  });

  test('Shift+- decrements BPM by 2', async ({ metronome }) => {
    await metronome.setBpmViaSlider(120);
    await metronome.page.keyboard.press('Shift+-');
    await expect(metronome.bpmDisplay()).toHaveText('118');
  });

  test('BPM keyboard increment respects max 280', async ({ metronome }) => {
    await metronome.setBpmViaSlider(280);
    await metronome.page.keyboard.press('+');
    await expect(metronome.bpmDisplay()).toHaveText('280');
  });

  test('BPM keyboard decrement respects min 40', async ({ metronome }) => {
    await metronome.setBpmViaSlider(40);
    await metronome.page.keyboard.press('-');
    await expect(metronome.bpmDisplay()).toHaveText('40');
  });

  test('keyboard shortcuts ignored when input is focused', async ({ metronome }) => {
    const startInput = metronome.page.locator('div').filter({ hasText: /^Start$/ }).locator('input[type="number"]');
    await startInput.focus();
    await expect(metronome.toggleButton()).toHaveText(/Start/);
    await metronome.page.keyboard.press('Space');
    await expect(metronome.toggleButton()).toHaveText(/Start/);
  });

});
