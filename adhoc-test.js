const YAML = require('yaml');
const fs = require('fs');
const validateSchema = require('yaml-schema-validator');

const file = fs.readFileSync('./app-compose.yml', 'utf8');
const appYml = YAML.parse(file);

const versionCheck = (val) => {
  return val === 1;
};

const requiredSchema = {
  version: { type: 'number', use: { versionCheck } },
  clean: {
    excludeDir: [{
      type: 'string'
    }],
    excludeFile: [{
      type: 'string'
    }],
  },
  generate: [
    {
      description: { type: 'string' },
      root: { type: 'boolean' },
      modelUrl: { type: 'string', required: true },
    },
  ],
};

const schemaErrors = validateSchema(appYml, { schema: requiredSchema });
console.log(schemaErrors);

console.log(JSON.stringify(appYml));
