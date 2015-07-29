var superagent = require('superagent');
var superagentparse = require('superagentparse');
var fs = require('fs');

var download = function(url, filename, options, callback) {
  if (!callback) {
    callback = options;
    options = {};
  }

  var timeout = options.timeout;
  superagent
    .get(url)
    .parse(superagentparse('buffer'))
    .buffer(true)
    .timeout(timeout)
    .end(function (err, res) {
      if (err) {
        return callback(err);
      }
      fs.writeFile(filename, res.text, {encoding: null}, callback);
    });
};

exports = module.exports = download;
