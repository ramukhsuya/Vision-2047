const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const bcrypt = require("bcrypt");
const _ = require("lodash");
require("dotenv").config();
const stripe=require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const router = express.Router();

var t = 0;
app.use(express.json());

mongoose.connect('mongodb+srv://Yashashwi:yashashwi@cluster0.qo8vdvd.mongodb.net/profileDB');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(express.static(path.join(__dirname, 'views')));
// Set view engine as EJS
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');
// Set 'views' directory for any views 
// being rendered res.render()
app.set('views', path.join(__dirname, 'Views'));
app.use('/form', express.static(__dirname + '/index.html'));

app.get("/", function(req, res) {
    res.render("home");
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("Public"));
app.set('trust proxy', 1);

app.use(session({
    secret: 'foo',
    resave: false, // Add this line to explicitly set resave to false
    saveUninitialized: true, // Add this line to explicitly set saveUninitialized to true
    store: MongoStore.create({ mongoUrl: 'mongodb+srv://Yashashwi:yashashwi@cluster0.qo8vdvd.mongodb.net/profileDB' }) // Use MongoDB as session store
}));

app.use(function(req, res, next) {
    if (!req.session) {
        return next(new Error('Oh no')) // Handle error
    }
    next(); // Otherwise continue
});

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Connected to MongoDB!");
});

module.exports = db;


const storeItems = new Map([
    [1,{price:1875,name:"Flight Offsets"}],
    [2,{price:10000,name:"Food and Drink Offsets"}],
    [3,{price:12500,name:"Home Energy Offsets"}],
    [4,{price:7500,name:"Vehicle Offsets"}],
    [5,{price:15000,name:"Total House Footprint"}],
    [6,{price:1875,name:"Individual"}],
    [7,{price:2500,name:"Couple"}],
    [8,{price:3750,name:"Small Family"}],
    [9,{price:6250,name:"Big Family"}],
    
])




const calculateDataSchema = new mongoose.Schema({
    id: String,
    footPrint: String,
    datae: Number,
    datac: Number,
    travel: Number,
    dataf: Number
});

const CalculateData = mongoose.model('CalculateData', calculateDataSchema);

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        lowercase: true,
        required: [true, "can't be blank"]
     },
    mobno: {
        type: Number,
        match: /^\d{10}$/, // This regex matches exactly 10 digits
        required: [true, 'Mobile number is required'],
        unique: true,
    },
    username: {
        type: String,
        lowercase: true,
        required: [true, "can't be blank"],
        match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
        index: true,
        unique: true
     },
     email: {
        type: String,
        lowercase: true,
        required: [true, "can't be blank"],
        match: [/\S+@\S+\.\S+/, 'is invalid'],
        index: true
     },
     password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
     },
     confirmPassword: String,
     calculateData: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CalculateData'
    }
});

const User = mongoose.model("User", userSchema);


app.get("/signup",function(req,res)
{
    res.render("signup");
});

app.get("/login",function(req,res)
{
    res.render("login");
});
app.post("/",function(req,res){
    res.render("home");
})




app.post("/signup", async function (req, res) {
    const { name, mobno, username, email, password, confirmPassword } = req.body;
  
    // Check if passwords match
    if (password !== confirmPassword) {
      return res.render("signup", { error: "Passwords do not match" });
    }
    
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user instance
      const newUser = new User({
        name,
        mobno,
        username,
        email,
        password: hashedPassword,
      });
  
      // Save the user to the database
      await newUser.save();
  
      res.redirect("/login"); // Redirect to login page after signup
    } catch (error) {
        console.error(error);
      res.status(500).json({ error: "Failed to create user" });
    }
});

var user;

