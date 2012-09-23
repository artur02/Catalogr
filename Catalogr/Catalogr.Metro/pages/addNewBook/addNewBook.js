(function() {
    "use strict";

        WinJS.UI.Pages.define("/pages/addNewBook/addNewBook.html", {
            // This function is called whenever a user navigates to this page. It
            // populates the page elements with the app's data.
            ready: function (element, options) {
                // TODO: Initialize the page here.
                
                
                    require(["data", "/js/Infra/amazon.js", '/js/Infra/templateLoader.js'], function (data, amazon, loader) {
                    loader.load('pages\\addNewBook\\templates').done(function () {
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
                                    var urlNodes = res.largeImage.getElementsByTagName("URL");
                                    var widthNodes = res.largeImage.getElementsByTagName("Width");
                                    var heightNodes = res.largeImage.getElementsByTagName("Height");
                                    var actualHeight = heightNodes[0].innerText;
                                    
                                    var cover = document.getElementById("cover");
                                    cover.src = urlNodes[0].innerText;

                                });


                            });
                        });
                        
                        var saveButton = document.getElementById('cmdSave');
                        saveButton.addEventListener('click', function () {
                            var authorNode = document.getElementById("authorSelector");
                            var author = authorNode.options[authorNode.selectedIndex];
                            
                            
                            require(['/js/Infra/database.js'], function(database) {
                                database.addBooks([{
                                    title: 'ALMA',
                                    authorid: author.value 
                                }]);
                            });
                        });


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
}());
