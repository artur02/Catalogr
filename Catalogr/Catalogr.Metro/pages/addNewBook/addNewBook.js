require(["data"], function (data) {
        "use strict";

        WinJS.UI.Pages.define("/pages/addNewBook/addNewBook.html", {
            // This function is called whenever a user navigates to this page. It
            // populates the page elements with the app's data.
            ready: function (element, options) {
                // TODO: Initialize the page here.
                var authorSelector = document.getElementById('authorSelector');
                var templateElement = document.getElementById("templateDiv");
                authorSelector.innerHTML = "";

                var templateControl = templateElement.winControl;
                data.groups.forEach(function (group) {
                    templateControl.render(group, authorSelector);
                });
            },

            unload: function () {
                // TODO: Respond to navigations away from this page.
            },

            updateLayout: function (element, viewState, lastViewState) {
                /// <param name="element" domElement="true" />

                // TODO: Respond to changes in viewState.
            }
        });
});