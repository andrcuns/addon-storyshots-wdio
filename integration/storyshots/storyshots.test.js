import path from 'path';

import initStoryshots from '@storybook/addon-storyshots';
import { imageSnapshot } from '../../src/index';

initStoryshots({
  suite: 'Default story snapshots',
  configPath: path.join(__dirname, '../storybook'),
  framework: 'react',
  test: imageSnapshot({
    storybookUrl: 'file:///app/.storybook',
    getMatchOptions: () => ({
      failureThreshold: 0.002,
      failureThresholdType: 'percent',
    }),
    browserOptions: {
      hostname: 'localhost',
      port: 4444,
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
