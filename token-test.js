const _ = require('lodash');
const S = require('underscore.string');

const name = "FirstName";

const injectSingle = (outObject = {}, name) => {
  outObject.camelcase = S(name)
    .camelize(true)
    .value();
  outObject.lcase = name.toLowerCase();
  outObject.ucase = name.toUpperCase();
  outObject.ulcase = S(name)
    .underscored()
    .value();
  outObject.dashlcase = _.replace(outObject.ulcase, '_', '-');
  outObject.uucase = S(name)
    .underscored()
    .value()
    .toUpperCase();
  outObject.dashucase = _.replace(outObject.uucase, '_', '-');
  outObject.titlecase = S(name)
    .classify()
    .value();
  outObject.titlename = S(_.replace(outObject.dashlcase, '-', ' '))
    .titleize()
    .value();

    return outObject;
};

console.log(injectSingle({}, name));
