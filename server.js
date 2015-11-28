var express         =       require("express");
var multer          =       require('multer');
var app             =       express();
var upload          =       multer({ dest: './uploads/'});

app.use(multer({ dest: './uploads/',
    rename: function (fieldname, filename) {
        return filename;
    },
    onFileUploadStart: function (file) {
        console.log('Upload of ' + file.originalname + ' is starting ...');
    },
    onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path)
    }
}));

app.use(express.static('uploads'))

app.get('/',function(req,res){
  res.sendFile(__dirname + "/index.html");
});

app.get('/robots.txt', function(req, res) {
    res.end('User-agent: *\nDisallow: /');
});

app.post('/api/upload',function(req,res){
    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading.");
        }
        res.end("Upload finished");
    });
});

app.listen(3000,function(){
    console.log("Listening on port 3000");
});
