import puppeteer, { type Browser } from 'puppeteer';

let browserInstance: Browser | null = null;
let browserPromise: Promise<Browser> | null = null;
let activeJobs = 0;
const MAX_CONCURRENT = 3;
const queue: Array<() => void> = [];

async function launchBrowser(): Promise<Browser> {
  return puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });
}

export async function getBrowser(): Promise<Browser> {
  if (browserInstance?.connected) return browserInstance;
  if (!browserPromise) {
    browserPromise = launchBrowser().then((browser) => {
      browserInstance = browser;
      browser.on('disconnected', () => {
        browserInstance = null;
        browserPromise = null;
      });
      return browser;
    });
  }
  return browserPromise;
}

async function acquireSlot(): Promise<void> {
  if (activeJobs < MAX_CONCURRENT) {
    activeJobs++;
    return;
  }
  await new Promise<void>((resolve) => queue.push(resolve));
  activeJobs++;
}

function releaseSlot(): void {
  activeJobs--;
  const next = queue.shift();
  if (next) next();
}

export async function withBrowserPage<T>(
  fn: (page: Awaited<ReturnType<Browser['newPage']>>) => Promise<T>,
): Promise<T> {
  await acquireSlot();
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    return await fn(page);
  } finally {
    await page.close().catch(() => undefined);
    releaseSlot();
  }
}

export async function closeBrowserPool(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close().catch(() => undefined);
    browserInstance = null;
    browserPromise = null;
  }
}
