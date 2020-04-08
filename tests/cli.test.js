const path = require('path');
const fs = require('fs-extra');
const setup = require('./fixtures/setup');

beforeAll(setup.setupBeforeStart);
beforeEach(setup.setupBeforeEach);

/**===================================================================
 * snapdev init [project]       Initialize snapdev
 */

test('snapdev init', async () => {
  console.log('snapdev init');

  let stdout = await setup.cli('init');
  // console.log(stdout);
  const jsonfile = path.join(setup.cwd, 'snapdev', 'snapdev.json');
  expect(stdout).toEqual(expect.stringContaining(`Created: ${jsonfile}`));
});

test('snapdev init [project]', async () => {
  console.log('snapdev init [project]');

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

test('snapdev new [project]', async () => {
  console.log('snapdev new [project]');

  let stdout = await setup.cli('new my-project');
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
  console.log('snapdev status no template');

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
  console.log('snapdev status with template');

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
  console.log('snapdev add <model>');

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
  console.log('snapdev clean');

  let stdout;
  // create template
  await setup.createNoUserTestAppTemplate();
  // generate code
  await setup.generateNoUserTestAppTemplate();
  // clean
  stdout = await setup.cli('clean', setup.snapdevFolder);
  expect(stdout).toEqual(expect.stringContaining(`Cleaned!`));

  const fileList = fs.readdirSync(setup.snapdevDistFolder).length;
  expect(fileList).toEqual(0);
});

/**===================================================================
 * snapdev generate [model]     Generate source code based on a given template and model
 */

test('snapdev generate must fail', async () => {
  console.log('snapdev generate must fail');

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

test('snapdev login fail', async () => {
  console.log('snapdev login fail');

  let stdout;

  // login
  stdout = await setup.cli(`login --username testuser --password password01`);
  expect(stdout).toEqual(
    expect.stringContaining(`Unauthorized: incorrect username or password`)
  );
});

test('snapdev login success', async () => {
  console.log('snapdev login success');

  let stdout;

  // login
  stdout = await setup.cli(`login --username snapdevtest --password Tsh3p1@@`);
  expect(stdout).toEqual(expect.stringContaining(`Login Succeeded`));

  // status
  stdout = await setup.cli('status', setup.snapdevFolder);
  expect(stdout).toEqual(expect.stringContaining(`Logged in as: snapdevtest`));
});

/**===================================================================
 * snapdev logout               Log out from snapdev online repository
 */

test('snapdev logout force', async () => {
  console.log('snapdev logout force');

  let stdout;

  // logout
  stdout = await setup.cli(`logout --force`);
  expect(stdout).toEqual(expect.stringContaining(`Removed login credentials`));

  // status
  stdout = await setup.cli('status', setup.snapdevFolder);
  expect(stdout).toEqual(expect.stringContaining(`Logged in as:`));
});

test('snapdev logout', async () => {
  console.log('snapdev logout');

  let stdout;

  stdout = await setup.cli(`logout --force`);
  expect(stdout).toEqual(expect.stringContaining(`Removed login credentials`));

  // login
  stdout = await setup.cli(`login --username snapdevtest --password Tsh3p1@@`);
  expect(stdout).toEqual(expect.stringContaining(`Logged in as: snapdevtest`));
  expect(stdout).toEqual(expect.stringContaining(`Login Succeeded`));

  // logout
  stdout = await setup.cli(`logout`);
  expect(stdout).toEqual(expect.stringContaining(`Removed login credentials`));
});

/**===================================================================
 * snapdev list                 List all your templates on snapdev online repository
 */

test('snapdev list', async () => {
  console.log('snapdev list');

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

test('snapdev list remote', async () => {
  console.log('snapdev list remote');
  let stdout;
  // logout
  stdout = await setup.cli(`logout --force`);
  expect(stdout).toEqual(expect.stringContaining(`Removed login credentials`));
  // create test-app
  await setup.createNoUserTestAppTemplate();
  // create test-app-2
  await setup.createNoUserTestApp2Template();
  // login
  stdout = await setup.cli(`login --username snapdevtest --password Tsh3p1@@`);
  expect(stdout).toEqual(expect.stringContaining(`Logged in as: snapdevtest`));
  expect(stdout).toEqual(expect.stringContaining(`Login Succeeded`));
  // list
  stdout = await setup.cli('list', setup.snapdevFolder);
  expect(stdout).toEqual(expect.stringContaining(`No templates found`));
  expect(stdout).toEqual(expect.stringContaining(`test-app`));
  expect(stdout).toEqual(expect.stringContaining(`test-app-2`));
});

/**===================================================================
 * snapdev tag                  Change template configuration
 */

test('snapdev tag user', async () => {
  console.log('snapdev tag user');
  let stdout;
  // logout
  stdout = await setup.cli(`logout --force`);
  expect(stdout).toEqual(expect.stringContaining(`Removed login credentials`));
  // create test-app
  await setup.createNoUserTestAppTemplate();
  // login
  stdout = await setup.cli(`login --username snapdevtest --password Tsh3p1@@`);
  expect(stdout).toEqual(expect.stringContaining(`Logged in as: snapdevtest`));
  expect(stdout).toEqual(expect.stringContaining(`Login Succeeded`));
  // tag
  stdout = await setup.cli('tag --user', setup.snapdevFolder);
  expect(stdout).toEqual(
    expect.stringContaining(`From: ${setup.snapdevTemplateFolder}/test-app`)
  );
  expect(stdout).toEqual(
    expect.stringContaining(
      `To: ${setup.snapdevTemplateFolder}/snapdevtest/test-app`
    )
  );
  expect(stdout).toEqual(
    expect.stringContaining(`Switched to snapdevtest/test-app`)
  );
});

test('snapdev tag version', async () => {
  console.log('snapdev tag version');
  let stdout;
  // logout
  stdout = await setup.cli(`logout --force`);
  expect(stdout).toEqual(expect.stringContaining(`Removed login credentials`));
  // create test-app
  await setup.createNoUserTestAppTemplate();
  // login
  stdout = await setup.cli(`login --username snapdevtest --password Tsh3p1@@`);
  expect(stdout).toEqual(expect.stringContaining(`Logged in as: snapdevtest`));
  expect(stdout).toEqual(expect.stringContaining(`Login Succeeded`));
  // tag user
  stdout = await setup.cli('tag --user', setup.snapdevFolder);
  expect(stdout).toEqual(
    expect.stringContaining(`Switched to snapdevtest/test-app`)
  );
  // tag version
  stdout = await setup.cli('tag --version 2.0.0', setup.snapdevFolder);
  expect(stdout).toEqual(
    expect.stringContaining(`snapdevtest/test-app set to version 2.0.0`)
  );
});

test.only('snapdev tag name', async () => {
  console.log('snapdev tag name');
  let stdout;
  // logout
  stdout = await setup.cli(`logout --force`);
  expect(stdout).toEqual(expect.stringContaining(`Removed login credentials`));
  // create test-app
  await setup.createNoUserTestAppTemplate();
  // login
  stdout = await setup.cli(`login --username snapdevtest --password Tsh3p1@@`);
  expect(stdout).toEqual(expect.stringContaining(`Logged in as: snapdevtest`));
  expect(stdout).toEqual(expect.stringContaining(`Login Succeeded`));
  // tag user
  stdout = await setup.cli('tag --user', setup.snapdevFolder);
  expect(stdout).toEqual(
    expect.stringContaining(`Switched to snapdevtest/test-app`)
  );
  // tag name
  stdout = await setup.cli('tag --name=my-app', setup.snapdevFolder);
  expect(stdout).toEqual(
    expect.stringContaining(
      `From: ${setup.snapdevTemplateFolder}/snapdevtest/test-app`
    )
  );
  expect(stdout).toEqual(
    expect.stringContaining(
      `To: ${setup.snapdevTemplateFolder}/snapdevtest/my-app`
    )
  );
  expect(stdout).toEqual(
    expect.stringContaining(`Switched to snapdevtest/my-app`)
  );
});

/**===================================================================
 * snapdev create <template>    Create a new template
 */
test('snapdev create <template>', async () => {
  console.log('snapdev create <template>');

  await setup.createNoUserTestAppTemplate();
});

/**===================================================================
 * snapdev checkout <template>  Switch context to the specified template
 */

test('snapdev checkout <template> must fail', async () => {
  console.log('snapdev checkout <template> must fail');

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
