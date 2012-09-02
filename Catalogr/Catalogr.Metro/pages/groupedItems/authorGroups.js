(function() {
    "use strict";

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var nav = WinJS.Navigation;
    var ui = WinJS.UI;

    ui.Pages.define("/pages/groupedItems/authorGroups.html", {
        // Navigates to the groupHeaderPage. Called from the groupHeaders,
        // keyboard shortcut and iteminvoked.
        navigateToGroup: function(key) {
            nav.navigate("/pages/groupDetail/groupDetail.html", { groupKey: key });
        },
        ready: function(element, options) {
            var _this = this;

            require(["/pages/groupedItems/viewmodel.js"], function(VM) {
                //VM.generate();
                


                window.App = Ember.Application.create({
                    

                        
                        });

                require(['/js/Infra/templateLoader.js'], function(loader) {
                    loader.load('pages');
                });

                Ember.TEMPLATES["my_cool_template"] = Ember.Handlebars.compile('<b>{{name}}</b>');
                Ember.TEMPLATES["hello"] = Ember.Handlebars.compile('Hello, <b>{{name}}</b>');

    var view = Ember.View.create({
        templateName: 'hello',
        name: "Bob"
    });
    view.appendTo('#content');
    

                window.App.name = "aaa";


                



                /*var listView = element.querySelector(".groupeditemslist").winControl;
                listView.groupHeaderTemplate = element.querySelector(".headertemplate");
                listView.itemTemplate = element.querySelector(".itemtemplate");
                listView.oniteminvoked = _this._itemInvoked.bind(this);

                // Set up a keyboard shortcut (ctrl + alt + g) to navigate to the
                // current group when not in snapped mode.
                listView.addEventListener("keydown", function(e) {
                    if (appView.value !== appViewState.snapped && e.ctrlKey && e.keyCode === WinJS.Utilities.Key.g && e.altKey) {
                        var data = listView.itemDataSource.list.getAt(listView.currentItem.index);
                        this.navigateToGroup(data.group.key);
                        e.preventDefault();
                        e.stopImmediatePropagation();
                    }
                }.bind(this), true);

                _this._initializeLayout(listView, appView.value);
                listView.element.focus();

                document.getElementById("cmdAdd").addEventListener("click", doClickAdd, false);*/
            });
        },

        // This function updates the page layout in response to viewState changes.
        updateLayout: function(element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            var listView = element.querySelector(".groupeditemslist").winControl;
            if (lastViewState !== viewState) {
                if (lastViewState === appViewState.snapped || viewState === appViewState.snapped) {
                    var handler = function(e) {
                        listView.removeEventListener("contentanimating", handler, false);
                        e.preventDefault();
                    };
                    listView.addEventListener("contentanimating", handler, false);
                    this._initializeLayout(listView, viewState);
                }
            }
        },

        // This function updates the ListView with new layouts
        _initializeLayout: function(listView, viewState) {
            /// <param name="listView" value="WinJS.UI.ListView.prototype" />
            require(["data", "/pages/groupedItems/viewmodel.js"], function(data, VM) {

                if (viewState === appViewState.snapped) {
                    listView.itemDataSource = VM.groups.dataSource;
                    listView.groupDataSource = null;
                    listView.layout = new ui.ListLayout();
                } else {
                    listView.itemDataSource = VM.items.dataSource;
                    listView.groupDataSource = VM.groups.dataSource;
                    listView.layout = new ui.GridLayout({ groupHeaderPosition: "top" });
                }
            });
        },

        _itemInvoked: function(args) {
            require(["data", "/pages/groupedItems/viewmodel.js"], function(data, VM) {
                if (appView.value === appViewState.snapped) {
                    // If the page is snapped, the user invoked a group.
                    var group = VM.groups.getAt(args.detail.itemIndex);
                    this.navigateToGroup(group.key);
                } else {
                    // If the page is not snapped, the user invoked an item.
                    var item = VM.items.getAt(args.detail.itemIndex);
                    nav.navigate("/pages/itemDetail/itemDetail.html", { item: data.getItemReference(item) });
                }
            });
        }
    });

    // Command button functions

    function doClickAdd() {
        nav.navigate('/pages/addNewBook/addNewBook.html');
    }

}());