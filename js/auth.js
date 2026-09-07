document.getElementById("loginForm").addEventListener("submit",async(e)=>{

e.preventDefault();

const username=document.getElementById("username").value;
const password=document.getElementById("password").value;

const res=await apiRequest({
action:"login",
username,
password
});

if(res.success){

localStorage.setItem("user",JSON.stringify(res.user));
window.location="dashboard.html";

}else{

document.getElementById("loginMessage").innerText="Invalid login.";

}

});