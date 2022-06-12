const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// the scheme of the item to be saved in database
const sensorsSchema = new Schema({


    temp: {
        type: String,
        required: true
    },
    hum: {
        type: String,
        required: true
    },
    humsol: {
        type: String,
        required: true
    },
    electrovane: {
        type: Boolean,
        default:false,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
},{timestamps:true});

module.exports = sensors = mongoose.model('sensors', sensorsSchema);