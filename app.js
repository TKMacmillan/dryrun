'use strict';
var app = require('koa')()
  , Router = require('koa-router')
  , bodyParser = require('koa-bodyparser')
  , DLAPClass = require('./controllers/DLAP')
  , DLAPData = new DLAPClass()
  , router = new Router();

app.use(bodyParser());

router.get('/', function*() {

    // Return simple 'hello world' json.
    this.body = JSON.stringify({ message: 'hello world!' });

});

router.get('/getData', function*() {

    // let DLAP = new DLAPData();
    let data = yield *DLAPData.getData('/api/titleservices/v1/titles/format/medium/titles.json', this)

});

app.use(router.middleware());

// start server
app.listen(process.env.PORT || 3000) 
