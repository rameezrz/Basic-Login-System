const express = require("express");
const expressLayouts=require('express-ejs-layouts')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const session = require('express-session');
const path = require('path')
const nocache = require('nocache')

const app = express();



//Connect to Mongo
mongoose.connect('mongodb://0.0.0.0:27017/loginSystem',{useNewUrlParser:true,useUnifiedTopology: true})
.then(()=> console.log("MongoDB Connected"))
.catch(err=> console.log(err))


//EJS
app.use(expressLayouts)
app.set('view engine','ejs')

//BodyParser
app.use(express.urlencoded({ extended: false })); 

//no-cache middleware
app.use(nocache())

//Express Session
app.use(session({
    secret:'secret',
    resave:true,
    saveUninitialized:true
}))


//Connect flash
app.use(flash())

//Global Vars
app.use((req,res,next)=>{
    res.locals.success_msg=req.flash('success_msg')
    res.locals.error_msg=req.flash('error_msg')
    res.locals.error=req.flash('error')
    next()
})

//load local files to servers
app.use(express.static(path.join(__dirname,'public')))

//Routes
app.get('/',(req,res)=>{
    res.render('index')
})
app.use('/users',require('./routes/users'))
app.use('/admin',require('./routes/admin'))

const PORT = process.env.PORT || 3000


//End Routes

app.listen(PORT);
