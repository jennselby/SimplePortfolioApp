Meteor.subscribe('userData');

Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
});

Accounts.onLogin(function () {
    document.cookie = 'simple-portfolio-server=' + Accounts._storedLoginToken() + '; path=/';
    Session.set('message', '');
    Session.set('results', []);
});

Tracker.autorun(function () {
    if (Meteor.user() && Meteor.user().grade) {
        // the main content depends on the grade of the user
        Session.set('contentTemplate', Meteor.user().grade.replace(/ /g, ''));
        // teachers can switch between views, so they get a subview
        if (Meteor.user().grade === 'Teacher') {
            Session.set('subContentTemplate', 'FileIndex');
        }
    }
});

Template.fileUpload.events({
    'click .submit': function(event, template) {
        var user = Meteor.user();
        if (!user || !user.canUpload) {
            return;
        }

        var ownerId = Meteor.userId();
        var ownerUsername = user.username;
        // admins do not have their own files. They must specify the owner of the file.
        if (user.isAdmin) {
            ownerUsername = $('#ownerUsername').val();
            if (!ownerUsername) {
                Session.set('message', 'Please specify an owner of the file.');
                return;
            }
            ownerId = Meteor.users.findOne({'username': ownerUsername})._id;
            if (!ownerId) {
                Session.set('message', 'User ' + ownerUsername + ' not found.');
                return;
            }
        }

        var files = $('.userFile')[0].files;

        Session.set('message', 'Uploading');
        Session.set('results', []);
        var messages = [];
        for (var index = 0, numFiles = files.length; index < numFiles; index++) {
            var fsFile = new FS.File(files[index]);
            fsFile.owner = ownerId;
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
                    result.link = Meteor.absoluteUrl() + ownerUsername + '/' + fileObj.name();
                    result.filename = fileObj.name();
                    if (result.filename.endsWith('.html')) {
                        Meteor.call('addHtmlFile', fileObj.name(), ownerId);
                    }
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

Template.fileUpload.helpers({
    'users': function () {
        if (!Meteor.user().isAdmin) {
            return [];
        }

        return Meteor.users.find({'isAdmin': false, 'canUpload': true},
                                {fields: {'profile': 1, 'username': 1},
                                sort: {'profile.name': 1}}).fetch();
    }
})


Template.uploadedStatus.helpers({
    'message': function () { return Session.get('message'); },
    'results': function () { return Session.get('results'); }
});

Template.content.helpers({
    'contentTemplate': function () { return Session.get('contentTemplate'); },
});

Template.content.events({
    'click #5thGradeLink': function() {
        Session.set('subContentTemplate', '5thGrade');
    },
    'click #8thGradeLink': function() {
        Session.set('subContentTemplate', 'EigthGrade');
    },
    'click #FileIndexLink': function() {
        Session.set('subContentTemplate', 'FileIndex');
    }
});

Template.Teacher.helpers({
    'subContentTemplate': function () { return Session.get('subContentTemplate'); },
});

Template.EigthGrade.helpers({
    'students': function () {
        var students = [];
        var users = Meteor.users.find({'isAdmin': false, 'canUpload': true, 'grade': '8th Grade'},
                                      {fields: {'profile': 1, 'htmlFiles': 1, 'username': 1},
                                       sort: {'profile.name': 1}}).fetch();
        _.each(users, function (user) {
            var student = {'userName': user.profile.name};
            // for 8th grade students, only link to the index.html file
            var indexIndex = user.htmlFiles.indexOf('index.html');
            if (indexIndex != -1) {
                student.link = Meteor.absoluteUrl() + user.username + '/' + htmlFilename;
            }
            students.push(student);
        });
        return students;
    }
});

Template.FileIndex.helpers({
    'grades': function () {
        var grades = [];
        var users = Meteor.users.find({'isAdmin': false, 'canUpload': true},
                                      {fields: {'profile': 1, 'htmlFiles': 1, 'grade': 1, 'username': 1},
                                       sort: {'grade': 1, 'profile.name': 1}}).fetch();
        var currentGrade = '';
        var currentUsers = [];
        _.each(users, function (user) {
            if (user.grade != currentGrade) {
                if (currentGrade != '') {
                    grades.push({'gradeName': currentGrade, 'users': currentUsers});
                }
                currentGrade = user.grade;
                currentUsers = [];
            }
            htmlFiles = [];
            _.each(user.htmlFiles, function(htmlFilename) {
                htmlFiles.push({'link': Meteor.absoluteUrl() + user.username + '/' + htmlFilename,
                                'filename': htmlFilename});
            });
            currentUsers.push({'userName': user.profile.name, 'htmlFiles': htmlFiles});
        });
        if (!_.isEmpty(currentUsers)) {
            grades.push({'gradeName': currentGrade, 'users': currentUsers});
        }
        return grades;
    }
});
