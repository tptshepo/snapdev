const path = require('path');
const fs = require('fs-extra');
const setup = require('./fixtures/setup');

beforeAll(setup.setupBeforeStart);
beforeEach(setup.setupBeforeEach);

/**===================================================================
 * snapdev init [project]       Initialize snapdev
 */

test('snapdev init', async () => {
  let stdout = await setup.cli('init');
  // console.log(stdout);
  const jsonfile = path.join(setup.cwd, 'snapdev', 'snapdev.json');
  expect(stdout).toEqual(expect.stringContaining(`Created: ${jsonfile}`));
});

test('snapdev init [project]', async () => {
  let stdout = await setup.cli('init my-project');
  // console.log(stdout);
  const jsonfile = path.join(
    setup.cwd,
    'my-project',
    'snapdev',
    'snapdev.json'
  );
  expect(stdout).toEqual(expect.stringContaining(`Created: ${jsonfile}`));
});

/**===================================================================
 * snapdev status               Get status of the current context
 */

test('snapdev status no template', async () => {
  // status
  let stdout = await setup.cli('status', setup.snapdevFolder);
  // console.log(stdout);
  expect(stdout).toEqual(expect.stringContaining(`Logged in as:`));
  expect(stdout).toEqual(expect.stringContaining(`template.json not found`));
  expect(stdout).toEqual(expect.stringContaining(`Template name:`));
  expect(stdout).toEqual(expect.stringContaining(`Template version:`));
  expect(stdout).toEqual(expect.stringContaining(`Template root:`));
});

test('snapdev status with template', async () => {
  // create template
  await setup.createNoUserTestAppTemplate();
  // status
  let stdout = await setup.cli('status', setup.snapdevFolder);
  // console.log(stdout);
  expect(stdout).toEqual(expect.stringContaining(`Logged in as:`));
  expect(stdout).toEqual(expect.stringContaining(`Template name: test-app`));
  expect(stdout).toEqual(expect.stringContaining(`Template version: 0.0.1`));
  expect(stdout).toEqual(
    expect.stringContaining(`Template root: ${setup.templateFolder}`)
  );
});

/**===================================================================
 * snapdev add <model>          Add a model file
 */

test('snapdev add <model>', async () => {
  // create template
  await setup.createNoUserTestAppTemplate();
  // add model
  let stdout = await setup.cli('add my-model', setup.snapdevFolder);
  expect(stdout).toEqual(
    expect.stringContaining(
      `Created: ${setup.templateModelFolder}/my-model.json`
    )
  );
});

/**===================================================================
 * snapdev clean                Cleans the dist folder of generated files
 */

test('snapdev clean', async () => {
  let stdout;
  // create template
  await setup.createNoUserTestAppTemplate();
  // generate code
  await setup.generateNoUserTestAppTemplate();
  // clean
  stdout = await setup.cli('clean', setup.snapdevFolder);
  expect(stdout).toEqual(expect.stringContaining(`Cleaned!`));
});

/**===================================================================
 * snapdev generate [model]     Generate source code based on a given template and model
 */

test('snapdev generate must fail', async () => {
  let stdout = await setup.cli('generate', setup.snapdevFolder);
  // console.log(stdout);
  expect(stdout).toEqual(expect.stringContaining(`template.json not found`));
});

test('snapdev generate template', async () => {
  let stdout;
  // create template
  await setup.createNoUserTestAppTemplate();
  // generate code
  await setup.generateNoUserTestAppTemplate();
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

test('snapdev list', async () => {
  await setup.createNoUserTestAppTemplate();
  await setup.createNoUserTestApp2Template();
  let stdout = await setup.cli('list', setup.snapdevFolder);
  expect(stdout).toEqual(
    expect.stringContaining(
      `You must be logged in to see your remote templates`
    )
  );
  expect(stdout).toEqual(expect.stringContaining(`test-app`));
  expect(stdout).toEqual(expect.stringContaining(`test-app-2`));
});

/**===================================================================
 * snapdev tag                  Change template configuration
 */

/**===================================================================
 * snapdev create <template>    Create a new template
 */
test('snapdev create <template>', async () => {
  await setup.createNoUserTestAppTemplate();
});

/**===================================================================
 * snapdev checkout <template>  Switch context to the specified template
 */

test('snapdev checkout <template> must fail', async () => {
  let stdout = await setup.cli('checkout test-app', setup.snapdevFolder);
  expect(stdout).toEqual(
    expect.stringContaining(`Template not found test-app`)
  );
});

test('snapdev checkout <template>', async () => {
  await setup.createNoUserTestAppTemplate();
  await setup.createNoUserTestApp2Template();
  let stdout = await setup.cli('checkout test-app', setup.snapdevFolder);
  expect(stdout).toEqual(expect.stringContaining(`Switched to test-app`));
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
