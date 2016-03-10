var _         = require('underscore')
  , config    = require('config')
  , url       = require('url');
  ;

function resolveUrl (path, metadata) {
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

var wrapped_request;

function create_request() {
  if (!wrapped_request) {
    var request      = require('request')
      , host_request = request.defaults({})
      ;

    wrapped_request = _.wrap(host_request, function(func) {
      var args        = _.rest(arguments)
        , options     = _.isObject(args[0])? args[0] : {}
        , getUrl      = _.partial(resolveUrl, _, this.details.metadata)
        ;


      if (_.isString(args[0])) {
        options.uri = getUrl(args[0]);
      }

      if (!_.isUndefined(options.uri)) {
        options.uri = getUrl(options.uri);
      }

      if (!_.isUndefined(options.url)) {
        options.url = getUrl(options.url);
      }

      options.headers = _.extend({}, options.headers);

      // todo [akamel] this changes options.headers
      if (this.details.metadata.runas.access_token) {
        options.headers['authorization'] = 'Bearer ' + this.details.metadata.runas.access_token
      }

      return func.apply(this, [options].concat(_.rest(args)));
    });
  }

  return wrapped_request;
}

function App(req, res) {
  this.details = req.details;

  this.express_app = req.app;
}

App.prototype.request = function() {
  return create_request().apply(this, _.toArray(arguments));
};

module.exports = App;