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
  copy,
  exists,
  templateModelFolderWithUser,
  templateModelFolderWithNoUser,
  snapdevModelsFolder,
} = require('./fixtures/setup');

beforeEach(async () => {
  await setupBeforeEach();
});
afterEach(async () => {});

test('snapdev generate', async () => {
  let result;

  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // copy default model to models folder
  await copy(templateModelFolderWithNoUser + '/default.json', snapdevModelsFolder + '/test-app-model.json');

  result = await snapdev('generate test-app-model');
  // console.log(result);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template name: test-app`);
  expect(result.stdout).toContain(`Model filename: test-app-model.json`);
  expect(result.stdout).toContain(
    `${snapdevModelsFolder}/test-app-model.json`
  );
  expect(result.stdout).toContain(`========== Source Code ==========`);
  expect(result.stdout).toContain(`MyAppModel.java`);
  expect(result.stdout).toContain(`Done.`);
});

test('snapdev generate should fail if no model', async () => {
  let result;

  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // copy default model to models folder
  await copy(templateModelFolderWithNoUser + '/default.json', snapdevModelsFolder + '/test-app-model.json');

  result = await snapdev('generate');
  // console.log(result);
  expect(result.code).toBe(1);
  expect(result.stderr).toContain(`Not enough non-option arguments: got 0, need at least 1`);
});

test('snapdev generate with clear', async () => {
  let result;

  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // copy default model to models folder
  await copy(templateModelFolderWithNoUser + '/default.json', snapdevModelsFolder + '/test-app-model.json');

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

  result = await snapdev('generate test-app-model --clear');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template name: test-app`);
  expect(result.stdout).toContain(`Model filename: test-app-model.json`);
  expect(result.stdout).toContain(`${snapdevModelsFolder}/test-app-model.json`);
  expect(result.stdout).toContain(`========== Source Code ==========`);
  expect(result.stdout).toContain(`MyAppModel.java`);
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

  // copy default model to models folder
  await copy(templateModelFolderWithNoUser + '/default.json', snapdevModelsFolder + '/test-app-model.json');

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

  result = await snapdev('generate test-app-model --clear --force');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template name: test-app`);
  expect(result.stdout).toContain(`Model filename: test-app-model.json`);
  expect(result.stdout).toContain(`${snapdevModelsFolder}/test-app-model.json`);
  expect(result.stdout).toContain(`========== Source Code ==========`);
  expect(result.stdout).toContain(`MyAppModel.java`);
  expect(result.stdout).toContain(`Done.`);

  found = await exists(distFolder + '/added.txt');
  expect(found).toBe(false);
  found = await exists(moduleFolder + '/added.txt');
  expect(found).toBe(false);
});
