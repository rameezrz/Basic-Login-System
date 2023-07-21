const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");


//User Model
const User = require("../models/User");

//Login Page
router.get("/login", (req, res) => {
  if(req.session.isAuth){
    email=req.session.email
    res.redirect('/users/dashboard')
  }else{
    res.render("login");
  }
});

//Register Page
router.get("/register", (req, res) => {
  res.render("register");
});

//Register handle
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  //check required field
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }

  //check passwords match
  if (password !== password2) {
    errors.push({ msg: "Password not matching" });
  }

  //check password length
  if (password.length < 6) {
    errors.push({ msg: "Mininum 6 characters required" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    //validation passed
    User.findOne({ email: email }).then((user) => {
      if (user) {
        //user exists
        errors.push({ msg: "Email is already registered" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });
        //hash password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            //set password
            newUser.password = hash;
            //save user
            newUser
              .save()
              .then((user) => {
                req.flash('success_msg','You are now registered')
                res.redirect("/users/login");
              })
              .catch((err) => {
                console.log(err.message);
              });
          });
        });
      }
    });
  }
});


//Login Handle
router.post('/login', async(req,res)=>{
  const {email,password} = req.body
  await User.findOne({email:email}).then(async(user)=>{
    if(!user){
      req.flash("error_msg","Email not registered")
      res.redirect('/users/login')
    }
    await bcrypt.compare(password,user.password,(err,isMatch)=>{
      if(err) throw err
      if(isMatch){
        req.session.isAuth=true
        req.session.email=user.email
        req.flash('success_msg',"Login Successfully")
        res.redirect('/users/dashboard')
      }else{
        req.flash('errror_msg',"Password Incorrect")
        res.redirect('/users/login')
      }
    })
  }).catch(err=>console.log(err));
})

const isAuth = (req,res,next)=>{
  if(req.session.isAuth){
    next()
  }else{
    res.redirect('/users/login')
  }
}

//dashboard
router.get('/dashboard',isAuth,(req,res)=>{
  res.render('dashboard',{email:req.session.email})
})


//Logout Handle
router.get('/logout', (req, res)=>{
  req.session.isAuth=false
  req.flash("success_msg","Logout Successfully")
  req.session.destroy()
  res.redirect('/')
});

module.exports = router;
