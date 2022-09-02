/* eslint-disable import/no-useless-path-segments */
const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
// const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// router.param('id', tourController.checkId);

// Check body middleware functions
// Check if body contains the name and price property
// If not, send back 400 back (bad requiest)
// Add it to the post handler stack

// IMPLEMENTING NESTED ROUTES FOR TOURS AND REVEIWS

// POST /tour/234f23/reviews - NESTED ROUTES
// GET /tour/234f23/reviews - NESTED ROUTES
// GET /tour/234f23/reviews/90f2239j - NESTED ROUTES

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

router.use('/:tourId/reviews', reviewRouter); // as router is also a middleware, we can use 'use' on it

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/')
  // .get(authController.protect, tourController.getAllTours)
  .get(tourController.getAllTours)
  // .post(tourController.createTour); // chaining multiple middleware
  .post(
    authController.protect,
    authController.restrictTo('lead-guide', 'admin'),
    tourController.createTour
  ); // chaining multiple middleware

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
