const express = require("express")
const router  = express.Router()
const bcrypt = require("bcrypt");

//User Model
const User = require("../models/User");

const adminCredentials={email:"admin123@gmail.com",password:"123456"}

router.get('/',(req,res)=>{
  if(req.session.admin){
    res.redirect('/admin/dashboard')
  }else{
    res.render("admin/adminLogin")
  }
})

router.post('/',(req,res)=>{
  const {email,password} = req.body
  if(email===adminCredentials.email && password===adminCredentials.password){
    req.session.admin=true
    res.redirect('admin/dashboard')
  }else{
    req.flash("error_msg","Invalid Login Credentials")
    res.redirect('/admin')
  }
})

const isAuth = (req,res,next)=>{
  if(req.session.admin){
    next()
  }else{
    res.redirect('/admin')
  }
}


//dashboard

router.get('/dashboard',isAuth,(req,res)=>{
  User.find()
  .then((users)=>{
        res.render('admin/adminDashboard',{users})
    })
    .catch((err)=>{
        console.log(err);
    })
})

router.get('/addUser',isAuth,(req,res)=>{
    res.render("admin/addUser")
})

//register user from admin handler
router.post('/addUser',isAuth,(req,res)=>{
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
    res.render("admin/addUser", {
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
        res.render("admin/addUser", {
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
                req.flash('success_msg','Registration Successful')
                res.redirect("/admin/dashboard");
              })
              .catch((err) => {
                console.log(err.message);
              });
          });
        });
      }
    });
  }
})

// user deletion handler
router.get('/delete/:id', isAuth, async(req,res)=>{
  try{
    const id=req.params.id
    await User.findByIdAndRemove(id)
    req.flash('success_msg',"user deleted Successfully")
    res.redirect('/admin/dashboard')
  }catch(e){
    req.flash('error_msg',"unable to delete user")
    res.redirect('/admin/dashboard')
  }})


router.get('/edit/:id', isAuth, async(req,res)=>{
  try{
    const id=req.params.id
    const user = await User.findById(id)
    res.render('admin/editUser',{user,key:id})
  }catch(e){
    console.log(e);
  }
})

router.post('/edit/:id',isAuth, async(req,res)=>{
  try{
    const id = req.params.id
    const {name,email} = req.body
    await User.findOne({email:email}).then(async(user)=>{
      if(user){
        if(name!=user.name&&email==user.email){
          await User.findByIdAndUpdate(id,{name})
          req.flash('success_msg',"Updated Successfully")
          res.redirect('/admin/dashboard')
        }else{
          req.flash("error_msg","Email already registered")
          res.render('admin/editUser',{user})
        }
      }else{
        await User.findByIdAndUpdate(id,{name,email})
        req.flash('success_msg',"Updated Successfully")
        res.redirect('/admin/dashboard')
      }
    })
  }catch(e){
      req.flash('error_msg',"unable to edit user")
      res.redirect('/admin/dashboard')
    }
})

//search users
router.get('/search',isAuth,async (req,res)=>{
  const key=req.query.search
  const users = await User.find({$or: [
    { name: { $regex: new RegExp(`^${key}`, "i") } },
    { email: { $regex: new RegExp(`^${key}`, "i") } }
  ]})
  res.render('admin/adminDashboard',{users,key})
})


router.get('/logout',(req,res)=>{
    req.session.admin=false
    req.session.destroy()  
    res.redirect('/admin');
})


module.exports = router