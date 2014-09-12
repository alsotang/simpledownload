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
      try {
        fs.writeFileSync(filename, res.text, {encoding: null});
      } catch (e) {
        return callback(e);
      }
      callback(null);
    });
};

exports = module.exports = download;
