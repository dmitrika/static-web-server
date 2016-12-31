const fs = require('fs');
const config = require('./config.js');

module.exports = function receiveFile(filepath, req, res) {
  if (req.headers['content-length'] > config.limitFileSize) {
    res.statusCode = 413;
    res.end('File is too big!');
    return;
  }

  let size = 0;
  let writeStream = new fs.WriteStream(filepath, {flags: 'wx'});

  req
    .on('data', chunk => {
      size += chunk.length;

      if (size > config.limitFileSize) {
        res.writeHead(413, {'Connection': 'close'});
        res.end('File is too big!');

        writeStream.destroy();
        fs.unlink(filepath);
      }
    })
    .on('close', () => {
      writeStream.destroy();
      fs.unlink(filepath);
    })
    .pipe(writeStream);

  writeStream
    .on('error', err => {
      if (err.code === 'EEXIST') {
        res.statusCode = 409;
        res.end('File exists');
      } else {
        if (!res.headersSent) {
          res.writeHead(500, {'Connection': 'close'});
          res.write('Internal error');
        }
        fs.unlink(filepath, err => res.end());
      }
    })
    .on('close', () => res.end('OK'));
}
