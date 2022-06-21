const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// the scheme of the item to be saved in database
const sensorsSchema = new Schema({

    idDevice: {
        type: String,
        default:'1001'
        
    },

    temp: {
        type: String,
    },
    hum: {
        type: String,
    },
    humsol: {
        type: String,
    },
    electrovane: {
        type: Boolean,
        default:false,
    },
    date: {
        type: Date,
        default: Date.now
    }
},{timestamps:true});

module.exports = sensors = mongoose.model('sensors', sensorsSchema);