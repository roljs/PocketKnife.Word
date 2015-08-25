//<![CDATA[ 
$(window).load(function () {
    /* 
    NOTE: The Trello client library has been included as a Managed Resource.  To include the client library in your own code, you would include jQuery and then
    
    <script src="https://api.trello.com/1/client.js?key=your_application_key">...
    
    See https://trello.com/docs for a list of available API URLs
    
    The API development board is at https://trello.com/api
    
    The &dummy=.js part of the managed resource URL is required per http://doc.jsfiddle.net/basic/introduction.html#add-resources
    */
    // The initialize function must be run each time a new page is loaded
    Office.initialize = function (reason) {
        $(document).ready(function () {
            app.initialize();
            $('#get-data-from-selection').click(getDataFromSelection);
            $('#post-card').click(getDataFromSelection);
            $('#save-card').click(saveCard);
        });
    };

    function onTokenReceived(token) {
        localStorage.setItem("trello_token", token);
        Trello.authorize({
            interactive: false,
            success: onAuthorize
        });

    }

    function initTrelloAuthPopUp() {
        var sessionId = startTokenBroker(onTokenReceived);
        window.open("//agave.azurewebsites.net/PocketKnife/App/TrelloAuth/TrelloAuthPopUp.html?sessionId=" + sessionId);
        //window.open("../TrelloAuth/TrelloAuthPopUp.html?sessionId=" + sessionId);
    }


    // Reads data from current document selection and displays a notification
    function getDataFromSelection() {
        Office.context.document.getSelectedDataAsync(Office.CoercionType.Text,
            function (result) {
                if (result.status === Office.AsyncResultStatus.Succeeded) {
                    // app.showNotification('The selected text is:', '"' + result.value + '"');
                    // showImages(result.value);
                    postCard(result.value);
                } else {
                    app.showNotification('Error:', result.error.message);
                }
            }
        );
    }

    function saveCard() {
        var name = $('#name').val();
        var desc = $('#desc').val();
        var idList = $('#boards').val();
        Trello.post("cards", {
            name: name,
            desc: desc,
            idList: idList
        });
        // $("#done-card").toggle(true);
    }

    function getMembers(thingie) {
        Trello.get("boards" + thingie + "/members", function (members) {
            $.each(members, function (ix, member) {
                var option = '<option value="' + member.id + '">' + member.fullName + '</option>';
                $('#members').append(option);
            });
        });
    }

    function postCard(name) {
        var isLoggedIn = Trello.authorized();
        $("#loggedout").toggle(!isLoggedIn);
        $("#loggedin").toggle(isLoggedIn);
        $("#form").toggle(isLoggedIn);
        // $("#post-card").toggle(!isLoggedIn);

        if (isLoggedIn) {
            onSuccess(name);
        }

        // Trello.post("cards", {
        // name: name,
        // desc: "its a different js file",
        // idList: "5487dd25020bd6541dc3d0e3"
        // })
    }

    
    var onSuccess = function (name) {
        updateLoggedIn();
        $("#output").empty();

        Trello.members.get("me", function (member) {
            $("#fullName").text(member.fullName);
            if (name != undefined) {
                if (name.length > 10) {
                    $("#name").text(name.substring(0, 10) + "...");
                } else {
                    $("#name").text(name);
                }
                $("#desc").text(name);
            }

            Trello.get("members/me/boards", function (boards) {
                $.each(boards, function (ix, board) {
                    Trello.get("boards/"+board.id+"/lists/open", function (lists) {
                        $.each(lists, function (ix, list) {
                            var option = '<option value="' + list.id + '">' + board.name + '/' + list.name + '</option>';
                            $('#boards').append(option);
                        });
                    });
                    
                });
            });


        });

    };
 

    var onAuthorize = function (name) {
        updateLoggedIn();
        $("#output").empty();

        Trello.members.get("me", function (member) {
            $("#fullName").text(member.fullName);

            // Output a list of all of the cards that the member 
            // is assigned to
            /*
            var $cards = $("<div>")
                .text("Loading Cards...")
                .appendTo("#output");

            Trello.get("members/me/cards", function (cards) {
                $cards.empty();
                $.each(cards, function (ix, card) {
                    $("<a>")
                    .attr({ href: card.url, target: "trello" })
                    .addClass("card")
                    .text(card.name)
                    .appendTo($cards);
                });
            });

            var $boards = $("<div>")
                .text("Loading Boards...")
                .appendTo("#output");

            Trello.get("members/me/boards", function (boards) {
                $boards.empty();
                $.each(boards, function (ix, board) {
                    $("<a>")
                    .attr({ href: board.url, target: "trello" })
                    .addClass("board")
                    .text(board.name + " " + board.id)
                    .appendTo($boards);
                });
            });


            var $lists = $("<div>")
                .text("Loading Lists...")
                .appendTo("#output");

            Trello.get("boards/5487dd0f3848434796ec3d6a/lists/open", function (lists) {
                $lists.empty();
                $.each(lists, function (ix, list) {
                    $("<a>")
                    .addClass("board")
                    .text(list.name + " " + list.id)
                    .appendTo($lists);
                });
            });
            */
        });

    };

    var updateLoggedIn = function () {
        var isLoggedIn = Trello.authorized();
        $("#loggedout").toggle(!isLoggedIn);
        $("#loggedin").toggle(isLoggedIn);
    };

    var logout = function () {
        Trello.deauthorize();
        updateLoggedIn();
    };

    Trello.authorize({
        interactive: false,
        success: onAuthorize
    });

    $("#connectLink")
    .click(function () {
        initTrelloAuthPopUp();
    });

  /* Original from Sudheer
     $("#connectLink")
    .click(function () {
        Trello.authorize({
            type: "redirect",
            expiration: "never",
            name: "PocketKnife",
            persist: "true",
            scope: { write: true, read: true, account: true },
            success: onAuthorize
        })
    });
*/

    $("#addCard")
    .click(function () {
        Trello.post("cards", {
            name: "this is a test",
            desc: "from the function",
            idList: "5487dd25020bd6541dc3d0e3"
        })
    });

    $("#disconnect").click(logout);




});//]]>  