const BaseCommand = require('./base');
const YAML = require('yaml');
const validateSchema = require('yaml-schema-validator/src/index');
const { readFile } = require('../Utils');
const colors = require('colors');

const Generate = require('./generate');
const Deploy = require('./deploy');
const Clean = require('./clean');

module.exports = class Command extends BaseCommand {
  constructor(cli) {
    super(cli);
  }

  async execute() {
    this.cli.checkSnapdevRoot();

    const versionCheck = (val) => {
      return val === 1;
    };

    const requiredSchema = {
      version: { type: 'number', use: { versionCheck } },
      generate: [
        {
          description: { type: 'string', required: true },
          modelUrl: { type: 'string', required: true },
          root: { type: 'boolean' },
        },
      ],
    };

    let appYmlData = '';
    try {
      appYmlData = await readFile('app-compose.yml', 'utf8');
    } catch (error) {
      console.log(
        colors.yellow('app-compose.yml not found in snapdev workspace')
      );
      process.exit(1);
    }

    const appYml = YAML.parse(appYmlData);

    const schemaErrors = validateSchema(appYml, { schema: requiredSchema, logLevel: 'warn' });
    if (schemaErrors.length > 0) {
      console.log(colors.yellow('app-compose.yml has syntax errors'));
      process.exit(1);
    }

    this.generate(appYml);

    return true;
  }

  async generate(appYml) {
    this.cli.program.silent = true;

    for (let index = 0; index < appYml.generate.length; index++) {
      const gen = appYml.generate[index];

      console.log();
      const counter = index + 1;
      const label = [];
      label.push(`[Step ${counter} of ${appYml.generate.length}]`);
      if (gen.root) {
        label.push(colors.cyan(`[root]`));  
      }
      label.push(`${gen.description}`);
      console.log(label.join(' '));
      console.log('=========================================================');
      // console.log();
      // console.log('===================================');

      // genererate
      this.cli.program.force = true;
      this.cli.program.clear = true;
      this.cli.program.model = gen.modelUrl;
      const execGenerate = new Generate(this.cli);
      await execGenerate.execute();
      
      console.log();

      // deploy
      this.cli.program.force = gen.root === undefined ? false : gen.root;
      const execDeploy = new Deploy(this.cli);
      await execDeploy.execute();
    }

    // clean up dist folder
    this.cli.program.force = true;
    const execClean = new Clean(this.cli);
    execClean.execute();

  }
};
