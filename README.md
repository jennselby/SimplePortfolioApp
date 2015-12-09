# SimplePortfolioApp
Testing out some code to let students upload their websites to a server.

Don't use this.

## Setup

1. Install Meteor
```
curl https://install.meteor.com/ | sh
```
Note: Linux & OSX only; see [Meteor's install instructions](https://www.meteor.com/install) for Windows

2. Create settings.json file

```
{
    "uploadDir": "/path/to/uploaded/files"
}
```
3. Create a file of all users that should be created with the following format
```
defaultPassword = "somePassword";

initialUsers = [
    {"name": "Student A.", "username": "stuabcd", "grade": "6th Grade"},
    {"name": "Student W.", "username": "stuwxyz", "grade": "7th Grade"},
];
```


## Running the Server
Run
```
meteor --settings settings.json
```
in the directory holding this repository.
