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

test('snapdev add a model file with no user', async () => {
  let result;

  // create template
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);
  
  result = await snapdev('add my-model');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Created: ${templateFolderWithNoUser}/models/my-model.json`);
});

test('snapdev add a model file with user', async () => {
  let result;

  // create user
  result = await snapdev(
    `register --force --email ${email} --username ${username} --password ${password}`
  );
  expect(result.code).toBe(0);

  // login
  result = await snapdev(`login --username ${username} --password ${password}`);
  expect(result.code).toBe(0);

  // create template
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);
  
  result = await snapdev('add my-model');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Created: ${templateFolderWithUser}/models/my-model.json`);
});

