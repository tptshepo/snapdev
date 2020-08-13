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

test('snapdev deregister', async () => {
  let result;

  // register
  result = await snapdev(
    `register --force --email ${email} --username ${username} --password ${password}`
  );
  expect(result.code).toBe(0);

  // login
  result = await snapdev(`login --username ${username} --password ${password}`);
  expect(result.code).toBe(0);

  // deregister
  result = await snapdev(`deregister --force`);
  expect(result.code).toBe(0);

  // login
  result = await snapdev(`login --username ${username} --password ${password}`);
  expect(result.code).toBe(1);
});


