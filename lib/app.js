var config    = require('config')
  , urljoin   = require('url-join')
  , rp        = require('request-promise')
  ;

// todo [akamel] clean this up; this isn't an app instance, this is a request instance/context...
function App(req, res) {
  req.app.email = (json) => {
    return rp.post({
                url     : urljoin(config.get('services.url'), 'api/email')
              , method  : 'POST'
              , json    : json
              , headers : { 'authorization' : req.get('authorization') }
            });
  };

  req.app.sms = (json) => {
    return rp.post({
                url     : urljoin(config.get('services.url'), 'api/sms')
              , method  : 'POST'
              , json    : json
              , headers : { 'authorization' : req.get('authorization') }
            });
  };

  req.app.phone = (json) => {
    return rp.post({
                url     : urljoin(config.get('services.url'), 'api/phone')
              , method  : 'POST'
              , json    : json
              , headers : { 'authorization' : req.get('authorization') }
            });
  };

  req.app.mongodb = {
      creds : (json) => {
                return rp.post({
                            url     : urljoin(config.get('services.url'), 'api/mongodb/creds')
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