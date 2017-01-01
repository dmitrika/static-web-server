import test from 'ava';
import fs from 'fs-extra';
import rp from 'request-promise';
import path from 'path';

import server from '../server';
import config from '../server/config';

const host = 'http://127.0.0.1:3000';

const request = rp.defaults({
  encoding: null,
  simple: false,
  resolveWithFullResponse: true
});

test.before(async t => {
  server.listen(3000);
});

test.after(async t => {
  server.close();
});

test.beforeEach(async t => {
  fs.emptyDirSync(config.files);
});

test('GET /nested/path returns 400', async t => {
  const response = await request.get(`${host}/nested/path`);

  t.is(response.statusCode, 400);
});

test('GET /file.test returns 200 & the file', async t => {
  const filepath = path.join('files', 'message.txt');
  const file = fs.writeFileSync(filepath, 'Hello tester');
  const content = fs.readFileSync(filepath);

  const response = await request.get(`${host}/message.txt`);

  t.deepEqual(response.body, content);
});

test('GET /file.test returns 404 inexistent', async t => {
  const response = await request.get(`${host}/inexistent.png`);

  t.is(response.statusCode, 404);
});

test('POST returns 200 & file is uploaded', async t => {
  const filepath = path.join('files', 'message2.txt');

  const assertpath = path.join('files', 'message-test.txt');
  fs.writeFileSync(assertpath, 'Hello tester');

  const req = request.post(`${host}/message2.txt`);

  fs.createReadStream(assertpath).pipe(req);

  const response = await req;

  t.is(response.statusCode, 200);
  t.deepEqual(fs.readFileSync(filepath), fs.readFileSync(assertpath))
});
