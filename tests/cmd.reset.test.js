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

test('snapdev reset', async () => {
  let result;
  
  // create user
  result = await snapdev(
    `register --force --email ${email} --username ${username} --password ${password}`
  );
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

  // reset
  result = await snapdev(`reset --force`);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Cloning template....`);
  expect(result.stdout).toContain(`Download size: 1509`);
  expect(result.stdout).toContain(`Clone location: ${templateFolderWithUser}`);
  expect(result.stdout).toContain(`Switched to ${username}/test-app`);
});

test('snapdev reset, fail if no online template', async () => {
  let result;
  
  // create user
  result = await snapdev(
    `register --force --email ${email} --username ${username} --password ${password}`
  );
  expect(result.code).toBe(0);

  // login
  result = await snapdev(`login --username ${username} --password ${password}`);
  expect(result.code).toBe(0);

  // create
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // reset
  result = await snapdev(`reset --force`);
  expect(result.code).toBe(1);

  // check local template
  result = await snapdev('status');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template name: ${username}/test-app`);
});



