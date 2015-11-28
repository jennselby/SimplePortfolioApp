var express         =       require('express');
var multer          =       require('multer');
var app             =       express();

var storage = multer.diskStorage({
  destination: './uploads',
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
})

var upload          =       multer({ storage: storage});

app.use(express.static('uploads'))

app.get('/',function(req,res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/robots.txt', function(req, res) {
    res.end('User-agent: *\nDisallow: /');
});

app.post('/api/upload', upload.array('userFile', 25), function(req,res){
    var numFiles = req.files.length;
    for (var index = 0; index < numFiles; ++index) {
        var file = req.files[index];
        console.log('Uploaded ' + file.originalname + ' to ' + file.path);
    }
    res.end('Files uploaded.');
});

app.listen(3000,function(){
    console.log('Listening on port 3000');
});
