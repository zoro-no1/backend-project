const express=require("express");
const path = require("path")
const userSchema=require("./model/user.js");
const post =require("./model/post.js");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const cookieParser = require("cookie-parser");


const app=express();

app.set("view engine","ejs")
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")))
app.use(cookieParser());
//get 
app.get("/",(req,res)=>{
   res.render("index")
});

app.get("/profile",isLogin,async (req,res)=>{

   let user=req.user;
   let p=await post.find().populate("userId");

  res.render("profile",{user,p})
 

});

    app.get("/delete/:post",isLogin, async (req,res)=>{
        let a= await post.findOneAndDelete({_id:req.params.post})
       console.log(a)
      await req.user.posts.splice( req.user.posts.indexOf(a._id),1)
     await req.user.save()
       res.redirect("/profile")
    })


    app.get("/like/:post",isLogin,async (req,res)=>{
   let p = await post.findOne({_id:req.params.post});
   if(p.like.indexOf(req.user._id)==-1){
   await p.like.push(req.user._id)
 await  p.save()
   }
   else{
    await p.like.splice(p.like.indexOf(req.user._id),1)
    await p.save()
   }
  
res.redirect("/profile")
    })



//login
app.get("/login",(req,res)=>{

    res.render("login");
})
//logout
 app.get("/logout",(req,res)=>{
    res.cookie("token","")
    res.redirect("/")
 })
//post 

app.post("/create",(req,res)=>{
let {username,email,password}= req.body;
    
bcrypt.genSalt(10,(err,salt)=>{
    bcrypt.hash(password,salt,async (err,hash)=>{
        let a=await userSchema.create({
            name:username,
            email,
            password:hash
        })
           
       let token= jwt.sign({email:a.email,_id:a._id},"token")
       res.cookie("token",token)
       res.redirect("/profile")
    })
})

});

 app.post("/login", async (req,res)=>{
       let a= await userSchema.findOne({email:req.body.email});
      if(!a)res.send("something is wrong")
        else{
        bcrypt.compare(req.body.password,a.password,(err,rus)=>{
     if(rus){
    let token =jwt.sign({email:a.email,_id:a._id},"token")
    res.cookie("token",token)
    res.redirect("/profile")}
    else res.send("something is wrong")
     
})
        }
    })

app.post("/post",isLogin,async (req,res)=>{
 let a=  await post.create({
        post:req.body.text,
        userId:req.user._id
    })
    req.user.posts.push(a._id)
   await req.user.save()
   res.redirect("/profile")
})





//function
async function isLogin(req,res,next) {
    if(!req.cookies.token)res.redirect("/login")
        else{
    let a= jwt.verify(req.cookies.token,"token")
    let data= await userSchema.findOne({_id:a._id}).populate("posts")
    req.user=data
}
next()
}

app.listen(3000)