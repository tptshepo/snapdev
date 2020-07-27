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

test('snapdev create template with no user', async () => {
  let result;

  result = await snapdev('create test-app');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(
    `Created: ${templateFolderWithNoUser}/template.json`
  );
  expect(result.stdout).toContain(
    `Created: ${templateFolderWithNoUser}/README.md`
  );
  expect(result.stdout).toContain(
    `Created: ${templateFolderWithNoUser}/src/{{titlecase}}.java.txt`
  );
  expect(result.stdout).toContain(
    `Created: ${templateFolderWithNoUser}/models/default.json`
  );
});

test('snapdev create template with user', async () => {
  let result;

  result = await snapdev(
    `register --force --email ${email} --username ${username} --password ${password}`
  );
  expect(result.code).toBe(0);

  result = await snapdev(`login --username ${username} --password ${password}`);
  expect(result.code).toBe(0);

  result = await snapdev('create test-app');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(
    `Created: ${templateFolderWithUser}/template.json`
  );
  expect(result.stdout).toContain(
    `Created: ${templateFolderWithUser}/README.md`
  );
  expect(result.stdout).toContain(
    `Created: ${templateFolderWithUser}/src/{{titlecase}}.java.txt`
  );
  expect(result.stdout).toContain(
    `Created: ${templateFolderWithUser}/models/default.json`
  );
});
