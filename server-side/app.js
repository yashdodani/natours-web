const express = require('express');
const path = require('path');
const morgan = require('morgan');

const bodyParser = require('body-parser');

const rateLimit = require('express-rate-limit');

const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const xss = require('xss-clean');

const hpp = require('hpp');

const cookieParser = require('cookie-parser');

const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

// Telling express about pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// GLOBAL MIDDLESWARES
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Setting security HTTP Headers (put it in beginning)
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'https:', 'http:', 'data:', 'ws:'],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'http:', 'data:'],
      scriptSrc: ["'self'", 'https:', 'http:', 'blob:'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:'],
    },
  })
);

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
app.use(cookieParser());

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
// app.use(express.static(`${__dirname}/public`);
app.use(express.static(path.join(__dirname, 'public')));

// Creating our own middleware (define before all route handlers)
// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

// ROUTES
// app.get('/', (req, res) => {
//   res.status(200).render('base', {
//     tour: 'The Forest Hiker', // these are now local variables available in pug
//     user: 'Jonas',
//   });
// });

// app.get('/overview', (req, res) => {
//   res.status(200).render('overview', {
//     title: 'All Tours',
//   });
// });

// app.get('/tour', (req, res) => {
//   res.status(200).render('tour', {
//     title: 'The Forest Hiker',
//   });
// });
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

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
