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

// route to process login information

// app.post("/login", (request, response) => {
//     var username = request.body.usernameLogin;
//     var password = request.body.passwordLogin;
//     MongoClient.connect(url, {useNewUrlParser: true}, function (error, database) {
//         if (error) {
//             console.log(error);
//         } else {
//             var db = database.db("codeFreaks");
//             var data = db.collection("userDetails").findOne({"username": username, "password": password});
//             data.then(function(result) {
//                 if (result != null){
//                     username = result["username"];
//                     name = result["name"];
//                     const payload = {"username" : username};
//                     var token = jwt.sign(payload, app.get('secret'));
//                     response.cookie('sessionJWT', token, { httpOnly: true});  // signed : true (for even encrypting the cookie using the cookieparser secret )
//                     response.render("userPage.hbs", {
//                         name : name
//                     })
//                 }
//                 else {
//                     response.render("login.hbs", {
//                         error : "The username and password entered by you are not valid. Try signing upfirst :)"
//                     })
//                 }
//             } )
//         }
//     })
// });
//
// // route to process sign up page

app.post("/signup", (request, response) =>{
    let name = request.body.name;
    let id = request.body.aadhar;
    let guardianEmail = request.body.email;
    let username = request.body.username;
    let password = request.body.password;
    MongoClient.connect(url, { useNewUrlParser: true } , function(error, database) {
        if (error){
            console.log("There was error connecting with the database!", error)
        }
        else{
            var db = database.db("codeFreaks");
            db.createCollection("userDetails", function(errordbCreation, res) {
                if (errordbCreation) {
                    console.log(errordbCreation);
                }

                else {
                    var valid = db.collection("citizens").findOne({"name" : name, "aadhar" : id}, function (error, result) {});


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
//
// // route to render logout page
//
// app.get("/logout", (request, response) => {
//     response.clearCookie("sessionJWT");
//     response.render("logout.hbs");
// });
//
// // middleware to verify the json web token
//
// app.use((request, response, next) => {
//     var token = request.cookies.sessionJWT;
//     if (token) {
//         jwt.verify(token , app.get('secret'), function (error , decode){
//             console.log(decode);
//             if (error) {
//                 response.render("error.hbs", {
//                     error : "The token authnetication failed try logging in again"
//                 })
//             }
//             else{
//                 console.log("Hi");
//                 request.decode = decode;
//                 next();
//             }
//         } )
//     }
//     else{
//         response.render("error.hbs", {
//             error : "Login first! This is the member only page"
//         })
//     }
// });
//
// // route to upload avatar
//
// app.post("/uploadAvatar", upload.single('avatar'), (request, response) => {
//     // var username = request.decode.username;
//     // request.file.filename = username + ".png";
//     response.render("signupDone.hbs");
// });
//
// // route to save feed
//
// app.post("/saveNotes", (request, response) => {
//     console.log("inside saved notes");
//     var username = request.decode.username;
//     console.log(username);
//     MongoClient.connect(url, { useNewUrlParser: true } , function(error, database) {
//         if (error) {
//             console.log(error);
//         }
//         else {
//             var db = database.db("Facebook");
//             var feed = request.body["notes"];
//             var data = db.collection("userDetails").findOne({"username" : username});
//             var addToPersonal = new Promise((resolve, reject) => {
//                 if(db.collection("userDetails").updateOne({ "username": username}, {$push: {'notes': feed}})){
//                     resolve("Notes saved to personal successfully")
//                 }
//             });
//             var addToFriend = new Promise((resolve, reject) => {
//                 data.then(function(result) {
//                     var friends = result.friends;
//                     var content = {
//                         'feed' : feed,
//                         'posted by' : username
//                     };
//                     var friendsLength = friends.length;
//                     for (var i = 0 ; i < friendsLength ; i++){
//                         db.collection("userDetails").updateOne({"username": friends[i]}, {$push : { 'content' : content}});
//                     }
//                     resolve('Added to friends feed successfully')
//                 });
//
//             });
//
//             addToPersonal.then((message) => {
//                 console.log(message);
//                 return addToFriend;
//             }).then((message) => {
//                 console.log(message);
//                 console.log("Feed added to personal as well as friends feed");
//                 response.send("Feed posted successfully");
//             });
//         }
//     })
// });
//
// // route to get the list of people
//
// app.get("/getPeople", (request, response) => {
//     MongoClient.connect(url, { useNewUrlParser: true } , function(error, database) {
//         if (error) {
//             console.log(error);
//         }
//
//         else {
//             var db = database.db("Facebook");
//             var people = db.collection("userDetails").find({}, {"username":1, _id:0}).toArray();
//             var peopleList = [];
//             people.then(function(result){
//                 console.log(result);
//                 for (var i = 0; i < result.length ; i++){
//                     peopleList.push(result[i].username);
//                 }
//                 response.json(JSON.stringify({"peopleList" : peopleList}));
//             })
//             // people.then(function (result) {
//             //     console.log(tyresult);
//             // })
//         }
//     })
// });
//
// // route to update user status
//
// app.post("/updateStatus", (request, response) => {
//     var username = request.decode.username;
//     var status = request.body.status;
//     MongoClient.connect(url, { useNewUrlParser: true } , function(error, database) {
//         if (error) {
//             console.log(error);
//         }
//         else {
//             var db = database.db("Facebook");
//             db.collection("userDetails").updateOne({"username" : username}, {$set : {"status" : status}});
//             response.send("Status have been successfully updated.")
//         }
//     })
// });
//
// // route to update the place user is living in
//
// app.post("/updatePlace", (request, response) => {
//     var username = request.decode.username;
//     var place = request.body.place;
//     MongoClient.connect(url, { useNewUrlParser: true } , function(error, database) {
//         if (error) {
//             console.log(error);
//         }
//         else {
//             var db = database.db("Facebook");
//             db.collection("userDetails").updateOne({"username" : username}, {$set : {"place" : place}});
//             response.send("Place of living have been successfully updated.");
//         }
//     })
// });
//
// // route to get the profile page of other user
//
// // points to fix :: friend request button should not be displayed if the requested profile is already in the
// //
//
// app.get("/getProfile", (request, response) => {
//     var username = request.decode.username;
//     var usernameProfile = request.query.profile;
//     MongoClient.connect(url, { useNewUrlParser: true } , function(error, database) {
//         if (error) {
//             console.log(error);
//         }
//         else {
//             var db = database.db("Facebook");
//             // to check if the public profile requested by the user if a friend of the main user or not
//             console.log(username + "main user");
//             console.log(usernameProfile);
//             var mainUser = db.collection("userDetails").findOne({"username" : username});
//             console.log(mainUser);
//             mainUser.then(function (result) {
//                 var friendList = result.friends;
//                 console.log(friendList);
//                 console.log(friendList.includes(usernameProfile));
//                 if ( friendList.includes(usernameProfile) ){
//                     var data = db.collection("userDetails").findOne({"username" : usernameProfile});
//                     data.then(function (result) {
//                         var status = result.status;
//                         var name = result.name;
//                         var email = result.email;
//                         var place = result.place;
//                         response.render("friendPage.hbs", {
//                             status : status,
//                             name : name,
//                             email : email,
//                             username : usernameProfile,
//                             place : place
//                         })
//                     })
//                 }
//                 else {
//                     var data = db.collection("userDetails").findOne({"username" : usernameProfile});
//                     data.then(function (result) {
//                         var status = result.status;
//                         var name = result.name;
//                         var email = result.email;
//                         var place = result.place;
//                         response.render("userPageExternal.hbs", {
//                             status : status,
//                             name : name,
//                             email : email,
//                             username : usernameProfile,
//                             place : place
//                         })
//                     })
//                 }
//             })
//         }
//     })
// });
//
// // route to get the list of friend request for particular user
//
// app.get("/getListFriendRequest", (request, response) => {
//     var username = request.decode.username;
//     MongoClient.connect(url, { useNewUrlParser: true } , function(error, database) {
//         if (error) {
//             console.log(error);
//         }
//         else {
//             var db = database.db("Facebook");
//             var data = db.collection("userDetails").findOne({"username": username});
//             data.then(function (result){
//                 var listFriendRequest = result.friendRequest;
//                 response.json(JSON.stringify({"listFriendRequest" : listFriendRequest}));
//             })
//         }
//     })
// });
//
// // route to send friend request
//
// app.post("/addFriend", (request, response) => {
//     var username = request.decode.username;
//     var destEmail = request.body.email;
//     console.log(destEmail);
//     MongoClient.connect(url, { useNewUrlParser: true } , function(error, database) {
//         if (error) {
//             console.log(error);
//         }
//         else {
//             var db = database.db("Facebook");
//             var data = db.collection("userDetails").findOne({"email" : destEmail});
//             data.then(function (result) {
//                 var destUsername = result.username;
//                 var listFriendRequest = result.friendRequest;
//                 console.log(listFriendRequest);
//                 if (listFriendRequest.length === 0){
//                     db.collection("userDetails").updateOne({ "username": destUsername}, {$push: {'friendRequest': username}});
//                     response.send("Friend request sent successfully.")
//                 }
//                 else {
//                     for (var i = 0; i < listFriendRequest.length ; i++){
//                         if (listFriendRequest[i] === username){
//                             response.send("Friend request already sent.")
//                         }
//                         else{
//                             db.collection("userDetails").updateOne({ "username": destUsername}, {$push: {'friendRequest': username}});
//                             response.send("Friend request sent successfully.")
//                         }
//                     }
//                 }
//             })
//         }
//     })
// });
//
// // route to accept friend request
//
// app.post("/acceptFriend", (request, response) => {
//     var username = request.decode.username;
//     var destUsername = request.body.username;
//     console.log(username, destUsername);
//     MongoClient.connect(url, { useNewUrlParser: true } , function(error, database) {
//         if (error) {
//             console.log(error);
//         }
//         else {
//             var db = database.db("Facebook");
//             //user promise in future to make only one friend added at a time
//             var addingFriend = new Promise((resolve, reject) => {
//                 if(db.collection("userDetails").updateOne({ "username": username}, {$push: {'friends': destUsername}})){
//                     resolve("Friend Added Successfully")
//                 }
//             });
//             var removingFriend = new Promise((resolve, reject) => {
//                 if(db.collection("userDetails").updateOne({ "username": username}, {$pull: {'friendRequest': destUsername}})){
//                     resolve("Friend removed from friend request list successfully")
//                 }
//             });
//
//             var addToRequestorList = new Promise((resolve, reject) => {
//                 if (db.collection("userDetails").updateOne({"username" : destUsername}, {$push : {"friends" : username}}));
//                 resolve("Added to requestor list as well (now a mutual acceptance)")
//             });
//
//             addingFriend.then((message) => {
//                 console.log(message);
//                 return removingFriend;
//             }).then((message) => {
//                 console.log(message);
//                 return addToRequestorList;
//             }).then( (message) => {
//                 console.log(message);
//                 console.log("Friend added successfully");
//                 response.send("You and " + destUsername + " are now friends.");
//             })
//         }
//     })
// });
//
// // route to reject friend request
//
// app.post("/rejectFriend", (request, response) => {
//     var username = request.decode.username;
//     var destUsername = request.body.username;
//     console.log(username, destUsername);
//     MongoClient.connect(url, { useNewUrlParser: true } , function(error, database) {
//         if (error) {
//             console.log(error);
//         }
//         else {
//             var db = database.db("Facebook");
//             db.collection("userDetails").updateOne({ "username": username}, {$pull: {'friendRequest': destUsername}});
//             response.send("You declined the friend request of " + destUsername);
//         }
//     })
// });
//
// // route to get the feed of the user on their public page (accessible only when the user which is requesting is the friend of that guy)
//
// app.post('/getFeed', (request, response) => {
//     var username = request.decode.username;
//     var usernameProfile = request.body.username;
//     console.log(usernameProfile);
//     // putting some additional checks to avoid any illegal feed leak
//     MongoClient.connect(url, { useNewUrlParser: true } , function(error, database) {
//         if (error) {
//             console.log(error);
//         }
//         else {
//             var db = database.db("Facebook");
//             // to check if the public profile requested by the user if a friend of the main user or not
//             var mainUser = db.collection("userDetails").findOne({"username" : usernameProfile});
//             console.log(mainUser);
//             mainUser.then(function (result) {
//                 var friendList = result.friends;
//                 var feed = result.notes;
//                 console.log(friendList);
//                 console.log(feed);
//                 console.log(friendList.includes(username));
//                 if ( friendList.includes(username) ){
//                     response.json(JSON.stringify({"feed" : feed}));
//                 }
//                 else {
//                     response.send("You are not friend of " + usernameProfile + ". You are not allowed to access the feed. Try sending friend request first.")
//                 }
//             })
//         }
//     })
// });
//
//
// //to get the feed of all the friends on the user homepage
//
// app.get ("/getFriendsFeed", (request, response) => {
//     var username = request.decode.username;
//     MongoClient.connect(url, { useNewUrlParser: true } , function(error, database) {
//         if (error) {
//             console.log(error);
//         }
//         else {
//             var db = database.db("Facebook");
//             // to check if the public profile requested by the user if a friend of the main user or not
//             var mainUser = db.collection("userDetails").findOne({"username" : username});
//             console.log(mainUser);
//             mainUser.then(function (result) {
//                 var posts = result.content;
//                 console.log(posts);
//                 response.json(JSON.stringify(posts));
//             })
//         }
//     })
//
// })
//
//
// // server init
//
app.listen(3000, () => {
    console.log("Server is up at port 3000");
});
