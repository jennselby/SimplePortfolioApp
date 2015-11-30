Meteor.subscribe('userData');

Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
});

Accounts.onLogin(function () {
    document.cookie = 'simple-portfolio-server=' + Accounts._storedLoginToken() + '; path=/';

});

Template.fileUpload.events({
    'click .submit': function(event, template) {
        if (!Meteor.user()) {
            return;
        }

        var files = $('.userFile')[0].files;

        Session.set('message', 'Uploading');
        Session.set('results', []);
        var messages = [];
        for (var index = 0, numFiles = files.length; index < numFiles; index++) {
            var fsFile = new FS.File(files[index]);
            fsFile.owner = Meteor.userId();
            Files.insert(fsFile, function (err, fileObj) {
                // Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
                var result = {};
                if (err) {
                    result.fileMessage = 'Error uploading file' + err;
                    result.link = '';
                    result.filename = '';
                }
                else {
                    result.fileMessage = 'Uploaded file';
                    result.link = Meteor.absoluteUrl() + Meteor.user().username + '/' + fileObj.name();
                    result.filename = fileObj.name();
                }
                var results = Session.get('results').concat(result);
                Session.set('results', results);
                if (results.length === numFiles) {
                    Session.set('message', 'Done');
                }
            });
        };
    }
});

Template.uploadedStatus.helpers({
    'message': function () { return Session.get('message'); },
    'results': function () { return Session.get('results'); }
});
