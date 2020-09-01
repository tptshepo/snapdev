class BaseCommand {
  constructor(cli) {
    this.cli = cli;
  }
  async execute() {
  }
}

module.exports = BaseCommand;