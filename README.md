## Install

`npm install simpledownload`

## Usage

```js
import simpledownload from 'simpledownload'
await simpledownload('https://www.google.co.jp/images/srpr/logo11w.png', `${__dirname}/1.jpg`);
```

### simpledownload(url: string, localPath: string, options?: {timeout: number}): Promise\<void\>

* `url` - the url you wanna download. e.g `https://www.google.co.jp/images/srpr/logo11w.png`
* `localPath` - e.g `` `${__dirname}/1.jpg` ``
* `options.timeout` - use millisecond. If timeout, `err.timeout` would exist.

## license

MIT
