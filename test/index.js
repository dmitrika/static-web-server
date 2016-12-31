import test from 'ava';
import fs from 'fs-extra';
import rp from 'request-promise'

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
