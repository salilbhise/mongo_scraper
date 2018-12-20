// Dependencies

const express = require("express");
const mongoose = require('mongoose');
const logger = require("morgan");
const bodyParser = require("body-parser");
var axios = require("axios");
var cheerio = require("cheerio");
const path = require("path");
const models = require('./models');

var PORT = 3000;


var app = express();

app.use(express.static('public'))

mongoose.connect('mongodb://localhost:27017/scrapper');

app.get('/', function(req,res){
    res.sendFile(path.join(__dirname, '/public/index.html'))
})

app.get('/scrape', function(req, res){
    axios.get('https://hbr.org/').then(result => {
        
        //stream-item h3
        const $ = cheerio.load(result.data);
        $('stream-item h3').each((index, element )=> {
           
            const article = {
                title: $(element).text(),
                url: $(element).siblings('.stream-item-info').children('a').attr('href'),
                summary: $(element).siblings('.dek').text()
            }
            models.Article.create(article).then( response => {
                console.log("article created");
            })
        })
        res.send("scrape complete")
    })
    
})


app.get('/articles', function(req, res){
    models.Article.find({}).then(result => {
        res.send(result);
    })
})













// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });