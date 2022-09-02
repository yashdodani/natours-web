const mongoose = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');

// console.log(app.get('env'));
// console.log(process.env);
dotenv.config({ path: './config.env' });

const port = 3000;
app.listen(3000, () => {
  console.log(`App running on port 3000...`);
});
