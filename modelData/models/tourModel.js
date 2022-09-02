const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

// const User = require('./userModel');

// Creating Schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have less or equal than 10 characters'],
      // validate: [validator.isAlpha, 'Tour name should only contain characters'], // to demonstrate using external validators
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price; // 100 < 200, true
        },
        message: 'Discount price ({VALUE}) is greater than price',
      },
    },

    summary: {
      type: String,
      trim: true, // remove all the while spaces in starting and beginning
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String, // just a name of the image is stored in the database, and then we with this name access that image
      required: [true, 'A tour must have a image'],
    },
    images: [String], // an array of strings
    createdAt: {
      type: Date, // built in data type - date
      default: Date.now(), // this is miliseconds from time, mongo parse this automatically to the date.
      select: false, // to hide it from the client
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    // Geospatial Data - storing locations in the form of lat and long, or any other form
    // Modelling Locations
    startLocation: {
      // GeoJSON - to specify geolocation data
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], // we except array of number, [lat, long]
      address: String,
      description: String,
    },
    locations: [
      // this is how we make embedded documents, start with an array
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array, // we did this when applied embedding
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// IMplementing Index field (for more fast execution)
// we should implement indexing only for queries that are requested more often, not for all of the properties, as it takes resources to allow indexing.
// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: 1 }); // for compounding indexes
tourSchema.index({ slug: 1 });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// VirtualPopulating Tour with Reviews
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE (pre, post host): runs before .save() and .create()
tourSchema.pre('save', function (next) {
  // pre save hook
  // console.log(this);
  this.slug = slugify(this.name, { lower: true }); // this = current document
  next();
});

// Modelling Tour Guides - Embedding (to render udsers based on the IDs)
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id)); // as map uses async function, guides (var) is now an array of Promises, not users
//   this.guides = await Promise.all(guidesPromises); // here we await all promises and complete them and keep then in guidesSchema

//   next();
// });

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  // ^find means all the strings that start with find (find, findOne, findById)
  // tourSchema.pre('find', function (next) {
  // this here now points to the query, due to 'find'
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

// Populating Users in Guides
tourSchema.pre(/^find/, function (next) {
  // populate(fill up) guides field in our model, also remove fields that we don't want to see

  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds `);
  // console.log(docs);
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  console.log(this.pipeline()); // this = aggregation object
  next();
});

// Creating a model out of schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
