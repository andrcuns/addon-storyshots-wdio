# storyshots-wdio

![Workflow status](https://github.com/andrcuns/addon-storyshots-wdio/workflows/Test/badge.svg)
[![Version](https://badge.fury.io/js/addon-storyshots-wdio.svg)](https://www.npmjs.com/package/addon-storyshots-wdio)
[![npm](https://img.shields.io/npm/dm/addon-storyshots-wdio.svg)](https://www.npmjs.com/package/addon-storyshots-wdio)

Adaptation of [storyshots-puppeteer](https://github.com/storybookjs/storybook/tree/next/addons/storyshots/storyshots-puppeteer)
addon which uses [WebdriverIO](https://webdriver.io/) for a wider browser support.

## Getting Started

Add the following module into your app.

```sh
yarn add --dev addon-storyshots-wdio
```

## Configure Storyshots for image snapshots

/\*\ **React-native** is **not supported** by this test function.

Internally, it uses [jest-image-snapshot](https://github.com/americanexpress/jest-image-snapshot).

When willing to generate and compare image snapshots for your stories, you have two options:

- Have a storybook running (ie. accessible via http(s), for instance using `yarn storybook`)
- Have a static build of the storybook (for instance, using `yarn build-storybook`)

Then you will need to reference the storybook URL (`file://...` if local, `http(s)://...` if served)

### Using default values for _imageSnapshots_

Then you can either create a new Storyshots instance or edit the one you previously used:

```js
import initStoryshots from '@storybook/addon-storyshots';
import { imageSnapshot } from 'addon-storyshots-wdio';

initStoryshots({ suite: 'Image storyshots', test: imageSnapshot() });
```

This will assume you have a storybook running on at _<http://localhost:6006>_.
Internally here are the steps:

- Launches instances of remote web driver using [WebdriverIO](https://webdriver.io/)
- Browses each stories (calling _<http://localhost:6006/iframe.html?...>_ URL),
- Take screenshots & save all images under \_\_image_snapshots\_\_ folder.

### Specifying the storybook URL

If you want to set specific storybook URL, you can specify via the `storybookUrl` parameter, see below:

```js
import initStoryshots from '@storybook/addon-storyshots';
import { imageSnapshot } from 'addon-storyshots-wdio';

initStoryshots({
  suite: 'Image storyshots',
  test: imageSnapshot({ storybookUrl: 'http://my-specific-domain.com:9010' }),
});
```

The above config will use _<https://my-specific-domain.com:9010>_ for screenshots. You can also use query parameters in your URL (e.g. for setting a different background for your storyshots, if you use `@storybook/addon-backgrounds`).

You may also use a local static build of storybook if you do not want to run the webpack dev-server:

```js
import initStoryshots from '@storybook/addon-storyshots';
import { imageSnapshot } from 'addon-storyshots-wdio';

initStoryshots({
  suite: 'Image storyshots',
  test: imageSnapshot({ storybookUrl: 'file:///path/to/my/storybook-static' }),
});
```

### Specifying options to _jest-image-snapshots_

If you wish to customize [jest-image-snapshot](https://github.com/americanexpress/jest-image-snapshot), then you can provide a `getMatchOptions` parameter that should return the options config object. Additionally, you can provide `beforeScreenshot` which is called before the screenshot is captured.

```js
import initStoryshots from '@storybook/addon-storyshots';
import { imageSnapshot } from 'addon-storyshots-wdio';
const getMatchOptions = ({ context: { kind, story }, url }) => {
  return {
    failureThreshold: 0.2,
    failureThresholdType: 'percent',
  };
};
const beforeScreenshot = (page, { context: { kind, story }, url }) => {
  return new Promise(resolve =>
    setTimeout(() => {
      resolve();
    }, 600)
  );
};
initStoryshots({
  suite: 'Image storyshots',
  test: imageSnapshot({ storybookUrl: 'http://localhost:6006', getMatchOptions, beforeScreenshot }),
});
```

`getMatchOptions` receives an object: `{ context: {kind, story}, url}`. _kind_ is the kind of the story and the _story_ its name. _url_ is the URL the browser will use to screenshot.

`beforeScreenshot` receives the [WebdriverIO browser instance](https://webdriver.io/docs/api.html) and an object: `{ context: {kind, story}, url}`. _kind_ is the kind of the story and the _story_ its name. _url_ is the URL the browser will use to screenshot. `beforeScreenshot` is part of the promise chain and is called after the browser navigation is completed but before the screenshot is taken. It allows for triggering events on the page elements and delaying the screenshot and can be used avoid regressions due to mounting animations.

### Specifying custom browser options (WebdriverIO)

You might want to use different options for the instance of browser object.

```js
import initStoryshots from '@storybook/addon-storyshots';
import { imageSnapshot } from 'addon-storyshots-wdio';

const browserOptions = {
  logLevel: 'error',
  path: '/', // remove `path` if you decided using something different from driver binaries.
  capabilities: {
    browserName: 'firefox'
  }
}

initStoryshots({
  suite: 'Image storyshots',
  test: imageSnapshot({ storybookUrl: 'http://localhost:6006', browserOptions }),
});
```

### Specifying a custom WebdriverIO `browser` instance (WebdriverIO)

You might use the async `getCustomBrowser` function to obtain a custom instance of a WebdriverIO `browser` object. This will prevent `storyshots-wdio` from creating its own `browser`.

```js
import initStoryshots from '@storybook/addon-storyshots';
import { imageSnapshot } from 'addon-storyshots-wdio';

(async function() {
    initStoryshots({
      suite: 'Image storyshots',
      test: imageSnapshot({
        storybookUrl: 'http://localhost:6006',
        getCustomBrowser: () => remote({
          logLevel: 'trace',
          capabilities: {
              browserName: 'chrome'
          }
        }),
      })
    });
})();
```

### Specifying a custom after test function

You might need a function which is executed after image comparison and has access to test result, browser object and current image
to attach it to some kind of report or something similar. For that you might use `afterTest` function. `afterTest` receives and object
`{ failed, browser, image, context, url }` which can be used for a custom action after test.

```js
import initStoryshots from '@storybook/addon-storyshots';
import { imageSnapshot } from 'addon-storyshots-wdio';

(async function() {
    initStoryshots({
      suite: 'Image storyshots',
      test: imageSnapshot({
        storybookUrl: 'http://localhost:6006',
        afterTest: ({ failed, image, context: { id } }) => {
          if (failed) {
            fs.writeFile(getCurrentSnapshot(`${id}.png`), Buffer.from(image, 'base64'));
          }
        ),
      })
    });
})();
```

### Integrate image storyshots with regular app

You may want to use another Jest project to run your image snapshots as they require more resources: Chrome and Storybook built/served.
You can find a working example of this in the [official-storybook](https://github.com/storybookjs/storybook/tree/master/examples/official-storybook) example.

### Integrate image storyshots with [Create React App](https://github.com/facebookincubator/create-react-app)

You have two options here, you can either:

- Simply add the storyshots configuration inside any of your `test.js` file. You must ensure you have either a running storybook or a static build available.

- Create a custom test file using Jest outside of the CRA scope:

  A more robust approach would be to separate existing test files ran by create-react-app (anything `(test|spec).js` suffixed files) from the test files to run storyshots with image snapshots.
  This use case can be achieved by using a custom name for the test file, ie something like `image-storyshots.runner.js`. This file will contains the `initStoryshots` call with image snapshots configuration.
  Then you will create a separate script entry in your package.json, for instance

  ```json
  {
    "scripts": {
      "image-snapshots": "jest image-storyshots.runner.js --config path/to/custom/jest.config.json"
    }
  }
  ```

  Note that you will certainly need a custom config file for Jest as you run it outside of the CRA scope and thus you do not have the built-in config.

  Once that's setup, you can run `yarn image-snapshots`.

### Example

A fully running example can be seen in [storyshots.test.js](integration/storyshots/storyshots.test.js)

### Reminder

An image snapshot is simply a screenshot taken by a web browser.

The browser opens a page (either using the static build of storybook or a running instance of Storybook)

If you run your test without either the static build or a running instance, this wont work.

To make sure your screenshots are taken from latest changes of your Storybook, you must keep your static build or running Storybook up-to-date.
This can be achieved by adding a step before running the test ie: `yarn build-storybook && yarn image-snapshots`.
If you run the image snapshots against a running Storybook in dev mode, you don't have to worry about the snapshots being up-to-date because the dev-server is watching changes and rebuilds automatically.
