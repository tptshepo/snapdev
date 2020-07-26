const {
  setupBeforeEach,
  username,
  username2,
  email,
  email2,
  password,
  snapdev,
} = require('./fixtures/setup');

beforeEach(async () => {
  await setupBeforeEach();
  let result;
  // remove username2
  result = await snapdev(`logout --force`);
  result = await snapdev(
    `login --username ${username2} --password ${password}`
  );
  result = await snapdev(`deregister --force`);

  // remove username
  result = await snapdev(`logout --force`);
  result = await snapdev(`login --username ${username} --password ${password}`);
  result = await snapdev(`deregister --force`);
});

test('snapdev register success', async () => {
  let result;

  result = await snapdev(
    `register --force --email ${email2} --username ${username2} --password ${password}`
  );
  // console.log(result);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Account created`);
});

test('snapdev register fail duplicate email', async () => {
  let result;

  result = await snapdev(
    `register --force --email ${email2} --username ${username2} --password ${password}`
  );
  // console.log(result);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Account created`);

  result = await snapdev(
    `register --force --email ${email2} --username ${username2} --password ${password}`
  );
  // console.log(result);
  expect(result.code).toBe(1);
});

test('snapdev register fail duplicate username', async () => {
  let result;

  result = await snapdev(
    `register --force --email ${email} --username ${username} --password ${password}`
  );
  // console.log(result);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Account created`);

  result = await snapdev(
    `register --force --email ${email2} --username ${username} --password ${password}`
  );
  // console.log(result);
  expect(result.code).toBe(1);
});
