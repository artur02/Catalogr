define([], function() {
    function load(foldername) {
        // Open folder.
        Windows.ApplicationModel.Package.current.installedLocation.getFolderAsync(foldername).done(function(folder) {
            // Open file
        });
    }

    return {
        load: load
    };
});