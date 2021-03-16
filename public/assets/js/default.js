const apiEndpoint = "http://localhost:8080/";

function isLoggedIn() {
    var isLoggedIn = true;
    if (window.localStorage.getItem("sessionID") === null) return false;
    fetch(apiEndpoint + "sessions/" + window.localStorage.getItem("sessionID") + "?exists").then((body) => {
        body.json().then((res) => {
            res = res.response;
            if (res.exists) isLoggedIn = true;
        });
    });
    return isLoggedIn;
}

function runeCheck(el) {
    if (!isLoggedIn()) return alert("You must log-in first");
    if (el.classList.contains("clicked")) {
        el.classList.remove("clicked");
        fetch(apiEndpoint + "runes/" + el.id).then((body) => {
            body.json().then((res) => {
                res = res.response.data;

                var amount = parseInt(res[0].amount);
                amount--;
                el.children[1].innerHTML = amount;

                var body = { "amount": amount };

                fetch(apiEndpoint + "runes/" + el.id, {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
            });
        });
    } else {
        el.classList.add("clicked")
        fetch(apiEndpoint + "runes/" + el.id).then((body) => {
            body.json().then((res) => {
                res = res.response.data;

                var amount = parseInt(res[0].amount);
                amount++;
                el.children[1].innerHTML = amount;

                var body = { "amount": amount };

                fetch(apiEndpoint + "runes/" + el.id, {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
            });
        });
    }
}

function setRunes() {

    fetch(apiEndpoint + "runes").then((body) => {
        body.json().then((res) => {
            res = res.response.data;

            for (i in res) {
                document.getElementById(res[i].name).children[1].innerHTML = res[i].amount;
            }
        });
    });
}

function updateProgressBars() {
    var colors = {
        "oryx": [
            "rgb(49, 46, 46)",
            "rgb(111,104,104)"
        ],
        "realmclearing": [
            "rgb(184,102,12)",
            "rgb(241,141,31)"
        ],
        "void": [
            "rgb(141,81,255)",
            "rgb(167,120,255)"
        ],
        "cult": [
            "rgb(255,36,41)",
            "rgb(255,85,89)"
        ]
    }
    for (i in document.getElementsByClassName("progressbar")) {
        if (!isNaN(i)) {
            var el = document.getElementsByClassName("progressbar")[i];
            if (el.classList.contains("started")) {
                var percentageArray = el.children[1].innerHTML.split("/")
                var percentage = (parseInt(percentageArray[0]) / parseInt(percentageArray[1])) * 100;
                el.style.background = "linear-gradient(to right, " + colors[el.classList[1]][0] + percentage + "%, " + colors[el.classList[1]][1] + " " + percentage + "%)"
            }
        }
    }
}

//https://discord.com/api/oauth2/authorize?client_id=818916834714845185&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Flogin&response_type=code&scope=identify

function discord(el) {
    switch (el.classList.contains("logged-out")) {
        case true:
            const fragment = new URLSearchParams(window.location.hash.slice(1));

            if (fragment.has("access_token")) {
                const accessToken = fragment.get("access_token");
                const tokenType = fragment.get("token_type");

                fetch('https://discord.com/api/users/@me', {
                        headers: {
                            authorization: `${tokenType} ${accessToken}`
                        }
                    })
                    .then(res => res.json())
                    .then(response => {
                        const { username, discriminator } = response;
                        document.getElementById('info').innerText += ` ${username}#${discriminator}`;
                    })
                    .catch(console.error);

            } else {
                document.getElementById('discord').style.display = 'block';
            }
            break;
        case false:

            break;
        default:
            break;
    }
}