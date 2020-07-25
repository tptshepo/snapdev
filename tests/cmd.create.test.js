const {
  setupBeforeEach,
  username,
  password,
  snapdev,
  templateFolderWithNoUser,
  templateFolderWithUser,
} = require('./fixtures/setup');

beforeEach(setupBeforeEach);

test('snapdev create template with no user', async () => {
  let result;

  result = await snapdev('create test-app');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`${templateFolderWithNoUser}/template.json`);
  expect(result.stdout).toContain(`${templateFolderWithNoUser}/README.md`);
  expect(result.stdout).toContain(`${templateFolderWithNoUser}/src/{{titlecase}}.java.txt`);
  expect(result.stdout).toContain(`${templateFolderWithNoUser}/models/default.json`);
});


test('snapdev create template with user', async () => {
  let result;

  result = await snapdev(`login --username ${username} --password ${password}`);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Logged in as: ${username}`);
  expect(result.stdout).toContain(`Login Succeeded`);

  result = await snapdev('create test-app');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`${templateFolderWithUser}/template.json`);
  expect(result.stdout).toContain(`${templateFolderWithUser}/README.md`);
  expect(result.stdout).toContain(`${templateFolderWithUser}/src/{{titlecase}}.java.txt`);
  expect(result.stdout).toContain(`${templateFolderWithUser}/models/default.json`);
});
