const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const bodyParser = require("body-parser");
const cors = require("cors");

const authRouter = require("./src/routes/authRoutes");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT;

// routes
app.use('/', authRouter);

mongoose
      .connect(process.env.MONGODB_URI)
      .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
      })
      .catch((err) => {
        console.error('Database connection error'+err);
      });

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



module.exports = app;