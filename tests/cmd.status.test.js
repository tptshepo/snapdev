const path = require('path');
const fs = require('fs-extra');
const {
  setupBeforeEach,
  username,
  password,
  email,
  snapdev,
  templateFolderWithUser,
  templateFolderWithNoUser,
} = require('./fixtures/setup');

beforeEach(async () => {
  await setupBeforeEach();
});
afterEach(async () => {});

test('snapdev status when not logged in and no template', async () => {
  let result = await snapdev('status');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`API endpoint: http://localhost:3001`);
  expect(result.stdout).toContain(`template.json not found`);
});

test('snapdev status when not logged in with a template', async () => {
  let result;

  // create test-app
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  result = await snapdev('status');
  expect(result.code).toBe(0);
  // console.log(stdout);
  expect(result.stdout).toContain(`API endpoint: http://localhost:3001`);
  expect(result.stdout).toContain(`Template name: test-app`);
  expect(result.stdout).toContain(`Template version: 0.0.1`);
  expect(result.stdout).toContain(`Template root: ${templateFolderWithNoUser}`);
});

test('snapdev status when logged in and no template', async () => {
  let result;

  // create user
  result = await snapdev(
    `register --force --email ${email} --username ${username} --password ${password}`
  );
  expect(result.code).toBe(0);

  // login
  result = await snapdev(`login --username ${username} --password ${password}`);
  expect(result.code).toBe(0);

  result = await snapdev('status');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`API endpoint: http://localhost:3001`);
  expect(result.stdout).toContain(`Logged in as: ${username}`);
  expect(result.stdout).toContain(`template.json not found`);
});

test('snapdev status when logged in with a template', async () => {
  let result;

  // create user
  result = await snapdev(
    `register --force --email ${email} --username ${username} --password ${password}`
  );
  expect(result.code).toBe(0);

  // login
  result = await snapdev(`login --username ${username} --password ${password}`);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Logged in as: ${username}`);
  expect(result.stdout).toContain(`Login Succeeded`);

  // create test-app
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  result = await snapdev('status');
  expect(result.code).toBe(0);
  // console.log(stdout);
  expect(result.stdout).toContain(`API endpoint: http://localhost:3001`);
  expect(result.stdout).toContain(`Logged in as: ${username}`);
  expect(result.stdout).toContain(`Template name: ${username}/test-app`);
  expect(result.stdout).toContain(`Template version: 0.0.1`);
  expect(result.stdout).toContain(`Template root: ${templateFolderWithUser}`);
});
