// Declare a proxy to reference the SignalR hub.
var broker = $.connection.brokerHub;
var urlParams = getQueryStringParams();

function getQueryStringParams() {
    var urlParams;
    var match,
        pl = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
        urlParams[decode(match[1])] = decode(match[2]);

    return urlParams;
};

function closeWindow() {
    //Hack required to close a window without any prompt for IE7 & greater versions.
    window.open('', '_parent', '');
    window.close();
}

var onAuthorize = function () {
    var tt = localStorage.getItem("trello_token");
    if (tt != null) {
        broker.client.broadcastMessage = function (name, message) {

        };

        $.connection.hub.qs = { 'sessionId': urlParams["sessionId"] };
        //$.connection.hub.url = "//rolandoj-demo.azurewebsites.net/signalr";
        $.connection.hub.url = "https://localhost:44326/signalr";
        $.connection.hub.start().done(function () {
            if (urlParams["sessionId"]) {
                broker.server.send("TrelloToken", tt);
                
                //TODO: For some reason sendToGroup is not found, need to check why, but this is needed instead of plain send to maintain security, otherwise the token is broadcast to all clients
                //broker.server.sendToGroup(urlParams["sessionId"], "TrelloToken", tt);
            }
            else {
                broker.server.send("TrelloToken", tt);
            }

            closeWindow();
        });
    }

};

function initTrelloAuthUi() {
    //Trello.authorize({ type: "redirect", success: onAuthorize, name: "PocketKnife.Word", persist: true });
    Trello.authorize({
        type: "redirect",
        expiration: "never",
        name: "PocketKnife",
        persist: "true",
        scope: { write: true, read: true, account: true },
        success: onAuthorize
    })

}

$(document).ready(function () {
    
    Trello.authorize({ interactive: false, success: onAuthorize, error: initTrelloAuthUi });
        
});