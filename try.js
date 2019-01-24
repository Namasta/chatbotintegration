//This section list the required libraries
'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');
var admin = require("firebase-admin");

const {
    dialogflow,
    Image,
    Table,
    Carousel,
  } = require('actions-on-google');
  
  var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
  var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
  var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

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