Meteor.startup(function () {
    if (! Meteor.settings.uploadDir) {
        console.log('Please set the upload directory in your settings file.');
        process.exit(1);
    }

    // create accounts
    if (typeof initialUsers !== "undefined" && typeof defaultPassword !== "undefined") {
        _.each(initialUsers, function (user) {
            if (! Meteor.users.findOne({username: user.username})) {
                // Create the user
                var id = Accounts.createUser({username: user.username, password: defaultPassword,
                                              profile: {name: user.name}});

                // By default, users can upload and aren't admins, but this can be overridden in
                // the initialUsers object
                var additional = {canUpload: true, isAdmin: false, grade: user.grade};
                if (user.canUpload !== undefined) {
                    additional.canUpload = user.canUpload;
                }
                if (user.isAdmin !== undefined) {
                    additional.isAdmin = user.isAdmin;
                }
                if (additional.canUpload) {
                    additional.htmlFiles = [];
                }
                // add the additional fields into the database
                Meteor.users.update({_id: id}, {$set : additional});
            }
        });
    }

});

Meteor.publish('userData', function () {
    if (this.userId) {
        return Meteor.users.find({},
                                 {fields: {'username': 1, 'grade': 1, 'profile': 1,
                                           'isAdmin': 1, 'canUpload': 1,
                                           'htmlFiles': 1}});
    } else {
        this.ready();
    }
});

function authorizeFilesChange(userId, doc) {
    if (! userId) {
        return false;
    }
    var user = Meteor.users.findOne(userId);
    if (!user || !user.canUpload) {
        return false;
    }

    if (!doc.owner || (doc.owner !== userId && !user.isAdmin)) {
        return false;
    }

    return true;
}

Files.allow({
    'insert': authorizeFilesChange,
    'update': authorizeFilesChange,
});



// read from mongo
WebApp.connectHandlers.use(function (req, res, next) {

    // gross way of getting our cookie value
    var match = /simple-portfolio-server=([-_A-Za-z0-9]+)/.exec(req.headers.cookie);
    if (match) {
        var hashedToken = Accounts._hashLoginToken(match[1]);
        var loggedInUser = Meteor.users.findOne({'services.resume.loginTokens.hashedToken': hashedToken});
        if (loggedInUser) {

            // looking for URLs of form /username/filename
            var urlParts = req.url.split('/');
            if (urlParts.length === 3) {
                var username = urlParts[1];
                var filename = urlParts[2];
                var user = Meteor.users.findOne({username: username})
                if (user) {
                    var files = Files.find({owner: user._id, "original.name": filename}).fetch();
                    // the user might have uploaded multiple versions. Use the latest one
                    files = _.sortBy(files, function(item) {return -item.uploadedAt});
                    if (files.length > 0) {
                        var filepath = Npm.require("path").join(Meteor.settings.uploadDir,
                                                                files[0].copies.files.key);
                        Meteor.npmRequire("send")(req, filepath).pipe(res);
                        return;
                    }
                }
            }
        }
    }

    next();

});

Meteor.methods({
    addHtmlFile: function (fileName, ownerId) {
        if (Meteor.userId() && Meteor.user().canUpload && (Meteor.userId() == ownerId || Meteor.user().isAdmin)) {
            Meteor.users.update({_id:ownerId}, {$addToSet:{'htmlFiles': fileName}})
        }
    }
});
