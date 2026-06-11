[![Node.js CI](https://github.com/alsotang/simpledownload/actions/workflows/node.js.yml/badge.svg)](https://github.com/alsotang/simpledownload/actions/workflows/node.js.yml)

## Install

`npm install simpledownload`

## Usage

```js
import {simpledownload} from 'simpledownload'
await simpledownload('https://www.google.co.jp/images/srpr/logo11w.png', `${__dirname}/1.jpg`);
```

### simpledownload(url: string, localPath: string, options?: {timeout, agent}): Promise\<void\>

* `url` - the url you wanna download. e.g `https://www.google.co.jp/images/srpr/logo11w.png`
* `localPath` - e.g `` `${__dirname}/1.jpg` ``
* `options.timeout` - timeout in milliseconds.
* `options.agent` - `http.Agent` or `https.Agent`. For example, you can use `node-socks-proxy-agent` to enable socks5 proxy.

## Error handling

```js
import {simpledownload, HttpStatusCodeError, TimeoutError} from 'simpledownload'

try {
  await simpledownload('https://example.com/file.jpg', `${__dirname}/1.jpg`, {
    timeout: 5000,
  });
} catch (err) {
  if (err instanceof HttpStatusCodeError && err.statusCode === 404) {
    // handle not found
  } else if (err instanceof TimeoutError) {
    // handle timeout
    console.log(err.timeout);
  } else {
    throw err;
  }
}
```

Redirect responses (`3xx`) with a `Location` header are followed automatically.
After redirects, any non-2xx response rejects with `HttpStatusCodeError`, so callers can check `err.statusCode`.
If the download times out, it rejects with `TimeoutError`, so callers can check `err.timeout`.


## dev

1. `$ npm run test`
2. bump package.json version
3. `$ npm publish`

## license

MIT
