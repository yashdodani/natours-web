/* eslint-disable import/no-useless-path-segments */
const express = require('express');

const viewController = require('./../controllers/viewsController');

const authController = require('./../controllers/authController');

const router = express.Router();
// router.get('/', (req, res) => {
//   res.status(200).render('base', {
//     tour: 'The Forest Hiker', // these are now local variables available in pug
//     user: 'Jonas',
//   });
// });

router.use(authController.isLoggedIn);

router.get('/', viewController.getOverview);
router.get('/tour/:slug', viewController.getTour);

router.get('/login', viewController.getLoginForm);
router.post('/login', viewController.postLoginForm);

module.exports = router;
