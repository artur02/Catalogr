define(function () {
    "use strict";


    return {
        log: function() {
            var i,
                a = [];

            for (i = 0; i < arguments.length; i++) {
                a.push(arguments[i]);
            }

            console.log(a.join(" "));
        }
    };
});