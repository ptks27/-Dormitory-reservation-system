const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = mongoose.Schema({
    room: {
        type: String,
        required: true
    },
    roomid: {
        type: String,
        required: true
    },
    userid: {
        type: Schema.Types.String,
        ref: "User", 
        required: true,
    },
    fromdate: {
        type: String,
        required: true
    },
    todate: {
        type: String,
        required: true
    },
    totalamount: {
        type: String,
        required: true
    },
    totaldays: {
        type: String,
        required: true
    },
    transactionId: {
        type: String,
        required: true
    },
    paymentid: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'booked'
    },
    bookingDate: {
        type: String,
        default: Date.now
    },
    paymentDate: {
        type: String,
        default: Date.now
    },
   
   
}, {
    timestamps: true,
});

const bookingmodel = mongoose.model('bookings', bookingSchema);
module.exports = bookingmodel;

