require(["data"], function (data) {
        "use strict";

        WinJS.UI.Pages.define("/pages/addNewBook/addNewBook.html", {
            // This function is called whenever a user navigates to this page. It
            // populates the page elements with the app's data.
            ready: function (element, options) {
                // TODO: Initialize the page here.
                
                require(['/js/Infra/templateLoader.js'], function (loader) {
                    loader.load('pages\\addNewBook\\templates').done(function () {
                        var view = Ember.View.create({
                            templateName: 'authors',
                            options: []
                        });

                        data.authors().forEach(function(author) {
                            view.options.push({
                                text: author
                            });
                        });
                        
                        view.appendTo('#selectauthor');


                    }, function (err) {
                        debugger;
                    });
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