var express = require("express");
var app = express();
const PORT = 8080;

app.use(express.json());

app.listen(
    PORT,
    () => console.log("App live and listening on port " + PORT)
    );

app.get("/dbtest", (req, res) => {
    res.status(200).send({
        status: "ok",
        token: createToken(32)
    });
});

app.post("/dbtest/:sessionid", (req, res) => {
    const { sessionid } = req.params;
    const { token } = req.body;

    if (!token) {
        res.status(400).send({
            status: "error",
            message: "No given token"
        });
    }else {
        res.status(200).send({
            status: "ok",
            response: "This is your token: " + token + " and your sessionID is #" + sessionid
        });
    }
});

function createToken(length) {
    var result = '';
    var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}