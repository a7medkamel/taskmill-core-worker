var request         = require('request')
  , _               = require('underscore')
  , url             = require('url')
  , host_request    = request.defaults({})
  ;

function resolveUrl (path, metadata) {
  try {
    var parsed = url.parse(path);

    if (!parsed.hostname) {
      parsed.hostname = metadata.host.hostname;
      parsed.port = metadata.host.port;
      parsed.protocol = metadata.host.protocol;
    }

    return url.format(parsed);
  } catch (e) { }

  return undefined;
}

var wrapped_request = _.wrap(host_request, function(func) {
  var args        = _.rest(arguments)
    , options     = _.isObject(args[0])? args[0] : {}
    , getUrl      = _.partial(resolveUrl, _, this.options.metadata)
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

  options.headers = _.defaults({}, options.headers, {
    'authorization' : 'Bearer ' + this.options.metadata.runas.access_token
  });

  return func.apply(this, [options].concat(_.rest(args)));
});

function App(req, res, next, options){
  this.req  = req;
  this.res  = res;
  this.next = next;
  this.options = options;
}

App.prototype.request = function() {
  return wrapped_request.apply(this, _.toArray(arguments));
};

module.exports = App;