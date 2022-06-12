const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');


const value = require("./models/sensors.models");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const cors = require('cors')


app.use(cors())

mongoose.connect("mongodb+srv://agrosmart:agrosmart@cluster0.q1dly.mongodb.net/auth?retryWrites=true&w=majority",
).then(() => {
    console.log('connected to base de données')
})



//sensors
   app.post('/api/sensors',(req,res)=>{
 
       const newItem = new value({
       temp: req.body.temp,
       hum: req.body.hum,
       humsol: req.body.humsol,
       electrovane: req.body.electrovane
    });
    // save value to database
    newItem.save()
        .then(item => res.json(item));
    console.log(req.body);
   });


app.get('/',(req, res) => {
    res.send('hello');
   })

/*
   app.get('/api/sensors', async(req,res)=>{
 
    //const sensors = await value.find();
       //res.status(200).json(sensors);
   });
   */


const PORT = process.env.PORT || 5000; 

app.listen(PORT,()=>{
    console.log('server is running...')
})