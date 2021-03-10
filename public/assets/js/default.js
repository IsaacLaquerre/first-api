function runeCheck(el) {
    if (el.classList.contains("clicked")) {
        el.classList.remove("clicked")
        if (window.localStorage.getItem(el.children[1].id) == null) {
            window.localStorage.setItem(el.children[1].id, 0)
            el.children[1].innerHTML = 0;
        }else {
            var amount = parseInt(window.localStorage.getItem(el.children[1].id));
            console.log(el.children[1].id + ": " + amount)
            amount--;
            el.children[1].innerHTML = amount;
            window.localStorage.setItem(el.children[1].id, amount);
        }
    }else {
        el.classList.add("clicked")
        if (window.localStorage.getItem(el.children[1].id) == null) {
            window.localStorage.setItem(el.children[1].id, 1)
            el.children[1].innerHTML = 1;
        }else {
            var amount = parseInt(window.localStorage.getItem(el.children[1].id));
            amount++;
            el.children[1].innerHTML = amount;
            window.localStorage.setItem(el.children[1].id, amount);
        }
    }
}

function setRunes() {
    for (i in document.getElementsByClassName("runeCheckButton")) {
        if (document.getElementsByClassName("runeCheckButton")[i] === undefined || document.getElementsByClassName("runeCheckButton")[i].children === undefined) return;
        if (window.localStorage.getItem(document.getElementsByClassName("runeCheckButton")[i].children[1].id) === null) {
            window.localStorage.setItem(document.getElementsByClassName("runeCheckButton")[i].children[1].id, 0)
        }
        document.getElementsByClassName("runeCheckButton")[i].children[1].innerHTML = window.localStorage.getItem(document.getElementsByClassName("runeCheckButton")[i].children[1].id)
    }
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
    switch(el.classList.contains("logged-out")) {
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

			}
			else {
				document.getElementById('discord').style.display = 'block';
			}
        break;
        case false:

        break;
        default:
        break;
    }
}