// Mark an article as saved
$(".save").on("click", function(){
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "POST",
    url:"/saved/" + thisId
  }).then(function(data){
    window.location = "/"
  });
});

// Remove an article from the saved articles
$(".delete").on("click", function(){
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "POST",
    url: "/delete/" + thisId
  }).then(function(dtat){
    window.location = "/"
  });
});

// Get news by scraping Dawgnation.com
$("#getNews").on("click", function(){
  $.ajax({
    method: "GET",
    url: "/scrape",
  }).then(function(data){
    console.log(data)
    window.location = "/"
  });
});

// Create Note
$(".save-note").on("click", function(){
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      body:$("#idNote" + thisId).val()
    }
  }).then(function(data){
    console.log(data);
    $("#idNote").modal("hide");
    window.location = "/saved"
  });
});

// Delete 1 note
$(".deleteNote").on("click", function(){
  var thisId = $(this).attr("data-note-id");
  $.ajax({
    method: "POST",
    url: "/deleteNote/" + thisId,
  }).then(function(data){
    console.log(data);
    window.location = "/saved"
  });
});