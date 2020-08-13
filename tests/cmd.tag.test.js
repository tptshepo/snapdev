const {
  setupBeforeEach,
  username,
  email,
  password,
  snapdev,
  snapdevFolder,
} = require('./fixtures/setup');

beforeEach(async () => {
  await setupBeforeEach();
});
afterEach(async () => {});

test('snapdev tag, set tags', async () => {
  let result;

  // create temmplate
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // tag --tags
  result = await snapdev('tag --tags="node,js,react"');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Tags updated`);
  
  result = await snapdev('status');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template tags: node,js,react`);
});

test('snapdev tag, make private, then public again on local template', async () => {
  let result;

  // create temmplate
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // tag --private
  result = await snapdev('tag --private');
  // console.log(result);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template marked as private`);
  
  result = await snapdev('status');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template acl: private`);

  // tag --public
  result = await snapdev('tag --public');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template marked as public`);
  
  result = await snapdev('status');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template acl: public`);

  // tag --private --public
  result = await snapdev('tag --private --public');
  expect(result.code).toBe(1);
});

test('snapdev tag, make private, then public again', async () => {
  let result;

  // create user
  result = await snapdev(
    `register --force --email ${email} --username ${username} --password ${password}`
  );
  expect(result.code).toBe(0);

  // login
  result = await snapdev(`login --username ${username} --password ${password}`);
  expect(result.code).toBe(0);

  // create temmplate
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // tag --tags
  result = await snapdev('tag --tags="node,js,react"');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Tags updated`);

  // push
  result = await snapdev('push');
  // console.log(result);
  expect(result.code).toBe(0);

  result = await snapdev('status');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template acl: private`);

  // tag --private
  result = await snapdev('tag --private');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template marked as private`);
  
  result = await snapdev('status');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template acl: private`);

  // tag --public
  result = await snapdev('tag --public');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template marked as public`);
  
  result = await snapdev('status');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template acl: public`);

  // tag --private --public
  result = await snapdev('tag --private --public');
  expect(result.code).toBe(1);
});

test('snapdev tag, assign user to local template', async () => {
  let result;

  // create temmplate
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // create user
  result = await snapdev(
    `register --force --email ${email} --username ${username} --password ${password}`
  );
  expect(result.code).toBe(0);

  // login
  result = await snapdev(`login --username ${username} --password ${password}`);
  expect(result.code).toBe(0);

  // tag --user
  result = await snapdev('tag --user');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`From: ${snapdevFolder}/templates/test-app`);
  expect(result.stdout).toContain(
    `To: ${snapdevFolder}/templates/${username}/test-app`
  );
  expect(result.stdout).toContain(`Switched to ${username}/test-app`);
});

test('snapdev tag, change template version', async () => {
  let result;

  // create temmplate
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // tab --version
  result = await snapdev('tag --version 1.0.2');
  expect(result.code).toBe(0);

  expect(result.stdout).toContain(`test-app set to version 1.0.2`);
});

test('snapdev tag, rename template with no user', async () => {
  let result;

  // create temmplate
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // tab --name
  result = await snapdev('tag --name test-app2');
  expect(result.code).toBe(0);

  expect(result.stdout).toContain(`From: ${snapdevFolder}/templates/test-app`);
  expect(result.stdout).toContain(`To: ${snapdevFolder}/templates/test-app2`);
  expect(result.stdout).toContain(`Switched to test-app2`);
});

test('snapdev tag, rename template with user', async () => {
  let result;

  // create temmplate
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // create user
  result = await snapdev(
    `register --force --email ${email} --username ${username} --password ${password}`
  );
  expect(result.code).toBe(0);

  // login
  result = await snapdev(`login --username ${username} --password ${password}`);
  expect(result.code).toBe(0);

  // tag --user
  result = await snapdev('tag --user');
  expect(result.code).toBe(0);

  // tab --name
  result = await snapdev('tag --name test-app2');
  expect(result.code).toBe(0);

  expect(result.stdout).toContain(
    `From: ${snapdevFolder}/templates/${username}/test-app`
  );
  expect(result.stdout).toContain(
    `To: ${snapdevFolder}/templates/${username}/test-app2`
  );
  expect(result.stdout).toContain(`Switched to ${username}/test-app2`);

  result = await snapdev('push --force');
  expect(result.code).toBe(0);
});
