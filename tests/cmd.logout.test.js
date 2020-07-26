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

test('snapdev logout success', async () => {
  let result;
  // login
  result = await snapdev(`login --username ${username} --password ${password}`);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Logged in as: ${username}`);
  expect(result.stdout).toContain(`Login Succeeded`);
  
  // logout
  result = await snapdev(`logout`);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Removed login credentials`);
});
