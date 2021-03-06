/**
 * Convert objects from one form to another
 */
const _ = require('lodash');
const S = require('underscore.string');

const injectSingle = (outObject, name) => {
  outObject.camelcase = S(name).camelize(true).value();
  outObject.lcase = name.toLowerCase();
  outObject.ucase = name.toUpperCase();
  outObject.ulcase = S(name).underscored().value();
  // console.log('outObject.ulcase:', outObject.ulcase);
  outObject.dashlcase = S(outObject.ulcase).replaceAll('_', '-').value();
  // console.log('outObject.dashlcase:', outObject.dashlcase);
  outObject.uucase = S(name).underscored().value().toUpperCase();
  outObject.dashucase = S(outObject.uucase).replaceAll('_', '-').value();
  outObject.titlecase = S(name).classify().value();
  outObject.titlename = S(S(outObject.dashlcase).replaceAll('-', ' ').value()).titleize().value();
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
  outObject.rtitlename = rootObject.titlename;
};
const injectPlural = (outObject, plural) => {
  outObject.pcamelcase = S(plural).camelize(true).value();
  outObject.plcase = plural.toLowerCase();
  outObject.pucase = plural.toUpperCase();
  outObject.pulcase = S(plural).underscored().value();
  outObject.pdashlcase = S(outObject.pulcase).replaceAll('_', '-').value();
  outObject.puucase = S(plural).underscored().value().toUpperCase();
  outObject.pdashucase = S(outObject.puucase).replaceAll('_', '-').value();
  outObject.ptitlecase = S(plural).classify().value();
  outObject.ptitlename = S(S(outObject.pdashlcase).replaceAll('-', ' ').value()).titleize().value();
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
  outObject.rptitlename = rootObject.ptitlename;
};

const injectEnums = (outObject, enums) => {
  try {
    // "enum": "['','Option 1','Option 2','Option 3']",
    // eslint-disable-next-line no-eval
    const arr = eval(enums);
    outObject.enums = arr;
  } catch (error) {
    throw new Error(`Expected array on enum field. Example... ['Option 1','Option 2','Option 3']`);
  }
};

const injectType = (outObject, type) => {
  // [IN] "type": "String"
  // [OUT] typeString = true
  outObject[`type${type}`] = true;
  outObject.typelcase = type.toLowerCase();
};

const injectStringHelpers = (inObject) => {
  let rootObject = null;

  const result = _.cloneDeepWith(inObject, function (outObject) {
    if (_.isObject(outObject) && !_.isArray(outObject)) {
      // single
      if (_.has(outObject, 'name')) {
        const { name } = outObject;

        // Single
        injectSingle(outObject, name);

        // Root Single
        if (rootObject === null) {
          rootObject = outObject;
        }
        injectRootSingle(outObject, rootObject);
      }

      // enums
      if (_.has(outObject, 'enum')) {
        const enums = outObject.enum;
        injectEnums(outObject, enums);
      }

      // type
      if (_.has(outObject, 'type')) {
        const { type } = outObject;
        injectType(outObject, type);
      }

      // plural
      if (_.has(outObject, 'plural')) {
        const { plural } = outObject;

        // plural
        injectPlural(outObject, plural);

        // Root plural
        injectRootPlural(outObject, rootObject);
      }
    }
  });

  return result;
};

module.exports = {
  injectStringHelpers,
};
