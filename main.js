const express = require("express");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const MongoClient = require('mongodb').MongoClient;
const cors = require("cors");
const nodemon = require("nodemon");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
var nodemailer = require('nodemailer');
const config = require("./key/config");


function email(destEmail, time, place, priUser, secUser){
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'eciproje425@gmail.com',
            pass: config.password
        }
    });

    let mailOptions = {
        from: 'eciproje425@gmail.com',
        to: destEmail,
        subject: 'Details about your Parent meetup',
        text: "This is to inform you that your parent " + priUser + " has setup a meetup with " + secUser +
            ". They would be meeting up at " + place + " on " + time + "."
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent successfully");
        }
    });
}

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
    let username = request.decode.username;
    MongoClient.connect(url, {useNewUrlParser: true}, function (error, database) {
        if (error) {
            response.render("error.hbs", {
                error : error
            });
        } else {
            let db = database.db("hello");
            db.collection("meetupDetails").findOne({"username" : username}, (error, result) => {
                if (error) {
                    console.log("there was some error !")
                    response.render("error.hbs", {
                        error : error
                    })
                }
                else {
                    let matches = db.collection("meetupDetails").find({
                        "location" : result.location,
                        "timeDate" : result.timeDate
                    }, {
                        "username":1,
                        "timeDate" : 1,
                        "location" : 1,
                        "preference" : 1,
                        "description" : 1
                    }).toArray();
                    matches.then((res) => {
                        console.log(res);
                        response.json(JSON.stringify(res)); // giving in response the list of objects of all the similar meetup details
                    })
                }
            })
        }
    })
})

//route to send request to various user

app.post("/requestMeetup", (resuest, response) => {
    let username = request.decode.username;
    let destUsername = request.body.username;
    MongoClient.connect(url, {useNewUrlParser: true}, function (error, database) {
        if (error) {
            response.render("error.hbs", {
                error : error
            });
        } else {
            let db = database.db("hello");
            db.collection("meetupDetails").findOne({"username" : destUsername}, (error, result) => {
                if (error) {
                    console.log("there was some error !")
                    response.render("error.hbs", {
                        error : error
                    })
                }
                else {
                    db.collection("meetupDetails").updateOne({ "username": destUsername},
                        {$push: {'requests': username}
                        });
                }
            })
        }
    })
})

app.get("/pendingRequests", (request, response) => {
    let username = request.decode.username;
    MongoClient.connect(url, {useNewUrlParser: true}, function (error, database) {
        if (error) {
            response.render("error.hbs", {
                error : error
            });
        } else {
            let db = database.db("hello");
            db.collection("meetupDetails").findOne({"username" : username}, (error, result) => {
                if (error) {
                    console.log("there was some error !")
                    response.render("error.hbs", {
                        error : error
                    })
                }
                else {
                    db.collection("meetupDetails").findOne({"username" : username}, (err, result) => {
                        if(err) {
                            response.render("error.hbs", {
                                error : error
                            })
                        }
                        else {
                            let reqs = result.requests;
                            let lengthReqs = reqs.length;
                            let send = new Array();
                            for (let i = 0; i < lengthReqs; i++){
                                db.collection("meetupDetails").findOne({"username" : reqs[i]}, (err, res) => {
                                    if(err){
                                        response.render("error.hbs", {
                                            error : error
                                        })
                                    }
                                    else {
                                        let resObject = {
                                            "username" : res.username,
                                            "timeDate" : res.timeDate,
                                            "location" : res.location,
                                            "preference" : res.preference,
                                            "description" : res.description
                                        }
                                        send.push(resObject);
                                    }
                                })
                            }
                            console.log(send);
                            response.json(JSON.stringify(send));
                        }
                    });
                }
            })
        }
    })
} )

// route to accept the request of a particular user includes mailing and all as well

