(function() {
    "use strict";

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var nav = WinJS.Navigation;
    var ui = WinJS.UI;

    function initializeLayout(listView, viewState) {
        require(["data", "/pages/groupedItems/viewmodel.js"], function (data, VM) {

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
    }

    function itemInvoked(item) {
        require(["data", "/pages/groupedItems/viewmodel.js"], function (data, VM) {
            if (appView.value === appViewState.snapped) {
                // If the page is snapped, the user invoked a group.
                var group = VM.groups.getAt(item.detail.itemIndex);
                this.navigateToGroup(group.key);
            } else {
                // If the page is not snapped, the user invoked an item.
                var selectedItem = VM.items.getAt(item.detail.itemIndex);
                nav.navigate("/pages/itemDetail/itemDetail.html", { selectedItem: data.getItemReference(selectedItem) });
            }
        });
    }

    function itemTemplateBuilder(item) {
        return new WinJS.Promise(function(comp, err) {
            require(['/js/Infra/emberExtensions.js'], function(ember) {
                var view = Ember.View.create({
                    templateName: 'item',
                    title: item._value.data.title,
                    navigate: function() {
                        debugger;
                    }
                });
                var ret = ember.viewToDom(view);
                comp(ret);
            });
        });
    }
    function headerTemplateBuilder(header) {
        return new WinJS.Promise(function(comp, err) {
            require(['/js/Infra/emberExtensions.js'], function(ember) {
                var view = Ember.View.create({
                    templateName: 'header',
                    author: header._value.data.title,
                    navigate: function(event) {
                        console.log(event.view.author);
                    }
                });
                var ret = ember.viewToDom(view);
                comp(ret);
            });
        });
    }
    
    function navigateToGroup(key) {
        nav.navigate("/pages/groupDetail/groupDetail.html", { groupKey: key });
    }

    ui.Pages.define("/pages/groupedItems/authorGroups.html", {
        // Navigates to the groupHeaderPage. Called from the groupHeaders,
        // keyboard shortcut and iteminvoked.
        ready: function (element, options) {
            Ember.Application.create();

            var _this = this;
            require(["/pages/groupedItems/viewmodel.js"], function(VM) {
                VM.generate();
                
                require(['/js/Infra/templateLoader.js'], function(loader) {
                    loader.load('pages\\groupedItems\\templates').done(function() {
                        var listView = document.getElementById('list').winControl;
                        listView.groupHeaderTemplate = headerTemplateBuilder;
                        listView.itemTemplate = itemTemplateBuilder;
                        
                        initializeLayout(listView, appView.value);
                        listView.element.focus();
                        
                        listView.oniteminvoked = itemInvoked.bind(_this);
                        listView.addEventListener("keydown", function (e) {
                            if (appView.value !== appViewState.snapped && e.ctrlKey && e.keyCode === WinJS.Utilities.Key.g && e.altKey) {
                                var data = listView.itemDataSource.list.getAt(listView.currentItem.index);
                                navigateToGroup(data.group.key);
                                e.preventDefault();
                                e.stopImmediatePropagation();
                            }
                        }, true);

                    }, function(err) {
                        debugger;
                    });
                });

                document.getElementById("cmdAdd").addEventListener("click", doClickAdd, false);
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
        }
    });

    // Command button functions

    function doClickAdd() {
        nav.navigate('/pages/addNewBook/addNewBook.html');
    }

}());