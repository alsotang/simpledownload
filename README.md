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
* `options.timeout` - use millisecond. If timeout, `err.timeout` would exist.
* `options.agent` - `http.Agent`. For example, you can use `node-socks-proxy-agent` to enable socks5 proxy.

## license

MIT
