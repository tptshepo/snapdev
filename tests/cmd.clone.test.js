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

test('snapdev clone', async () => {
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

  // clone
  result = await snapdev(`clone ${username}/test-app --force`);
  // console.log(result);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Cloning template....`);
  expect(result.stdout).toContain(`Download size: 1509`);
  expect(result.stdout).toContain(`Clone location: ${templateFolderWithUser}`);
  expect(result.stdout).toContain(`Switched to ${username}/test-app`);
});

test('snapdev clone should fail if local template exists', async () => {
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

  // clone
  result = await snapdev(`clone ${username}/test-app`);
  expect(result.code).toBe(1);
  expect(result.stdout).toContain(
    `The destination location is not empty, add --force to overrid`
  );
});
