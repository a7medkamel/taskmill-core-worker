var _ = require('underscore');

function resolveUrl (path, metadata) {
  var url = require('url');
  try {
    var parsed = url.parse(path);

    if (!parsed.hostname) {
      parsed.hostname = '__relay.io';
      // parsed.hostname = metadata.host.hostname;
      parsed.protocol = metadata.host.protocol;

      // todo [akamel] not the best way to not include port
      if (metadata.host.port != 443 && metadata.host.port != 80) {
        parsed.port = metadata.host.port;
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