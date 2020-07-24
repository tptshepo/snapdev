const path = require('path');
const fs = require('fs-extra');
const {
  setupBeforeEach,
  username,
  password,
  snapdev,
} = require('./fixtures/setup');

beforeEach(setupBeforeEach);

test('snapdev list where user is not logged in', async () => {
  let stdout = await snapdev('list');
  expect(stdout).toEqual(
    expect.stringContaining(
      `You must be logged in to see your remote templates`
    )
  );
  expect(stdout).toEqual(expect.stringContaining(`No local templates found`));
});

test('snapdev list where user is not logged in but has two local templates', async () => {
  let stdout;

  // create template
  stdout = await snapdev('create test-app');
  expect(stdout).toEqual(expect.stringContaining(`Switched to test-app`));

  // snapdev list
  stdout = await snapdev('list');
  expect(stdout).toEqual(
    expect.stringContaining(
      `You must be logged in to see your remote templates`
    )
  );
  expect(stdout).toEqual(expect.stringContaining(`test-app`));
});

test('snapdev list remote', async () => {
  let stdout;

  // login
  stdout = await snapdev(`login --username ${username} --password ${password}`);
  expect(stdout).toEqual(expect.stringContaining(`Logged in as: snapdevtest`));
  expect(stdout).toEqual(expect.stringContaining(`Login Succeeded`));

  // create test-app
  stdout = await snapdev('create test-app');

  // push template
  stdout = await snapdev('push');
  expect(stdout).toEqual(expect.stringContaining(`Push Succeeded`));

  // list
  stdout = await snapdev('list');
  // console.log(stdout);
  expect(stdout).toEqual(expect.stringContaining(`${username}/test-app`));
  expect(stdout).not.toEqual(
    expect.stringContaining(`No remote templates found`)
  );
  expect(stdout).not.toEqual(
    expect.stringContaining(`No local templates found`)
  );
});
