const {
  setupBeforeEach,
  username,
  email,
  password,
  snapdev,
} = require('./fixtures/setup');

beforeEach(async () => {
  await setupBeforeEach();
});
afterEach(async () => {});

test('snapdev login success', async () => {
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
});

test('snapdev login fail', async () => {
  let result;

  // create user
  result = await snapdev(
    `register --force --email ${email} --username ${username} --password ${password}`
  );
  expect(result.code).toBe(0);

  // login
  result = await snapdev(`login --username ${username} --password demo`);
  expect(result.stdout).toContain(`Invalid username or password`);
});
