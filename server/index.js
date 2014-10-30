var debug = require('debug');
var lodash = require('lodash');
var progress = require('progress');
var restify = require('restify');
var unirest = require('unirest');
var yargs = require('yargs');

function respond(req, res, next) {
  res.send('hello ' + req.params.name);
  next();
}

var server = restify.createServer();

server.use(restify.acceptParser(server.acceptable));
server.use(restify.authorizationParser());
server.use(restify.dateParser());
server.use(restify.queryParser());
server.use(restify.jsonp());
server.use(restify.gzipResponse());
server.use(restify.bodyParser());

server.get('/api/:name', respond);
server.head('/api/:name', respond);
server.get(/\/?.*/, restify.serveStatic({
  directory: './server/public',
  default: 'index.html'
}));
server.listen(3210, function() {
  console.log('%s listening at %s', server.name, server.url);
});