const {
  setupBeforeEach,
  username,
  email,
  password,
  snapdev,
  templateFolderWithUser,
} = require('./fixtures/setup');

beforeEach(async () => {
  await setupBeforeEach();
});
afterEach(async () => {});

test('snapdev pull', async () => {
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
  expect(result.code).toBe(0);

  // pull
  result = await snapdev('pull');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Pulling template....`);
  expect(result.stdout).toContain(`Clone location: ${templateFolderWithUser}`);
  expect(result.stdout).toContain(`Switched to ${username}/test-app`);
});

test('snapdev pull, fail to pull unpushed template', async () => {
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

  // pull
  result = await snapdev('pull');
  expect(result.code).toBe(1);
  expect(result.stdout).toContain(`Pulling template....`);
  expect(result.stdout).toContain(`Template not found`);
});

test('snapdev pull, get the version that I am working on', async () => {
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

  // push v1
  result = await snapdev('push');
  expect(result.code).toBe(0);

  result = await snapdev('status');
  expect(result.code).toBe(0);
  // console.log(result);
  expect(result.stdout).toContain(`Template version: 0.0.1`);
  
  // push v2
  result = await snapdev('push --force');
  expect(result.code).toBe(0);

  result = await snapdev('status');
  expect(result.code).toBe(0);
  // console.log(result);
  expect(result.stdout).toContain(`Template version: 0.0.2`);

  // clone v1
  result = await snapdev(`clone ${username}/test-app --force --version=0.0.1`);
  expect(result.code).toBe(0);

  result = await snapdev('status');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Template version: 0.0.1`);

  // pull
  result = await snapdev(`pull`);
  expect(result.code).toBe(0);

  result = await snapdev('status');
  expect(result.code).toBe(0);
  // console.log(result);
  expect(result.stdout).toContain(`Template version: 0.0.2`);
});
