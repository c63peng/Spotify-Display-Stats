//importing fetch 
const  fetch  = require ("node-fetch");  
//importing express (bringing in the express framework and storing it in a constant )
const  express = require("express");

//initializing the express framework and saving it to another constant
const app = express();
//saving the port of the server into a constant, checks whether the envir var to see if a PORT is defined otherwise it will use PORT 8080
const PORT = process.env.PORT || 8080; 

//variable consts
const client_id = 'd5a5e3fb3ccc4d7f849de23697cd1393';
const client_secret = 'a223ea535b6a484d8f760ef13faf62d7';
const url = 'https://accounts.spotify.com/api/token'; 

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
})

//HTTP POST request using JS fetch api
// curl - X POST "https://accounts.spotify.com/api/token"
//      - H "Content-Type: application/x-www-form-urlencoded"
//      - d "grant_type=client_credentials&client_id=d5a5e3fb3ccc4d7f849de23697cd1393&client_secret=a223ea535b6a484d8f760ef13faf62d7"

async function get_token(){
        //Prepare request parameteres in URL-enocded format 
  const params = new URLSearchParams();  //works with the query string of a URL to set key-values
  params.append('grant_type', 'client_credentials');
  params.append('client_id', client_id);
  params.append('client_secret', client_secret);

  const result = await fetch (url,{
  method: "POST", 
  headers : {
       'Content-Type' : 'application/x-www-form-urlencoded'
  }, 
  body : params
  })

  console.log("Response Status: ", result.status); 
  const bodyText = await result.text(); //read the body text 
  console.log("Response text: ", await bodyText); 
 
  try {
    const token_response = JSON.parse(bodyText); // Parse the JSON body
    const access_token = token_response.access_token;
    console.log("get_token : " + access_token); 
    return access_token;
  } catch (error) {
    throw new Error("Error parsing token response: " + error.message);
  }
}

async function fetchWebApi(endpoint, method, token, body) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
    body:JSON.stringify(body)
  });
  return await res.json();
}

async function getTopTracks(token){
  // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
  return (await fetchWebApi(
    'v1/me/top/tracks?time_range=short_term&limit=5', 'GET', token
  )).items;
}

async function main() {
  try {
    var token = await get_token(); //gets access token
    const topTracks = await getTopTracks(token);

    console.log(
      topTracks?.map(
      ({ name, artists }) =>
      `${name} by ${artists.map(artist => artist.name).join(', ')}`
      )
    );
    // console.log ("out of function: " + token); 
  }
  catch(error){
    console.error("Error: " + error)
  }
}

main(); 