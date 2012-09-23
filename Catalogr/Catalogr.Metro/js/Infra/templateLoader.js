define([], function () {
    function TemplateCache() {
        var templateCache = {};

        function isCached(file) {
            return Object.getOwnPropertyNames(templateCache).some(function (key) {
                return key === file.path;
            });
        }

        function putCached(file, template) {
            templateCache[file.path] = template;
        }

        function getCached(file) {
            return templateCache[file.path];
        }

        return {
            isCached: isCached,
            put: putCached,
            get: getCached
        };
    }

    var cache = new TemplateCache();

    

    function putCached(file) {
        return Windows.Storage.FileIO.readTextAsync(file).then(function(fileContent) {
            var template = Ember.Handlebars.compile(fileContent);
            Ember.TEMPLATES[file.displayName] = template;
            cache.put(file, template);

            return template;
        });
    }

    function load(path) {
        return new WinJS.Promise(function(comp, err) {
            var templates = [];

            Windows.ApplicationModel.Package.current.installedLocation.getFolderAsync(path).done(function(folder) {
                var a = folder.createFileQuery(Windows.Storage.Search.CommonFileQuery.orderByName);
                a.getFilesAsync().done(function(res) {
                    var promises = [];
                    res.forEach(function(file) {
                        var template;
                        if (cache.isCached(file)) {
                            template = cache.get(file);
                            templates.push(template);
                        } else {
                            var promise = putCached(file).then(function(template) {
                                templates.push(template);
                            });

                            promises.push(promise);
                        }

                    });

                    WinJS.Promise.join(promises).done(
                        function () {
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