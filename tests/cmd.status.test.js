const path = require('path');
const fs = require('fs-extra');
const {
  setupBeforeEach,
  username,
  password,
  snapdev,
  templateFolderWithUser,
  templateFolderWithNoUser,
} = require('./fixtures/setup');

beforeEach(setupBeforeEach);

test('snapdev status when not logged in and no template', async () => {
  let stdout = await snapdev('status');
  // console.log(stdout);
  expect(stdout).toEqual(
    expect.stringContaining(`API endpoint: http://localhost:3001`)
  );
  expect(stdout).toEqual(expect.stringContaining(`template.json not found`));
});

test('snapdev status when not logged in with a template', async () => {
  let stdout;
  
  // create test-app
  stdout = await snapdev('create test-app');

  stdout = await snapdev('status');
  // console.log(stdout);
  expect(stdout).toEqual(
    expect.stringContaining(`API endpoint: http://localhost:3001`)
  );
  expect(stdout).toEqual(expect.stringContaining(`Template name: test-app`));
  expect(stdout).toEqual(expect.stringContaining(`Template version: 0.0.1`));
  expect(stdout).toEqual(expect.stringContaining(`Template root: ${templateFolderWithNoUser}`));
});

test('snapdev status when logged in and no template', async () => {
  let stdout;
  // login
  stdout = await snapdev(`login --username ${username} --password ${password}`);
  expect(stdout).toEqual(expect.stringContaining(`Logged in as: ${username}`));
  expect(stdout).toEqual(expect.stringContaining(`Login Succeeded`));

  stdout = await snapdev('status');
  // console.log(stdout);
  expect(stdout).toEqual(
    expect.stringContaining(`API endpoint: http://localhost:3001`)
  );
  expect(stdout).toEqual(expect.stringContaining(`Logged in as: ${username}`));
  expect(stdout).toEqual(expect.stringContaining(`template.json not found`));
});


test('snapdev status when logged in with a template', async () => {
  let stdout;
  // login
  stdout = await snapdev(`login --username ${username} --password ${password}`);
  expect(stdout).toEqual(expect.stringContaining(`Logged in as: ${username}`));
  expect(stdout).toEqual(expect.stringContaining(`Login Succeeded`));

  // create test-app
  stdout = await snapdev('create test-app');

  stdout = await snapdev('status');
  // console.log(stdout);
  expect(stdout).toEqual(
    expect.stringContaining(`API endpoint: http://localhost:3001`)
  );
  expect(stdout).toEqual(expect.stringContaining(`Logged in as: ${username}`));
  expect(stdout).toEqual(expect.stringContaining(`Template name: ${username}/test-app`));
  expect(stdout).toEqual(expect.stringContaining(`Template version: 0.0.1`));
  expect(stdout).toEqual(expect.stringContaining(`Template root: ${templateFolderWithUser}`));
});

