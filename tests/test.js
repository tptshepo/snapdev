const S = require('underscore.string');
const _ = require('lodash');

let name = 'chat_user';
let value = _.replace(name, '_', '-');

console.log(value);
