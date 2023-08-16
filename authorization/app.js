const  express = require("express");
const querystring = require("querystring"); 
const cors = require("cors"); 
const cookieParser = require("cookie-parser"); 
const { stat } = require("fs");
const { response } = require("express");

const client_id = 'd5a5e3fb3ccc4d7f849de23697cd1393';
const client_secret = 'a223ea535b6a484d8f760ef13faf62d7'; 
const redirect_uri = 'http://localhost:8888/callback';
const token_endpoint_uri = 'https://accounts.spotify.com/api/token'; 
const PORT = process.env.PORT || 8888;

const generateRandomString = function(length){
    let text = ''; 
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

let stateKey = 'spotify_auth_state'; 

var app = express();

app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser()); 

app.get('/login', function(req, res) {

  let state = generateRandomString(16);
  res.cookie(stateKey, state); 

  const scope = 'user-read-private user-read-email';

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

//spotify automatically reroutes to callback after login
app.get('/callback ', function(req, res){
    
    let code = req.query || null; 
    let state = req.query.state || null; 
    let storedState = req.cookies ? req.cookies[skateKey] : null; 

    if (state === null || state !== storedstate){
        res.redirect( '/#' + 
        querystring.stringify({
            error: 'state_mismatch'
        })); 
    }else{
        res.clearCookie(stateKey); 

        const authOptions = {
            method: 'POST', 
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded', 
                'Authorization' : 'Basic ' + (Buffer,from(client_id + ':' + client_secret).toString('base64'))
            }, 
            body: `code=${code}&redirect_uri=${redirect_uri}&grant_type=authorization_code`,
            json: true
        }; 

        fetch(token_endpoint_uri,authOptions)
            .then((response) =>{
                if (response.status === 200 ){
                    response.json().then((data) =>{
                      let access_token = data.access_token; 
                      let refresh_token = data.refresh_token;  
                      res.redirect('/#' + 
                      querystring.stringify({
                        access_token: access_token, 
                        refresh_token: refresh_token
                      })); 
                    })
                }else{
                    res.redirect('/#' + 
                    querystring.stringify({
                        error : 'invalid_token'
                    })); 
                };
            }); 
    }; 
}); 

//gets new access token with refresh token
app.get('/refresh_token', function(req,res){
    const refresh_token = req.query.refresh_token; 
    const authOptions = {
        method : 'POST', 
        headers: {
            'Authorization': 'Basic ' + (Buffer,from(client_id + ':' + client_secret).toString('base64')), 
            'Content-Type' : 'application/x-www-form-urlencoded', 
        }, 
        body : `grant_type=refresh_token&refresh_token${refresh_token}`
    }; 
    
    fetch(token_endpoint_uri,authOptions)
        .then((response) => {
            if (response.status === 200 ){
                response.json().then((data) =>{
                const access_token = data.access_token; 
                res.send({access_token});
                });
            };
        })
        .catch((error) => {
            console.error(error); 
            res.send(error); 
        }); 
})

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
})