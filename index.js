const express = require("express");
const session = require('express-session');
const mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'firstapi',
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

var sess;

app.get("/", (req, res) => {
    sess = req.session;
    res.sendFile("index.html", { root: "public" });
});

app.get("/sessions/:sessionID", (req, res) => {
    sess = req.session;

    const { sessionID } = req.params;
    const { exists } = req.query;

    var result = {};

    if (exists || exists === "") {
        existsInTable("sessions", "id", sessionID, function(exists, err) {
            if (exists) {
                result = {
                    status: "ok",
                    response: {
                        exists: true
                    }
                };
            } else if (err) {
                result = {
                    status: "error",
                    error: err
                };
            } else {
                result = {
                    status: "ok",
                    response: {
                        exists: false
                    }
                }
            }
            res.send(result);
        });
    } else {
        selectFromDB(function(success, resp) {
            if (success) {
                result = {
                    status: "ok",
                    response: {
                        data: resp
                    }
                };
            } else {
                result = {
                    status: "error",
                    error: resp
                };
            }
            res.send(result);
        }, "sessions", "id", sessionID);
    }
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
        } else {
            result = {
                status: "error",
                error: resp
            };
        }

        res.send(result);

    }, "runes");
});

app.get("/runs", (req, res) => {
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
        } else {
            result = {
                status: "error",
                error: resp
            };
        }

        res.send(result);

    }, "runs");

});

app.get("/runes/:rune", (req, res) => {
    sess = req.session;

    const { rune } = req.params;

    if (!rune) rune = "";

    var result = {};

    selectFromDB(function(success, resp) {
        if (success) {
            result = {
                status: "ok",
                response: {
                    data: resp
                }
            };
        } else {
            result = {
                status: "error",
                error: resp
            };
        }

        res.send(result);

    }, "runes", "name", rune);

});

router.get("/", (req, res) => {
    sess = req.session;
    if (sess.email) {
        return res.redirect("/" + sess.token);
    } else {
        res.redirect("/login");
    }
});

app.post("/runes/:rune", (req, res) => {
    sess = req.session;

    const { rune } = req.params;
    const { amount } = req.body;

    if (!rune) rune = "";
    if (!amount) {
        res.status(400).send({
            status: "error",
            message: "Bad request: couldn't find token 'amount' in request body"
        });
        return;
    }

    updateDBRow("runes", "amount", amount, ["name", rune], function() {

    });
});

router.get("/", (req, res) => {
    sess = req.session;
    if (sess.email) {
        return res.redirect("/" + sess.token);
    } else {
        res.redirect("/login");
    }
});


router.post("/login", (req, res) => {
    sess = req.session;
    sess.email = req.body.email;
    sess.token = createToken(32);
    res.redirect(307, "/" + sess.token)
});

router.get("/:token", (req, res) => {
    sess = req.session;
    const { token } = req.params;
    if (token === sess.token) {
        res.send({ test: "test" });
    } else res.status(400);
});

app.use("/", router);

function createToken(length) {
    var result = "";
    var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

function existsInTable(table, row, query, callback) {
    connection.query("SELECT EXISTS(SELECT * FROM " + table + " WHERE " + row + "='" + query + "')", function(err, resp, field) {
        if (err) {
            callback(false, err);
            return;
        }
        if (resp[0][Object.keys(resp[0])[0]] == 0) callback(false);
        else callback(true);
    });
}

function selectFromDB(callback, table, row, query) {
    if (row && query) query = " WHERE " + row + "='" + query + "'";
    else query = "";
    try {
        connection.query("SELECT * FROM " + table + query, function(err, resp, fields) {
            if (err || resp[0] === undefined) {
                callback(false, "This value doesn't exist");
                return;
            }
            callback(true, resp);
        });
    } catch (err) {
        callback(false, err);
        return;
    }
}

function updateDBRow(table, row, value, anchor, callback) {
    connection.query("UPDATE " + table + " SET " + row + "=" + value + " WHERE " + anchor[0] + "='" + anchor[1] + "'");
    console.log("Updated value of \"" + row + "\" to \"" + value + "\" for \"" + anchor[1] + "\" in " + table);
    callback();
}

function insertToDB(table, row, value, callback) {
    connection.query("INSERT INTO " + table + "(" + row + ") VALUES ('" + value + "');");
    console.log("Added value \"" + value + "\" into column \"" + row + "\" in the \"" + table + "\" table");
    callback();
}

function deleteFromDB(table, row, value, callback) {
    connection.query("DELETE FROM " + table + " WHERE " + row + " = '" + value + "' LIMIT 1;");
    console.log("Removed value \"" + value + "\" from column \"" + row + "\" in the \"" + table + "\" table");
    callback();
}

function addColumnInDB(table, rowName, varType, callback) {
    if (!varType) varType = "VARCHAR(255)";
    connection.query("ALTER TABLE " + table + " ADD COLUMN (" + rowName + " " + varType + ");");
    console.log("Created column \"" + rowName + "\" in table \"" + table + "\"");
    callback();
}

function dropColumnInDB(table, rowName, callback) {
    connection.query("ALTER TABLE " + table + " DROP COLUMN " + rowName + ";")
    console.log("Deleted column \"" + rowName + "\" in table \"" + table + "\"");
    callback();
}