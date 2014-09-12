var http = require('http');
var fs = require('fs');

var download = function(url, pathname, cb) {
  var file = fs.createWriteStream(pathname);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);
    });
  });
};

exports = module.exports = download;
