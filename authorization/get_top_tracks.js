//importing fetch 
const  fetch  = require ("node-fetch"); 
//server set up 
//importing express (bringing in the express framework and storing it in a constant )
const  express = require("express");
//initializing the express framework and saving it to another constant
const app = express();
//saving the port of the server into a constant, checks whether the envir var to see if a PORT is defined otherwise it will use PORT 8080
const PORT = process.env.PORT || 8080; 

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const token_endpoint_URI = 'https://accounts.spotify.com/api/token'; 

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
})

//gets access token needed in authorizations of GET requests 
async function get_access_token(){
    const params = new URLSearchParams();  //works with the query string of a URL to set key-values
    params.append('grant_type', 'client_credentials');
    params.append('client_id', client_id);
    params.append('client_secret', client_secret);

    const response = await fetch (token_endpoint_URI, {
        method: "POST", 
        headers: {
            "Content-Type" : "application/x-www-form-urlencoded", 
        }, 
        body: params,
    })
    
    //parsings the data recieved and returns access token
    const results = await response.text();
    const token = JSON.parse(results).access_token; 
    return token;
}

async function fetch_web_Api(endpoint, method, token, body) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    // https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=5
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
    body:JSON.stringify(body)
  });
  if (res.ok) {
    return await res.text(); // Parse the response as JSON
  } else {
    throw new Error(`Request failed with status: ${res.status}`);
  }

}

async function get_top_tracks(token){
    // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
    return (await fetch_web_Api(
      'v1/me/top/tracks?time_range=short_term&limit=5', 'GET', token
    )).items;
  }

async function _main(){
    const access_token = await get_access_token();
    console.log("access token: " + access_token);  

    const top_tracks = await get_top_tracks(access_token); 
    console.log("top tracks: " + top_tracks);  

    // console.log(
    //     top_tracks?.map(
    //       ({name, artists}) =>
    //         `${name} by ${artists.map(artist => artist.name).join(', ')}`
    //     )
    // )
}

// _main(); 


export default {get_access_token, fetch_web_Api, get_top_tracks}; 