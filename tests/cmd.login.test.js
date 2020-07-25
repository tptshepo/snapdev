const {
  setupBeforeEach,
  username,
  password,
  snapdev,
} = require('./fixtures/setup');

beforeEach(setupBeforeEach);

test('snapdev login success', async () => {
  let stdout;
  // login
  stdout = await snapdev(`login --username ${username} --password ${password}`);
  expect(stdout).toEqual(expect.stringContaining(`Logged in as: ${username}`));
  expect(stdout).toEqual(expect.stringContaining(`Login Succeeded`));
});

test('snapdev login fail', async () => {
  let stdout;
  // login
  stdout = await snapdev(`login --username demo --password demo`);
  expect(stdout).toEqual(
    expect.stringContaining(`Unauthorized: incorrect username or password`)
  );
});
