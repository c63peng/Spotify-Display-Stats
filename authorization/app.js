const express = require('express');
const querystring = require('querystring');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fetch = require ("node-fetch"); 

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET; 
const redirect_uri = 'http://localhost:8888/callback';
const PORT = process.env.PORT || 8888; 
const token_endpoint_URI = 'https://accounts.spotify.com/api/token'; 

const generateRandomString = function (length) { // generate random string to use as a state
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

let stateKey = 'spotify_auth_state'; // name of the cookie

let app = express();

app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser());

app.get('/login', function (req, res) { // handle login request from the hyperlink on html page

    let state = generateRandomString(16);
    res.cookie(stateKey, state); // set cookie to travel with request

    // request authorization - automatically redirects to callback read-birthdate  user-library-read
    const scope = 'user-read-private user-read-email user-top-read user-read-playback-state user-top-read';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
});

app.get('/callback', function (req, res) {

    // request refresh and access tokens after comparing states

    let code = req.query.code || null;
    let state = req.query.state || null;
    let storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        res.clearCookie(stateKey); // eat (clear) cookie

        const authOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
            },
            body: `code=${code}&redirect_uri=${redirect_uri}&grant_type=authorization_code`,
            json: true
        };

        fetch(token_endpoint_URI, authOptions) // make request to token endpoint for our tokens
            .then((response) => {
                if (response.status === 200) {
                    response.json().then((data) => {
                        let access_token = data.access_token
                        let refresh_token = data.refresh_token
                        res.redirect('/#' +
                            querystring.stringify({
                                access_token: access_token,
                                refresh_token: refresh_token
                            }));
                    });
                } else {
                    res.redirect('/#' +
                        querystring.stringify({
                            error: 'invalid_token'
                        }));
                };
            })
            .catch(error => {
                console.error(error);
            });
    }
});

app.get('/refresh_token', function (req, res) {

    const refresh_token = req.query.refresh_token;
    const authOptions = {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=refresh_token&refresh_token=${refresh_token}`,
    };

    fetch(token_endpoint_URI, authOptions)
        .then(response => {
            if (response.status === 200) {
                response.json().then((data) => {
                    const access_token = data.access_token;
                    res.send({ access_token });
                });
            };
        })
        .catch(error => {
            console.error(error);
            res.send(error);
        });
});

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
})

