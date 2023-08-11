//importing fetch 
const  fetch  = require ("node-fetch"); 
//server set up 
//importing express (bringing in the express framework and storing it in a constant )
const  express = require("express");
const { response } = require("express");
const { json } = require("body-parser");

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

const get_token = async (endpoint, method, body) => {
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
    //; application/json
    body : params
    })

    console.log("Response Status: ", result.status); 

    const bodyText = await result.text(); //read the body text 
    // console.log("Response text: ", await result.text()); 
    console.log("Response text: ", await bodyText); 
    // const token_repsonse = await bodyText.json();
    // const access_token = token_repsonse.access_token; 
    // // console.log("Access token:", access_token);
    // return access_token;
    try {
        const token_response = JSON.parse(bodyText); // Parse the JSON body
        const access_token = token_response.access_token;

        const res = await fetch (`https://api.spotify.com/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        method,
        body:JSON.stringify(body)
        });

        return await res.json();
        // return access_token;
    } catch (error) {
        throw new Error("Error parsing token response: " + error.message);
    }
}


const userurl = 'https://api.spotify.com/v1/me/top/artists';

// const get_data = async(access_token) => {

//     // console.log("Access token in get_data(): " + access_token); 
//     const response = await fetch (userurl, {
//         method: 'GET', 
//         headers: {'Authorization' : 'Bearer ' + access_token,}, 
//     });

//     if (response.status === 401){
//         throw new Error("Missing token"); 
//     }

//     let data = await response.json()

//     console.log(data);
     
//     return data; 
// }

// const fetch_web_api = async(endpoint, method, body ) => {
//     const res = await fetch (`https://api.spotify.com/${endpoint}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         method,
//         body:JSON.stringify(body)
//     });
//     return await res.json();
// }

async function getTopTracks(){
 // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
    const tracks = await get_token('v1/me/top/tracks?time_range=short_term&limit=5', 'GET')
    return tracks.items;
}
   
  
const topTracks = async () =>{
    const tracks = await getTopTracks();
    // await getTopTracks() }; 

    console.log(
        topTracks?.map(({name, artists}) =>
            `${name} by ${artists.map(artist => artist.name).join(', ')}`
        )
    );
};    

topTracks();
// topTracks();
  
// get_token()
//     .then((access_token) => get_data(access_token))
//     .catch((error) => console.error("Error getting data: ",error )); 

//     curl --request GET \
//   --url https://api.spotify.com/v1/me/top/artists \
//   --header 'Authorization: Bearer 1POdFZRZbvb...qqillRxMr2z'




