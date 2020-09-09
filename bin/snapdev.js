#!/usr/bin/env node
process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
process.env['NODE_CONFIG_DIR'] = __dirname + '/../config/';

const { yargs } = require('./entry');

yargs.parse();
