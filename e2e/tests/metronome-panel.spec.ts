import { test, expect } from '../../e2e/fixtures.js';

test.describe('Metronome Panel', () => {

  test('default state on load', async ({ metronome }) => {
    await expect(metronome.bpmDisplay()).toHaveText('120');
    await expect(metronome.volumeDisplay()).toHaveText('50%');
    await expect(metronome.accentDisplay()).toHaveText('4');
    await expect(metronome.feelButton('Normal')).toHaveAttribute('aria-pressed', 'true');
    await expect(metronome.toggleButton()).toHaveText(/Start/);
  });

  test('start/stop toggle changes button label', async ({ metronome }) => {
    await expect(metronome.toggleButton()).toHaveText(/Start/);
    await metronome.clickToggle();
    await expect(metronome.toggleButton()).toHaveText(/Stop/);
    await metronome.clickToggle();
    await expect(metronome.toggleButton()).toHaveText(/Start/);
  });

  test('BPM slider changes displayed value', async ({ metronome }) => {
    await metronome.setBpmViaSlider(150);
    await expect(metronome.bpmDisplay()).toHaveText('150');
  });

  test('BPM adjust buttons increment/decrement by 1', async ({ metronome }) => {
    await metronome.setBpmViaSlider(120);
    await metronome.clickBpmAdjust(1);
    await expect(metronome.bpmDisplay()).toHaveText('121');
    await metronome.clickBpmAdjust(-1);
    await expect(metronome.bpmDisplay()).toHaveText('120');
  });

  test('BPM adjust buttons increment/decrement by 10', async ({ metronome }) => {
    await metronome.setBpmViaSlider(120);
    await metronome.clickBpmAdjust(10);
    await expect(metronome.bpmDisplay()).toHaveText('130');
    await metronome.clickBpmAdjust(-10);
    await expect(metronome.bpmDisplay()).toHaveText('120');
  });

  test('BPM clamps to minimum 40', async ({ metronome }) => {
    await metronome.setBpmViaSlider(40);
    await metronome.clickBpmAdjust(-1);
    await expect(metronome.bpmDisplay()).toHaveText('40');
  });

  test('BPM clamps to maximum 280', async ({ metronome }) => {
    await metronome.setBpmViaSlider(280);
    await metronome.clickBpmAdjust(1);
    await expect(metronome.bpmDisplay()).toHaveText('280');
  });

  test('volume slider can be set to 0%', async ({ metronome }) => {
    await metronome.volumeSlider().fill('0');
    await expect(metronome.volumeDisplay()).toHaveText('0%');
  });

  test('volume slider can be set to 100%', async ({ metronome }) => {
    await metronome.volumeSlider().fill('100');
    await expect(metronome.volumeDisplay()).toHaveText('100%');
  });

  test('accent slider can be changed', async ({ metronome }) => {
    await metronome.accentSlider().fill('8');
    await expect(metronome.accentDisplay()).toHaveText('8');
  });

  test('accent slider min is 1', async ({ metronome }) => {
    await metronome.accentSlider().fill('1');
    await expect(metronome.accentDisplay()).toHaveText('1');
  });

  test('accent slider max is 32', async ({ metronome }) => {
    await metronome.accentSlider().fill('32');
    await expect(metronome.accentDisplay()).toHaveText('32');
  });

  test('feel buttons: select x2', async ({ metronome }) => {
    await metronome.selectFeel('x2');
    await expect(metronome.feelButton('x2')).toHaveAttribute('aria-pressed', 'true');
    await expect(metronome.feelButton('Normal')).not.toHaveAttribute('aria-pressed', 'true');
  });

  test('feel buttons: select 1/2', async ({ metronome }) => {
    await metronome.selectFeel('1/2');
    await expect(metronome.feelButton('1/2')).toHaveAttribute('aria-pressed', 'true');
    await expect(metronome.feelButton('Normal')).not.toHaveAttribute('aria-pressed', 'true');
  });

  test('feel buttons: select Normal', async ({ metronome }) => {
    await metronome.selectFeel('x2');
    await metronome.selectFeel('Normal');
    await expect(metronome.feelButton('Normal')).toHaveAttribute('aria-pressed', 'true');
    await expect(metronome.feelButton('x2')).not.toHaveAttribute('aria-pressed', 'true');
  });

  test('subdivision buttons: select 8th', async ({ metronome }) => {
    await metronome.selectSubdivision('8th');
    await expect(metronome.subdivisionButton('8th')).toHaveAttribute('aria-pressed', 'true');
  });

  test('subdivision buttons: select 8th 3', async ({ metronome }) => {
    await metronome.selectSubdivision('8th 3');
    await expect(metronome.subdivisionButton('8th 3')).toHaveAttribute('aria-pressed', 'true');
  });

  test('subdivision buttons: select 16th', async ({ metronome }) => {
    await metronome.selectSubdivision('16th');
    await expect(metronome.subdivisionButton('16th')).toHaveAttribute('aria-pressed', 'true');
  });

  test('subdivision buttons: select 16th 5:4', async ({ metronome }) => {
    await metronome.selectSubdivision('16th 5:4');
    await expect(metronome.subdivisionButton('16th 5:4')).toHaveAttribute('aria-pressed', 'true');
  });

  test('subdivision buttons: select 16th 6:4', async ({ metronome }) => {
    await metronome.selectSubdivision('16th 6:4');
    await expect(metronome.subdivisionButton('16th 6:4')).toHaveAttribute('aria-pressed', 'true');
  });

  test('subdivision buttons: reselect No', async ({ metronome }) => {
    await metronome.selectSubdivision('8th');
    await metronome.selectSubdivision('No');
    await expect(metronome.subdivisionButton('No')).toHaveAttribute('aria-pressed', 'true');
    await expect(metronome.subdivisionButton('8th')).not.toHaveAttribute('aria-pressed', 'true');
  });

  test('tap tempo updates BPM after 4 taps', async ({ metronome }) => {
    const initialBpm = await metronome.getBpmValue();
    await metronome.tapTempo(4, 300);
    const newBpm = await metronome.getBpmValue();
    expect(newBpm).not.toBe(initialBpm);
    expect(newBpm).toBeGreaterThanOrEqual(40);
    expect(newBpm).toBeLessThanOrEqual(280);
  });

  test('help icon opens modal for BPM control', async ({ metronome }) => {
    await metronome.openHelpModal(0);
    await expect(metronome.helpModal()).toBeVisible();
    await expect(metronome.helpModalTitle()).toContainText('BPM');
  });

  test('help modal closes on X button', async ({ metronome }) => {
    await metronome.openHelpModal(0);
    await expect(metronome.helpModal()).toBeVisible();
    await metronome.closeHelpModal();
    await expect(metronome.helpModal()).not.toBeVisible();
  });

  test('help modal closes on overlay click', async ({ metronome }) => {
    await metronome.openHelpModal(0);
    await expect(metronome.helpModal()).toBeVisible();
    await metronome.page.locator('.help-modal-overlay').click({ position: { x: 5, y: 5 } });
    await expect(metronome.helpModal()).not.toBeVisible();
  });

  test('multiple help icons each open a modal', async ({ metronome }) => {
    const helpButtonCount = await metronome.helpButtons().count();
    for (let i = 0; i < helpButtonCount; i++) {
      await metronome.openHelpModal(i);
      await expect(metronome.helpModal()).toBeVisible();
      await metronome.closeHelpModal();
      await expect(metronome.helpModal()).not.toBeVisible();
    }
  });

});
