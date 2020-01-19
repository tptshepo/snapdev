const path = require('path');
const fs = require('fs-extra');
const {
  cli,
  cwd,
  setupBeforeStart,
  setupBeforeEach,
  username,
  projectName,
  projectFolder,
  snapdevFolder,
  snapdevJsonFile,
  snapdevTemplateFolder,
  createTestAppTemplate,
  generateTestAppTemplate
} = require('./fixtures/setup');

beforeAll(setupBeforeStart);
beforeEach(setupBeforeEach);

/**
 * snapdev init [project]       Initialize snapdev
 */

test('snapdev init', async () => {
  let stdout = await cli('init');
  // console.log(stdout);
  const jsonfile = path.join(cwd, 'snapdev', 'snapdev.json');
  expect(stdout).toEqual(expect.stringContaining(`Created: ${jsonfile}`));
});

test('snapdev init [project]', async () => {
  let stdout = await cli('init my-project');
  // console.log(stdout);
  const jsonfile = path.join(cwd, 'my-project', 'snapdev', 'snapdev.json');
  expect(stdout).toEqual(expect.stringContaining(`Created: ${jsonfile}`));
});

/**
 * snapdev status               Get status of the current context
 */

test('snapdev status', async () => {
  let stdout = await cli('status', snapdevFolder);
  // console.log(stdout);
  expect(stdout).toEqual(expect.stringContaining(`Logged in as: ${username}`));
  expect(stdout).toEqual(expect.stringContaining(`template.json not found`));
});

/**
 * snapdev checkout <template>  Switch context to the specified template
 */

test('snapdev checkout <template>', async () => {
  let stdout = await cli('checkout test-app', snapdevFolder);
  // console.log(stdout);
  expect(stdout).toEqual(expect.stringContaining(`Template not found.`));
});

test('snapdev checkout <template> --create', async () => {
  await createTestAppTemplate();
});

/**
 * snapdev generate [model]     Generate source code based on a given template and model
 */

test('snapdev generate', async () => {
  let stdout = await cli('generate', snapdevFolder);
  // console.log(stdout);
  expect(stdout).toEqual(expect.stringContaining(`template.json not found`));
});

test('snapdev generate template', async () => {
  let stdout;
  // create template
  await createTestAppTemplate();
  // generate code
  await generateTestAppTemplate();
});
