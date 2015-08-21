/// <reference path="../App.js" />

(function () {
    "use strict";

    // The initialize function must be run each time a new page is loaded
    Office.initialize = function (reason) {
        $(document).ready(function () {
            app.initialize();

            $('#get-data-from-selection').click(getDataFromSelection);
            $('#post-card').click(getDataFromSelection);
        });
    };

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

    function showImages(selectedText) {

        $('#Images').empty();

        var parameters = {
            tags: selectedText,
            tagsmode: "any",
            format: "json"
        };

        $.getJSON("https://secure.flickr.com/services/feeds/photos_public.gne?jsoncallback=?",
                        parameters,
                        function (results) {
                            $.each(results.items, function (index, item) {
                                $('#Images').append($("<img />").attr("src", item.media.m));
                            });
                        }
        );
    }

    function displayTrelloAuthError() {
        app.showNotification('Error:', "Login to Trello failed");
    }

    
    function authSuccess(name) {
        app.showNotification('Msg:', name);
        var isLoggedIn = Trello.authorized();
        $("#loggedout").toggle(!isLoggedIn);
        $("#loggedin").toggle(isLoggedIn);

        $("#output").empty();
        app.showNotification('Msg:', "2");
        Trello.members.get("me", function (member) {
            $("#fullName").text(member.fullName+"-home.js");

            $("#name").text(name.substring(0, 15));
            $("#desc").text(name);

            var $cards = $("<div>")
                .text("Loading Cards...")
                .appendTo("#output");

            // Output a list of all of the cards that the member 
            // is assigned to
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


        });
    }


    function authTrello(name) {
        Trello.authorize({
            type: "redirect",
            interactive: true,
            expiration: "never",
            name: "PocketKnife",
            persist: "true",
            error: displayTrelloAuthError,
            success: authSuccess(name),
            scope: { write: true, read: true, account: true }
        })
    }

    function postCard(name) {
        var isLoggedIn = Trello.authorized();
        $("#loggedout").toggle(!isLoggedIn);
        $("#loggedin").toggle(isLoggedIn);

        if (!isLoggedIn)
            authTrello(name);

        // Trello.post("cards", {
            // name: name,
            // desc: "its a different js file",
            // idList: "5487dd25020bd6541dc3d0e3"
        // })
    }


})();


