const express = require("express"); //done
const hbs = require("hbs"); //done
const bodyParser = require("body-parser"); //done
const MongoClient = require('mongodb').MongoClient; //done
const cors = require("cors"); //done
const nodemon = require("nodemon"); //done
const jwt = require("jsonwebtoken"); //done
var config = require("./config"); //done
const cookieParser = require("cookie-parser"); //done

// database configuration
let url = "mongodb://localhost:27017/hello";
let app = express();

app.set("secret", config.secret);
app.set('view engine', "hbs");
app.use(cors());
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(cookieParser());

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
    let id = request.body.aadhar;
    let guardianEmail = request.body.email;
    let username = request.body.username;
    let password = request.body.password;

    // db connection and fetching

    MongoClient.connect(url, { useNewUrlParser: true } , function(error, database) {
        if (error){
            console.log("There was error connecting with the database!", error)
        }
        else{
            var db = database.db("hello");
            db.createCollection("userDetails", function(errordbCreation, res) {
                if (errordbCreation) {
                    console.log(errordbCreation);
                }
                else {
                    db.collection("details").findOne({"aadhar" : id}, function (error, result) {
                        if (error) {

                        }
                    });


                    MongoClient.connect(url, function(err, db) {
                        if (err) throw err;
                        var dbo = db.db("mydb");
                        dbo.collection("customers").findOne({}, function(err, result) {
                            if (err) throw err;
                            console.log(result.name);
                            db.close();
                        });
                    });


                    valid.then(function(result) {
                        console.log(result);
                        if (result == null) {
                            response.render("error.hbs", {
                                error : "The aadhar details provided by you is not valid !!"
                            });
                        }
                        else {
                            let data = {"name": name, "aadhar" : id, "guardianEmail": guardianEmail,  "username" : username,"password": password};
                            db.collection("regDetails").insertOne(data, function (errorInsertion, res) {
                                if (errorInsertion) {
                                    console.log(errorInsertion);
                                } else {
                                    response.render("signUpsuccessful.hbs");
                                }
                            })
                        }
                    });



                    // console.log(db.collection("citizens").findOne({"aadhar" : aadhar, "name" : name}).then (function(result) {
                    //     console.log(result);
                    // }));
                    // if (db.collection("citizens").findOne({"aadhar" : aadhar, "name" : name})){
                    //     console.log(aadhar);
                    //     console.log(name);
                    //
                    // }
                    // else {
                    //
                    // }

                }
            })
        }
    })

});