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
  templateModelFolder,
  snapdevJsonFile,
  snapdevTemplateFolder,
  createTestAppTemplate,
  createTestApp2Template,
  checkoutTestAppTemplate,
  generateTestAppTemplate
} = require('./fixtures/setup');

beforeAll(setupBeforeStart);
beforeEach(setupBeforeEach);

/**===================================================================
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

/**===================================================================
 * snapdev status               Get status of the current context
 */

test('snapdev status', async () => {
  let stdout = await cli('status', snapdevFolder);
  // console.log(stdout);
  expect(stdout).toEqual(expect.stringContaining(`Logged in as: snapdevtest`));
  expect(stdout).toEqual(expect.stringContaining(`template.json not found`));
});

/**===================================================================
 * snapdev add <model>          Add a model file
 */

test('snapdev add <model>', async () => {
  // create template
  await createTestAppTemplate();
  // add model
  let stdout = await cli('add my-model', snapdevFolder);
  expect(stdout).toEqual(
    expect.stringContaining(`Created: ${templateModelFolder}/my-model.json`)
  );
});

/**===================================================================
 * snapdev clean                Cleans the dist folder of generated files
 */

test('snapdev clean', async () => {
  let stdout;
  // create template
  await createTestAppTemplate();
  // generate code
  await generateTestAppTemplate();
  // clean
  stdout = await cli('clean', snapdevFolder);
  expect(stdout).toEqual(expect.stringContaining(`Cleaned!`));
});

/**===================================================================
 * snapdev generate [model]     Generate source code based on a given template and model
 */

test('snapdev generate must fail', async () => {
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

/**===================================================================
 * snapdev register             Register for a free snapdev account
 */

/**===================================================================
 * snapdev login                Log in to snapdev online repository
 */

/**===================================================================
 * snapdev logout               Log out from snapdev online repository
 */

/**===================================================================
 * snapdev list                 List all your templates on snapdev online repository
 */

/**===================================================================
 * snapdev tag                  Change template configuration
 */

/**===================================================================
 * snapdev create <template>    Create a new template
 */
test('snapdev create <template>', async () => {
  await createTestAppTemplate();
});

/**===================================================================
 * snapdev checkout <template>  Switch context to the specified template
 */

test('snapdev checkout <template> must fail', async () => {
  let stdout = await cli('checkout test-app', snapdevFolder);
  expect(stdout).toEqual(
    expect.stringContaining(`Template not found ${username}/test-app`)
  );
});

test('snapdev checkout <template>', async () => {
  await createTestAppTemplate();
  await createTestApp2Template();
  let stdout = await cli('checkout test-app', snapdevFolder);
  expect(stdout).toEqual(
    expect.stringContaining(`Switched to ${username}/test-app`)
  );
});

/**===================================================================
 * snapdev clone <template>     Pull a template from the snapdev online repository
 */

/**===================================================================
 * snapdev push                 Upload a template to snapdev online repository
 */

/**===================================================================
 * snapdev deploy               Copy the generated code to the snapdev parent folder
 */

/**===================================================================
 * snapdev reset                Revert the current template to the latest version on the online repository
 */

/**===================================================================
 * snapdev delete <template>    Delete a template from your local repository
 */

/**===================================================================
 * snapdev version              Snapdev version number
 */
