// Set up postgres helper function
var postgres = require('pg');
var postgresUser = process.env.SPA_DB_USER;
var postgresPswd = process.env.SPA_DB_PSWD;
var postgresUserPswd = ''; 
if (postgresUser && postgresPswd) {
    postgresUserPswd = postgresUser + ':' + postgresPswd + '@';
}
var postgresDB = 'postgres://' + postgresUserPswd + 'localhost/simple_portfolio_app';

pgQuery = function (queryStr, parameters, callback) {
    //this initializes a connection pool
    //it will keep idle connections open for a (configurable) 30 seconds
    //and set a limit of 20 (also configurable)
    pg.connect(postgresDB, function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }   
        client.query(queryStr, parameters, function(err, result) {
            //call `done()` to release the client back to the pool
            done();

            if(err) {
                return console.error('error running query', err);
            }   
            callback(result);
        }); 
    }); 
}

// setup local sign-in strategy
var bcrypt = require('bcryptjs')
var Q = require('q');
exports.localAuth = function (username, password) {
    var deferred = Q.defer();

}
