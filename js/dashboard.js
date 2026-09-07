const user=JSON.parse(localStorage.getItem("user"));

if(!user){
window.location="index.html";
}

document.getElementById("userRole").innerText=user.role;

if(user.role==="admin"){
document.getElementById("downloadPDF").style.display="block";
}

async function loadDashboard(){

const res=await apiRequest({
action:"dashboard"
});

document.getElementById("todayTotal").innerText=res.today;
document.getElementById("monthTotal").innerText=res.month;
document.getElementById("yearTotal").innerText=res.year;
document.getElementById("transactions").innerText=res.transactions;

const body=document.getElementById("tableBody");
body.innerHTML="";

res.collections.forEach(r=>{

body.innerHTML+=`
<tr>
<td>${r.date}</td>
<td>${r.receipt}</td>
<td>${r.service}</td>
<td>KSh ${r.amount}</td>
<td>${r.cashier}</td>
</tr>
`;

});

}

document.getElementById("collectionForm").addEventListener("submit",async(e)=>{

e.preventDefault();

const data={
action:"addCollection",
patient:patient.value,
receipt:receipt.value,
service:service.value,
amount:amount.value,
payment:payment.value,
notes:notes.value,
cashier:user.name
};

const res=await apiRequest(data);

if(res.success){

alert("Collection Saved.");

collectionForm.reset();

loadDashboard();

}

});

async function loadReport(){

const filter=document.getElementById("filterType").value;

const from=document.getElementById("fromDate").value;

const to=document.getElementById("toDate").value;

const res=await apiRequest({
action:"getCollections",
filter,
from,
to
});

const body=document.getElementById("tableBody");
body.innerHTML="";

res.collections.forEach(r=>{

body.innerHTML+=`
<tr>
<td>${r.date}</td>
<td>${r.receipt}</td>
<td>${r.service}</td>
<td>KSh ${r.amount}</td>
<td>${r.cashier}</td>
</tr>
`;

});

}

function logout(){

localStorage.clear();

window.location="index.html";

}

loadDashboard();