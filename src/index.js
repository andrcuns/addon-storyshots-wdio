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
  getGotoOptions: noop,
  getCustomBrowser: undefined,
};

export const imageSnapshot = (customConfig = {}) => {
  const {
    storybookUrl,
    browserOptions,
    getMatchOptions,
    beforeScreenshot,
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

    let image;
    try {
      await browser.url(url);
      await beforeScreenshot(browser, { context, url });
      image = await browser.takeScreenshot();
    } catch (e) {
      logger.error(`Error when connecting to ${url}, did you start or build the storybook first?`, e);
      throw e;
    }

    expect(image).toMatchImageSnapshot(getMatchOptions({ context, url }));
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
