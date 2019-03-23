
    $.ajax({
        type : "GET",
        url : "http://" + a + "/getListFriendRequest",
        contentType : "application/json",
        success : function (result) {
            var listFriendRequest = JSON.parse(result).listFriendRequest;
            var friendRequestCount = listFriendRequest.length;
            if (friendRequestCount === 0) {
                $("span#friendRequestCount").html("No friend requests to show");
            }
            else {
                $("span#friendRequestCount").html(friendRequestCount);
            }
            console.log(listFriendRequest);
            for (var i = 0; i < listFriendRequest.length ; i++){
                var li = document.createElement("li");
                var a = document.createElement("a");
                var accept = document.createElement("button");
                var reject = document.createElement("button");
                var acceptText = document.createTextNode("Accept");
                var rejectText = document.createTextNode("Reject");
                accept.appendChild(acceptText);
                reject.appendChild(rejectText);
                accept.setAttribute("type", "submit");
                reject.setAttribute("type", "submit");
                accept.setAttribute("name", listFriendRequest[i]);
                reject.setAttribute("name", listFriendRequest[i]);
                // add proper event listener so that there should be one click friend request accept/reject
                accept.addEventListener('click', function(){
                    var name  = $(this).attr("name");
                    console.log(name);
                    value = {"username": name};
                    $.ajax({
                        type: "POST",
                        url: "http://localhost:3000/acceptFriend",
                        contentType: "application/json",
                        data: JSON.stringify(value),
                        success: function (result) {
                            $("div#output").html(result);
                            $("#showFriendRequest").empty();
                            $("span#friendRequestCount").empty();
                        }
                    })
                });
                // by clicking the reject button user would be rejecting the friend request
                reject.addEventListener('click', function(){
                    var name  = $(this).attr("name");
                    console.log(name);
                    value = {"username": name};
                    $.ajax({
                        type: "POST",
                        url: "http://localhost:3000/rejectFriend",
                        contentType: "application/json",
                        data: JSON.stringify(value),
                        success: function (result) {
                            $("div#output").html(result);
                            $("#showFriendRequest").empty();
                            $("span#friendRequestCount").empty();
                        }
                    })
                });
                li.appendChild(accept);
                li.appendChild(reject);
                // insert profile link in the list we get as the list of friend request
                var textnode = document.createTextNode(listFriendRequest[i]);
                a.appendChild(textnode);
                a.setAttribute("href", "http://localhost:3000/getProfile?profile=" + listFriendRequest[i])
                li.appendChild(a);
                document.getElementById("showFriendRequest").appendChild(li);
            }
        }
    });
