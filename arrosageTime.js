const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// the scheme of the item to be saved in database
const arrosageSchema = new Schema({

    Temperature: {
        type: String,
    },
    Humidity: {
        type: String,
    },
     Humiditesol: {
        type: String,
    },
    heureEtDate: {
        type: String,
    },
    heureInsertion: {
        type: String,
    }
},{timestamps:true});

module.exports = sensors = mongoose.model('arrosage', arrosageSchema);