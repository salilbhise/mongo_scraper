// Dependencies
const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const logger = require("morgan");
const method = require("method-override");
const body = require("body-parser");

// Requiring scraping tools
const axios = require("axios");
const cheerio = require("cheerio");
const path = require("path");
// const request = require("request");

// Requiring Note and Article models
const Article = require("./models/Article");
const Note = require("./models/Note");
const databaseUrl = 'mongodb://localhost/scrapper';

if (process.env.MONGODB_URI) {
	mongoose.connect(process.env.MONGODB_URI);
}
else {
	mongoose.connect(databaseUrl);
};

// Set Mongoose to leverage built in JavaScript ES6 promises
mongoose.Promise = Promise;
// Database configuration with Mongoose
const db = mongoose.connection;

// Show any Mongoose errors
db.on("error", function(error) {
	console.log("Mongoose Error: ", error);
});

// Once logged in to the db through Mongoose, log a success message
db.once("open", function() {
	console.log("Mongoose connection successful.");
});


const app = express();
const port = process.env.PORT || 3000;

// Middleware Morgan for logging requests
app.use(logger("dev"));
// Make public a static dir
app.use(express.static("public"));
app.use(body.urlencoded({extended: false}));
app.use(method("_method"));

// Set Handlebars as the default templating engine
app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

// Start the server
app.listen(port, function() {
	console.log("Listening on port " + port);
})

// Routes

app.get("/", function(req, res) {
	Article.find({}, null, {sort: {created: -1}}, function(err, data) {
		if(data.length === 0) {
			res.render("placeholder", {message: "Nothing scraped yet. Please click \"Scrape Newest Articles\" for the latest updates."});
		}
		else{
			res.render("index", {articles: data});
		}
	});
});

// A GET request to scrape the Harvard Business Review website
app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with request
	axios("https://hbr.org/", function(error, response, html) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
		const $ = cheerio.load(html);
		const result = {};
		$('stream-item h3').each(function(i, element) {
			const link = $(element).find("a").attr("href");
			const title = $(element).find("h2.headline").text().trim();
            const summary = $(element).find("p.summary").text().trim();
            // Having issues with images and not getting all summaries
			const img = $(element).parent().find("figure.media").find("img").attr("src");
			result.link = link;
			result.title = title;
			if (summary) {
				result.summary = summary;
			};
			if (img) {
				result.img = img;
			}
			else {
				result.img = $(element).find(".wide-thumb").find("img").attr("src");
			};
			const entry = new Article(result);
			Article.find({title: result.title}, function(err, data) {
				if (data.length === 0) {
					entry.save(function(err, data) {
						if (err) throw err;
					});
				}
			});
		});
		console.log("Scrape complete.");
		res.redirect("/");
	});
});

app.get("/saved", function(req, res) {
	Article.find({issaved: true}, null, {sort: {created: -1}}, function(err, data) {
		if(data.length === 0) {
			res.render("placeholder", {message: "No saved articles yet. Keep your news articles by clicking \"Save Article\"."});
		}
		else {
			res.render("saved", {saved: data});
		}
	});
});

app.get("/:id", function(req, res) {
	Article.findById(req.params.id, function(err, data) {
		res.json(data);
	})
})

app.post("/search", function(req, res) {
	console.log(req.body.search);
	Article.find({$text: {$search: req.body.search, $caseSensitive: false}}, null, {sort: {created: -1}}, function(err, data) {
		console.log(data);
		if (data.length === 0) {
			res.render("placeholder", {message: "Sorry, no results. Maybe try some other key words."});
		}
		else {
			res.render("search", {search: data})
		}
	})
});

app.post("/save/:id", function(req, res) {
	Article.findById(req.params.id, function(err, data) {
		if (data.issaved) {
			Article.findByIdAndUpdate(req.params.id, {$set: {issaved: false, status: "Save Article"}}, {new: true}, function(err, data) {
				res.redirect("/");
			});
		}
		else {
			Article.findByIdAndUpdate(req.params.id, {$set: {issaved: true, status: "Saved"}}, {new: true}, function(err, data) {
				res.redirect("/saved");
			});
		}
	});
});

app.post("/note/:id", function(req, res) {
	var note = new Note(req.body);
	note.save(function(err, doc) {
		if (err) throw err;
		Article.findByIdAndUpdate(req.params.id, {$set: {"note": doc._id}}, {new: true}, function(err, newdoc) {
			if (err) throw err;
			else {
				res.send(newdoc);
			}
		});
	});
});

app.get("/note/:id", function(req, res) {
	var id = req.params.id;
	Article.findById(id).populate("note").exec(function(err, data) {
		res.send(data.note);
	})
})