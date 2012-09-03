define([], function () {
    var templateCache = { };

    function isCached(file) {
        
    }

    function getCached(file) {
        
    }

    function putCached(file) {
        return new WinJS.Promise(function(comp, err) {

            return Windows.Storage.FileIO.readTextAsync(file).then(function(fileContent) {
                try {
                    var template = Ember.Handlebars.compile(fileContent);
                    Ember.TEMPLATES[file.displayName] = template;
                    comp(template);
                } catch(e) {
                    err(e);
                } 
            });
        });
    }

    function load(path) {
        return new WinJS.Promise(function(comp, err) {
            var templates = [];
        
            // Open folder.
            Windows.ApplicationModel.Package.current.installedLocation.getFolderAsync(path).done(function(folder) {
                var a = folder.createFileQuery(Windows.Storage.Search.CommonFileQuery.orderByName);
                a.getFilesAsync().done(function (res) {
                    var promises = [];
                    res.forEach(function (file) {
                        var template;
                        if(isCached(file)) {
                            template = getCached(file);
                            templates.push(template);
                        } else {
                            var promise = putCached(file).then(function (template) {
                                templates.push(template);
                            });

                            promises.push(promise);
                        }
                    
                    });

                    WinJS.Promise.join(promises).done(function() {
                        comp(templates);
                    },
                        function(e) {
                            err(e);
                        });
                });
            });
        });

    }

    return {
        load: load
    };
});