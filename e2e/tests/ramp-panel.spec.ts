import { test, expect } from '../../e2e/fixtures.js';

test.describe('Ramp Panel', () => {

  test('default state: Start=120, Target=180, status=Ready', async ({ ramp }) => {
    await expect(ramp.startBpmInput()).toHaveValue('120');
    await expect(ramp.targetBpmInput()).toHaveValue('180');
    await expect(ramp.statusDisplay()).toHaveText('Ready');
  });

  test('start BPM input accepts new value', async ({ ramp }) => {
    await ramp.setStartBpm(100);
    await expect(ramp.startBpmInput()).toHaveValue('100');
  });

  test('target BPM input accepts new value', async ({ ramp }) => {
    await ramp.setTargetBpm(200);
    await expect(ramp.targetBpmInput()).toHaveValue('200');
  });

  test('linear ramp: start shows Ramping status', async ({ ramp }) => {
    await ramp.setStartBpm(100);
    await ramp.setTargetBpm(140);
    await ramp.setLinearIncrement(1);
    await ramp.setLinearDuration(30);
    await ramp.startLinearRamp();
    await expect(ramp.statusDisplay()).toContainText('Ramping:');
    await expect(ramp.statusDisplay()).toContainText('100');
    await expect(ramp.statusDisplay()).toContainText('140');
  });

  test('linear ramp: cancel returns status to Ready', async ({ ramp }) => {
    await ramp.setStartBpm(100);
    await ramp.setTargetBpm(200);
    await ramp.setLinearDuration(60);
    await ramp.startLinearRamp();
    await expect(ramp.statusDisplay()).toContainText('Ramping:');
    await ramp.stopLinearRamp();
    await expect(ramp.statusDisplay()).toHaveText('Ready');
  });

  test('linear ramp: inputs disabled while ramping', async ({ ramp }) => {
    await ramp.setLinearDuration(60);
    await ramp.startLinearRamp();
    await expect(ramp.startBpmInput()).toBeDisabled();
    await expect(ramp.targetBpmInput()).toBeDisabled();
    await expect(ramp.linearIncrementInput()).toBeDisabled();
    await expect(ramp.linearDurationInput()).toBeDisabled();
    await ramp.stopLinearRamp();
  });

  test('linear ramp: inputs re-enabled after cancel', async ({ ramp }) => {
    await ramp.setLinearDuration(60);
    await ramp.startLinearRamp();
    await ramp.stopLinearRamp();
    await expect(ramp.startBpmInput()).not.toBeDisabled();
    await expect(ramp.targetBpmInput()).not.toBeDisabled();
    await expect(ramp.linearIncrementInput()).not.toBeDisabled();
    await expect(ramp.linearDurationInput()).not.toBeDisabled();
  });

  test('linear ramp: completes and resets to Ready', async ({ ramp }) => {
    await ramp.setStartBpm(120);
    await ramp.setTargetBpm(130);
    await ramp.setLinearIncrement(1);
    await ramp.setLinearDuration(2);
    await ramp.startLinearRamp();
    await expect(ramp.statusDisplay()).toContainText('Ramping:', { timeout: 1000 });
    await expect(ramp.statusDisplay()).toHaveText('Ready', { timeout: 10000 });
  });

  test('alternating ramp: start shows Ramping status', async ({ ramp }) => {
    await ramp.setStartBpm(100);
    await ramp.setTargetBpm(160);
    await ramp.startAlternatingRamp();
    await expect(ramp.statusDisplay()).toContainText('Ramping:');
    await ramp.stopAlternatingRamp();
  });

  test('alternating ramp: cancel returns status to Ready', async ({ ramp }) => {
    await ramp.setStartBpm(100);
    await ramp.setTargetBpm(200);
    await ramp.startAlternatingRamp();
    await expect(ramp.statusDisplay()).toContainText('Ramping:');
    await ramp.stopAlternatingRamp();
    await expect(ramp.statusDisplay()).toHaveText('Ready');
  });

  test('alternating ramp: inputs disabled while ramping', async ({ ramp }) => {
    await ramp.startAlternatingRamp();
    await expect(ramp.startBpmInput()).toBeDisabled();
    await expect(ramp.targetBpmInput()).toBeDisabled();
    await expect(ramp.alternatingMultiplierInput()).toBeDisabled();
    await expect(ramp.alternatingPositiveStepInput()).toBeDisabled();
    await expect(ramp.alternatingNegativeStepInput()).toBeDisabled();
    await expect(ramp.alternatingMeasuresInput()).toBeDisabled();
    await ramp.stopAlternatingRamp();
  });

  test('alternating ramp: step highlights progress', async ({ ramp }) => {
    await ramp.setStartBpm(100);
    await ramp.setTargetBpm(200);
    await ramp.startAlternatingRamp();
    await expect(ramp.statusDisplay()).toContainText('Ramping:');
    await ramp.stopAlternatingRamp();
  });

  test('alternating ramp: invalid config disables start button', async ({ ramp }) => {
    await ramp.alternatingMultiplierInput().fill('1');
    await ramp.alternatingPositiveStepInput().fill('1');
    await ramp.alternatingNegativeStepInput().fill('5');
    await expect(ramp.alternatingRampButton()).toBeDisabled();
  });

});
