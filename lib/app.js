var _         = require('lodash')
  , sdk_n     = require('breadboard-sdk-notification')
  , sdk_m     = require('breadboard-sdk-mongodb')
  , sdk_ds    = require('breadboard-sdk-docusign')
  ;

// todo [akamel] clean this up; this isn't an app instance, this is a request instance/context...
function App(req, res) {
  let defs = [sdk_n, sdk_m, sdk_ds];

  let opts  = { bearer : req.get('authorization'), remote : req.__metadata.remote }
    , sdks  = _.map(defs, (def) => def.sdk(_.cloneDeep(opts)))
    , mixin = _.extend({}, ...sdks)
    ;

  _.extend(req.app, mixin);
}

module.exports = App;