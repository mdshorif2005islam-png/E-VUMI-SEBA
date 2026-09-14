const $ = id => document.getElementById(id);

function toggleMenu(){
  $("navMenu").classList.toggle("open");
}

document.querySelectorAll("nav a").forEach(link=>{
  link.addEventListener("click",()=> $("navMenu").classList.remove("open"));
});

function selectService(serviceName){
  $("service").value = serviceName;
  document.querySelector("#request").scrollIntoView({behavior:"smooth"});
}

function createRequestId(){
  return "EVS-" + Math.floor(100000 + Math.random()*900000);
}

$("requestForm").addEventListener("submit", function(e){
  e.preventDefault();

  const id = createRequestId();
  const data = {
    id,
    name: $("name").value.trim(),
    phone: $("phone").value.trim(),
    email: $("email").value.trim(),
    service: $("service").value,
    details: $("details").value.trim(),
    document: $("document").files[0]?.name || "",
    status: "আবেদন গ্রহণ করা হয়েছে",
    date: new Date().toLocaleString("bn-BD")
  };

  const requests = JSON.parse(localStorage.getItem("evumiRequests") || "[]");
  requests.push(data);
  localStorage.setItem("evumiRequests", JSON.stringify(requests));
  localStorage.setItem("lastRequestId", id);

  $("formMessage").textContent = `✅ আবেদন সফল হয়েছে। আপনার Request ID: ${id}`;
  $("formMessage").style.color = "#087f5b";
  this.reset();
  $("statusResult").innerHTML = `<div class="result"><strong>Request ID:</strong> ${id}<br>স্ট্যাটাস: আবেদন গ্রহণ করা হয়েছে</div>`;
  document.querySelector("#status").scrollIntoView({behavior:"smooth"});
});

$("statusForm").addEventListener("submit", function(e){
  e.preventDefault();

  const id = $("requestId").value.trim().toUpperCase();
  const requests = JSON.parse(localStorage.getItem("evumiRequests") || "[]");
  const found = requests.find(r => r.id === id);

  if(found){
    $("statusResult").innerHTML = `
      <div class="result">
        <strong>${found.id}</strong><br>
        সেবা: ${found.service}<br>
        আবেদনকারী: ${found.name}<br>
        স্ট্যাটাস: <strong>${found.status}</strong><br>
        আবেদন: ${found.date}
      </div>`;
  }else{
    $("statusResult").innerHTML = `<div class="result">❌ এই Request ID পাওয়া যায়নি। সঠিক ID লিখুন।</div>`;
  }
});

$("year").textContent = new Date().getFullYear();
