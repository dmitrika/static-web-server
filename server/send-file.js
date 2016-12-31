const fs = require('fs');
const mime = require('mime');

module.exports = function sendFile(path, res) {
  let fileStream = fs.createReadStream(path);
  fileStream.pipe(res);

  fileStream
    .on('error', err => {
      if (err.code === 'ENOENT') {
        res.statusCode = 404;
        res.end('Not found');
      } else {
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end('Internal error');
        } else {
          res.end();
        }
      }
    })
    .on('open', () => {
      res.setHeader('Content-Type', mime.lookup(path));
    });

  res
    .on('close', () => {
      fileStream.destroy();
    });

}
