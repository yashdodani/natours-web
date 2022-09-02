class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1A)) filtering
    const queryObj = { ...this.queryString }; //shallow copy of query
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]); // delete operator used to delete. remove all these excluded from the query

    // 1B)) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this; // returning the whole object, so that more functions can be called
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy); // ascending order
      // for descending order just replace price with -price in url and mongoose will automatically sort them
      // sort('price ratingsAverage') for multiple properties
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      // when say sort more than once, it converts the parameter in an array and that gives error due to split
      const fields = this.queryString.fields.split(',').join(' ');
      // query = query.select('name duration price') // this is known as projecting
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // with '-' we exclude it
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    // ex. page=2&limit=10, 1-10 for page 1, 11-20 for page 2, 21-30 for page 3
    this.query = this.query.skip(skip).limit(limit);

    // if (this.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exit'); // throw here to catch there
    // } // not required
    return this;
  }
}

module.exports = APIFeatures;
