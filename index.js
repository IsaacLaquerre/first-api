const express = require("express");
const session = require('express-session');
const mysql = require('mysql')

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1S44c196**',
  database: 'my_db',
  flags: "-FOUND_ROWS"
})

connection.connect(function(err) {
    if (err) {
      console.error('Error connecting to database: ' + err.stack);
      return;
    }

    addToDB("tasks", "test", "hello");
    removeFromDB("tasks", "test", "hello");
   
    console.log('Connected to database as id ' + connection.threadId);
});

var app = express();
var router = express.Router();

const PORT = 8080;
const SECRET = createToken();

app.use(session({ secret: "test", saveUninitialized: true, resave: true }));
app.use(express.json());
app.use(express.static("public"));

app.listen(
    PORT,
    () => console.log("App live and listening on port " + PORT)
    );

app.get("/", (req, res) => {
    sess = req.session;
    /*if (!sess.email) {
        res.redirect("/login");
    }else {*/
        res.sendFile("index.html", { root: "public" });
    //}
});

app.post("/dbtest/:id", (req, res) => {
    sess = req.session;
    if (!sess.email) {
        res.redirect("/login");
    }else {
        res.redirect("/");
    }
});

var sess;

router.get("/",(req,res) => {
    sess = req.session;
    if(sess.email) {
        return res.redirect("/dbtest/" + sess.token);
    }else {
        res.redirect("/login");
    }
});


router.post("/login", (req, res) => {
    sess = req.session;
    sess.email = req.body.email;
    sess.token = createToken(32);
    res.redirect(307, "/dbtest/" + sess.token)
});

app.use("/", router);

function createToken(length) {
    var result = "";
    var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

function addToDB(table, row, value) {
    connection.query("INSERT INTO " + table + "(" + row + ") VALUES ('" + value + "')");
    console.log("Added value \"" + values[i] + "\" into column \"" + rows[i] + "\" in the \"" + table + "\" table");
}

function removeFromDB(table, row, value) {
    connection.query("DELETE FROM " + table + " WHERE " + row + " = '" + value + "' LIMIT 1");
    console.log("Removed value \"" + value + "\" from column \"" + row + "\" in the \"" + table + "\" table");
}