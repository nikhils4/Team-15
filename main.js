const express = require("express");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const MongoClient = require('mongodb').MongoClient;
const cors = require("cors");
const nodemon = require("nodemon");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const config = require("./key/config");

// database configuration
let url = "mongodb://localhost:27017/hello";

let app = express();

app.set("secret", config.secret);
app.set('view engine', "hbs");
app.use(cors());
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(cookieParser());



//functions used in the api

function getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// route to sign up page

app.get("/", (request, response) => {
    response.render("homepage.hbs");
});

// route to render login page

app.get("/login", (request, response) => {
    response.render("login.hbs");
});

// route to render signup page

app.get("/signup", (request, response) => {
    response.render("signup.hbs");
});


//route to collect the data given by the sign up form and validate that with the existing aadhar card details
    //if this gets validated then add the details in the database
    //if this doesn't gets validated ignore the details obtained from the sign up form and render an error message

app.post("/signup", (request, response) => {

    //value storage that is received from the frontend

    let name = request.body.name;
    let id = parseInt(request.body.aadhar);
    let guardianEmail = request.body.email;
    let username = request.body.username;
    let password = request.body.password;
    console.log(typeof id);
    // db connection and fetching

    MongoClient.connect(url, { useNewUrlParser: true } , function(error, database) {
        if (error){
            console.log("There was error connecting with the database!", error)
        }
        else{
            let db = database.db("hello");
            db.createCollection("userDetails", function(errordbCreation, res) {
                if (errordbCreation) {
                    console.log(errordbCreation);
                }
                else {
                    db.collection("aadharDetails").findOne({"aadhar" : id, "name" : name}, function (error, result) {
                        if (error) {
                            response.render("error.hbs", {
                                error : "There was error retrieving the details form the database"
                            });
                        }
                        else {
                            if (result == null){
                                response.render("error.hbs", {
                                    error : "The details given by you were not correct and didn't matched our database"
                                })
                            }
                            else{
                                let age = getAge(result.dob)
                                if (age >=60 && age <=80){
                                    //password hashing
                                    let hashpassword = bcrypt.hashSync(password, 12);
                                    db.collection("userDetails").insertOne({"name" : name,
                                        "aadhar" : id,
                                        "guardianEmail" : guardianEmail,
                                        "username" : username,
                                        "password" : hashpassword
                                    });
                                    response.render("signUpsuccessful.hbs", {
                                        success : "You are successfully registered"
                                    });
                                }
                                else {
                                    response.render("error.hbs", {
                                        error : "According to adhar details you are not in the optimum range to use this website"
                                    })
                                }

                            }
                        }
                    });
                }
            })
        }
    })

});

// route to login user and sign jwt to make persistent sessions

app.post("/login", (request, response) => {
    let username = request.body.usernameLogin;
    let password = request.body.passwordLogin;
    MongoClient.connect(url, {useNewUrlParser: true}, function (error, database) {
        if (error) {
            response.render("error.hbs", {
                error : error
            });
        } else {
            let db = database.db("hello");
            db.collection("userDetails").findOne({"username": username}, (error, result) => {
                if(error){
                    response.render("error.hbs", {
                        error : error
                    })
                }
                else {
                    let passwordDB = result.password;
                    if(bcrypt.compareSync(password, passwordDB)) {
                        username = result.username;
                        name = result.name;
                        const payload = {"username" : username};
                        let token = jwt.sign(payload, app.get('secret'));
                        response.cookie('sessionJWT', token, { httpOnly: true});

                        response.render("userpage.hbs", {
                            name :result.name,
                        })
                    } else {
                        response.render("error.hbs" ,{
                            error : "The password and username provided by you didn't match out database"
                        })
                    }
                }
            });
        }
    })
});


app.get("/logout", (request, response) => {
    response.clearCookie("sessionJWT");
    response.render("logout.hbs");
});

//jwt middleware to verify user credentials

app.use((request, response, next) => {
    var token = request.cookies.sessionJWT;
    if (token) {
        jwt.verify(token , app.get('secret'), function (error , decode){
            console.log(decode);
            if (error) {
                response.render("error.hbs", {
                    error : "The token authnetication failed try logging in again"
                })
            }
            else{
                request.decode = decode;
                next();
            }
        } )
    }
    else{
        response.render("error.hbs", {
            error : "You can't access this page this is a private page, try logging in first :)"
        })
    }
});

// to save meetup details of the user and to update the details if already present

app.post("/saveMeetup", (request, response) => {
    let username = request.decode.username;
    let location = request.body.location;
    let preference = request.body.pref;
    let timeDate = request.body.timeDate;
    let description = request.body.description;

    MongoClient.connect(url, {useNewUrlParser: true}, function (error, database) {
        if (error) {
            response.render("error.hbs", {
                error : error
            });
        } else {
            let db = database.db("hello");
            db.collection("meetupDetails").findOne({"username": username}, (error, result) => {
                if(error){
                    response.render("error.hbs", {
                        error : error
                    })
                }
                else {
                    if (result == null){ // includes the condition when the user have no meetup scheduled
                        db.collection("meetupDetails").insertOne({
                            "username" : username,
                            "timeDate" : timeDate,
                            "location" : location,
                            "preference" : preference,
                            "description" : description
                        });
                        response.render("meetupMatches.hbs", {
                            result : "Your meetup matches will appear here"
                        })
                    }
                    else {
                        let identifier = {"username" : username};
                        let update = { $set : {
                                "username" : username,
                                "timeDate" : timeDate,
                                "location" : location,
                                "preference" : preference,
                                "description" : description
                            }
                        }
                        db.collection("meetupDetails").updateOne(identifier, update, (error, result) => {
                            if (error){
                                response.render("error.hbs" ,{
                                    error : error
                                })
                            }
                            else {
                                response.render("userpage.hbs", {
                                    success : "Successfully updated the user details"
                                })
                            }
                        })
                    }
                }
            });
        }
    })
});


// route to get the saved meetup details

app.get("/getSavedDetails", (request, response) => {
    let username = request.decode.username;
    MongoClient.connect(url, {useNewUrlParser: true}, function (error, database) {
        if (error) {
            response.render("error.hbs", {
                error : error
            });
        } else {
            let db = database.db("hello");
            db.collection("meetupDetails").findOne({"username": username}, (error, result) => {
                if(error){
                    response.render("error.hbs", {
                        error : error
                    })
                }
                else {
                    response.json(JSON.stringify({
                        "username" : request.username,
                        "location" : request.location,
                        "timeDate" : request.timedate,
                        "preference" : request.pref,
                        "description" : request.description
                    }))
                }
            });
        }
    })
})

//get details of similar meetup

app.get("/getSimilarMeetup", (request, response) => {

})


app.listen(3000, () => {
    console.log("Server is up at port 3000");
});