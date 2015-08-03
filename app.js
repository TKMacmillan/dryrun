'use strict';
var app = require('koa')()
  , _ = require('underscore')
  , gzip = require('koa-gzip')
  , serve = require('koa-static')
  , Router = require('koa-router')
  , Promise = require('bluebird')
  , bodyParser = require('koa-bodyparser')
  , views = require('koa-render')
  , React = require('react/addons')
  , Quiz = require('./jsx/Quiz.jsx')
  , quizClass = require('./controllers/Quiz')
  , quizController = new quizClass()
  , env = (typeof process.env.CUSTOM_ENV === 'undefined')? 'localhost':
      (process.env.CUSTOM_ENV === 'qa')? 'qa': 'prod'
  , general = new Router();

// Hook the .jsx extension.
// require('node-jsx').install({ harmony: true, extension: '.jsx' });

app.use(bodyParser());

// GZIP responses.
app.use(gzip());

// Use koa-static for css, js and images.
app.use(serve(__dirname+'/public'))

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
  // Handle "unhandled" requests, `this.status = 404`s, and 404 errors
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
  this.redirect('/hypothetical-university/2015/fall/math-101/quiz-1');
  // this.body = yield this.render('index', { });
});

general.get('/api/hypothetical-university/2015/fall/math-101/quiz-1', function*() {
  let submissions = yield *quizController.getSubmissions(this);
  this.body = JSON.stringify({
    'question': 'Is 1,024^2 equal to 1,048,576 ?',
    'answers': ['True', 'False'],
    'submissions': submissions
  });
});

general.post('/api/quiz', function*() {
  let bd = this.request.body;
  yield *quizController.postSubmission(bd.answer, bd.name, this);
});

general.get('/thank-you', function*() {
  this.body = yield this.render('thankyou', { });
});

// This route uses server-side rendering for the quiz.
general.get('/hypothetical-university/2015/fall/math-101/quiz-1', function*() {
  var quizContent = React.renderToString(<Quiz />);
  this.body = yield this.render('quiz', {
    quiz: quizContent
  });
});

// This route uses client-side rendering for React/D3 charts.
general.get('/overview', function*() {
  this.body = yield this.render('overview', { });
});

general.get('/webcam', function*() {
  this.body = yield this.render('webcam', { });
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

// start server
app.listen(process.env.PORT || 3000) 