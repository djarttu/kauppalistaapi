const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

let users={users:[
    {
        id:"1",
        username:"1",
        email:"1",
        password:bcrypt.hashSync("1", 6),
        validApiKey:[]

    }
]};




module.exports={
    addUser:(username, email, password)=>{
        users.users.push({
            id:uuidv4(),
            username,
            email,
            password

        }
        
        );
        console.log(users);
    },

    getApiKey:(userId)=>{
        const user = users.users.find(u=>u.id==userId);
        if(user===undefined)
        {
            return false
        }

        return user.validApiKey;
    },
    getUserByName:(username)=> users.users.find(u=>u.username==username),


    resetApiKey:(userId)=>{
        console.log("resetApikey func");
        const user=users.users.find(u=>u.id==userId);
        if(user===undefined)
         {
             console.log("ei löytyny resetoitavvaa");
             return false;
         }
         console.log("creating new apikey");
         const a=uuidv4();
         if(user.validApiKey.length>1)
            {
                user.validApiKey.splice(0,1);
            }
         user.validApiKey.push(a);
         
         return a;
    },

    getUserWithApiKey:(apiKey)=>{
        console.log("geusas");
        let user;
        users.users.forEach(element => {for(let i=0;i<element.validApiKey.length; i++){
            console.log(element.validApiKey[i]+" loopphissa");
            if(element.validApiKey[i]==apiKey){
                console.log(element);
                user=element;
                break;
                
            }
        }
           
        }
        );
        return user;
    
    
    
    
    }
    

}