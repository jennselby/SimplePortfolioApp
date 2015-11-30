// Thanks to the tutorials at
//   https://codeforgeek.com/2014/11/file-uploads-using-node-js/
//   https://orchestrate.io/blog/2014/06/26/build-user-authentication-with-node-js-express-passport-and-orchestrate/
// without which this would have taken a lot longer to get working.

var express = require('express');
var multer = require('multer');
var helmet = require('helmet');
var expressHandlebars = require('express-handlebars');
var morgan = require('morgan');
var winston = require('winston');
var fileStreamRotator = require('file-stream-rotator')
var fs = require('fs')
// TODO: are the parsers and override actually necessary?
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var passport = require('passport');
var localStrategy = require('passport-local');

var helpers = require('./js/helpers.js');
var app = express();

// for now, store all files in the uploads directory under their own name
var storage = multer.diskStorage({
    destination: './uploads',
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
})

var upload = multer({ storage: storage});


// serve the files that are uploaded
app.use(express.static('uploads'))

// set some (hopefully) sane HTTP headers for security reasons
app.use(helmet());

// set up logging
var logDirectory = process.env.SPA_LOG_DIR || (__dirname + '/log');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
var accessLogStream = fileStreamRotator.getStream({
    filename: logDirectory + '/access-%DATE%.log',
    frequency: 'daily',
    verbose: false
})
app.use(morgan('combined', {stream: accessLogStream}));
winston.add(require('winston-daily-rotate-file'), {filename: logDirectory + '/simple_portfolio_app.log'});

// configure Express to work with Passport
// TODO: are the parsers and override actually necessary?
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
var sessionSecret = process.env.SPA_SESSION_SECRET;
if (!sessionSecret) {
    winston.error('No session secret found.');
    process.exit(1);
}
// TODO: according to the session js docs, the settings used by this tutorial are not for production
// (the default store leaks memory)
// move to the commented line below ASAP
//app.use(session({secret: sessionSecret, store: /* TODO */, saveUnitialized: false, resave: false}));
app.use(session({secret: sessionSecret, saveUnitialized: true, resave: true}));
app.use(passport.initialize());
app.use(passport.session());

// move status fields from the session to the response, so that they can be displayed to the user
app.use(function (req, res, next) {
    var err = req.session.error;
    var msg = req.session.notice;
    var success = req.session.success;

    delete req.session.error;
    delete req.session.success;
    delete req.session.notice;

    if (err) {
        res.locals.error = err;
    }
    if (msg) {
        res.locals.notice = msg;
    }
    if (success) {
        res.locals.success = success;
    }

    next();
});

var handlebars = expressHandlebars.create({
    defaultLayout: 'main',
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// home page 
app.get('/', function(req, res){
    res.render('home', {user: req.user});
});

// upload page TODO: don't have this as a separate page
app.get('/upload', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

// signin page TODO: don't have this as a separate page
app.get('/signin', function(req, res){
    res.render('signin');
});

//sends the request through our local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
app.post('/login', passport.authenticate('local-signin', { 
    successRedirect: '/',
    failureRedirect: '/signin'
    })
);

//logs user out of site, deleting them from the session, and returns to homepage
app.get('/logout', function(req, res){
    var name = req.user.username;
    winston.info("LOGOUT " + req.user.username)
    req.logout();
    res.redirect('/');
    req.session.notice = "You have successfully been logged out " + name + "!";
});

// politely request that search engines ignore this site
app.get('/robots.txt', function(req, res) {
    res.end('User-agent: *\nDisallow: /');
});

// handle upload requests
app.post('/api/upload', upload.array('userFile', 25), function(req,res){
    var numFiles = req.files.length;
    for (var index = 0; index < numFiles; ++index) {
        var file = req.files[index];
        winston.info('Uploaded ' + file.originalname + ' to ' + file.path);
    }
    res.end('Files uploaded.');
});

var port = process.env.SPA_PORT || 3000;
app.listen(port, function(){
    console.log('Listening on port ' + port);
});
