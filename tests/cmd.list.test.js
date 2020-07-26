const path = require('path');
const fs = require('fs-extra');
const {
  setupBeforeEach,
  username,
  password,
  snapdev,
} = require('./fixtures/setup');

beforeEach(async () => {
  await setupBeforeEach();
});
afterEach(async () => {});

test('snapdev list where user is not logged in', async () => {
  let result = await snapdev('list');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(
    `You must be logged in to see your remote templates`
  );
  expect(result.stdout).toContain(`No local templates found`);
});

test('snapdev list where user is not logged in but has two local templates', async () => {
  let result;

  // create template
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Switched to test-app`);

  // snapdev list
  result = await snapdev('list');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(
    `You must be logged in to see your remote templates`
  );
  expect(result.stdout).toContain(`test-app`);
});

test('snapdev list remote', async () => {
  let result;

  // login
  result = await snapdev(`login --username ${username} --password ${password}`);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Logged in as: snapdevtest`);
  expect(result.stdout).toContain(`Login Succeeded`);

  // create test-app
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // push template
  result = await snapdev('push');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Push Succeeded`);

  // list
  result = await snapdev('list');
  expect(result.code).toBe(0);
  // console.log(result.stdout);
  expect(result.stdout).toContain(`${username}/test-app`);
  expect(result.stdout).not.toContain(`No remote templates found`);
  expect(result.stdout).not.toContain(`No local templates found`);
});
