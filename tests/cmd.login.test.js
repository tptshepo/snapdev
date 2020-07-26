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

test('snapdev login success', async () => {
  let result;
  // login
  result = await snapdev(`login --username ${username} --password ${password}`);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Logged in as: ${username}`);
  expect(result.stdout).toContain(`Login Succeeded`);
});

test('snapdev login fail', async () => {
  let result;
  // login
  result = await snapdev(`login --username demo --password demo`);
  expect(result.stdout).toContain(`Unauthorized: incorrect username or password`);
});
