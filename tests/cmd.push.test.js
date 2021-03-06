const {
  setupBeforeEach,
  username,
  email,
  password,
  snapdev,
  templateSchemaDefFileWithUser,
  readJSON,
  updateJSON,
  remove,
} = require('./fixtures/setup');

beforeEach(async () => {
  await setupBeforeEach();
});
afterEach(async () => {});

test('snapdev push', async () => {
  let result;

  // create user
  result = await snapdev(`register --force --email ${email} --username ${username} --password ${password}`);
  expect(result.code).toBe(0);

  // login
  result = await snapdev(`login --username ${username} --password ${password}`);
  expect(result.code).toBe(0);

  // create
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // delete schema file, to simulate older templates
  await remove(templateSchemaDefFileWithUser);

  // push
  result = await snapdev('push');
  // console.log(result);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Pushing...`);
  expect(result.stdout).toContain(`Push Succeeded`);

  result = await snapdev('status');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template version: 0.0.2`);
});

test('snapdev push, schema update', async () => {
  let result;

  // create user
  result = await snapdev(`register --force --email ${email} --username ${username} --password ${password}`);
  expect(result.code).toBe(0);

  // login
  result = await snapdev(`login --username ${username} --password ${password}`);
  expect(result.code).toBe(0);

  // create
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // get schema content
  let schemaDef = await readJSON(templateSchemaDefFileWithUser);
  expect(schemaDef).toMatchObject({
    type: 'root',
  });

  // push
  result = await snapdev('push');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Pushing...`);
  expect(result.stdout).toContain(`Push Succeeded`);

  // pull template
  result = await snapdev(`reset --force`);

  // get schema content
  schemaDef = await readJSON(templateSchemaDefFileWithUser);
  expect(schemaDef).toBeDefined();

  // change schema
  updateJSON(templateSchemaDefFileWithUser, {
    name: 'hello world',
  });

  // push again
  result = await snapdev('push --force');
  expect(result.code).toBe(0);

  // pull template
  result = await snapdev(`reset --force`);

  // get schema content
  schemaDef = await readJSON(templateSchemaDefFileWithUser);
  expect(schemaDef.name).toBe(`hello world`);
});

test('snapdev push, fail when pushing an existing version', async () => {
  let result;

  // create user
  result = await snapdev(`register --force --email ${email} --username ${username} --password ${password}`);
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

  // push
  result = await snapdev('push --version 0.0.2');
  expect(result.code).toBe(1);
});

test('snapdev push, success when pushing a new version', async () => {
  let result;

  // create user
  result = await snapdev(`register --force --email ${email} --username ${username} --password ${password}`);
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

  // push
  result = await snapdev('push --version 0.0.5');
  expect(result.code).toBe(0);

  result = await snapdev('status');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template version: 0.0.5`);
});
