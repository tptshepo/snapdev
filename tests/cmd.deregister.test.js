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

test('snapdev deregister', async () => {
  let result;
  expect(1).toBe(0);
});


