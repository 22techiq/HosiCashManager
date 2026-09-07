const API_URL="YOUR_GOOGLE_APPS_SCRIPT_URL";

async function apiRequest(data){

const response=await fetch(API_URL,{
method:"POST",
body:JSON.stringify(data)
});

return response.json();

}