const { setupBeforeEach, username, username2, email, email2, password, snapdev } = require('./fixtures/setup');

beforeEach(async () => {
  await setupBeforeEach();
});
afterEach(async () => {});

test('snapdev register success', async () => {
  const result = await snapdev(`register --force --email ${email2} --username ${username2} --password ${password}`);
  // console.log(result);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Account created`);
});

test('snapdev register fail duplicate email', async () => {
  let result;

  result = await snapdev(`register --force --email ${email2} --username ${username2} --password ${password}`);
  // console.log(result);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Account created`);

  result = await snapdev(`register --force --email ${email2} --username ${username2} --password ${password}`);
  // console.log(result);
  expect(result.code).toBe(1);
});

test('snapdev register fail duplicate username', async () => {
  let result;

  result = await snapdev(`register --force --email ${email} --username ${username} --password ${password}`);
  // console.log(result);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Account created`);

  result = await snapdev(`register --force --email ${email2} --username ${username} --password ${password}`);
  // console.log(result);
  expect(result.code).toBe(1);
});
