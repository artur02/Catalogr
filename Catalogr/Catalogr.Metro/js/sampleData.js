define(["config", "Infra/logger", "Infra/database"], function(config, logger, database) {
    "use strict";

    function loadData(evt) {
        
            var books = [];
            var authors = [];
            var foldername = "data";
            var filename = "data.xml";
            var results = "";

            // Open folder.
            Windows.ApplicationModel.Package.current.installedLocation.getFolderAsync(foldername).done(function (folder) {
                // Open file
                folder.getFileAsync(filename).done(function (file) {

                    // Prepare load settings.
                    var loadSettings = new Windows.Data.Xml.Dom.XmlLoadSettings;
                    loadSettings.prohibitDtd = false;
                    loadSettings.resolveExternals = false;

                    // Load XML - Important: We do this before opening the transaction to talk to the database, so the transaction won't expire.
                    Windows.Data.Xml.Dom.XmlDocument.loadFromFileAsync(file, loadSettings).done(function (xmlDoc) {
                        // Load the books
                        var nodes = xmlDoc.selectNodes('//book');
                        var len = nodes.length;
                        for (var i = 0; i < len; i++) {
                            var book = {
                                id: nodes[i].attributes[0].nodeValue,
                                title: nodes[i].attributes[1].nodeValue,
                                authorid: nodes[i].attributes[2].nodeValue
                            };
                            books.push(book);
                        }

                        // Load the authors.
                        nodes = xmlDoc.selectNodes('//author');
                        len = nodes.length;
                        for (i = 0; i < len; i++) {
                            var author = {
                                id: nodes[i].attributes[0].nodeValue,
                                name: nodes[i].attributes[1].nodeValue
                            };
                            authors.push(author);
                        }

                        database.addBooks(books).then(function () {
                            logger.info("Sample data - books stored");
                            return database.addAuthors(authors);
                        }).done(function () {
                                logger.info("Sample data - authors stored");
                            },
                            function(err) {
                                logger.error(err);
                            });
                    });
                });
            });
    }
    
    return {
        load: function startLoadData(dbname, version) {
            return new WinJS.Promise(function(comp, err) {
                database.open(dbname, version).done(function (res) {
                    loadData(res);

                    comp();
                });
            });
        }
    };

});