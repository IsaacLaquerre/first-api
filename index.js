const express = require("express");
const session = require('express-session');
const mysql = require('mysql');

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

app.get("/runes", (req, res) => {
    sess = req.session;

    var result = {};

    selectFromDB(function(success, resp) {
        if (success) {
            result = {
                status: "ok",
                response: {
                    data: resp
                }
            };
        }else {
            console.log(resp)
            result = {
                status: "error",
                error: resp
            };
        }

        res.send(result);
    }, "runes");
});

var sess;

router.get("/",(req,res) => {
    sess = req.session;
    if(sess.email) {
        return res.redirect("/" + sess.token);
    }else {
        res.redirect("/login");
    }
});


router.post("/login", (req, res) => {
    sess = req.session;
    sess.email = req.body.email;
    sess.token = createToken(32);
    res.redirect(307, "/" + sess.token)
});

router.get("/:token", (req,res) => {
    sess = req.session;
    const { token } = req.params;
    if (token === sess.token) {
        res.send({test: "test"});
    }else res.status(400);
});

app.use("/", router);

function createToken(length) {
    var result = "";
    var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

function selectFromDB(callback, table, row, query) {
    if (!row) row = "*";
    else if (Array.isArray(row)) row = row.join(", ");
    if (row && query) query = " WHERE name = '" + query + "'";
    else query = "";
    try {
        connection.query("SELECT " + row + " FROM " + table + query, function(err, resp, fields) {
            if (err || resp[0] === undefined) {
                callback(false, err);
                return;
            }
            callback(true, resp);
        });
    }catch (err) {
        callback(false, err);
        return;
    }
    
}

function insertToDB(table, row, value) {
    connection.query("INSERT INTO " + table + "(" + row + ") VALUES ('" + value + "');");
    console.log("Added value \"" + value + "\" into column \"" + row + "\" in the \"" + table + "\" table");
    connection.end();
}

function deleteFromDB(table, row, value) {
    connection.query("DELETE FROM " + table + " WHERE " + row + " = '" + value + "' LIMIT 1;");
    console.log("Removed value \"" + value + "\" from column \"" + row + "\" in the \"" + table + "\" table");
    connection.end();
}

function addColumnInDB(table, rowName, varType) {
    if (!varType) varType = "VARCHAR(255)";
    connection.query("ALTER TABLE " + table + " ADD COLUMN (" + rowName + " " + varType + ");");
    console.log("Created column \"" + rowName + "\" in table \"" + table + "\"");
    connection.end();
}

function dropColumnInDB(table, rowName) {
    connection.query("ALTER TABLE " + table + " DROP COLUMN " + rowName + ";")
    console.log("Deleted column \"" + rowName + "\" in table \"" + table + "\"");
    connection.end();
}