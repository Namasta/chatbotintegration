// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';


const express = require('express');
const bodyParser = require('body-parser');
const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');
var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chatbotintegration-2b8d8.firebaseio.com"
});

const db = admin.firestore();

const {
    dialogflow,
    Image,
    Table,
    Carousel,
  } = require('actions-on-google');
  var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
  var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
  var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

const app = dialogflow();

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

app.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({ request, response });
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    function welcome(agent) {
        agent.add(`Welcome to my agent!`);
    }

    function fallback(agent) {
        agent.add(`I didn't understand`);
        agent.add(`I'm sorry, can you try again?`);
    }

    function testImage(agent) {
        agent.add(`I am testimage`);
        agent.add(`I'm sorry, can you try again?`);
    }



    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('GetImageDetailIntent', testImage);
    // intentMap.set('your intent name here', googleAssistantHandler);
    agent.handleRequest(intentMap);
});



const expressApp = express().use(bodyParser.json());

expressApp.post('/fulfillment', app.dialogflowFirebaseFulfillment);
//expressApp.listen(3000);
var listener = expressApp.listen(process.env.PORT, process.env.IP, function () {
    //var listener = app.listen(4000, process.env.IP, function () {
    console.log("server started");
    console.log("listening on port " +
      listener.address().port);
  });