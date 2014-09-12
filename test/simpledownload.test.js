var download = require('..');
var fs = require('fs');
var path = require('path');
var superagent = require('superagent');
var should = require('should');

var dir = path.join(__dirname, 'download');

describe('test/simpledownload.test.js', function () {
  before(function () {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  });

  it('should download a svg', function (done) {
    var url = 'http://nodejs.org/images/logo.svg';
    var pathname = path.join(dir, 'logo.svg');
    download(url, pathname, function (err) {
      var filecontent = fs.readFileSync(pathname, 'utf-8');
      superagent.get(url)
        .end(function (err, res) {
          res.body.should.equal(filecontent);
          done();
        });
    });
  });

});
