import { Page } from '@playwright/test';

export class RampPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
}
