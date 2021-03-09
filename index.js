const express = require("express");
const session = require('express-session');

var app = express();
var router = express.Router();

const PORT = 8080;
const SECRET = createToken();

app.use(session({ secret: "test", saveUninitialized: true, resave: true }));
app.use(express.json());

app.listen(
    PORT,
    () => console.log("App live and listening on port " + PORT)
    );

app.get("/dbtest", (req, res) => {
    sess = req.session;
    if (!sess.email) {
        res.redirect("/login");
    }else {
        res.status(200).send({
            status: "ok",
        });
    }
});

app.post("/dbtest/:id", (req, res) => {
    sess = req.session;
    if (!sess.email) {
        res.redirect("/login");
    }else {
        res.status(200).send({
            status: "ok",
            response: "Your token is: " + sess.token
        });
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