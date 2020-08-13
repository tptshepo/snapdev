const {
  setupBeforeEach,
  username,
  password,
  snapdev,
  email,
  mkdir,
  touch,
  copy,
  exists,
  templateModelFolderWithNoUser,
  snapdevModelsFolder,
  templateModelsAPI,
  snapdevHost,
  readJSON,
  credentialFile,
} = require('./fixtures/setup');
const request = require('superagent');

beforeEach(async () => {
  await setupBeforeEach();
});
afterEach(async () => {});

test('snapdev generate', async () => {
  let result;

  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // copy default model to models folder
  await copy(
    templateModelFolderWithNoUser + '/default.json',
    snapdevModelsFolder + '/test-app-model.json'
  );

  result = await snapdev('generate test-app-model');
  // console.log(result);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template name: test-app`);
  expect(result.stdout).toContain(`Model filename: test-app-model.json`);
  expect(result.stdout).toContain(`${snapdevModelsFolder}/test-app-model.json`);
  expect(result.stdout).toContain(`========== Source Code ==========`);
  expect(result.stdout).toContain(`MyAppModel.java`);
  expect(result.stdout).toContain(`Done.`);
});

test('snapdev generate with online model', async () => {
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
  expect(result.stdout).toContain(`Pushing...`);
  expect(result.stdout).toContain(`Push Succeeded`);

  // create 2
  result = await snapdev('create demo2');
  expect(result.code).toBe(0);

  // create online model
  const cred = await readJSON(credentialFile);
  const response = await request
    .post(templateModelsAPI)
    .set('Authorization', `Bearer ${cred.token}`)
    .send({
      name: `${username}/test-app`,
      modelDefName: 'test-app-model',
      modelDef: '{"name":"snapdev"}',
    });
  // console.log(response);
  const data = response.body.data.templateModel;
  expect(data.modelDefName).toBe('test-app-model');
  expect(data.templateName).toBe('test-app');
  expect(data.templateVersion).toBe('0.0.1');
  expect(data.modelDef).toBe('{"name":"snapdev"}');

  // generate with online model
  result = await snapdev(
    `generate ${snapdevHost}/m/${username}/test-app/test-app-model`
  );
  // console.log(result);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template name: ${username}/test-app`);
  expect(result.stdout).toContain(`Model filename: test-app-model.json`);
  expect(result.stdout).toContain(`${snapdevModelsFolder}/test-app-model.json`);
  expect(result.stdout).toContain(`========== Source Code ==========`);
  expect(result.stdout).toContain(`Snapdev.java`);
  expect(result.stdout).toContain(`Done.`);

  // check template context
  result = await snapdev('status');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template name: ${username}/test-app`);
});

test('snapdev generate online even if template is missing', async () => {
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
  expect(result.stdout).toContain(`Pushing...`);
  expect(result.stdout).toContain(`Push Succeeded`);

  // remove the template
  result = await snapdev(`delete ${username}/test-app --force`);
  // console.log(result);
  expect(result.code).toBe(0);

  // create online model
  const cred = await readJSON(credentialFile);
  const response = await request
    .post(templateModelsAPI)
    .set('Authorization', `Bearer ${cred.token}`)
    .send({
      name: `${username}/test-app`,
      modelDefName: 'test-app-model',
      modelDef: '{"name":"snapdev"}',
    });
  // console.log(response);
  const data = response.body.data.templateModel;
  expect(data.modelDefName).toBe('test-app-model');
  expect(data.templateName).toBe('test-app');
  expect(data.templateVersion).toBe('0.0.1');
  expect(data.modelDef).toBe('{"name":"snapdev"}');

  // generate with online model
  result = await snapdev(
    `generate ${snapdevHost}/m/${username}/test-app/test-app-model`
  );
  // console.log(result);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`========== Source Code ==========`);
  expect(result.stdout).toContain(`Snapdev.java`);
  expect(result.stdout).toContain(`Done.`);
});

test('snapdev generate online should fail template mismatch', async () => {
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

  // create online model
  const cred = await readJSON(credentialFile);
  const response = await request
    .post(templateModelsAPI)
    .set('Authorization', `Bearer ${cred.token}`)
    .send({
      name: `${username}/test-app`,
      modelDefName: 'test-app-model',
      modelDef: '{"name":"snapdev"}',
    });
  // console.log(response);
  const data = response.body.data.templateModel;
  expect(data.modelDefName).toBe('test-app-model');
  expect(data.templateName).toBe('test-app');
  expect(data.templateVersion).toBe('0.0.1');
  expect(data.modelDef).toBe('{"name":"snapdev"}');

  // bump local version using push
  result = await snapdev('push --force');
  expect(result.code).toBe(0);

  // generate with online model
  result = await snapdev(
    `generate ${snapdevHost}/m/${username}/test-app/test-app-model`
  );
  // console.log(result);
  expect(result.code).toBe(1);
  expect(result.stdout).toContain(`Template versions mismatch`);
});

test('snapdev generate online should pass template mismatch if forced', async () => {
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

  // create online model
  const cred = await readJSON(credentialFile);
  const response = await request
    .post(templateModelsAPI)
    .set('Authorization', `Bearer ${cred.token}`)
    .send({
      name: `${username}/test-app`,
      modelDefName: 'test-app-model',
      modelDef: '{"name":"snapdev"}',
    });
  // console.log(response);
  const data = response.body.data.templateModel;
  expect(data.modelDefName).toBe('test-app-model');
  expect(data.templateName).toBe('test-app');
  expect(data.templateVersion).toBe('0.0.1');
  expect(data.modelDef).toBe('{"name":"snapdev"}');

  // bump local version using push
  result = await snapdev('push --force');
  expect(result.code).toBe(0);

  // generate with online model
  result = await snapdev(
    `generate ${snapdevHost}/m/${username}/test-app/test-app-model --force`
  );
  // console.log(result);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(
    `The generation will continue as per the --force flag`
  );
  expect(result.stdout).toContain(`========== Source Code ==========`);
  expect(result.stdout).toContain(`Snapdev.java`);
  expect(result.stdout).toContain(`Done.`);
});

test('snapdev generate should fail if no model', async () => {
  let result;

  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // copy default model to models folder
  await copy(
    templateModelFolderWithNoUser + '/default.json',
    snapdevModelsFolder + '/test-app-model.json'
  );

  result = await snapdev('generate');
  // console.log(result);
  expect(result.code).toBe(1);
  expect(result.stderr).toContain(
    `Not enough non-option arguments: got 0, need at least 1`
  );
});

test('snapdev generate with clear', async () => {
  let result;

  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // copy default model to models folder
  await copy(
    templateModelFolderWithNoUser + '/default.json',
    snapdevModelsFolder + '/test-app-model.json'
  );

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
  await copy(
    templateModelFolderWithNoUser + '/default.json',
    snapdevModelsFolder + '/test-app-model.json'
  );

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
