const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
var assert = require('assert');


const value = require("./sensors.models");
const moteur = require("./moteur.models");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const cors = require('cors')


app.use(cors())
var url = "mongodb+srv://agrosmart:agrosmart@cluster0.q1dly.mongodb.net/auth?retryWrites=true&w=majority";
mongoose.connect(url,
).then(() => {
    console.log('connected to base de données')
})



//sensors
   app.post('/api/sensors',(req,res)=>{
 
       const newItem = new value({
       temp: req.body.temp,
       hum: req.body.hum,
       humsol: req.body.humsol,
       electrovane: req.body.electrovane,
       manuelle: req.body.manuelle

    });
    // save value to database
    newItem.save()
        .then(item => res.json(item));
    console.log(req.body);
   });


app.get('/',(req, res) => {
    res.send('hello heroku');
   })

   //
   app.get('/api/sensors', async(req,res)=>{
 
       const moteur = await moteur.find().sort({ createdAt: -1 }).limit(1);
       moteur.map((arr, key) => {
             res.status(200).send(arr.manuelle);
       })
       
       console.log(moteur) 

   });


app.get('/sensors',async(req, res)=>{
    await value.find()
        .then(items => res.json(items.slice(items.length - 6, items.length)))
        .catch(err => console.log(err));
});
 const MongoClient = require('mongodb').MongoClient;

 app.get('/api', async(req,res)=>{
 
       const sensors = await value.find();
       var temperature = sensors[sensors.length - 1]["temp"]
       var humidite = sensors[sensors.length - 1]["hum"]
       var humiditesol = sensors[sensors.length - 1]["humsol"]
       console.log(temperature,humidite)
       
     
    var datHeure = new Date();
    var min = datHeure.getMinutes();
    var heur = datHeure.getHours(); //heure
    var sec = datHeure.getSeconds(); //secondes
    var mois = datHeure.getDate(); //renvoie le chiffre du jour du mois 
    var numMois = datHeure.getMonth() + 1; //le mois en chiffre
    var laDate = datHeure.getFullYear(); // me renvoie en chiffre l'annee
    if (numMois < 10) { numMois = '0' + numMois; }
    if (mois < 10) { mois = '0' + mois; }
    if (sec < 10) { sec = '0' + sec; }
    if (min < 10) { min = '0' + min; }
    var heureInsertion = heur + ':' + min + ':' + sec;
     var heureEtDate = mois + '/' + numMois + '/' + laDate;
     console.log(heur,min,sec)
    // TODO

   if ((heur == 08 && min == 00 && sec == 00) || (heur == 12 && min == 00 && sec == 00) || (heur == 22 && min == 21 )) {
        var tempe = parseFloat(temperature);
        var humi = parseFloat(humidite);
        var humsol = parseFloat(humiditesol);

        console.log("En number " + tempe);
        console.log("En chaine de caractere " + temperature);
        //l'objet qui contient la temperature, humidite et la date
        var tempEtHum = { 'Temperature': tempe, 'Humidity': humi,'Humiditesol': humsol ,'Date': heureEtDate, 'Heure': heureInsertion };
        //Connexion a mongodb et insertion Temperature et humidite
        MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
            if (err) throw err;
            var dbo = db.db("auth");
            dbo.collection("arrosage").insertOne(tempEtHum, function(err, res) {
                if (err) throw err;
                console.log("1 document inserted");
                db.close();
            });
        });

    } //Fin if
 
 });



 app.get('/moy', (req, res) => {

    //Fonction pour la recuperation de la moyenne temperature
    MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("auth");
         assert.equal(null, err);
        //Declaration des variables are
        var tempDixNeufHeure;
        var humDixNeufHeure;
        var tempDouzeHeure;
        var humDouzeHeure;
        var tempHuitHeure;
        var humHuitHeure;
        var moyH;
        var moyT;
        //fin
        var col = dbo.collection('arrosage');
        col.aggregate([{ $group: { _id: "_id", moyeTemp: { $avg: "$Temperature" } } }]).toArray(function(err, items) {
            console.log(items);
            moyT = items[0].moyeTemp;
            console.log(moyT);
        });
        //Moyenne humidite donnees
        col.aggregate([{ $group: { _id: "_id", moyeHum: { $avg: "$Humidity" } } }]).toArray(function(err, humi) {
            console.log(humi);
            moyH = humi[0].moyeHum;
            console.log(moyH);
        });
        //recuperation de la temperature de 8h
        col.find({ Heure: "22:21:01" }, { Temperature: 1 }).toArray(function(err, tem1) {
            console.log(tem1);
            tempHuitHeure = tem1[0].Temperature;
            humHuitHeure = tem1[0].Humidity;
            console.log("Temperature Huit heure:\t" + tempHuitHeure);
            console.log("Humidite Huit heure :\t" + humHuitHeure);
        });
        //recuperation de la temperature de 12h
        col.find({ Heure: "22:14:17" }, { Temperature: 1 }).toArray(function(err, tem2) {
            console.log(tem2);
            tempDouzeHeure = tem2[0].Temperature;
            humDouzeHeure = tem2[0].Humidity;
            console.log("Temperature Douze heure:\t" + tempDouzeHeure);
            console.log("Humidite Douze heure :\t" + humDouzeHeure);
        });
        //recuperation de la temperature de 19h
        col.find({ Heure: "22:10:30" }, { Temperature: 1 }).toArray(function(err, tem3) {
            console.log(tem3);
            tempDixNeufHeure = tem3[0].Temperature;
            humDixNeufHeure = tem3[0].Humidity;
            console.log("Temperature Dix neuf heure:\t" + tempDixNeufHeure);
            console.log("Humidite Dix neuf heure :\t" + humDixNeufHeure);
            var objet = [{
                MoyTemperature: moyT,
                MoyHumidite: moyH,
                TempHuitHeure: tempHuitHeure,
                HumiditeHuitHeure: humHuitHeure,
                TemperatureDouzeHeure: tempDouzeHeure,
                HumiditeDouzeHeure: humDouzeHeure,
                TemperatureDixNeufHeure: tempDixNeufHeure,
                HumiditeDixNeufHeure: humDixNeufHeure
            }];
            //console.log("L'objet global = \t" + objet);
            res.send(objet);
            db.close();
        });

    });


});





//derniere state de l'electrovanne 
app.get('/electrovanne', async(req,res)=>{
 
       const arrosage = await value.find().sort({ createdAt: -1 }).limit(1);
       arrosage.map((arr, key) => {
             res.status(200).send(arr.electrovane);
       })
       
       console.log(arrosage) 

   });


//declencher l'electrovanne 
 app.post('/electrovanne/on', async(req,res)=>{
  const newItem = new moteur({
      manuelle: true,
      electrovane:true
    });
    // save value to database
    newItem.save()
        .then(item => res.json(item));
    console.log(req.body);
   });
 
 
 //arreter l'electrovanne   
 app.post('/electrovanne/off', async(req,res)=>{
  const newItem = new moteur({
      manuelle: false,
      electrovane:false

    });
    // save value to database
    newItem.save()
        .then(item => res.json(item));
    console.log(req.body);
   });










const PORT = process.env.PORT || 5000; 

app.listen(PORT,()=>{
    console.log('server is running...')
})