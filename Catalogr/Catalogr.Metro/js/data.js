define(["Infra/database"], function (database) {
    "use strict";

    var authors;
    var books;

    // Returns an array of sample data that can be added to the application's
    // data list. 
    function generateSampleData() {
        return new WinJS.Promise(function (comp, err, prog) {


            database.read().then(function(res) {

                authors = res.authors;
                books = res.books;

                comp({
                    authors: authors,
                    books: books
                });
            });
        });
    }


    return {
        generate: function () {
            return new WinJS.Promise(function(comp, err) {


                    // TODO: Replace the data with your real data.
                    // You can add data from asynchronous sources whenever it becomes available.
                    generateSampleData().then(function(res) {
                        comp({
                            authors: res.authors,
                            books: res.books
                        });
                    });

            });
        },
        

        authors: function() {
            return authors;
        },
        books: function() {
            return books;
        }
    };

});