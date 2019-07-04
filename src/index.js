import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { logger } from '@storybook/node-logger';
import { remote } from 'webdriverio';
import { constructUrl } from './url';


expect.extend({ toMatchImageSnapshot });

const defaultBrowserOptions = {
  logLevel: 'error',
  capabilities: {
    browserName: 'chrome',
  },
};
const noop = () => { };

const defaultConfig = {
  storybookUrl: 'http://localhost:6006',
  browserOptions: defaultBrowserOptions,
  getMatchOptions: noop,
  beforeScreenshot: noop,
  afterTest: noop,
  getGotoOptions: noop,
  getCustomBrowser: undefined,
};

export const imageSnapshot = (customConfig = {}) => {
  const {
    storybookUrl,
    browserOptions,
    getMatchOptions,
    beforeScreenshot,
    afterTest,
    getCustomBrowser,
  } = { ...defaultConfig, ...customConfig };

  let browser;

  const testFn = async ({ context }) => {
    const { kind, framework, name } = context;
    if (framework === 'rn') {
      // Skip tests since we de not support RN image snapshots.
      logger.error("It seems you are running imageSnapshot on RN app and it's not supported. Skipping test.");

      return;
    }
    const url = constructUrl(storybookUrl, kind, name);

    if (!browser) {
      logger.error(`Error when generating image snapshot for test ${kind} - ${name} : browser object is missing.`);
      throw new Error('no-browser-running');
    }

    expect.assertions(1);

    let failed = false;

    await browser.url(url);
    await beforeScreenshot(browser, { context, url });
    const image = await browser.takeScreenshot();

    try {
      expect(image).toMatchImageSnapshot(getMatchOptions({ context, url }));
    } catch (error) {
      failed = true;
      throw error;
    } finally {
      await afterTest({ failed, browser, image, context, url });
    }
  };

  testFn.afterAll = async () => {
    await browser.deleteSession();
  };

  testFn.beforeAll = async () => {
    if (getCustomBrowser) {
      browser = await getCustomBrowser();
    } else {
      browser = await remote(browserOptions);
    }
  };

  return testFn;
};
