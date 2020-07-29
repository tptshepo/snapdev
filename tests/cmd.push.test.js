const {
  setupBeforeEach,
  username,
  email,
  password,
  snapdev,
  templateFolderWithNoUser,
  templateFolderWithUser,
} = require('./fixtures/setup');

beforeEach(async () => {
  await setupBeforeEach();
});
afterEach(async () => {});

test('snapdev push', async () => {
  let result;
  
   // create user
   result = await snapdev(
    `register --force --email ${email} --username ${username} --password ${password}`
  );
  expect(result.code).toBe(0);

  // login
  result = await snapdev(`login --username ${username} --password ${password}`);
  expect(result.code).toBe(0);

  // create
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // push
  result = await snapdev('push');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Pushing...`);
  expect(result.stdout).toContain(`Push Succeeded`);
});

test('snapdev push, fail when pushing an existing version', async () => {
  let result;
  
   // create user
   result = await snapdev(
    `register --force --email ${email} --username ${username} --password ${password}`
  );
  expect(result.code).toBe(0);

  // login
  result = await snapdev(`login --username ${username} --password ${password}`);
  expect(result.code).toBe(0);

  // create
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // push
  result = await snapdev('push');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Pushing...`);
  expect(result.stdout).toContain(`Push Succeeded`);
  
  // push
  result = await snapdev('push');
  expect(result.code).toBe(1);
});

test('snapdev push, success when pushing a new version', async () => {
  let result;
  
   // create user
   result = await snapdev(
    `register --force --email ${email} --username ${username} --password ${password}`
  );
  expect(result.code).toBe(0);

  // login
  result = await snapdev(`login --username ${username} --password ${password}`);
  expect(result.code).toBe(0);

  // create
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // push
  result = await snapdev('push');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Pushing...`);
  expect(result.stdout).toContain(`Push Succeeded`);

  // tab --version
  result = await snapdev('tag --version 0.0.2');
  expect(result.code).toBe(0);
  
  // push
  result = await snapdev('push');
  expect(result.code).toBe(0);
});


