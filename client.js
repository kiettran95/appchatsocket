$(function () {

    // Connect to socket.io
    var socket = io.connect('http://127.0.0.1:4000');

    /*
    * Enter chat and load users
    */
    $("a#enterChat").click(function (e) {
        e.preventDefault();

        let username = $("#username").val();

        localStorage.setItem("username", username);

        if (username != "") {

            socket.emit("username", username);

            $("div#enterUsername").addClass('hidden');
            $("div#chatMain").removeClass('hidden');

            socket.on('users', function (data) {
                data.forEach(element => {
                    if ( ! $("li#" + element.socketID).length && $("div#userList li").text() != element.username) {
                        $("div#userList ul").append('<li id="' + element.socketID + '">' + element.username + '</li>');
                    }
                });
            });

        } else {
            alert('You must enter a username!')
        }

    });

    /*
    * Enter chat on ENTER
    */
    $("input#username").keypress(function (e) {
        let username = $("#username").val();

        if (e.which == 13) {
            if (username != "") {
                $("a#enterChat").click();
            } else {
                alert('You must enter a username!')
            }
        }


    });

    /*
    * Handle log on
    */
    socket.on('logon', function (data) {
        $("div#userList ul").append('<li id="' + data.socketID + '">' + data.username + '</li>');
    });

    /*
    * Handle log off
    */
    socket.on('logoff', function (id) {
        $("li#" + id).remove();
        localStorage.removeItem("username");
    });

    /*
    * Handle chat input
    */
    $("#chatText").keypress(function (e) {

        if (e.which == 13) {
            let message = $("#chatText").val();
            let windowID = $("div#chatWindows div.active").attr('id');

            if (message != "") {

                socket.emit('input', {
                    username: localStorage.getItem("username"),
                    message: message,
                    date: moment().format("DD/MM/YYYY HH:mm"),
                    windowID: windowID
                });

            $("#chatText").val("");
            e.preventDefault();

            } else {
                alert('You must enter a message');
            }
        }        

    });

    /*
    * Handle output
    */
    socket.on('output', function (data) {
        $("div#chatWindows div#"+data.windowID).append("<p>[" + data.date + "] <b>" + data.username +  "</b>: " + data.message + "</p>");
    });

    /*
    * Load chat messages
    */
    socket.on('messages', function (data) {
        data.forEach(element => {
            $("div#publicChat").append("<p>[" + element.date + "] <b>" + element.username +  "</b>: " + element.message + "</p>");
        });
    });

    /*
    * Handle private chat 
    */
    $(document).on("dblclick", "div#userList li", function () {

        let socketID = $(this).attr('id');
        let senderUsername = localStorage.getItem("username");
        let receiverUsername = $(this).text();

        $("#chatText").focus();

        $("div#rooms > div").removeClass('active');
        $("div#chatWindows > div").removeClass('active');

        $("div#rooms").append("<div id=" + receiverUsername + " class='active'>" + "<span>x</span>" + receiverUsername + "</div>");
        $("div#chatWindows").append("<div id=" + senderUsername + "-" + receiverUsername + " class='chatroom active'></div>");
    });

});