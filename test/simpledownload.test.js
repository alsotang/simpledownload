var download = require('..');
var fs = require('fs');
var path = require('path');
var should = require('should');
var nock = require('nock');

var dir = path.join(__dirname, 'download');
var urlhost = 'http://nodejs.org';
var urlpath = '/images/logo.svg';
var url = urlhost + urlpath;

var pathname = path.join(dir, 'logo.svg');

describe('test/simpledownload.test.js', function () {
  before(function () {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  });

  afterEach(function () {
    if (fs.existsSync(pathname)) {
      fs.unlinkSync(pathname);
    }
  });

  it('should download a svg', function (done) {
    var replyContent = 'mock svg';
    nock(urlhost)
      .get(urlpath)
      .reply(200, replyContent);

    download(url, pathname, function (err) {
      should.not.exists(err);
      var filecontent = fs.readFileSync(pathname, 'utf-8');
      filecontent.should.equal(replyContent);
      done();
    });
  });

  it('should handle timeout', function (done) {
    var replyContent = 'mock svg';
    nock(urlhost)
      .get(urlpath)
      .delay(2000)
      .reply(200, replyContent);

    download(url, pathname, {timeout: 20}, function (err) {
      err.timeout.should.equal(20);
      done();
    });
  });

  it('should err when pathname not exists', function (done) {
    var replyContent = 'mock svg';
    nock(urlhost)
      .get(urlpath)
      .reply(200, replyContent);

    var pathname = path.join(__dirname, 'notexists/1.svg');
    download(url, pathname, function (err) {
      err.code.should.equal('ENOENT');
      done();
    });
  });
});
