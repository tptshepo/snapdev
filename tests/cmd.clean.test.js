const {
  setupBeforeEach,
  snapdev,
  mkdir,
  touch,
  exists,
} = require('./fixtures/setup');

beforeEach(async () => {
  await setupBeforeEach();
});
afterEach(async () => {});

test('snapdev clean', async () => {
  let result;

  // create dist folder
  const distFolder = await mkdir('/dist');
  const moduleFolder = await mkdir('/dist/node_modules');

  // create any file
  await touch(distFolder + '/added.txt', 'test');
  await touch(moduleFolder + '/added.txt', 'test');

  let found = await exists(distFolder + '/added.txt');
  expect(found).toBe(true);
  found = await exists(moduleFolder + '/added.txt');
  expect(found).toBe(true);

  // clean
  result = await snapdev('clean');
  expect(result.code).toBe(0);

  found = await exists(distFolder + '/added.txt');
  expect(found).toBe(false);
  found = await exists(moduleFolder + '/added.txt');
  expect(found).toBe(true);
});

test('snapdev clean with force', async () => {
  let result;

  // create dist folder
  const distFolder = await mkdir('/dist');
  const moduleFolder = await mkdir('/dist/node_modules');

  // create any file
  await touch(distFolder + '/added.txt', 'test');
  await touch(moduleFolder + '/added.txt', 'test');

  let found = await exists(distFolder + '/added.txt');
  expect(found).toBe(true);
  found = await exists(moduleFolder + '/added.txt');
  expect(found).toBe(true);

  // clean
  result = await snapdev('clean --force');
  expect(result.code).toBe(0);

  found = await exists(distFolder + '/added.txt');
  expect(found).toBe(false);
  found = await exists(moduleFolder + '/added.txt');
  expect(found).toBe(false);
});


