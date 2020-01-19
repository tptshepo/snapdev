const path = require('path');
const fs = require('fs-extra');
const { cli, cwd, setup } = require('./fixtures/preTest');

beforeEach(setup);

test('snapdev init', async () => {
  let stdout = await cli('init');
  console.log(stdout);
});
