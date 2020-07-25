const {
  setupBeforeEach,
  username,
  password,
  snapdev,
  templateFolderWithNoUser,
  templateFolderWithUser,
} = require('./fixtures/setup');

beforeEach(setupBeforeEach);

test('snapdev model get model file', async () => {
  let result;

  result = await snapdev('create test-app');
  expect(result.code).toBe(0);
  
  result = await snapdev('model');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`default.json`);
});

test('snapdev model get model directory with no user', async () => {
  let result;

  result = await snapdev('create test-app');
  expect(result.code).toBe(0);
  
  result = await snapdev('model');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`${templateFolderWithNoUser}/models`);
});

test('snapdev model get model directory with user', async () => {
  let result;

  result = await snapdev(`login --username ${username} --password ${password}`);
  expect(result.code).toBe(0);

  result = await snapdev('create test-app');
  expect(result.code).toBe(0);
  
  result = await snapdev('model');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`${templateFolderWithNoUser}/${username}/models`);
});

