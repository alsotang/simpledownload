[![Build Status](https://travis-ci.org/alsotang/simpledownload.svg?branch=master)](https://travis-ci.org/alsotang/simpledownload) [![Coverage Status](https://coveralls.io/repos/alsotang/simpledownload/badge.png?branch=master)](https://coveralls.io/r/alsotang/simpledownload?branch=master)

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
* `options.timeout` - use millisecond. If timeout, `err.timeout` would exist.
* `callback` - `function(err)`

license
==

MIT
