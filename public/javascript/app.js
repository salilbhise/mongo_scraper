$('#scrape').click(function(){
   
    $.get('/scrape', function(data){
        console.log(data);
    })
})


function getArticles(){
    $.get('/articles', function(data){
        console.log(data);
        populateArticles(data);
    })
}

getArticles();

function populateArticles(data){

    data.forEach(article => {
        $('#content')
        .append(
        ` <div class="article">
                <div> Title: ${article.title}</div>
        </div>`
        )
    })


}