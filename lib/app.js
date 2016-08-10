var config    = require('config')
  , url       = require('url')
  , rp        = require('request-promise')
  ;

function resolveUrl (path) {
  try {
    var parsed = url.parse(path);

    if (!parsed.hostname) {
      parsed.hostname = config.get('services.hostname');
      parsed.protocol = config.get('services.protocol');
      if (config.has('services.port')) {
        var port = config.get('services.port');

        // if standard port, don't include it
        switch(parsed.protocol) {
          case 'http':
          parsed.port = (port === 80)? undefined : port;
          break;
          case 'https':
          parsed.port = (port === 443)? undefined : port;
          break;
          default:
          parsed.port = port;
        }
      }
    }

    return url.format(parsed);
  } catch (e) { }

  return undefined;
}

// todo [akamel] clean this up; this isn't an app instance, this is a request instance/context...
function App(req, res) {
  // this.req = req;
  // this.res = res;

  req.app.email = (json) => {
    return rp.post({
                url     : resolveUrl('api/email')
              , method  : 'POST'
              , json    : json
              , headers : { 'authorization' : req.get('authorization') }
            });
  };

  req.app.sms = (json) => {
    return rp.post({
                url     : resolveUrl('api/sms')
              , method  : 'POST'
              , json    : json
              , headers : { 'authorization' : req.get('authorization') }
            });
  };

  req.app.phone = (json) => {
    return rp.post({
                url     : resolveUrl('api/phone')
              , method  : 'POST'
              , json    : json
              , headers : { 'authorization' : req.get('authorization') }
            });
  };

  req.app.mongodb = {
      creds : (json) => {
                return rp.post({
                            url     : resolveUrl('api/mongodb/creds')
                          , method  : 'POST'
                          , json    : {
                              uri : req.details.remote
                          }
                          , headers : { 'authorization' : req.get('authorization') }
                        });
              }
  }
}

module.exports = App;