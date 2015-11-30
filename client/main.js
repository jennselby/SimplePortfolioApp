Accounts.ui.config({
  passwordSignupFields: 'USERNAME_ONLY'
});

Template.fileUpload.events({
  'click .submit': function(event, template) {
    var files = $('.userFile')[0].files;
    console.log("starting upload", files);


    for (var i = 0, ln = files.length; i < ln; i++) {
      var file = files[i];
      console.log("a file", file);
      Files.insert(file, function (err, fileObj) {
        // Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
        console.log("Upload done", err);
      });
    };
  }
});
