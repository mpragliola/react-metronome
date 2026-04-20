import { test as base, Page } from '@playwright/test';
import { MetronomePage } from './pages/MetronomePage.js';
import { RampPage } from './pages/RampPage.js';

const audioContextStub = `
  (function() {
    class FakeAudioNode {
      connect() { return this; }
      disconnect() {}
    }
    class FakeOscillator extends FakeAudioNode {
      type = 'sine';
      frequency = { value: 440, setValueAtTime() {} };
      start() {}
      stop() {}
    }
    class FakeGainNode extends FakeAudioNode {
      gain = { value: 1, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} };
    }
    class FakeAudioContext {
      state = 'running';
      currentTime = 0;
      destination = new FakeAudioNode();
      createOscillator() { return new FakeOscillator(); }
      createGain() { return new FakeGainNode(); }
      resume() { return Promise.resolve(); }
      close() { return Promise.resolve(); }
    }
    window.AudioContext = FakeAudioContext as any;
    (window as any).webkitAudioContext = FakeAudioContext;
  })();
`;

type Fixtures = {
  metronome: MetronomePage;
  ramp: RampPage;
};

export const test = base.extend<Fixtures>({
  metronome: async ({ page }, use) => {
    await page.addInitScript(audioContextStub);
    await page.goto('/');
    await use(new MetronomePage(page));
  },
  ramp: async ({ page }, use) => {
    await page.addInitScript(audioContextStub);
    await page.goto('/');
    await use(new RampPage(page));
  },
});

export { expect } from '@playwright/test';
