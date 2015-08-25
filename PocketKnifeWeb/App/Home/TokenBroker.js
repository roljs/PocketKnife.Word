
function startTokenBroker(onTokenReceived) {
    // Declare a proxy to reference the hub.
    var broker = $.connection.brokerHub;
    // Create a function that the hub can call to broadcast messages.
    broker.client.broadcastMessage = function (name, message) {
        if (name == "TrelloToken") {
            onTokenReceived(message);
        }
    };

    $.connection.hub.stop();
    var sessionId = generateSessionId();
    $.connection.hub.url = "https://rolandoj-demo.azurewebsites.net/signalr";
    //$.connection.hub.url = "https://localhost:44326/signalr";

    $.connection.hub.qs = { 'sessionId': sessionId};
    // Start the connection.
    $.connection.hub.start();
    return sessionId; 
}

function generateSessionId() {
        var d = Date.now();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
}