const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// MIDDLESWARES\

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// middleware - something that can modify the incoming data, a step between request and response

app.use(express.json());

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Creating our own middleware (define before all route handlers)

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
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
