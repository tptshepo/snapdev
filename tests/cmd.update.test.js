const { setupBeforeEach, snapdev, templateFolderWithNoUser, ls, sdExt } = require('./fixtures/setup');

beforeEach(async () => {
  await setupBeforeEach();
});
afterEach(async () => {});

test('snapdev update', async () => {
  let result;

  // create
  result = await snapdev('create test-app');
  expect(result.code).toBe(0);

  // no sd ext
  let files = await ls(`${templateFolderWithNoUser}/src`);
  expect(sdExt(files)).toBe(false);

  // update
  result = await snapdev('update --ext');
  expect(result.code).toBe(0);

  // has sd ext
  files = await ls(`${templateFolderWithNoUser}/src`);
  expect(sdExt(files)).toBe(true);
});
