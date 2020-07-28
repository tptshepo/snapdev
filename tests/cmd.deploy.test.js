const {
  setupBeforeEach,
  username,
  email,
  password,
  snapdev,
  templateFolderWithNoUser,
  templateFolderWithUser,
  projectFolder,
  touch,
} = require('./fixtures/setup');

beforeEach(async () => {
  await setupBeforeEach();
});
afterEach(async () => {});

test('snapdev deploy', async () => {
  let result;

  // create
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // generate
  result = await snapdev('generate');
  expect(result.code).toBe(0);

  // deploy
  result = await snapdev('deploy');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Destination: ${projectFolder}`);
  expect(result.stdout).toContain(`Copied: MyAppModel.java`);
});

test('snapdev deploy, fail if parent folder not project', async () => {
  let result;

  // create file
  const file = await touch(projectFolder + '/.no-snapdev-project', 'test');

  // create
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // generate
  result = await snapdev('generate');
  expect(result.code).toBe(0);

  // deploy
  result = await snapdev('deploy');
  expect(result.code).toBe(1);
  expect(result.stdout).toContain(
    `Project folder conatins .no-snapdev-project file`
  );
});

test('snapdev deploy, force copy if parent folder not project', async () => {
  let result;

  // create file
  const file = await touch(projectFolder + '/.no-snapdev-project', 'test');

  // create
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // generate
  result = await snapdev('generate');
  expect(result.code).toBe(0);

  // deploy
  result = await snapdev('deploy --force');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Destination: ${projectFolder}`);
  expect(result.stdout).toContain(`Copied: MyAppModel.java`);
});