app.post("/login", async function (req, res) {
    const { loginUsername, loginPassword } = req.body;

    try {
        // Find the user by username
        user = await User.findOne({ username: loginUsername });

        console.log(user);
        console.log(loginUsername);
        // Check if user exists
        if (!user) {
            console.log("User not found");
            return res.render("login", { error: "Invalid username or password" });
        }

        // Compare the provided password with the hashed password stored in the database
        const isPasswordMatch = await bcrypt.compare(loginPassword, user.password);

        if (isPasswordMatch) {
            // Passwords match, user authenticated successfully
            // Redirect the user to a dashboard or another page upon successful login
            t=1;
            console.log("User authenticated successfully");
            res.redirect("/");
        } else {
            // Passwords do not match
            console.log("Invalid password");
            return res.render("login", { error: "Invalid username or password" });
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.get("/about",function(req,res)
{
    res.render("about");
});

app.get("/research",function(req,res)
{
    res.render("research");
});

app.get("/sendEmail",function(req,res)
{
    res.render("sendEmail");
});

app.get("/industry-calculator",function(req,res)
{
    res.render("industry-calculator");
});
app.post("/industry-calculator",function(req,res){
    var companyName= req.body.companyname;
    var petrol=req.body.petrol;
    var coal=req.body.coal;
    var consumption=req.body.consumption;
    var cost=req.body.cost;
    console.log(req.body);
    var petrolprint=(petrol*2.3);
    var coalprint=(coal*2.4);
    var consumptionprint=(consumption*1.22);
    var sectorprint=0;
    if(req.body.flexRadioDefault==="agriculture")
    sectorprint=sectorprint+ 0.2*Math.pow(10,6);
    else if(req.body.flexRadioDefault==="ironandsteel")
    sectorprint=sectorprint+ Math.pow(10,6);
    else if(req.body.flexRadioDefault==="transportation")
    sectorprint=sectorprint+ 0.8*Math.pow(10,6);
    else if(req.body.flexRadioDefault==="informationtecnology")
    sectorprint=sectorprint+ 0.1*Math.pow(10,6);
    else if(req.body.flexRadioDefault==="textile")
    sectorprint=sectorprint+ 0.2*Math.pow(10,6);
    footprintb=(petrolprint+coalprint+consumptionprint+sectorprint);

    /*
    if(sector==='1' && employees>50000)
    {
      footprintI=12 *Math.pow(10,6);
    }
    else if(sector==='1'&& employees>=1000 && employees<=50000)
    {
        footprintI= 0.8 *Math.pow(10,6);
    }
    else if(sector==='1' && employees<1000)
    {
        footprintI=0.2 *Math.pow(10,6);
    }

    if(sector==='2' && employees>70000)
    {
      footprintI=2.5*Math.pow(10,6);
    }
    else if(sector==='2'&& employees>=1000 && employees<=70000)
    {
        footprintI=0.6*Math.pow(10,6);
    }
    else if(sector==='2' && employees<1000)
    {
        footprintI=0.040*Math.pow(10,6);;
    }

    if(sector==='3' && employees>100000)
    {
      footprintI=35*Math.pow(10,6);
    }
    else if(sector==='3'&& employees>=1000 && employees<=100000)
    {
        footprintI= 3*Math.pow(10,6);
    }
    else if(sector==='3' && employees<1000)
    {
        footprintI=0.25*Math.pow(10,6);
    }
    
    if(sector==='4' && employees>65000)
    {
      footprintI=4*Math.pow(10,6);
    }
    else if(sector==='4'&& employees>=1000 && employees<=65000)
    {
        footprintI= 5*Math.pow(10,6);
    }
    else if(sector==='4' && employees<1000)
    {
        footprintI=1*Math.pow(10,6);
    }
   
    if(sector==='5' && employees>90000)
    {
      footprintI=3.5*Math.pow(10,6);
    }
    else if(sector==='5'&& employees>=1000 && employees<=90000)
    {
        footprintI= 0.7*Math.pow(10,6);
    }
    else if(sector==='5' && employees<1000)
    {
        footprintI=0.1*Math.pow(10,6);
    }*/
    var areab= footprintb/2.75;
    areab= Math.round(areab);
    console.log(areab)

    res.render("result-industry",{footprintb:footprintb,areab:areab})

    

});


app.post("/create-checkout-session", async (req,res )=> {
    
    try{
        
            const session =await stripe.checkout.sessions.create({
               payment_method_types: ["card"],
               mode:"payment",
               line_items:req.body.items.map(item => {
                const storeItem =storeItems.get(item.id)
                return{
                    price_data:{
                    currency: 'inr',
                product_data:{
                    name: storeItem.name
                },
                unit_amount:storeItem.price
            },
            quantity:item.quantity,
            
                    
                 }
               }),
               success_url: "${process.env.SERVER_URL}/success.ejs",
               cancel_url:"${process.env.SERVER_URL}/cancel.ejs",
              
        })
        res.json({url:session.url})
    }
    catch (e)
    {
        res.status(500).json({error: e.message})
    }
    
});

app.get("/faq",function(req,res)
{
    const faqItems = [
        {
            question: "How does your service work?",
            answer: "We calculate your carbon footprint based on your lifestyle or business operations. Then, we offer personalized offset plans that involve tree planting through reputable organizations and facilitating renewable energy connections."
        },
        {
            question: "What are the different subscription plans?",
            answer: "We offer various subscription plans tailored to different carbon footprints and budgets. You can choose a plan that best suits your needs."
        },
        {
            question: "How do you calculate my carbon footprint?",
            answer: "We use a comprehensive methodology that considers factors like transportation, energy consumption, and waste generation. You can also use our online calculator for a quick estimate."
        },
        {
            question: "What types of trees do you plant?",
            answer: "We partner with reputable organizations like Green Yatra that plant native species suitable for the local environment and ensure long-term maintenance."
        },
        {
            question: "How can I be sure the trees survive?",
            answer: "We work with organizations with proven track records in tree planting and survival rates which have already planted crores of trees across the country."
        },
        {
            question: "What are the benefits of renewable energy connections?",
            answer: "By supporting renewable energy projects, you directly contribute to reducing reliance on fossil fuels and promoting a cleaner energy grid. The best part is that it costs less as well."
        },
        {
            question: "How much does it cost to offset my carbon footprint?",
            answer: "The cost depends on your carbon footprint and the chosen subscription plan. We offer transparent pricing and information on the impact of your contribution."
        },
        {
            question: "Are there any tax benefits for carbon offsetting?",
            answer: "Tax benefits for carbon offsetting may vary depending on your location. We recommend consulting a tax professional for specific advice."
        },
        {
            question: "How can I be sure your offsetting solutions are legitimate?",
            answer: "We prioritize partnerships with reputable organizations with proven certifications and transparent project details. You can access detailed information about our partners and the impact of your contribution through our platform."
        }
    ];

    res.render('faq', { faqItems: faqItems });
});

module.exports = router;

app.get("/calculator",function(req,res)
{
    res.render("calculator");
});
app.post("/calculator",async function(req,res){
    
    
    var people = req.body.people;
    var electricitybill=req.body.electricitybill;
    var electricityprice=req.body.electricityprice
    var cylinders= req.body.cylinders;
    var flights = req.body.flights;
    var flighthrs=req.body.flighthrs;
    var vehicledis= req.body.vehicledis;
    var mileage =req.body.mileage;
    var bus= req.body.bus;
    var busdis= req.body.busdis;
    var train = req.body.train;
    var traindis=req.body.traindis;
    var newspaper= req.body.newspaper;
    var aluminium = req.body.aluminium;
    var plastic= req.body.aluminium;
    var glass= req.body.glass;
    var textile=req.body.textile;
    var electronics=req.body.electronics
    console.log(req.body);
    
    var electricity= electricitybill/electricityprice;
    var electricprint=(electricity*1.22)/people;
    var cylinderprint = (cylinders*42)/people;
    var fuel= vehicledis/mileage;
    var fuelprint= (fuel*2.3)/people;
    var flighttotal= (flights*flighthrs);
    var flightprint=(flighttotal*90)/people;
    var bustotal=(bus*busdis);
    var busprint = (bustotal*0.04)/people;
    var traintotal=(train*traindis)/people;
    var trainprint = (traintotal*0.049)/people;
    var foodprint=0;
    if(req.body.flexRadioDefault==="meatlover")
    foodprint=foodprint+108;
    else if(req.body.flexRadioDefault==="omnivore")
    foodprint=foodprint+83;
    else if(req.body.flexRadioDefault==="Vegetarian")
    foodprint=foodprint+55;
    else if(req.body.flexRadioDefault==="Vegan")
    foodprint=foodprint+46;
    var garbageprint=0;
    if(req.body.flexRadioDefault==="daily")
    garbageprint=garbageprint+132;
    else if(req.body.flexRadioDefault==="twiceinaweek")
    garbageprint=garbageprint+80;
    else if(req.body.flexRadioDefault==="weekly")
    garbageprint=garbageprint+30;
    else if(req.body.flexRadioDefault==="Fortnightly")
    garbageprint=garbageprint+18;
    var footprint = (electricprint+cylinderprint+fuelprint+flightprint+foodprint+busprint+trainprint+garbageprint);
    console.log(footprint);
    percentages=[((electricprint/footprint))*100,((cylinderprint/footprint)*100),(((fuelprint+flightprint+trainprint+busprint)/footprint))*100,((foodprint/footprint)*100),((garbageprint/footprint)*100)];
    
    if(newspaper=== undefined)
    footprint=footprint+43/people;
    if(aluminium=== undefined)
    footprint=footprint+84/people;
    if(plastic===undefined)
    footprint=footprint+125/people;
    if(glass===undefined)
    footprint=footprint+93/people;
    if(textile===undefined)
    footprint=footprint+57/people;
    if(electronics===undefined)
    footprint=footprint+154/people;
    let area=footprint/2256;
    area=area*2.471;
    area=Math.round(area);
    var indiaResult ;
    var indiaResultSub;

    
   footprint=Math.round(footprint)
    if(footprint>580)
    {
        indiaResult="OH NO!! You are beyond the Cusp"
        indiaResultSub="Your Emission levels exceed India's average by"+" "+Math.floor((footprint)/5.80)+"%"+" "+"Oops You exceeded the indian levels"
    }
    else if(footprint<=580)
    {
        indiaResult="Great! Keep it UP"
        indiaResultSub="Your Emission levels are below India's average by"+" "+Math.floor((580-footprint)/5.80)+"%"+" " +"Keep up the good work"
    }
    if (t) {
        try {
            // Find the corresponding CalculateData document for the user
            let calculateData = await CalculateData.findOne({ user: user._id });
    
            // If CalculateData document doesn't exist, create a new one
            if (!calculateData) {
                calculateData = new CalculateData({
                    user: user._id,
                    footPrint: footprint,
                    datae: (electricprint / footprint) * 100,
                    datac: (cylinderprint / footprint) * 100,
                    travel: ((fuelprint + flightprint + trainprint + busprint) / footprint) * 100,
                    dataf: (foodprint / footprint) * 100
                });
    
                // Save the new CalculateData document
                await calculateData.save();
            }
    
            // Update user with calculateData reference
            user.calculateData = calculateData._id;
    
            // Save user
            await user.save();
        } catch (error) {
            // Handle error appropriately
            console.error('Error updating calculateData:', error);
            // Return or throw the error, or handle it in another way
        }
    }
    
    
    

    res.render("result",{footprint:footprint,percentages:percentages,indiaResult:indiaResult,indiaResultSub:indiaResultSub,area:area})
});
app.get("/vision",function(req,res)
{
    res.render("vision");
});

app.get("/offset",function(req,res)
{
    res.render("offset");
});

app.get("/team",function(req,res)
{
    res.render("team");
});



app.post("")

app.listen(3000,function()
{
    console.log("Server Started on port on 3000");
});