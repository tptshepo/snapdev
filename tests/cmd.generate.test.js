const {
  setupBeforeEach,
  username,
  password,
  snapdev,
  templateFolderWithNoUser,
  templateFolderWithUser,
  snapdevFolder,
  mkdir,
  touch,
  exists,
} = require('./fixtures/setup');

beforeEach(async () => {
  await setupBeforeEach();
});
afterEach(async () => {});

test('snapdev generate', async () => {
  let result;

  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  result = await snapdev('generate');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template name: test-app`);
  expect(result.stdout).toContain(`Model filename: default.json`);
  expect(result.stdout).toContain(
    `${templateFolderWithNoUser}/models/default.json`
  );
  expect(result.stdout).toContain(`========== Source Code ==========`);
  expect(result.stdout).toContain(`MyModel.java`);
  expect(result.stdout).toContain(`Done.`);
});

test('snapdev generate for all model files', async () => {
  let result;

  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  result = await snapdev('generate --all');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template name: test-app`);
  expect(result.stdout).toContain(`Generate for all models`);
  expect(result.stdout).toContain(`Model filename: default.json`);
  expect(result.stdout).toContain(
    `${templateFolderWithNoUser}/models/default.json`
  );
  expect(result.stdout).toContain(`========== Source Code ==========`);
  expect(result.stdout).toContain(`MyModel.java`);
  expect(result.stdout).toContain(`Done.`);
});

test('snapdev generate with clear', async () => {
  let result;

  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // create dist folder
  const distFolder = await mkdir('/dist');
  const moduleFolder = await mkdir('/dist/node_modules');
  // create any file
  await touch(distFolder + '/added.txt', 'test');
  await touch(moduleFolder + '/added.txt', 'test');

  let found = await exists(distFolder + '/added.txt');
  expect(found).toBe(true);
  found = await exists(moduleFolder + '/added.txt');
  expect(found).toBe(true);

  result = await snapdev('generate --clear');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template name: test-app`);
  expect(result.stdout).toContain(`Model filename: default.json`);
  expect(result.stdout).toContain(`${templateFolderWithNoUser}/models/default.json`);
  expect(result.stdout).toContain(`========== Source Code ==========`);
  expect(result.stdout).toContain(`MyModel.java`);
  expect(result.stdout).toContain(`Done.`);

  found = await exists(distFolder + '/added.txt');
  expect(found).toBe(false);
  found = await exists(moduleFolder + '/added.txt');
  expect(found).toBe(true);
});

test('snapdev generate with clear and force', async () => {
  let result;

  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // create dist folder
  const distFolder = await mkdir('/dist');
  const moduleFolder = await mkdir('/dist/node_modules');
  // create any file
  await touch(distFolder + '/added.txt', 'test');
  await touch(moduleFolder + '/added.txt', 'test');

  let found = await exists(distFolder + '/added.txt');
  expect(found).toBe(true);
  found = await exists(moduleFolder + '/added.txt');
  expect(found).toBe(true);

  result = await snapdev('generate --clear --force');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template name: test-app`);
  expect(result.stdout).toContain(`Model filename: default.json`);
  expect(result.stdout).toContain(`${templateFolderWithNoUser}/models/default.json`);
  expect(result.stdout).toContain(`========== Source Code ==========`);
  expect(result.stdout).toContain(`MyModel.java`);
  expect(result.stdout).toContain(`Done.`);

  found = await exists(distFolder + '/added.txt');
  expect(found).toBe(false);
  found = await exists(moduleFolder + '/added.txt');
  expect(found).toBe(false);
});
