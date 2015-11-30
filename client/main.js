Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
});

Template.fileUpload.events({
    'click .submit': function(event, template) {
        var files = $('.userFile')[0].files;


        for (var i = 0, ln = files.length; i < ln; i++) {
            var fsFile = new FS.File(files[i]);
            fsFile.owner = Meteor.userId();
            Files.insert(fsFile, function (err, fileObj) {
                // Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
                if (err) {
                    // TODO: Display error to user
                }

                // TODO: Display success to user
            });
        };
    }
});
