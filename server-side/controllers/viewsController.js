/* eslint-disable import/no-useless-path-segments */
const axios = require('axios');
const Tour = require('./../models/tourModel');
// const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get all the tour data from the collection
  const tours = await Tour.find();
  // 2) Build the template
  // 3) Render that template using the tour data from step one
  res.status(200).render('overview', {
    title: 'All Tours',
    tours: tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data for the req tour (including reviews and tour guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  // 2) Build the template

  // 3) Render template using the data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} tour`,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Login',
  });
};

exports.postLoginForm = async (req, res, next) => {
  // console.log(req.body);
  // console.log(user);
  // const user = await User.findOne({ email });

  try {
    const { email, password } = req.body;
    console.log(email);
    console.log(password);
    axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    // console.log(res);
    res.status(200).json({
      status: 'success',
    });

    // console.log(res);
  } catch (err) {
    console.log('😶😶 ERRRORRRRR');
  }
};
