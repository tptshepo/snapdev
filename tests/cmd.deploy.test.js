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

test('snapdev deploy', async () => {
  let result;
});


