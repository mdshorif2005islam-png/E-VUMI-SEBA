/* ============================================
   E-Vumi Seba - script.js
   Google Sheets Backend সংযুক্ত ✅
   ============================================ */

// 🔗 আপনার Google Apps Script Web App URL
const API_URL = 'https://script.google.com/macros/s/AKfycbyRjXrb020eAZkE8cS6pcSbqzTzyEPYBxjTzbR9E_GZ1YEMILRwun53gRTirKvjnMFMEg/exec';

const $ = id => document.getElementById(id);

// ====== Menu Toggle ======
function toggleMenu(){
  $("navMenu").classList.toggle("open");
}

document.querySelectorAll("nav a").forEach(link=>{
  link.addEventListener("click",()=> $("navMenu").classList.remove("open"));
});

// ====== Service Card Click → Form-এ অটো সেট ======
function selectService(serviceName){
  $("service").value = serviceName;
  document.querySelector("#request").scrollIntoView({behavior:"smooth"});
}

// ====== Request ID Generator ======
function createRequestId(){
  return "EVS-" + Math.floor(100000 + Math.random()*900000);
}

// ====== Request Form Submit ======
$("requestForm").addEventListener("submit", async function(e){
  e.preventDefault();

  const submitBtn = this.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ পাঠানো হচ্ছে...';
  $("formMessage").textContent = '';

  const id = createRequestId();
  const data = {
    id,
    name: $("name").value.trim(),
    phone: $("phone").value.trim(),
    email: $("email").value.trim(),
    service: $("service").value,
    details: $("details").value.trim(),
    document: $("document").files[0]?.name || "",
    status: "আবেদন গ্রহণ করা হয়েছে",
    date: new Date().toLocaleString("bn-BD")
  };

  try {
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',   // ⚠️ Google Apps Script-এর জন্য জরুরি
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(data)
    });

    // ✅ ব্যাকআপ হিসেবে localStorage-এও রাখুন
    const local = JSON.parse(localStorage.getItem("evumiRequests") || "[]");
    local.push(data);
    localStorage.setItem("evumiRequests", JSON.stringify(local));
    localStorage.setItem("lastRequestId", id);

    // ✅ সফল মেসেজ
    $("formMessage").textContent = `✅ আবেদন সফল হয়েছে। আপনার Request ID: ${id}`;
    $("formMessage").style.color = "#087f5b";
    this.reset();

    // ✅ Status সেকশনে রেজাল্ট দেখান
    $("statusResult").innerHTML = `
      <div class="result">
        <strong>Request ID:</strong> ${id}<br>
        স্ট্যাটাস: আবেদন গ্রহণ করা হয়েছে
      </div>`;

    setTimeout(() => {
      document.querySelector("#status").scrollIntoView({behavior:"smooth"});
    }, 500);

  } catch (err) {
    $("formMessage").textContent = `❌ সমস্যা হয়েছে। আবার চেষ্টা করুন।`;
    $("formMessage").style.color = "#c92a2a";
    console.error(err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

// ====== Status Check ======
$("statusForm").addEventListener("submit", async function(e){
  e.preventDefault();

  const id = $("requestId").value.trim().toUpperCase();
  $("statusResult").innerHTML = '<div class="result">⏳ খোঁজা হচ্ছে...</div>';

  try {
    // ✅ Google Sheet থেকে সব ডেটা আনুন
    const res = await fetch(API_URL);
    const all = await res.json();

    const found = all.find(r => String(r.ID).toUpperCase() === id);

    if (found) {
      $("statusResult").innerHTML = `
        <div class="result">
          <strong>${found.ID}</strong><br>
          সেবা: ${found.Service}<br>
          আবেদনকারী: ${found.Name}<br>
          স্ট্যাটাস: <strong>${found.Status}</strong><br>
          আবেদন: ${found.Date}
        </div>`;
    } else {
      $("statusResult").innerHTML = `
        <div class="result">❌ এই Request ID পাওয়া যায়নি। সঠিক ID লিখুন।</div>`;
    }
  } catch (err) {
    // নেটওয়ার্ক সমস্যা হলে লোকাল ব্যাকআপ চেক করুন
    const local = JSON.parse(localStorage.getItem("evumiRequests") || "[]");
    const found = local.find(r => r.id.toUpperCase() === id);

    if (found) {
      $("statusResult").innerHTML = `
        <div class="result">
          <strong>${found.id}</strong><br>
          সেবা: ${found.service}<br>
          আবেদনকারী: ${found.name}<br>
          স্ট্যাটাস: <strong>${found.status}</strong><br>
          আবেদন: ${found.date}
        </div>`;
    } else {
      $("statusResult").innerHTML = `
        <div class="result">❌ সার্ভারে সংযোগ করা যাচ্ছে না। পরে চেষ্টা করুন।</div>`;
    }
  }
});

// ====== Year in Footer ======
$("year").textContent = new Date().getFullYear();