Accounts.config({
    forbidClientAccountCreation: true
});

Files = new FS.Collection("files", {
    stores: [
        new FS.Store.FileSystem("files", {path: Meteor.settings.uploadDir})
    ]
});

