const BaseCommand = require('./base');
const request = require('superagent');
const path = require('path');
const HttpStatus = require('http-status-codes');
const colors = require('colors');
const { cleanDirectory } = require('../Utils');

module.exports = class Command extends BaseCommand {
  constructor(cli) {
    super(cli);
  }
  async execute() {
    // make sure we are in snapdev root folder
    this.cli.checkSnapdevRoot();

    // check if the model is online or local
    let isOnline = false;
    let modelName = this.cli.program.model;
    if (
      modelName.indexOf('http://') > -1 ||
      modelName.indexOf('https://') > -1
    ) {
      isOnline = true;
    }

    if (isOnline) {
      await this.cli.checkLogin();
      /** Get the contents from the API */
      console.log(`Retrieving the online model from ${modelName}`);
      // console.log(`Bearer ${this.cli.token}`);
      let apiData;
      try {
        const response = await request
          .get(modelName)
          .set('Authorization', `Bearer ${this.cli.token}`)
          .send();
        apiData = response.body.data;
        /** Save the model to file */
        const modelDef = JSON.parse(apiData.modelDef);
        const modelDefFileName = path.join(
          this.cli.modelsFolder,
          apiData.modelDefName + '.json'
        );
        this.cli.updateJSON(modelDefFileName, modelDef);
        modelName = apiData.modelDefName + '.json';
      } catch (err) {
        if (err.status === HttpStatus.BAD_REQUEST) {
          console.log(colors.yellow(err.response.body.error.message));
        } else if (err.status === HttpStatus.UNAUTHORIZED) {
          console.log(colors.yellow('Session expired'));
          this.cli.program.force = true;
          await this.cli.logout();
        } else {
          console.log(colors.yellow(err.message));
        }
        process.exit(1);
      }

      const latestVersion = apiData.latestVersion;

      // check if user has local template
      const templateFound = this.cli.hasTemplate(apiData.templateOrigin);
      this.cli.program.template = apiData.templateOrigin;

      if (!templateFound) {
        /** local template is missing, clone it */

        if (this.cli.program.version === undefined) {
          // use the template version of the model if version not set
          this.cli.program.version = apiData.templateVersion;
        }
        // download template
        await this.cli.clone(false);
      } else {
        /** Check if the local template matches the model template version */

        // switch branch context
        await this.cli.switchContextBranch(apiData.templateOrigin);

        let { templateVersion } = await this.cli.getTemplateContext(
          false,
          false
        );

        // console.log('Programm Version:', this.cli.program.version);

        const modelVersion = apiData.templateVersion;
        const localVersion = templateVersion;

        console.log('Model version:', modelVersion);
        console.log('Local version:', localVersion);
        console.log('Latest version:', latestVersion);

        if (this.cli.program.version === undefined) {
          if (modelVersion !== localVersion) {
            console.log(
              `The online model was created on version '${modelVersion}' of the template but the local version is on '${localVersion}'.`
            );

            if (this.cli.program.force) {
              console.log(
                colors.yellow(
                  'The generation will continue with the local version as per the --force flag'
                )
              );
            } else {
              throw new Error(
                'Template versions mismatch. Use --force if you want to continue with the local version.'
              );
            }
          }
        } else {
          /** clone the specified version */

          if (latestVersion !== localVersion) {
            // download template
            await this.cli.clone(false);
          }
        }
      }
    }

    let {
      branch,
      templateFolder,
      templateSrcFolder,
    } = await this.cli.getTemplateContext();

    if (this.cli.program.clear) {
      // clean dist folder
      cleanDirectory(this.cli.distFolder, false, this.cli.program.force);
    }

    // console.log('Template root:', templateFolder);
    // console.log('Template src:', templateSrcFolder);
    console.log('Template name:', branch);

    this.cli.generateForModel(modelName, templateFolder, templateSrcFolder);

    return true;
  }
};
