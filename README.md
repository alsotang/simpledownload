simpledownload
=

install
==

`npm install simpledownload`

get start
==

```js
var download = require('simpledownload');
download('https://www.google.co.jp/images/srpr/logo11w.png',
  __dirname + '/google.png', function (err) {
    // hanlde err
    });
```

download(url, filename, [options], callback)
==

* `url` - the url you wanna download. e.g `http://fxck.it/1.jpg`
* `filename` - e.g `__dirname + '/1.jpg'`
* `options.timeout` - use millisecond

license
==

MIT
