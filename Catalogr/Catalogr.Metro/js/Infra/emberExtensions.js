/*globals $, define, Ember*/
define([], function () {
    "use strict";

    function viewToDom(view) {
        var buffer = new Ember.RenderBuffer();
        view.renderToBuffer(buffer);
        var result = $(buffer.string());
        return result[0];
    }

    return {
        viewToDom: viewToDom
    };
});