const express = require('express');
const tourController = require('./../controllers/tourController');
const fs = require('fs');
const router = express.Router();

router.param('id', tourController.checkId);

// Check body middleware functions
// Check if body contains the name and price property
// If not, send back 400 back (bad requiest)
// Add it to the post handler stacl

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour); // chaining multiple middleware

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
