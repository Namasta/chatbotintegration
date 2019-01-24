//This section list the required libraries
var express = require("express");
//Create an instance of express server
var app = express();

app.get("/",function(req,res){
    res.send('<h1>This is my web app</h1>');
});


app.get("/something",function(req,res){
    res.send('<h1>This is something</h1>');
});

//Start the express server to listen to a port in the server
var listener = app.listen(
   process.env.PORT,
   process.env.IP,
   function(){
    console.log("server has started");
    console.log('Listening on port ' + listener.address().port);
});