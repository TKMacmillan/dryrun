'use strict';
var app = require('koa')()
  , _ = require('underscore')
  , gzip = require('koa-gzip')
  , serve = require('koa-static')
  , Router = require('koa-router')
  , Promise = require('bluebird')
  , bodyParser = require('koa-bodyparser')
  , views = require('koa-render')
  , env = (typeof process.env.CUSTOM_ENV === 'undefined')? 'localhost':
      (process.env.CUSTOM_ENV === 'qa')? 'qa': 'prod'
/*
  , redisHost = (env === 'localhost')? '127.0.0.1':
      (env === 'qa') ? 'elasticache': '127.0.0.1'
  , redis = require('redis').createClient(6379, redisHost)
  , session = require('koa-generic-session')
  , redisStore = require('koa-redis')
*/
  , react = require('react')
  // , quiz = react.createFactory(require('./public/js/views/quiz.js').Quiz)
  // , quizController = require('./controllers/Quiz')
  // , quiz = new quizController()
  , general = new Router();

// Hook the .jsx extension.
require('node-jsx').install({ harmony: true, extension: '.jsx' });

app.use(bodyParser());

// GZIP responses.
app.use(gzip());

app.use(serve(__dirname+'/public'))

// TODO - Make the following session key an environment variable
// and read it in with process.env("SESSION_SECRET")
/*
app.keys = ['4m4cm1ll4n'];
app.use(session({
  cookie: {
    path: '/',
    httpOnly: true,
    // maxage: null,
    maxage: 1209600000,
    rewrite: true,
    signed: true
  },
  key: 'userSessID',
  store: redisStore({
    client: redis
  })
}));
*/

// custom 404
app.use(function *(next) {
  var err;
  try {
    yield next;
  } catch (e) {
    // handle thrown 404 errors
    if (e.status !== 404) throw e;
    err = e;
  }
  // handle "unhandled" requests, `this.status = 404`s, and 404 errors
  var status = this.status = (err && err.status) || this.status || 404
  if (status !== 404) return;

  // send a 404
  switch (this.accepts('json', 'html', 'text')) {
    case 'json':
      return this.body = {message: err ? err.message :  'page not found'}
    case 'html':
      return this.body = yield this.render('404');
  }
});

// body parser
app.use(bodyParser());

// append view renderer
app.use(views('./views', {
  map: { html: 'handlebars' },
  cache: false
}));

general.get('/', function*() {
    var data = {};
    var content = react.renderToString(quiz(data));
    this.body = yield this.render('test', {
      props.safeStringify(data)
    });
});

// TODO: Figure out what to do with this.
app.use(function *(next) {
  try {
    yield next;
  } catch (err) {
    this.status = err.status || 500;
    this.body = err.message;
    this.app.emit('error', err, this);
  }
});

app.use(general.middleware());

// A utility function to safely escape JSON for embedding in a <script> tag
function safeStringify(obj) {
  return JSON.stringify(obj).replace(/<\/script/g, '<\\/script').replace(/<!--/g, '<\\!--')
}

// start server
app.listen(process.env.PORT || 3000) 