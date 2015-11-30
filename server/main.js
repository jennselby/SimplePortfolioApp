Meteor.startup(function () {
    // create accounts
    if (! Meteor.users.findOne({username: 'test'})) {
        Accounts.createUser({username: 'test', password: 'testy',
                             canUpload: true, isAdmin: true,
                             profile: {name: 'Testy McTesterson'}});
    }
    if (! Meteor.users.findOne({username: 'guest'})) {
        Accounts.createUser({username: 'guest', password: 'guesty',
                             canUpload: false, isAdmin: false,
                             profile: {name: 'Guesty McGuesterson'}});
    }

});


Files.allow({
    'insert': function (userId, doc) {
        if (! userId) {
            return false;
        }
        var user = Meteor.users.findOne(userId);
        if (!user || !user.canUpload) {
            return false;
        }

        if (!doc.userId || doc.userId !== userId) {
            return false;
        }

        return true;
    }
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
