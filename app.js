const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const bcrypt = require("bcrypt");
const path = require("path");
const db = null;
const dbpath = path.join(__dirname, "userData.db");
const intializerServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
intializerServer();

app.post("/users/", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  
  const selectuserQuery = `SELECT *  FROM user WHERE username = '${username}'`;
  const dbUser = await db.get(selectuserQuery);
    if(dbUser === undefined){
        const lengthing = len(password);
        if (lengthing>5){
            const hashedpassword = await bcrypt.hash(request.body.password, 10);
            const creatingUser = `INSERT INTO user (username,name,password, gender, location)
            VALUES('${username}',
            '${name}',
            '${hashedpassword}',
            '${gender}',
            '${location}')`;
            const dbuserResponse = await db.run(creatingUser);
            response.status(200);
            response.send("User created successfully")
        }
        else{
            response.status(400);
            response.send("Password is too short");
        }

        
    else {
    reponse.status(400);
    response.send("User already exists");
      }
});

app.post("/login", async(request, response)=>{
    const{username, password}= request.body;
    const checkingUser = `SELECT * FROM user WHERE username = '${username}';`;
    const dbuser = await db.get(checkingUser);
    if(dbuser=== undefined){
        response.status(400);
        response.send("Invalid User");
    }
    else{
        const isPasswordMatch = await bcrypt.compare(password, dbuser.password);
        if(isPasswordMatch === true){
            response.status(200);
            response.send("Login success!");
        }
        else{
            response.status(400);
            response.send("Invalid password");
        }
    }
});

app.put("/change-password", async(request, response)=>{
    const{username,oldPassword, newPassword}= request.body;
    const confirmingUser = `SELECT * FROM user WHERE username = '${username}';`;
    const passconfirm = await db.get(confirmingUser);
    if(passconfirm ===undefined){
        response.status(400);
        response.send("Invalid user")
    }
    else{
        const confirmingPassword = await bcrypt.compare(password, request.body.oldPassword);
        if(confirmingPassword === true){
            const length = len(newPassword);
            if length<5 {
                response.status(400);
                response.send("Password is too short");
            };
            else{
                const hashingNewPass = await bcrypt.hash(newPassword,10);
                const updatingPassQuery = `
                UPDATE user
                SET 
                password = '${hashingNewPass}'
                WHERE username = '${username}';`;
                await db.run(updatingPassQuery);
                response.status(200);
                response.send("Password updated");
                
            };
        };
        else{
            response.status(400);
            response.send("Invalid current password");
        };
    };
    
});
module.exports = app;