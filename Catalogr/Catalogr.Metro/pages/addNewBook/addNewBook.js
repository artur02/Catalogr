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

                        data.authors().forEach(function(author) {
                            view.options.push({
                                text: author
                            });
                        });
                        
                        view.appendTo('#selectauthor');
                        



                        var button = document.getElementById('detailsButton');
                        button.addEventListener('click', function () {
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
                                    item.backgroundImage = urlNodes[0].innerText;
                                    var actualHeight = heightNodes[0].innerText;
                                    item.backgroundImageHeight = 250;
                                    item.backgroundImageWidth = 250 / actualHeight * widthNodes[0].innerText;

                                    var cover = document.getElementById("cover");
                                    cover.src = urlNodes[0].innerText;

                                });


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
