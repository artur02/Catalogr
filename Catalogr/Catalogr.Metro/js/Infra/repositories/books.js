define(["Infra/database", "Infra/logger"], function (db, logger) {
    function BookRepository() {
        function add(books) {
            return new WinJS.Promise(function (comp, err) {
                db.open().then(function () {
                    var txn = db.getTransaction([db.STORE.books], db.MODE.readwrite);
                    txn.oncomplete = function () {
                        logger.info("Database populated.", "sample", "status");
                        comp();
                    };
                    txn.onerror = function () {
                        logger.error("Unable to populate database or database already populated.");
                        err("Unable to populate database or database already populated");
                    };
                    txn.onabort = function () {
                        logger.error("Unable to populate database or database already populated.");
                        err("Unable to populate database or database already populated");
                    };

                    var booksStore = txn.objectStore(db.STORE.books);

                    // Write books to IndexedDB table.
                    books.forEach(function (book) {
                        try {
                            var errorHandler = function () {
                                logger.error("Failed to add book: " + this + ".");
                            };

                            addBook(booksStore, book, errorHandler.bind(book));
                        } catch (error) {
                            logger.error(error.message);
                        }
                    });
                });
            });


        }



        function addBook(store, item, error) {
            var addResult = store.add(item);
            addResult.author = item.name;
            addResult.onerror = error;
        };

        function del(books) {
            return new WinJS.Promise(function (comp, err) {
                db.open().then(function () {
                    var txn = db.getTransaction([db.STORE.books], db.MODE.readwrite);
                    txn.oncomplete = function () {
                        logger.info("Failed deleting book.");
                        comp();
                    };

                    var booksStore = txn.objectStore(db.STORE.books);

                    books.forEach(function (book) {
                        try {
                            deleteBook(booksStore, book);
                        } catch (error) {
                            logger.error(error.message);
                        }
                    });
                });
            });
        }

        function deleteBook(store, item, error) {
            store.delete(item.id);
        }

        return {
            add: add,
            del: del
        };
    }

    return BookRepository;

});