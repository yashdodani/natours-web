const express = require('express');
const morgan = require('morgan');

const rateLimit = require('express-rate-limit');

const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const xss = require('xss-clean');

const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// GLOBAL MIDDLESWARES

// Setting security HTTP Headers (put it in beginning)
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// middleware - something that can modify the incoming data, a step between request and response

// Implementing RATE LIMIT, to limit the number of requests from a single IP, to save us from BRUTE FORCE ATTACKS
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // miliseconds
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // limited size of body

// Data Sanitization - against NoSQL query injection. ex-{"email": {"$gt": ""}}
app.use(mongoSanitize()); // It looks at request body, req queryString and req.params, and filter out all of the "$" signs and '.', Then they will not work

// Data Sanitization - against XSS(cross site scripting attacks)
app.use(xss()); // clean any user input from malicious html code (or js). Mongoose too has many good validators that do not allow xss attacks, so we should use appropriate validators in schema to avoid these attacks

// Prevent parameter pollution
// app.use(hpp()); // sometimes we don't want this to refactor some requests, so we whitelist some exceptions
app.use(
  hpp({
    whitelist: [  
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Creating our own middleware (define before all route handlers)
// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// ROUTES

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Order of execution of MIDDLEWARE depends on the order in which code is written

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'Fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server`); // built in Error constructor, Error(err.message)
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
  // if we pass anything to next(), express will understand that there is an error and it will stop all the middleware and will go to global error handling middleware and the error
}); // work for all http methods // * handles all the urls(everything)

// GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler); // by specifying these params, express understands that this is an error handling middleware

module.exports = app;
