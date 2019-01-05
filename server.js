require('dotenv').load();

const express = require('express');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const moment = require('moment');
const bcrypt = require('bcrypt');
const fs = require('fs');
const app = express();

// serve client
app.use(express.static('client/build'));

if (!fs.existsSync('.data/database.db')) {
  var db = Database('.data/database.db');
  console.log("No previous database found, creating new database in the .data folder.");

  // Tables
  db.prepare("CREATE TABLE posts (id INT, title CHAR(10), content CHAR(3000), user_id INT, date CHAR(16))").run();
  db.prepare("CREATE TABLE users (id INT, username CHAR(10), password CHAR(16), bio CHAR(300), date CHAR(16))").run();
  db.prepare("CREATE TABLE likes (post_id INT, user_id INT, date CHAR(16))").run();
  db.prepare("CREATE TABLE comments (id INT, post_id INT, content CHAR(3000), user_id INT, date CHAR(16))").run();
  db.prepare("CREATE TABLE replies (id INT, comment_id INT, content CHAR(500), user_id INT, date CHAR(30))").run();

  // Default Entries
  db.prepare("INSERT INTO users VALUES ('1', 'admin', ?, '', ?)").run(bcrypt.hashSync('password', 10), moment().utc().add(0, 's').format());
  db.prepare("INSERT INTO posts VALUES ( 1000000, 'First post!', '{content}', '1', ?)").run(moment().utc().add(1, 's').format());
  db.prepare("INSERT INTO likes VALUES ( 1000000, '1', ?)").run(moment().utc().add(2, 's').format());
  db.prepare("INSERT INTO comments VALUES ( 1, '1000000', '{comment}', '1', ?)").run(moment().utc().add(3, 's').format());
  db.prepare("INSERT INTO replies VALUES ( '1', '1', '{reply}', '2', ?);").run(moment().utc().add(4, 's').format());

  // More entries for delevopers to play around with
  if (process.env.NODE_ENV !== 'production') {
    db.prepare("INSERT INTO users VALUES ('2', 'developer', ?, 'devguy', ?)").run(bcrypt.hashSync('password', 10), moment().utc().add(5, 's').format());
    db.prepare("INSERT INTO posts VALUES ( '1000001', 'Here is another post!', '{more content}', '2', ?)").run(moment().utc().add(6, 's').format());
    db.prepare("INSERT INTO likes VALUES ( '1000001', '2', ?)").run(moment().utc().add(7, 's').format());
    db.prepare("INSERT INTO likes VALUES ( '1000000', '2', ?)").run(moment().utc().add(8, 's').format());
    db.prepare("INSERT INTO comments VALUES ( '2', '1000001', '{a second comment}', '1', ?)").run(moment().utc().add(9, 's').format());
    db.prepare("INSERT INTO comments VALUES ( '3', '1000001', '{a third comment}', '2', ?)").run(moment().utc().add(10, 's').format());
    db.prepare("INSERT INTO replies VALUES ( '2', '1', '{here is another reply}', '1', ?);").run(moment().utc().add(11, 's').format());
    db.prepare("INSERT INTO replies VALUES ( '3', '2', '{third reply, just for you!}', '2', ?);").run(moment().utc().add(12, 's').format());
  }
}

const api = require("./server/api.js");
app.use(express.static('./server/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/v1", api);

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
