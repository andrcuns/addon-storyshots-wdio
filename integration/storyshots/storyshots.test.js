/* eslint-disable no-undef */
import path from 'path';

import initStoryshots from '@storybook/addon-storyshots';
import { start } from 'chromedriver';
import { imageSnapshot } from '../../src/index';

let driver;

beforeAll(async () => {
  driver = await start([], true);
});

afterAll(async () => {
  await driver.kill();
});

initStoryshots({
  suite: 'Default story snapshots',
  configPath: path.join(__dirname, '../storybook'),
  framework: 'react',
  test: imageSnapshot({
    storybookUrl: `file:///${path.join(__dirname, '../../.storybook')}`,
    getMatchOptions: () => ({
      failureThreshold: 0.002,
      failureThresholdType: 'percent',
    }),
    browserOptions: {
      hostname: 'localhost',
      port: 9515,
      path: '/',
      logLevel: 'error',
      capabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          args: [
            '--no-sandbox',
            '--disable-gpu',
            '--window-size=200,100',
            '--headless',
          ],
        },
      },
    },
  }),
});
