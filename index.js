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

        var visualRecognition = new VisualRecognitionV3({
            version: '2018-03-19',
            iam_apikey: '2Svww-vgXV-Tlgv3j86H5bLOez9pu4K8pqjiMDlaXq5Y'
          });
      
          var params = {
            //url: "https://www.t-mobile.com/content/dam/t-mobile/en-p/cell-phones/apple/apple-iphone-x/silver/Apple-iPhoneX-Silver-1-3x.jpg"
            url: agent.parameters.url
          };
          return new Promise((resolve, reject) => {
            visualRecognition.classify(params, function (err, response) {
              if (err) {
                console.log(err);
                agent.add("There is something wrong with the image link");
                reject("Error");
              }
              else {
                let result = JSON.stringify(response, null, 2);
                var i=0; var str = "";
                var categories = response.images[0].classifiers[0].classes;
                for (i = 0; i < categories.length; i++) {
                    str += categories[i].class + " :";
                    str += categories[i].score + "\n ";
                }
                agent.add(str);
                //console.log(result);                
                categories.sort(function (a, b) { return b.score - a.score });
                categories.forEach(element => {
                  if (element.score > 0.8 && element.type_hierarchy != null)
                    str += element.class + " :" + element.score + "\n";
                });
                //agent.add('Image contains: \n' + str);
                agent.add(new Card({
                  title: `Image Details`,
                  imageUrl: params.url,
                  text: str,
                })
                );
                console.log(result);
                resolve("Good");
              }
            });
          });
        
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


