const BaseCommand = require('./base');

module.exports = class Command extends BaseCommand {
  constructor(cli) {
    super(cli);
  }

  async execute() {
    return await this.cli.clone(true);
  }
};
