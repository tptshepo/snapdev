const { setupBeforeEach, snapdev, snapdevFolder } = require('./fixtures/setup');

beforeEach(async () => {
  await setupBeforeEach();
});
afterEach(async () => {});

test('snapdev init', async () => {
  const result = await snapdev('init');
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`${snapdevFolder}/snapdev/snapdev.json`);
  expect(result.stdout).toContain(`${snapdevFolder}/snapdev/models/default.json`);
});

test('snapdev init test-app2', async () => {
  const result = await snapdev('init test-app2');
  // console.log(result);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`${snapdevFolder}/test-app2/snapdev/snapdev.json`);
  expect(result.stdout).toContain(`${snapdevFolder}/test-app2/snapdev/models/default.json`);
});
