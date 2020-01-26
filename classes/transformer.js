/**
 * Convert objects from one form to another
 */
const _ = require('lodash');
const S = require('underscore.string');

const injectStringHelpers = inObject => {
  let rootObject = null;

  let result = _.cloneDeepWith(inObject, function(outobject) {
    if (_.isObject(outobject) && !_.isArray(outobject)) {
      // single

      if (_.has(outobject, 'name')) {
        let name = outobject['name'];

        outobject.camelcase = S(name)
          .camelize(true)
          .value();
        outobject.lcase = name.toLowerCase();
        outobject.ucase = name.toUpperCase();
        outobject.ulcase = S(name)
          .underscored()
          .value();
        outobject.dashlcase = _.replace(outobject.ulcase, '_', '-');
        outobject.uucase = S(name)
          .underscored()
          .value()
          .toUpperCase();
        outobject.dashucase = _.replace(outobject.uucase, '_', '-');
        outobject.titlecase = S(name)
          .classify()
          .value();

        if (rootObject === null) {
          rootObject = outobject;
          // console.log('root:', rootObject);
        }

        //root name
        outobject.rcamelcase = rootObject.camelcase;
        outobject.rlcase = rootObject.lcase;
        outobject.rucase = rootObject.ucase;
        outobject.rulcase = rootObject.ulcase;
        outobject.rdashlcase = rootObject.dashlcase;
        outobject.ruucase = rootObject.uucase;
        outobject.rdashucase = rootObject.dashucase;
        outobject.rtitlecase = rootObject.titlecase;
      }

      // plural

      if (_.has(outobject, 'plural')) {
        let plural = outobject['plural'];

        outobject.pcamelcase = S(plural)
          .camelize(true)
          .value();
        outobject.plcase = plural.toLowerCase();
        outobject.pucase = plural.toUpperCase();
        outobject.pulcase = S(plural)
          .underscored()
          .value();
        outobject.pdashlcase = _.replace(outobject.pulcase, '_', '-');
        outobject.puucase = S(plural)
          .underscored()
          .value()
          .toUpperCase();
        outobject.pdashucase = _.replace(outobject.puucase, '_', '-');
        outobject.ptitlecase = S(plural)
          .classify()
          .value();

        //root plural
        outobject.rpcamelcase = rootObject.pcamelcase;
        outobject.rplcase = rootObject.plcase;
        outobject.rpucase = rootObject.pucase;
        outobject.rpulcase = rootObject.pulcase;
        outobject.rpdashlcase = rootObject.pdashlcase;
        outobject.rpuucase = rootObject.puucase;
        outobject.rpdashucase = rootObject.pdashucase;
        outobject.rptitlecase = rootObject.ptitlecase;
      }
    }
  });

  return result;
};

module.exports = {
  injectStringHelpers
};
