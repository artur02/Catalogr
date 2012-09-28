/*global WinJS, define, require */

define(["config", "Infra/logger"], function (config, logger) {
    "use strict";

    var db;

    var objectStores = Object.create({}, {
        books: {
            value: "books",
            writable: false,
            enumerable: true
        },
        authors: {
            value: "authors",
            writable: false,
            enumerable: true
        }
    });

    var transactionMode = Object.create({}, {
        readonly: {
            value: "readonly",
            writable: false,
            enumerable: true
        },
        readwrite: {
            value: "readwrite",
            writable: false,
            enumerable: true
        },
        versionchange: {
            value: "versionchange",
            writable: false,
            enumerable: true
        }
    });

    function getTransaction(stores, mode) {
            return db.transaction(stores, mode);
    }
    
    // Whenever an IndexedDB is created, the version is set to "", 
    // but can be immediately upgraded by calling createDB. 
    function dbVersionUpgrade(evt) {
        function createBookSchema() {
            var bookStore = db.createObjectStore(objectStores.books, { keyPath: "id", autoIncrement: true });
            bookStore.createIndex("title", "title", { unique: false });
        }

        function createAuthorSchema() {
            db.createObjectStore(objectStores.authors, { keyPath: "id" });
        }

        return new WinJS.Promise(function (comp, err) {

            // If the database was previously loaded, close it. 
            // Closing the database keeps it from becoming blocked for later delete operations.
            if (db) {
                db.close();
            }
            db = evt.target.result;

            var txn = evt.target.transaction;

            createBookSchema();
            createAuthorSchema();


            // Once the creation of the object stores is finished (they are created asynchronously), log success.
            txn.oncomplete = function () { logger.info("Database schema created."); };

            comp();
        });

    }

    function open(name, version) {
        if (!name) {
            name = config.db.name;
        }
        
        if (!version) {
            version = config.db.version;
        }

        return new WinJS.Promise(function (comp, err) {
            try {
                // TODO store database in cache by name and version
                if (db) {
                    comp(db);
                    return;
                }

                //deleteDb(name);
                var dbRequest = window.indexedDB.open(name, version);

                // Add asynchronous callback functions
                dbRequest.onerror = function() {
                    var error = "Error creating database";
                    logger.error(error);
                    err(new Error(error));
                };
                dbRequest.onsuccess = function(evt) {
                    if (!db) {
                        db = evt.target.result;
                        //clear();
                    }
                    comp(db);
                };
                dbRequest.onupgradeneeded = function(evt) {
                    dbVersionUpgrade(evt).then(comp);
                };
                dbRequest.onblocked = function() {
                    logger.error("Database create blocked.");
                    err();
                };
            } catch (e) {
                err(e);
            }
        });
    }
 
    function deleteDb(dbName) {
        if (!dbName) {
            dbName = config.db.name;
        }

        window.indexedDB.deleteDatabase(dbName);
    }

    function clear() {
        var txn = db.transaction([objectStores.books, objectStores.authors], transactionMode.readwrite);
        var books = txn.objectStore(objectStores.books);
        books.clear();
      
        var authors = txn.objectStore(objectStores.authors);
        authors.clear();
    }
   
    function read() {
        return new WinJS.Promise(function (comp, err) {
            open().then(function() {


                // Declare arrays to hold the data to be read.
                var books = [];
                var authors = [];

                // Create a transaction with which to query the IndexedDB.
                var txn = db.transaction([objectStores.books, objectStores.authors], transactionMode.readonly);

                // Set the event callbacks for the transaction.
                txn.onerror = function() {
                    logger.error("Error reading data.", "sample", "error");
                    err();
                };
                txn.onabort = function() {
                    logger.error("Reading of data aborted.", "sample", "error");
                    err();
                };

                txn.oncomplete = function () {

                    comp({
                        books: books,
                        authors: authors
                    });
                };

                var bookCursorRequest = txn.objectStore(objectStores.books).index("title").openCursor();

                bookCursorRequest.onsuccess = function(e) {
                    var cursor = e.target.result;
                    if (cursor) {
                        books.push(cursor.value);
                        cursor.continue();
                    }
                };

                var authorCursorRequest = txn.objectStore(objectStores.authors).openCursor();

                authorCursorRequest.onsuccess = function(e) {
                    var cursor = e.target.result;
                    if (cursor) {
                        var data = cursor.value;
                        authors[data.id] = data.name;
                        cursor.continue();
                    }
                };
            });

        });
    }

    

    return {
        create: open,
        open: open,
        read: read,
        getTransaction: getTransaction,
        clear: deleteDb,

        STORE: objectStores,
        MODE: transactionMode
    };

});