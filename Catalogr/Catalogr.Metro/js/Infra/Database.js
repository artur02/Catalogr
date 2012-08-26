(function (context, Logger) {
    "use strict";

    var newCreate = false;

    WinJS.Namespace.define("Database", {
        create: function (name, version) {
            var dbRequest = window.indexedDB.open(name, version);

            // Add asynchronous callback functions
            dbRequest.onerror = function () { Logger.log && Logger.log("Error creating database.", "sample", "error"); };
            dbRequest.onsuccess = function (evt) { dbSuccess(evt); };
            dbRequest.onupgradeneeded = function (evt) { dbVersionUpgrade(evt); };
            dbRequest.onblocked = function () { Logger.log && Logger.log("Database create blocked.", "sample", "error"); };
            newCreate = false;
        },
        read: function () {
            return new WinJS.Promise(function (comp, err, prog) {

                // Declare arrays to hold the data to be read.
                var books = [];
                var authors = [];
                var checkouts = [];

                // Create a transaction with which to query the IndexedDB.
                var txn = context.db.transaction(["books", "authors", "checkout"], "readonly");

                // Set the event callbacks for the transaction.
                txn.onerror = function () { WinJS.log && WinJS.log("Error reading data.", "sample", "error"); };
                txn.onabort = function () { WinJS.log && WinJS.log("Reading of data aborted.", "sample", "error"); };

                // The oncomplete event handler is called asynchronously once reading is finished and the data arrays are fully populated. This
                // completion event will occur later than the cursor iterations defined below, because the transaction will not complete until
                // the cursors are finished.
                txn.oncomplete = function () {

                    comp({
                        books: books,
                        authors: authors
                    });

                    //var outputContent = "";

                    //// If there are no books to display, there is no need to continue.
                    //var len = books.length;
                    //if (len === 0) {
                    //    return;
                    //}

                    //// Set checkout status for each book. Because the checkout table containing status for each book is sparsely
                    //// populated, we need to set the checkout status to 0 if it is not found in the checkouts array.
                    //for (var i = 0; i < len; i++) {
                    //    var bookId = books[i].id;
                    //    if (checkouts[bookId]) {
                    //        books[i].checkout = checkouts[bookId];
                    //    }
                    //    else {
                    //        books[i].checkout = 0;
                    //    }
                    //}

                    //// Construct an output table with one row per book.
                    //outputContent = "<table><tr><th>Book</th><th>Author</th><th>Checked Out?</th></tr>";
                    //for (i = 0; i < len; i++) {
                    //    outputContent += "<tr><td>" + books[i].title + "</td><td>" + authors[books[i].authorid] + "</td><td><input type='checkbox' " + (books[i].checkout === 1 ? "disabled='disabled' checked='checked'" : "disabled='disabled'") + "/></tr>";
                    //}

                    //// Display the content.
                    //var outputDiv = document.getElementById("dataOutput");
                    //outputDiv.innerHTML = outputContent;
                };

                // Create a cursor on the books object store. Because we want the results to be returned in title order, we use the title index
                // on the object store for the cursor to operate on. We could pass a keyRange parameter to the openCursor call to filter the cursor
                // to specific titles.
                var bookCursorRequest = txn.objectStore("books").index("title").openCursor();

                // As each record is returned (asynchronously), the cursor calls the onsuccess event; we store that data in our books array
                bookCursorRequest.onsuccess = function (e) {
                    var cursor = e.target.result;
                    if (cursor) {
                        books.push(cursor.value);
                        cursor.continue();
                    }
                };

                // The authors object store cursor is handled slightly differently. Here we load the entire authors table into an array because we know there
                // is only a small amount of data. With larger or filtered datasets, we could have parsed the authorid in the book cursor onsuccess handler 
                // above and initiated a nested cursor request that created a keyRange for the one authorid desired and passed that keyRange to the openCursor
                // call below. For clarity of this sample, we follow the simpler model.
                var authorCursorRequest = txn.objectStore("authors").openCursor();

                // Asynchronously retrieve and store the data in the authors array with a key of the author id. This makes it easy to retrieve a specific 
                // author by id in the oncomplete handler of the transaction.
                authorCursorRequest.onsuccess = function (e) {
                    var cursor = e.target.result;
                    if (cursor) {
                        var data = cursor.value;
                        authors[data.id] = data.name;
                        cursor.continue();
                    }
                };

                // Here we also create a cursor on the checkout object store to retrieve whether each book is checked out. If you run the scenarios in
                // sequence, this cursor will return no results (the cursor variable will be null below). If you run the write scenario and save new
                // checkouts, you can return to this page and see the cursor now returns the previously saved checkout data.
                var checkoutCursorRequest = txn.objectStore("checkout").openCursor();
                checkoutCursorRequest.onsuccess = function (e) {
                    var cursor = e.target.result;
                    if (cursor) {
                        var data = cursor.value;
                        checkouts[data.id] = data.status;
                        cursor.continue();
                    } 
                };
            });
        }
    });

    

    function dbSuccess(evt) {

        // Log whether the app tried to create the database when it already existed. 
        if (!newCreate) {
            // Close this additional database request
            var db = evt.target.result;
            db.close();

            Logger.log && Logger.log("Database schema already exists.", "sample", "error");
            return;
        }
    }

    // Whenever an IndexedDB is created, the version is set to "", but can be immediately upgraded by calling createDB. 
    function dbVersionUpgrade(evt) {

        // If the database was previously loaded, close it. 
        // Closing the database keeps it from becoming blocked for later delete operations.
        if (context.db) {
            context.db.close();
        }
        context.db = evt.target.result;

        // Get the version update transaction handle, since we want to create the schema as part of the same transaction.
        var txn = evt.target.transaction;

        // Create the books object store, with an index on the book title. Note that we set the returned object store to a variable
        // in order to make further calls (index creation) on that object store.
        var bookStore = context.db.createObjectStore("books", { keyPath: "id", autoIncrement: true });
        bookStore.createIndex("title", "title", { unique: false });

        // Create the authors object store.
        context.db.createObjectStore("authors", { keyPath: "id" });

        // Create the book checkout status object store. Note that new object stores can only be created/deleted as part of the version change.
        // transaction that we're adding to in this function.
        context.db.createObjectStore("checkout", { keyPath: "id" });

        // Once the creation of the object stores is finished (they are created asynchronously), log success.
        txn.oncomplete = function () { Logger.log && Logger.log("Database schema created.", "sample", "status"); };
        newCreate = true;
    }

})(CatalogrContext, Logger);