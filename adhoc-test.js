const YAML = require('yaml');
const fs = require('fs');
const validateSchema = require('yaml-schema-validator');

const file = fs.readFileSync('./file.yml', 'utf8');
const appYml = YAML.parse(file);

const versionCheck = (val) => {
  return val === 1;
};

const requiredSchema = {
  version: { type: 'number', use: { versionCheck } },
  generate: [
    {
      description: { type: 'string' },
      template: { type: 'string', required: true },
      modelUrl: { type: 'string', required: true },
    },
  ],
};

const schemaErrors = validateSchema(appYml, { schema: requiredSchema });
console.log(schemaErrors);

console.log(JSON.stringify(appYml));
