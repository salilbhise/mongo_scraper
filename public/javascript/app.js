$('#scrape').click(function () {

    $.get('/scrape', function (data) {
        console.log(data);
    })
})


function getArticles() {
    $.get('/articles', function (data) {
        console.log(data);
        populateArticles(data);
    })
}

getArticles();

function populateArticles(data) {

    data.forEach(article => {
        $('#content')
            .append(
                ` <div class="article">
                <div> Title: ${article.title}</div>
        </div>`
            )
    })

}

// Display today's date on page
const dt = new Date();
document.getElementById("datetime").innerHTML = dt.toLocaleDateString();


// Grab the articles as a json
// $.getJSON("/articles", function (data) {
//     // For each one
//     for (var i = 0; i < data.length; i++) {
//         // Display the apropos information on the page
//         $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
//     }
// });


// // Whenever someone clicks a p tag
// $(document).on("click", "p", function () {
//     // Empty the notes from the note section
//     $("#notes").empty();
//     // Save the id from the p tag
//     const thisId = $(this).attr("data-id");

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
                // Value taken from title input
                title: $("#titleinput").val(),
                // Value taken from note textarea
                body: $("#bodyinput").val()
            }
        })
        // With that done
        .then(function (data) {
            // Log the response
            console.log(data);
            // Empty the notes section
            $("#notes").empty();
        });

    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
});