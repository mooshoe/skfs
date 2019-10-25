const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

var router = express.Router();

var db = new Database('./.data/database.db');

// serve client
router.use("/", express.static('./client/build'));
// lol i am seriously doubting this project
router.use("/static/", express.static("./server/build"));

router.get('/login', function(req, res) {
	if (req.cookies.token != undefined) {
		res.redirect('/');
	}
	else
		res.render('login', { loginError: false, layout: false });
});

router.post('/login', function(req, res) {
	const account = db.prepare("SELECT * FROM users WHERE email = ?").get(req.body.email);
	if (account == undefined || !bcrypt.compareSync(req.body.password, account.password))
		res.render('login', { loginError: true, layout: false });
	else {
		res.cookie("token", jwt.sign({ id: account.id }, process.env.SECRET));
		if (req.query['from'] == 'token')
			res.redirect('/token');
		else
			res.redirect('/');
	}
});

router.get('/token', function(req, res) {
	if (req.cookies.token == undefined)
		res.redirect("/login?from=token");
	else
		res.render('token', { token: req.cookies.token, layout: false });
})

router.get('/logout', function(req, res) {
	req.session = null;
	res.redirect('/');
	
});

router.get("*", function (req, res) {
	res.sendFile("index.html", { root: "./client/build" });
});

module.exports = router;
