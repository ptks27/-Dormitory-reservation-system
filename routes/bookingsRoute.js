const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Room = require("../models/room")
const moment = require("moment");
const { v4: uuidv4 } = require('uuid');
const stripe = require("stripe")('sk_test_51OljfAEotz52E4GrZ54yP6tyslfBdAt6auJjNjBLcpvahjWIDtrBeok3dIZo9dI66vA0n9rnLksVJSIImEul3sEm00WNccu4Py')

router.post("/bookroom", async (req, res) => {
    const {
        room,
        userid,
        fromdate,
        todate,
        totalamount,
        totaldays,
        token
    } = req.body;

    try {
        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id,
        });

        const payment = await stripe.charges.create(
            {
                amount: totalamount * 100,
                customer: customer.id,
                currency: 'THB',
                receipt_email: token.email
            },
            {
                idempotencyKey: uuidv4()
            }
        );

        if (payment) {
            const paymentNumber = uuidv4();
            const newbooking = new Booking({
                room: room.name,
                roomid: room._id,
                userid: userid,
                fromdate: moment(fromdate).format('YYYY-MM-DD'),
                todate: moment(todate).format('YYYY-MM-DD'),
                totalamount,
                totaldays,
                transactionId: 'ชำระด้วยบัตรเครตดิต',
                paymentid: paymentNumber,
                bookingDate: moment().format('YYYY-MM-DD'),
                paymentDate: moment().format('YYYY-MM-DD') // Add the booking date
            });

            const booking = await newbooking.save();

            const roomtemp = await Room.findOne({ _id: room._id });

            roomtemp.currentbookings.push({
                bookingid: booking._id,
                fromdate: moment(fromdate).format('YYYY-MM-DD'),
                todate: moment(todate).format('YYYY-MM-DD'),
                userid:userid,
                status: booking.status,
                bookingDate: moment().format('YYYY-MM-DD'),
                paymentDate: moment().format('YYYY-MM-DD') // Add the booking date
            });

            await roomtemp.save();
        }

        res.send('ชำระสำเร็จ , ห้องของคุณ');

    } catch (error) {
        return res.status(400).json({ error });
    }
});

router.post("/cashpayment", async (req, res) => {
    const {
        room,
        userid,
        fromdate,
        todate,
        totalamount,
        totaldays,
    } = req.body;

    try {
        const paymentNumber = uuidv4();
        const newbooking = new Booking({
            room: room.name,
            roomid: room._id,
            userid:userid,
            fromdate: moment(fromdate).format('YYYY-MM-DD'),
            todate: moment(todate).format('YYYY-MM-DD'),
            totalamount,
            totaldays,
            transactionId: 'ชำระด้วยเงินสด', // Use a unique identifier for cash payments
            paymentid: paymentNumber,
            bookingDate: moment().format('YYYY-MM-DD'), // Add the booking date
            paymentDate: moment().format('YYYY-MM-DD')
        });

        const booking = await newbooking.save();

        const roomtemp = await Room.findOne({ _id: room._id });

        roomtemp.currentbookings.push({
            bookingid: booking._id,
            fromdate: moment(fromdate).format('YYYY-MM-DD'),
            todate: moment(todate).format('YYYY-MM-DD'),
            userid:userid,
            status: booking.status,
            bookingDate: moment().format('YYYY-MM-DD'),
            paymentDate: moment().format('YYYY-MM-DD') // Add the booking date
        });

        await roomtemp.save();

        res.send('ชำระสำเร็จ , ห้องของคุณ');

    } catch (error) {
        return res.status(400).json({ error });
    }
});

router.post("/getbookingsbyuserid", async (req, res) => {
    const userid = req.body.userid;

    try {
        const bookings = await Booking.find({ userid: userid });
        res.send(bookings);
    } catch (error) {
        return res.status(400).json({ error });
    }
});


router.post("/cancelbooking" , async (req , res) =>{
    const {bookingid , roomid} = req.body

    try {

        const bookingitem = await Booking.findOne({_id : bookingid})
        bookingitem .status = 'cancelled'
        await bookingitem .save()

        const room = await Room.findOne({_id : roomid})
        const bookings = room.currentbookings
        const temp = bookings.filter(booking => booking.bookingid.toString()!=bookingid)
        room.currentbookings = temp
        
        await room.save()

        res.send('ยกเลิกการจองสำเร็จ')

    } catch (error) {
        return res.status(400).json({error});

    }
});

router.get("/getallbookings", async(req, res) =>{
    try {
        const bookings = await Booking.find()
        res.send(bookings)

    } catch (error) {
        return res.status(400).json({error});

    }

});

module.exports = router;
