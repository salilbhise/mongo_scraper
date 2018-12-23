// Dependencies

const express = require("express");
// const exphbs = require("express-handlebars");
const mongoose = require('mongoose');
const logger = require("morgan");
const bodyParser = require("body-parser");

//Our scraping tools
//Axios is a promised-based http library, similar to jQuery's Ajax method
//It works on the client and on the server
const axios = require("axios");
const cheerio = require("cheerio");
const path = require("path");

// Require all models
const models = require('./models');

var PORT = 3000;

// Initialize Express
const app = express();

// app.engine("handlebars", exphbs({ defaultLayout: "main" }));
// app.set("view engine", "handlebars");

// Middleware Morgan for logging requests
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.json({
    type: "application/vnd.api+json"
}));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.text());

app.use(express.static('public'))

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/scrapper');

// Routing
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/index.html'))
})

// A GET route for scraping the Harvard Business Review website
app.get('/scrape', function (req, res) {
    axios.get('https://hbr.org/').then(result => {

        //stream-item h3
        const $ = cheerio.load(result.data);
        // Now, we grab every stream-item under the h3
        $('stream-item h3').each((index, element) => {

            const article = {
                title: $(element).text(),
                url: $(element).siblings('.stream-item-info').children('a').attr('href'),
                summary: $(element).siblings('.dek').text()
            }
            models.Article.create(article).then(response => {
                console.log("article created");
            })
        })
        res.send("scrape complete")
    })

})

// Route for getting all Articles from the db
app.get('/articles', function (req, res) {
    models.Article.find({}).then(result => {
        res.send(result);
    })
})

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            // If a note was created successfully, find on Article with an `_id` equal to `req.params.id`. Update the Article
            // { new: true} tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another '.then' which receives the result of the query
            return db.Article.findOneAndUpdate({
                _id: req.params.id
            }, {
                note: dbNote._id
            }, {
                new: true
            });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });

});


// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});