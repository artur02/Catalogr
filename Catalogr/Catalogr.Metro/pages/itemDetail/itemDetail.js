(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/itemDetail/itemDetail.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var app = Em.Application.create();
            

            require(["data", "/js/Infra/emberExtensions.js", "/js/Infra/templateLoader.js"], function (data, ember, loader) {
                loader.load('pages\\itemDetail\\templates').then(function() {
                    app.view = Em.View.create({
                        templateName: 'detail',
                        title: 'title',
                        author: 'author',
                    });
                    


                    app.view.appendTo('#content');
                });


                /*var item = options && options.item ? data.resolveItemReference(options.item) : data.items.getAt(0);
                element.querySelector(".titlearea .pagetitle").textContent = item.group.title;
                element.querySelector("article .item-title").textContent = item.title;
                element.querySelector("article .item-subtitle").textContent = item.subtitle;
                element.querySelector("article .item-image").src = item.backgroundImage;
                element.querySelector("article .item-image").alt = item.subtitle;
                element.querySelector("article .item-content").innerHTML = item.content;
                element.querySelector(".content").focus();*/
            });
        }
    });
})();
