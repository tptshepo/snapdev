const {
  setupBeforeEach,
  snapdev,
  projectFolder,
  touch,
  templateModelFolderWithNoUser,
  snapdevModelsFolder,
  copy,
  readFile,
} = require('./fixtures/setup');
const colors = require('colors');
const path = require('path');

beforeEach(async () => {
  await setupBeforeEach();
});
afterEach(async () => {});

test('snapdev deploy copy/paste placeholders', async () => {
  let result;

  // create
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // copy default model to models folder
  await copy(
    templateModelFolderWithNoUser + '/default.json',
    snapdevModelsFolder + '/test-app-model.json'
  );

  // generate
  result = await snapdev('generate test-app-model');
  expect(result.code).toBe(0);

  // deploy
  result = await snapdev('deploy');
  // console.log(result);
  expect(result.code).toBe(0);
  // expect(result.stdout).toContain(`Destination: ${projectFolder}`);
  // expect(result.stdout).toContain(`${colors.green('Copied:')} MyAppModel.java`);

  await copy(
    path.join(__dirname, 'fixtures', 'App.java'),
    path.join(projectFolder, 'App.java')
  );

  result = await snapdev('deploy');
  // console.log(result);
  expect(result.code).toBe(0);

  const fileData = await readFile(path.join(projectFolder, 'App.java'));
  expect(fileData).toContain(`package co.za.snapdev;
public class App {
  static void main(String[] args){
    private String field1;
    private String field2;
    // snapdev::paste::{"marker": "props", "index": 0}
    // logic goes here!
    // snapdev::paste::{"marker": "logic"}
    private String field1;
    private String field2;
    // snapdev::paste::{"marker": "props", "index": 1}
  }    
}`);
});

test('snapdev deploy', async () => {
  let result;

  // create
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // copy default model to models folder
  await copy(
    templateModelFolderWithNoUser + '/default.json',
    snapdevModelsFolder + '/test-app-model.json'
  );

  // generate
  result = await snapdev('generate test-app-model');
  expect(result.code).toBe(0);

  // deploy
  result = await snapdev('deploy');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Destination: ${projectFolder}`);
  expect(result.stdout).toContain(`${colors.green('Copied:')} MyAppModel.java`);
});

test('snapdev deploy, fail if parent folder not project', async () => {
  let result;

  // create file
  await touch(projectFolder + '/.no-snapdev-project', 'test');

  // create
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // copy default model to models folder
  await copy(
    templateModelFolderWithNoUser + '/default.json',
    snapdevModelsFolder + '/test-app-model.json'
  );

  // generate
  result = await snapdev('generate test-app-model');
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
  await touch(projectFolder + '/.no-snapdev-project', 'test');

  // create
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // copy default model to models folder
  await copy(
    templateModelFolderWithNoUser + '/default.json',
    snapdevModelsFolder + '/test-app-model.json'
  );

  // generate
  result = await snapdev('generate test-app-model');
  expect(result.code).toBe(0);

  // deploy
  result = await snapdev('deploy --force');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Destination: ${projectFolder}`);
  expect(result.stdout).toContain(`${colors.green('Copied:')} MyAppModel.java`);
});
