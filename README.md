# SimplePortfolioApp
Testing out some code to let students upload their websites to a server.

Don't use this.

## Setup

1. Install node

2. Install PostgreSQL and start the database server

3. Run
```
npm install
node js/setup.js
```
in the directory holding this repository.

4. Set the environment variables 
* **SPA_SESSION_SECRET**: a long random string (error if not set)
* **SPA_PORT**: the port the server should listen on (default 3000)

## Running the Server
Run
```
node server.js
```
in the directory holding this repository.

