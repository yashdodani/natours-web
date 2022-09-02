const mongoose = require('mongoose');
const dotenv = require('dotenv');

// CATCHING UNCAUGHT EXCEPTIONS
process.on('uncaughtException', (err) => {
  console.log('UNHANDLED EXCEPTION 🔥🔥🔥.. SHUTTING DOWN..');
  console.log(err.name, err.message);

  process.exit(1); // this crashes application
});

dotenv.config({ path: './config.env' });
const app = require('./app');

// console.log(app.get('env'));
// console.log(process.env);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    // console.log(con.connections);
    console.log('DB connenction successful');
  });

// for connecting to local just replace DB with DATABASE_LOCAL.

/*
// Mongoose simple schema
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
});

// Creating a model out of schema

const Tour = mongoose.model('Tour', tourSchema);

const testTour = new Tour({
  name: 'The Park Camper',
  rating: 4.7,
  price: 497,
});

testTour
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.log('error', err);
  }); // save the document in the data base

*/
// console.log(process.env);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port 3000...`);
});

// CATCHING UNHANDLED REJECTIONS (like database not connected)
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION 🔥🔥🔥.. SHUTTING DOWN..');
  console.log(err);
  server.close(() => {
    process.exit(1); // 0-for success, 1 - for uncaught exception
  });
});

// console.log(x);
