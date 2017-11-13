/*
A Simple Mediator
*/
var Mediator = (function() {
    var channels = {};
    //Subscribe to a specific channel
    var subscribe = function(channel, context, func) {
        if(!Mediator.channels[channel]) {
            Mediator.channels[channel] = [];
        }
        Mediator.channels[channel].push({
            context: context,
            func: func
        });
    };
    //Notify subscribers when specific event occurs.
    var publish = function(channel) {
        if(!this.channels[channel]) {
            return false;
        }

        var args = Array.prototype.slice.call(arguments, 1);
        
        for(var i=0; i < Mediator.channels[channel].length; i++) {
            var sub = Mediator.channels[channel][i];
            sub.func.apply(sub.context, args);
        }
    };

    return {
        channels: {},
        subscribe: subscribe,
        publish: publish
    };

})();