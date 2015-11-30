Meteor.startup(function () {
    // create accounts
    if (! Meteor.users.findOne({username: 'test'})) {
        Accounts.createUser({username: 'test', password: 'testy',
                             canUpload: true, isAdmin: true,
                             profile: {name: 'Testy McTesterson'}});
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

        return true;
    }
});



// read from mongo
WebApp.connectHandlers.use('/files', function (req, res, next) {
  

});




// manual uploaded files
var connect = WebAppInternals.NpmModules.connect.module;
WebApp.connectHandlers.use('/files', connect.static('/Users/nim/manual-files'));


