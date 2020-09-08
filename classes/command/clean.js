const BaseCommand = require('./baseCommand');
const helpers = require('../../helpers');

module.exports = class Command extends BaseCommand {
  constructor(cli) {
    super(cli);
  }

  execute() {
    // make sure we are in snapdev root folder
    this.cli.checkSnapdevRoot();

    // clean dist folder
    helpers.cleanDir(this.cli.distFolder, false, this.cli.program.force);

    if (!this.cli.program.silent) {
      console.log('Cleaned!');
    }

    return true;
  }
};
