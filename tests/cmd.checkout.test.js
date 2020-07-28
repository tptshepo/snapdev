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

test('snapdev checkout with no user', async () => {
  let result;

  // create test-app
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // status
  result = await snapdev('status');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template name: test-app`);

  // create test-app2
  result = await snapdev('create test-app2');
  expect(result.code).toBe(0);

  // status
  result = await snapdev('status');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template name: test-app2`);

  // checkout
  result = await snapdev('checkout test-app');
  expect(result.code).toBe(0);

  // status
  result = await snapdev('status');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template name: test-app`);
});

test('snapdev checkout with user', async () => {
  let result;

  // create user
  result = await snapdev(
    `register --force --email ${email} --username ${username} --password ${password}`
  );
  expect(result.code).toBe(0);

  // login
  result = await snapdev(`login --username ${username} --password ${password}`);
  expect(result.code).toBe(0);

  // create test-app
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // status
  result = await snapdev('status');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template name: ${username}/test-app`);

  // create test-app2
  result = await snapdev('create test-app2');
  expect(result.code).toBe(0);

  // status
  result = await snapdev('status');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template name: ${username}/test-app2`);

  // checkout
  result = await snapdev(`checkout ${username}/test-app`);
  expect(result.code).toBe(0);

  // status
  result = await snapdev('status');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template name: ${username}/test-app`);
});
