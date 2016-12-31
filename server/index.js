const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const config = require('./config.js');
const sendFile = require('./send-file.js');
const receiveFile = require('./recive-file.js');

module.exports = http.createServer((req, res) => {
  let pathname = url.parse(req.url).pathname;
  let filename = pathname.slice(1);

  if (filename.includes('/') || filename.includes('..')) {
    res.statusCode = 400;
    res.end('Nested paths are not allowed');
    return;
  }

  if (req.method === 'GET') {
    if (pathname === '/') {
      const index = path.join(config.public, 'index.html');
      sendFile(index, res);
    } else {
      const filepath = path.join(config.files, filename);
      sendFile(filepath, res);
    }
  }

  if (req.method === 'POST') {
    if (!filename) {
      req.statusCode = 404;
      req.end('File not found!');
    }
    const filepath = path.join(config.files, filename);
    receiveFile(filepath, req, res);
  }

  if (req.method === 'DELETE') {
    let filepath = path.join(config.files, filename);
    fs.unlink(filepath, err => {
      if (err) {
        throw new Error(err);
      } else {
        res.statusCode = 200;
        res.end('File deleted!');
      }
    });
  }
})
