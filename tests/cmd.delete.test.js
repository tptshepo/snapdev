const { setupBeforeEach, username, email, password, snapdev } = require('./fixtures/setup');

beforeEach(async () => {
  await setupBeforeEach();
});
afterEach(async () => {});

test('snapdev delete, local template', async () => {
  let result;

  // create
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // delete
  result = await snapdev('delete test-app --force');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`[Local] test-app removed`);

  // status
  result = await snapdev('status');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`template.json not found`);
});

test('snapdev delete, local and remote template', async () => {
  let result;

  // create user
  result = await snapdev(`register --force --email ${email} --username ${username} --password ${password}`);
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

  // delete
  result = await snapdev(`delete ${username}/test-app --remote --force`);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`[Remote] ${username}/test-app removed`);
  expect(result.stdout).toContain(`[Local] ${username}/test-app removed`);

  // status
  result = await snapdev('status');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`template.json not found`);
});
