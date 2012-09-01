define(function () {
    "use strict";

    function argToArray(arg) {
        var i, len,
                args = [];

        for (i = 0, len = arg.length; i < len; i++) {
            args.push(arg[i]);
        }

        return args;
    }

    return {
        log: function() {
            var args = argToArray(arguments);

            console.log(args.join(" "));
        },
        error: function () {
            var args = argToArray(arguments);

            console.error(args.join(" "));
        },
        info: function () {
            var args = argToArray(arguments);

            console.info(args.join(" "));
        },
        warn: function () {
            var args = argToArray(arguments);

            console.warn(args.join(" "));
        },
        assert: function () {
            console.assert.apply(arguments);
        }
    };
});