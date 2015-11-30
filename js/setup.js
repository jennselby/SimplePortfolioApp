var postgres = require('pg');

var client = new pg.Client('postgres:;//localhost/template1');
client.connect(function(err) {
    if(err) {
        return console.error('Could not connect to postgres template1', err);
    }
    client.query('CREATE DATABASE simple_portfolio_app', function(err, result) {
        if(err) {
            return console.error('Error creating database simple_portfolio_app', err);
        }
        client.end();

        client = new pg.Client('postgres:;//localhost/simple_portfolio_app');
        client.connect(function (err) {
            if(err) {
                return console.error('Could not connect to postgres simple_portfolio_app', err);
            }
    
            client.query(
                'CREATE TABLE users (username varchar(63), password varchar(255), canUpload boolean)',
                function(err, result) {
                    if (err) {
                        return console.error('Could not create users table');
                    }

                    // Here is where we would create users.
                }
            );
        }
    });
});
