const mongoose = require("mongoose");

var mongoURL = "mongodb+srv://pTKs:Gx0877523132@website.ug613gc.mongodb.net/"

mongoose.connect(mongoURL, {useUnifiedTopology : true,useNewUrlParser:true})

var connection = mongoose.connection

connection.on('error', ()=>{
    console.log('Mongo DB Connection failed')
})

connection.on('connected', ()=>{
    console.log('Mongo DB Connection Successful')
})

module.exports = mongoose