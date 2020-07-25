const {
  setupBeforeEach,
  username2,
  password,
  snapdev,
} = require('./fixtures/setup');

beforeEach(setupBeforeEach);

test('snapdev register success', async () => {
  let result;
  // login
  result = await snapdev(`register --force --email snapdevtest2@gmail.com --username ${username2} --password ${password}`);
  // console.log(result);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Account created`);
});

test('snapdev register duplicate email fail', async () => {
  let result;
  // login
  result = await snapdev(`register --force --email test@snapdev.co.za --username ${username2} --password ${password}`);
  // console.log(result);
  expect(result.code).toBe(1);
  // expect(result.stdout).toContain(`Account created`);
});

