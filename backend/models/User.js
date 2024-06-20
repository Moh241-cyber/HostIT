const mongoose = require('mongoose');
 
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    usedSpace: {
        type: Number,
        default: 0,
    },
    quota: {
        type: Number,
        default: 1000000000, // 1GB
    },
});
 
module.exports = mongoose.model('User', UserSchema);