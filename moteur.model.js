const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// the scheme of the item to be saved in database
const moteurSchema = new Schema({

   electrovane: {
        type: Boolean,
        default:false,
    },
    manuelle: {
        type: Boolean,
        default:false,

    },
    date: {
        type: Date,
        default: Date.now
    }
},{timestamps:true});

module.exports = sensors = mongoose.model('moteur', moteurSchema);