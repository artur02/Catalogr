define([], function () {
    function AuthorRepository() {
        function add(authors) {
            return new WinJS.Promise(function (comp, err) {

                var txn = db.getTransaction([db.STORE.authors], db.MODE.readwrite);
                txn.oncomplete = function () {
                    logger.log("Database populated.", "sample", "status");
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

                var authorsStore = txn.objectStore(db.STORE.authors);

                // Write authors to IndexedDB table.
                authors.forEach(function (author) {
                    try {
                        var errorHandler = function () {
                            logger.error("Failed to add author: " + this + ".");
                        };

                        addAuthor(authorsStore, author, errorHandler.bind(author));
                    } catch (error) {
                        logger.error(error.message);
                    }
                });
            });
        }

        function addAuthor(store, item, error) {
            var addResult = store.add(item);
            addResult.author = item.name;
            addResult.onerror = error;
        };

        function del(authors) {
            return new WinJS.Promise(function (comp, err) {
                db.open().then(function () {
                    var txn = db.getTransaction([db.STORE.authors], db.MODE.readwrite);
                    txn.oncomplete = function () {
                        logger.info("Failed deleting author.");
                        comp();
                    };

                    var authorsStore = txn.objectStore(db.STORE.authors);

                    authors.forEach(function (author) {
                        try {
                            deleteAuthor(authorsStore, author);
                        } catch (error) {
                            logger.error(error.message);
                        }
                    });
                });
            });
        }

        function deleteAuthor(store, item, error) {
            store.delete(item.id);
        }

        return {
            add: add,
            del: del
        };
    };

    return AuthorRepository;
});
