import { Page, Locator } from '@playwright/test';

export class MetronomePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
}
