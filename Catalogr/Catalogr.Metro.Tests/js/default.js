(function (globals) {
    'use strict';

    var activation = Windows.ApplicationModel.Activation,
        app = WinJS.Application,
        nav = WinJS.Navigation;

    app.addEventListener('activated', function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            args.setPromise(WinJS.UI.processAll().then(function () {
                globals.expect = chai.expect;
                mocha.run();
            }));
        }
    }, false);

    app.start();
})(this);