app.post("/acceptRequest", (request, response) => {
    let username = request.decode.username;
    let destUsername = request.body.username;
    MongoClient.connect(url, {useNewUrlParser: true}, function (error, database) {
        if (error) {
            response.render("error.hbs", {
                error : error
            });
        } else {
            let db = database.db("hello");
            db.collection("meetupDetails").findOne({"username" : username}, (error, result) => {
                if (error) {
                    console.log("there was some error !")
                    response.render("error.hbs", {
                        error : error
                    })
                }
                else {
                    db.collection("meetupDetails").updateOne({ "username": username},
                        { $set : {"status" : 1, "meetingWith" : destUsername}},
                        (err, res) => {
                            if (err){
                                response.render("error.hbs", {
                                    error : err
                                })
                            }
                            else {
                                let time = res.timeDate;
                                let place = res.location;
                                db.collection("userDetails").findOne({"username" : username},
                                    (error2, result2) => {
                                    if (error2){
                                        response.render("error.hbs", {
                                            error : error2
                                        })
                                    }
                                    else {
                                        let destEmail = result2.guardianEmail;
                                        var priUser = result2.name;
                                        priUser = priUser.toLowerCase()
                                            .split(' ')
                                            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                                            .join(' ');
                                        db.collection("userDetails").findOne({"username" : destUsername},
                                            (error4, result4) => {
                                                if (error4){
                                                    response.render("error.hbs", {
                                                        error : error4
                                                    })
                                                }
                                                else {
                                                    var secUser = result4.name;
                                                    secUser = secUser.toLowerCase()
                                                        .split(' ')
                                                        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                                                        .join(' ');
                                                    email(destEmail, time, place, priUser, secUser);
                                                    response.render("successMeetupScheduled.hbs", {
                                                        message : "Your meetup has been scheduled with " + secUser + " at " + place + " on " + time + "."
                                                    })
                                                }
                                            })
                                    }
                                    })
                            }
                    });
                }
            })

            // similarily for secondary user

            db.collection("meetupDetails").findOne({"username" : destUsername}, (error, result) => {
                if (error) {
                    console.log("there was some error !")
                    response.render("error.hbs", {
                        error : error
                    })
                }
                else {
                    db.collection("meetupDetails").updateOne({ "username": destUsername},
                        { $set : {"status" : 1, "meetingWith" : username}},
                        (err, res) => {
                            if (err){
                                response.render("error.hbs", {
                                    error : err
                                })
                            }
                            else {
                                let time = res.timeDate;
                                let place = res.location;
                                db.collection("userDetails").findOne({"username" : destUsername},
                                    (error2, result2) => {
                                        if (error2){
                                            response.render("error.hbs", {
                                                error : error2
                                            })
                                        }
                                        else {
                                            let destEmail = result2.guardianEmail;
                                            var priUser = result2.name;
                                            priUser = priUser.toLowerCase()
                                                .split(' ')
                                                .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                                                .join(' ');
                                            db.collection("userDetails").findOne({"username" : destUsername},
                                                (error4, result4) => {
                                                    if (error4){
                                                        response.render("error.hbs", {
                                                            error : error4
                                                        })
                                                    }
                                                    else {
                                                        var secUser = result4.name;
                                                        secUser = secUser.toLowerCase()
                                                            .split(' ')
                                                            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                                                            .join(' ');
                                                        email(destEmail, time, place, priUser, secUser);
                                                        response.render("successMeetupScheduled.hbs", {
                                                            message : "Your meetup has been scheduled with " + secUser + " at " + place + " on " + time + "."
                                                        })
                                                    }
                                                })
                                        }
                                    })
                            }
                        });
                }
            })
        }
    })
})


// to reject meetup request

app.post("/rejectRequest", (request, response) => {
    let username = request.decode.username;
    let destUsername = request.body.username;
    db.collection("meetupDetails").updateOne({ "username": username},
        {$pull: {'requests': destUsername}
        });
})

app.listen(3000, () => {
    console.log("Server is up at port 3000");
});