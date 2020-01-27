/**
 * Convert objects from one form to another
 */
const _ = require('lodash');
const S = require('underscore.string');

const injectSingle = (outObject, name) => {
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
};
const injectRootSingle = (outObject, rootObject) => {
  outObject.rcamelcase = rootObject.camelcase;
  outObject.rlcase = rootObject.lcase;
  outObject.rucase = rootObject.ucase;
  outObject.rulcase = rootObject.ulcase;
  outObject.rdashlcase = rootObject.dashlcase;
  outObject.ruucase = rootObject.uucase;
  outObject.rdashucase = rootObject.dashucase;
  outObject.rtitlecase = rootObject.titlecase;
};
const injectPlural = (outObject, plural) => {
  outObject.pcamelcase = S(plural)
    .camelize(true)
    .value();
  outObject.plcase = plural.toLowerCase();
  outObject.pucase = plural.toUpperCase();
  outObject.pulcase = S(plural)
    .underscored()
    .value();
  outObject.pdashlcase = _.replace(outObject.pulcase, '_', '-');
  outObject.puucase = S(plural)
    .underscored()
    .value()
    .toUpperCase();
  outObject.pdashucase = _.replace(outObject.puucase, '_', '-');
  outObject.ptitlecase = S(plural)
    .classify()
    .value();
};
const injectRootPlural = (outObject, rootObject) => {
  outObject.rpcamelcase = rootObject.pcamelcase;
  outObject.rplcase = rootObject.plcase;
  outObject.rpucase = rootObject.pucase;
  outObject.rpulcase = rootObject.pulcase;
  outObject.rpdashlcase = rootObject.pdashlcase;
  outObject.rpuucase = rootObject.puucase;
  outObject.rpdashucase = rootObject.pdashucase;
  outObject.rptitlecase = rootObject.ptitlecase;
};

const injectStringHelpers = inObject => {
  let rootObject = null;

  let result = _.cloneDeepWith(inObject, function(outObject) {
    if (_.isObject(outObject) && !_.isArray(outObject)) {
      // single
      if (_.has(outObject, 'name')) {
        let name = outObject['name'];

        // Single
        injectSingle(outObject, name);

        // Root Single
        if (rootObject === null) {
          rootObject = outObject;
        }
        injectRootSingle(outObject, rootObject);
      }

      // plural
      if (_.has(outObject, 'plural')) {
        let plural = outObject['plural'];

        // plural
        injectPlural(outObject, plural);

        //Root plural
        injectRootPlural(outObject, rootObject);
      }
    }
  });

  return result;
};

module.exports = {
  injectStringHelpers
};
