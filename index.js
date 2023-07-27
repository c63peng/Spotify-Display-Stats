// // curl - X POST "https://accounts.spotify.com/api/token"
// //     - H "Content-Type: application/x-www-form-urlencoded"
// //         - d "grant_type=client_credentials&client_id=d5a5e3fb3ccc4d7f849de23697cd1393&client_secret=a223ea535b6a484d8f760ef13faf62d7"


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

//Prepare request parameteres in URL-enocded format 
const params = new URLSearchParams();  //works with the query string of a URL to set key-values
params.append('grant_type', 'client_credentials');
params.append('client_id', client_id);
params.append('client_secret', client_secret);

app.listen(PORT, () => {
    //use backticks `  ` instead of single quotes '' to display variables using string interpolation
    console.log(`App is listening on port ${PORT}`);
})

//HTTP POST request using JS fetch api
 fetch (url,{
    method: "POST", 
    headers : {
        "Content-Type" : "application/x-www-form-urlencoded"
    }, 
    body : params
}) 
    .then ( (response) => {
        if (!response.ok){
            throw new Error(`HTTP error! Status ${response.status}`);
        }
        //parse the response JSON and return it 
        return response.json()
    })

    .then(date=>{
        
        console.log(date); 
    })
    .catch (error => {
        console.error('Fetch error: ', error); 
    })

