// var bodyParser          = require('body-parser')
//   , _                   = require('underscore')
//   , contentTypeOverride = require('express-content-type-override')
//   ;

// function passthrough(req, res, next){
//   process.nextTick(() => { next(); });
// }

// function middleware(manual) {
//   var content_type  = _.has(manual.input, 'content-type')? manual.input['content-type'] : undefined
//     , type          = _.has(manual.input, 'type')? manual.input['type'] : undefined
//     , mw            = passthrough
//     ;

//   switch(type) {
//     case 'buffer':
//     mw = bodyParser.raw({ type : '*/*'/*content_type*/ });
//     break;

//     case 'stream':
//     break;

//     default:
//       if (!_.isUndefined(content_type)) {
//         mw  = contentTypeOverride({ contentType : content_type });
//       }
//   }  

//   return mw;
// }

// module.exports = {
//     middleware  : middleware
// };