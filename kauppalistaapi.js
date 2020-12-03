const express = require('express')
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
//const { v4: uuidv4 } = require('uuid');
const app = express()
const port = 3000

const cookieParser =require('cookie-parser')
require ('dotenv').config()
app.use(bodyParser.json());
const users = require('./services/users')
app.use(cookieParser());
var ip = require('ip');
const ipAddress= ip.address();
const items = require('./services/items');
const passport=require('passport');
const { getItemById } = require('./services/items');
//const { getApiKey } = require('./services/users');
const BasicStrategy = require('passport-http').BasicStrategy;


passport.use(new BasicStrategy(
    function(username, password, done){
        const user=users.getUserByName(username);
        
        if (user==undefined){
            console.log("user not found");
            return done(null, false, {message: "Username not found"})
        }
        if(bcrypt.compareSync(password, user.password)==false){
            console.log("wrong pw");
            return done(null, false, {message:"pw not found"});
        }
        console.log("autentikaatio onnistui")
        return done(null, user,{message:"authentication ok"});
    }

    
));

app.get('/login', 
        passport.authenticate('basic', {session:false}),
        (req, res)=>{
            console.log(req.user.id)
            console.log("login func")
            let apiKey=users.resetApiKey(req.user.id);

            console.log(apiKey+" loginissa");

            
            res.json(apiKey);
        })

function checkForApiKey(req, res, next){
    console.log(req.get('X-Api-Key'));
    const receivedKey=req.get('X-Api-Key');
    if (receivedKey===undefined){
        return res.status(400).json({message:"ApiKey missing"});
    }
    const user =users.getUserWithApiKey(receivedKey);
    if(user===undefined){
        console.log("error", "wrong apikey");
        return res.status(400).json({message:"Wrong ApiKey"});
    }
    req.user=user;
    next();    

}

app.get('/items', (req, res)=>{
    let result = items.getAllItems();
    
    res.json(result);
})


app.post('/addItem', checkForApiKey,(req, res)=>{
    console.log(req.body);
    //if(ifEmpty(req.body!==false)){%T
        
        
    
    if('title' in req.body==false){
        res.status(400);
        return;
    }
    
    items.addItem(req.body, req.user.id);
    res.json({message:"apikey toimii"});
})



app.post('/registerUser',(req, res)=>{
   if('username' in req.body==false){
       res.status(400);
       return;
   }
   if('email' in req.body==false){
    res.status(400);
    return;
   }
   if('password' in req.body==false){
    res.status(400);
    return;
   }
   const hashedPassword = bcrypt.hashSync(req.body.password, 6);
   console.log(hashedPassword);
   users.addUser(req.body.username, req.body.email, hashedPassword);
   res.status(201).json({status:"user created"})
})

app.delete('/items/:id', checkForApiKey, async (req, res)=>{
    
    console.log(req.params);
    const item = items.getItemById(req.params.id);
    if(item==undefined)
    {
        res.status(400).json({status:"wrong itemID"});
        return;
    }
    if(item.ownerId!==req.user.id)
    {
        res.status(401).json({status:"wrong user"});
        return;
    }


    items.deleteItem(req.params.id);
    res.status(200).json({status:"item deleted"})
    
    
     
})

app.put('/modifyItems', checkForApiKey, (req, res)=>{
    
    const item = items.getItemById(req.body.id);
    if(item==undefined)
    {
        res.status(400).json({status:"wrong itemID"});
        return;
    }
    if(item.ownerId!==req.user.id)
    {
        res.status(400).json({status:"wrong user"});
        return;
    }
    items.modifyItem(req.body, req.user.id)
    res.status(200).json({status:"modification ok"});
})

app.get('/ownItems', checkForApiKey, (req, res) => {

    console.log(req.user.id, "asking own items with userID")
    res.json(items.getOwnItems(req.user.id));
})

app.get('/todos/:id', (req, res) => {
    //res.send('You requested id ' + req.params.id);
    const result = todos.find(t => t.id == req.params.id); // === specific vs == best effort
    if (result !== undefined) {
        res.json(result);
    }
    else {
        res.sendStatus(404);
    }
})



 


app.post('/sensors',(req, res)=>{
    
    
    if(ifEmpty(req.body)!==false)
    {
        
        console.log("pitäs lisätä listaan sensori")
        const newSensors=req.body;
        newSensors.id=uuidv4();
        newSensors.values=[];
        sensors.sensorList.push(newSensors);
        res.json({"id":newSensors.id});
        res.status(200);
        uuidv4();
    
    }
    else
        res.status(400);
      
})


function ifEmpty(Object){
    for(key in Object){
        console.log(Object[key]+" testi");
        if(Object[key]==""||Object[key]==null){
            console.log("tyhjä");
            return false;
            
        }
        else 
            console.log("täys")   
        
        }
      return true;  
}
    

app.put('/todos/:id', (req, res) => {
    const result = todos.find(t => t.id == req.params.id);
    if (result !== undefined) {
        for (const key in req.body){
            result[key] = req.body[key];
        }
        res.sendStatus(200);
    }
    else {
        res.sendStatus(404);
    }
})
app.get('/sensors/:id/values',(req, res)=>{
    console.log(req.params.id);
    const result=sensors.sensorList.find(t=>t.id==req.params.id)
    if(result!==undefined){
        var jsonObject={"values":result.values}
        res.send(jsonObject);
    }
})

app.delete('/todo/:id', async (req, res) => {
    
    const result = todos.findIndex(t => t.id == req.params.id);
    if(result !== -1){
        todos.splice(result, 1);
        res.sendStatus(200);
    }
    else {
        res.sendStatus(404);
    }
})

app.put('/sensors/:id/',(req, res)=>{
    console.log(req.params.id);
    const result=sensors.sensorList.find(t=>t.id==req.params.id)
    //console.log(result);
    if(result!==undefined)
        {
            console.log(result);
            console.log(req.body);
            result.values.push(req.body.value);
            res.json(sensors);
        }
    else
        {
            console.log("ei löyttny")
        }
    
        
})

app.listen(port, ipAddress, () => {
  console.log(`Example app listening at ${ipAddress}: ${port}`)
})