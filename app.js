/* eslint-disable no-unused-vars */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:app');
const createError = require('http-errors');
const express = require('express');
const helmet = require('helmet');
// const bodyParser = require('body-parser');
const routes = require('./routes');
const consumerRoutes = require('./routes/consumer');
const webhookRoutes = require('./routes/webhook');
const pjson = require('./package.json');

const app = express();
require('express-async-errors');
const Constant = require('./utilities/constant');

// parse application/x-www-form-urlencoded


app.use(helmet());
const sixtyDaysInSeconds = 5184000;
app.use(helmet.hsts({
  maxAge: sixtyDaysInSeconds,
}));
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));

// Create rawBody data for stripe webhook
function rawBodySaver(req, res, buf, encoding) {
  if (req.originalUrl.startsWith('/stripe/webhook')) {
    req.rawBody = buf.toString();
  }
}
app.use(express.json({
  extended: true,
  verify: rawBodySaver,
}));
app.use(express.urlencoded({ extended: false }));
app.disable('x-powered-by');
app.use(httpContext.middleware);

app.use((req, res, next) => {
  httpContext.ns.bindEmitter(req);
  httpContext.ns.bindEmitter(res);
  const requestId = req.headers['kong-request-id'];
  httpContext.set('requestId', requestId);
  if (req.headers.origin) {
    // debug('request Id set is: ', httpContext.get('requestId'));
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
  }
  return next();
});
// show version on home route
app.get('/', (req, res) => { res.json({ version: pjson.version }); });
app.use('/api/v1', routes);
app.use('/consumer-api/v1', consumerRoutes);
app.use('/stripe', webhookRoutes);

// Commented because using express default parser
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  debug(`error: ${err} ${err.statusCode}`);
  let errorResponse;
  if (err.name) {
    const code = err.statusCode ? err.statusCode : 500;
    if (err.name === Constant.errorName.validationError) {
      errorResponse = { status: false, error: err, code };
    } else if (err.name === Constant.errorName.castError) {
      errorResponse = { status: false, error: Constant.labelList.invalidInput, code };
    } else if (err.name === Constant.errorName.typeError) {
      errorResponse = { status: false, error: Constant.labelList.invalidInput, code };
    } else if (err.name === Constant.errorName.unauthorized) {
      errorResponse = { status: false, error: Constant.errorName.unauthorized, code: 401 };
    } else if (err.statusCode) {
      errorResponse = {
        status: false, error: err.message, code,
      };
    } else if (err.message) {
      errorResponse = {
        status: false, error: err.message, code,
      };
    } else {
      errorResponse = { status: false, error: Constant.labelList.invalidInput, code };
    }
  }
  if (errorResponse) {
    res.status(errorResponse.code).json(errorResponse);
  } else {
    next();
  }
});
module.exports = app;
