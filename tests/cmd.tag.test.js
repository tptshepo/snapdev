const {
  setupBeforeEach,
  username,
  email,
  password,
  snapdev,
  templateFolderWithNoUser,
  templateFolderWithUser,
  snapdevFolder,
} = require('./fixtures/setup');

beforeEach(async () => {
  await setupBeforeEach();
});
afterEach(async () => {});

test('snapdev tag, make private, the public again', async () => {
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

  // push
  result = await snapdev('push');
  expect(result.code).toBe(0);

  // tag --private
  result = await snapdev('tag --private');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Marked template as private`);
  
  // tag --public
  result = await snapdev('tag --public');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Marked template as public`);
  
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
});