/*Default Welcome Intent', conv => {
    var today = new Date();
    var dd = today.getDate();
    //conv.ask('Hello, This is MyAgent! How are you?' + dd);
    conv.ask('Hi, I am Agent.');
    conv.ask(new Image({
    url: 'https://developers.google.com/web/fundamentals/accessibility/semantics-builtin/imgs/160204193356-01-cat-500.jpg',
    alt: 'A cat',
    }));
});
 

app.intent('CreateAppointment',(conv,{name,email,date,time,location,duration, event})=>{
    var entry = {   name: name,
                    email:email,
                    date :date,
                    time:time,
                    location: location,
                    duration:duration,
                    event:event};
                    
    
     createappt(conv,entry);
     conv.ask('Done! '+ name +' , I have recorded that you have a ' + event + ' on ' + date.split('T')[0] + ' at ' + time.split('T')[1].split('+')[0] + ' for '+ duration[0] + ' under '+ email +'.');
     //conv.ask('Done! '+ name +' , I have recorded that you have a ' + Startdate + ' on ' + Starttime + ' at ' + time + ' for ' + duration + ' under '+ email +'.');

    
});

function createappt(conv,entry){
    var email = entry.email;
    var event = entry.event;
    var doc = db.collection('appointment').doc(email).collection('event')
    .add(entry).then(ref => {
        console.log('Added');
    });
}


app.intent('GetAppt', (conv,{email}) =>{    
    return getQueries(email,conv).then((output)=>{
        conv.add(output);
        return console.log('GetAppt executed');
    }) ;
});

function getQueries (email,conv) {
    return new Promise((resolve, reject) => {
        var eventRef = db.collection('appointment').doc(email).collection('event');
        eventRef.get().then(snapshot => {
            var str = "";
            var count = 0;
            //if(snapshot.size > 0){
            //    str = "You have " + snapshot.size + " events. ";
            //}
            //else{
            //   str = "You do not have any appointment";
            //}
            snapshot.forEach(doc => {
                var dt = new Date(doc.data().date);
                var time =new Date(doc.data().time);
                var tm = doc.data().time;
                if(dt > Date.now()){
                    //console.log('Found doc with id:', doc.id);
                    count++;
                    //str += 'Found doc with id:' + doc.id;
                    str += '\n' ;
                    str += "Event " +count + ", " + dt.toDateString();
                    //str += " at " + tm;
                    str += " at " + tm.split('T')[1].split('+')[0] + ".";
                     //time.split('T')[1].split('+')[0]
                    //str += "at " + time.toTimeString().slice(1,time.toTimeString().indexOf("GMT+")) + "."; 
                }
            });
            //conv.add(str);
            resolve(str);
        });
        //.catch(err => {
        //    console.log('Error getting documents', err);
        //    conv.add("Error getting event");
        //    reject("test");
        //});
    });
}

app.intent('CancelAppt', (conv,{email}) =>{
    return getQueries(email,conv).then((output)=>{
        conv.add(output + " Which appointments do you wish to cancel?");
        return console.log("CancelAppointmentIntent executed");
    }); 
});

app.intent('CancelSelectedAppt', (conv,{email,number}) =>{
    return deleteAppt(email,number,conv).then((output)=>{
        //conv.ask("Cancellation Done");
        return console.log("CancelSelectedApptIntent executed");
    }); 
});

function deleteAppt(email,number,conv){
    return new Promise((resolve, reject) => {
        var eventRef = db.collection('appointment').doc(email).collection('event');
        eventRef.get().then(snapshot => {
            var str = "";
            var id = "";
            var count = 0;
            //Get booking reference
            snapshot.forEach(doc => {
                var dt = new Date(doc.data().date);
                var time = doc.data().time;
                if(dt > Date.now()){
                    count++;
                    if(count == number){
                        console.log('DEL:Found doc with id:', doc.id);
                        str += count + ". Your booking on " + dt.toDateString();
                        str += "at " + time.split('T')[1].split('+')[0] + " is cancelled.";
                        //Delete doc here
                        var deleteDoc = eventRef.doc(doc.id).delete();
                        console.log('DEL:', deleteDoc);
                    }
                }
            });
            conv.ask(str);
            resolve("Cancellation Resolved");
        })
        .catch(err => {
            console.log('Error getting documents', err);
            conv.ask("Error Cancelling");
            reject("Cencellation Rejected");
        });
    });
}


app.intent('UpdateSelectedAppt', (conv,{email,number}) =>{
    return updateEvent(email,number,conv).then((output)=>{
    //return getQueries(email,conv).then((output)=>{
    //return deleteAppt(email,number,conv).then((output)=>{
       // conv.add(output +"Which parameter and value do you want to update ?  ");
        return console.log("UpdatedSelectedAppt Excuted ");
    }) ;
});


function updateEvent(email,number,conv){
     return new Promise((resolve, reject) => {
        var eventRef = db.collection('appointment').doc(email).collection('event');
        eventRef.get().then(snapshot => {
            var str = "";
            var id = "";
            var count = 0;
            //Get booking reference
            snapshot.forEach(doc => {
                var dt = new Date(doc.data().date);
                var time = doc.data().time;
                var dur = doc.data().duration;
                var loc = doc.data().location;
                //childSnap.val()['food']
                if(dt > Date.now()){
                    count++;
                    if(count == number){
                        console.log('DEL:Found doc with id:', doc.id);
                        //str += count + ". Your booking on " + dt.toDateString();
                        //str += "at " + time.toTimeString().slice(1,time.toTimeString().indexOf("GMT+")) + " is cancelled.";
                        str += "Event "+ count + ". Your apointment date : " + dt.toDateString();
                        str += "\n  time: " + time.split('T')[1].split('+')[0];
                        str += "\n   duration: " + dur['amount']+ dur['unit'];
                        //str += "\n    location: " + dur['amount'];
                        str += "\n    Which parameter and value do you want to update ? " ;
                        //Delete doc here
                        //var deleteDoc = eventRef.doc(doc.id).delete();
                        console.log('DEL:');
                    }
                }
                
            });
            conv.ask(str);
            resolve("Update Resolved");
        })
        .catch(err => {
            console.log('Error getting documents', err);
            conv.ask("Error Cancelling");
            reject("Update Rejected");
        });
    });
}

app.intent('UpdateAppt', (conv,{email}) =>{
    return getQueries(email,conv).then((output)=>{
        conv.add(output + " Which appointments do you wish to update?");
        return console.log("UpdateAppointmentIntent executed");
    }) 
});


app.intent('UpdateParameter', (conv,{email,number,param,date,time,location,duration}) =>{
    return updateParam(email,number,param,date,time,location,duration,conv).then((output)=>{
        //conv.ask("Cancellation Done");
        return console.log("CancelSelectedApptIntent executed");
    }) 
});


function updateParam(email,number,param,date,time,location,duration,conv){
    return new Promise((resolve, reject) => {
        var eventRef = db.collection('appointment').doc(email).collection('event');
        eventRef.get().then(snapshot => {
            var str = "";
            var id = "";
            var count = 0;
            //Get booking reference
            snapshot.forEach(doc => {
                var dt = doc.data().date;
                //var dt = new Date(doc.data().date);
                var tm = doc.data().time;
                var dur = doc.data().duration;
                var loc = doc.data().location;
                //childSnap.val()['food']
                //if(Date(dt) > Date.now()){
                    count++;
                    if(count == number){
                        if(date!=""){dt=date}
                        if(time!=""){tm=time}
                        if(duration!=""){dur=duration}
                        console.log('DEL:Found doc with id:', doc.id);
                       // str += count + ". Your booking on " + dt.toDateString();
                        //str += "at " + time.toTimeString().slice(1,time.toTimeString().indexOf("GMT+")) + " is cancelled.";
                        //str += "Event "+ count + " updated . Your apointment now is date : " + dt.toDateString();
                        str += "Event "+ count + " updated . Your apointment is now date : " + dt.split('T')[0];
                        str += "\r\n  time: "+ tm.split('T')[1].split('+')[0];
                        //.toTimeString().split('GMT')[0];
                        //.split('T')[1].split('+')[0];
                        //str += "\r\n  time: " + tm.toTimeString().slice(1,tm.toTimeString().indexOf("GMT+"));
                        str += "\r\n   duration: " + dur['amount']+ dur['unit'];
                        var updateDoc = eventRef.doc(doc.id).update({date: dt, time: tm, duration: dur});
                        console.log('Up:');
                    }
                //}
                
            });
            conv.ask(str);
            resolve("Cancellation Resolved");
        })
        .catch(err => {
            console.log('Error getting documents', err);
            conv.ask("Error Cancelling");
            reject("Cencellation Rejected");
        });
    });
}




exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);*/