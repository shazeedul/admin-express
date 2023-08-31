const express = require('express');
const mongoose = require("mongoose");
require('dotenv').config();
const bodyParser = require("body-parser");

const authRouter = require("./src/routes/authRoutes");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT;

// mongos connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
	.connect(MONGODB_URI, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("Database Connected"))
    .catch((err) => console.log(err));
    
mongoose.Promise = global.Promise;

// routes
app.use('/', authRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.status(404).json({
      message: "No such route exists"
    })
});
  
// error handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500).json({
        message: "Error Message"
    })
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;