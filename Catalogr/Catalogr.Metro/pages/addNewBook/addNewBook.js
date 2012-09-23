/*globals Ember, WinJS */
(function() {
    "use strict";

    function addMetaCommandHandler() {
        require(["/js/Infra/amazon.js"], function(amazon) {
            var metaButton = document.getElementById('cmdGetMeta');
            metaButton.addEventListener('click', function () {
                amazon.loadKeys().then(function () {
                    var authorNode = document.getElementById("authorSelector");
                    var titleNode = document.getElementById("title");
                    var author = authorNode.options[authorNode.selectedIndex].text;

                    amazon.bookSearch.getDetails({
                        Author: author,
                        Title: titleNode.value,
                        ResponseGroup: 'ItemAttributes,Images'
                    }).then(function (res) {
                        var cover = document.getElementById("cover");
                        cover.src = res.getLargest()[0].url;

                    });


                });
            });
        });
    }

    function addSaveCommandHandler() {
        var saveButton = document.getElementById('cmdSave');
        saveButton.addEventListener('click', function () {
            var authorNode = document.getElementById("authorSelector");
            var author = authorNode.options[authorNode.selectedIndex];
            var title = document.getElementById("title");


            require(['/js/Infra/database.js'], function (database) {
                database.addBooks([{
                    title: title.value,
                    authorid: author.value
                }]);
            });
        });
    }

    function addAuthorSelector() {
        require(["data", '/js/Infra/templateLoader.js'], function(data, loader) {
            loader.load('pages\\addNewBook\\templates').done(function() {
                var view = Ember.View.create({
                    templateName: 'authors',
                    options: []
                });

                data.authors().forEach(function(author, index) {
                    view.options.push({
                        text: author,
                        value: index
                    });
                });

                view.appendTo('#selectauthor');
            });
        });
    }

    WinJS.UI.Pages.define("/pages/addNewBook/addNewBook.html", {
        ready: function(element, options) {
            // TODO: Initialize the page here.
           
                    addAuthorSelector();

                    addMetaCommandHandler();
                    addSaveCommandHandler();                        
        },

        unload: function() {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function(element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
        }
    });
}());
