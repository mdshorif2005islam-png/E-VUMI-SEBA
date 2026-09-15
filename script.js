/* ============================================
   E-Vumi Seba - script.js
   Google Sheets Backend সংযুক্ত ✅
   ============================================ */

// 🔗 আপনার Google Apps Script Web App URL
const API_URL = 'https://script.google.com/macros/s/AKfycbyRjXrb020eAZkE8cS6pcSbqzTzyEPYBxjTzbR9E_GZ1YEMILRwun53gRTirKvjnMFMEg/exec';

const $ = id => document.getElementById(id);

// ===== Menu Toggle =====
function toggleMenu(){
  const menu = $("navMenu");
  if(menu) menu.classList.toggle("open");
}

// প্রতিটি nav link-এ ক্লিক করলে mobile menu বন্ধ হবে
document.querySelectorAll("nav a").forEach(link=>{
  link.addEventListener("click",()=>{
    const menu = $("navMenu");
    if(menu) menu.classList.remove("open");
  });
});

// ===== Request ID Generator =====
function createRequestId(){
  return "EVS-" + Math.floor(100000 + Math.random()*900000);
}

// ===== Request Form Submit (service.html) =====
const requestForm = $("requestForm");
if(requestForm){
  requestForm.addEventListener("submit", async function(e){
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
      email: $("email") ? $("email").value.trim() : "",
      service: $("service").value,
      details: $("details").value.trim(),
      document: $("document") && $("document").files[0] ? $("document").files[0].name : "",
      status: "আবেদন গ্রহণ করা হয়েছে",
      date: new Date().toLocaleString("bn-BD")
    };

    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(data)
      });

      // Backup
      const local = JSON.parse(localStorage.getItem("evumiRequests") || "[]");
      local.push(data);
      localStorage.setItem("evumiRequests", JSON.stringify(local));
      localStorage.setItem("lastRequestId", id);

      // সফল মেসেজ
      $("formMessage").innerHTML = `
        ✅ <strong>আবেদন সফল হয়েছে!</strong><br>
        <span style="font-size:22px;color:#087f5b;letter-spacing:1px;">${id}</span><br>
        <small style="color:#666;">এই ID সংরক্ষণ করুন — স্ট্যাটাস চেক করতে লাগবে</small>
      `;
      $("formMessage").style.color = "#087f5b";
      this.reset();

      // ২ সেকেন্ড পর status পেজে যাওয়ার অপশন
      setTimeout(() => {
        if(confirm("আপনার Request ID: " + id + "\n\nস্ট্যাটাস পেজে যেতে চান?")){
          window.location.href = "status.html";
        }
      }, 1800);

    } catch (err) {
      $("formMessage").textContent = "❌ সমস্যা হয়েছে। আবার চেষ্টা করুন।";
      $("formMessage").style.color = "#c92a2a";
      console.error(err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

// ===== Status Check (status.html) =====
const statusForm = $("statusForm");
if(statusForm){
  statusForm.addEventListener("submit", async function(e){
    e.preventDefault();

    const id = $("requestId").value.trim().toUpperCase();
    $("statusResult").innerHTML = '<div class="result">⏳ খোঁজা হচ্ছে...</div>';

    try {
      const res = await fetch(API_URL);
      const all = await res.json();
      const found = all.find(r => String(r.ID).toUpperCase() === id);

      if (found) {
        const statusColor =
          found.Status === 'সম্পন্ন' ? '#087f5b' :
          found.Status === 'প্রক্রিয়াধীন' ? '#f59e0b' :
          '#666';

        $("statusResult").innerHTML = `
          <div class="result">
            <strong style="font-size:18px;">${found.ID}</strong><br>
            <strong>সেবা:</strong> ${found.Service}<br>
            <strong>আবেদনকারী:</strong> ${found.Name}<br>
            <strong>স্ট্যাটাস:</strong>
            <span style="color:${statusColor};font-weight:700;">${found.Status}</span><br>
            <strong>আবেদনের তারিখ:</strong> ${found.Date}
          </div>`;
      } else {
        $("statusResult").innerHTML = `
          <div class="result" style="border-left-color:#c92a2a;">
            ❌ এই Request ID পাওয়া যায়নি।<br>
            <small>সঠিক ID লিখুন অথবা WhatsApp-এ যোগাযোগ করুন।</small>
          </div>`;
      }
    } catch (err) {
      // Offline backup
      const local = JSON.parse(localStorage.getItem("evumiRequests") || "[]");
      const found = local.find(r => r.id.toUpperCase() === id);

      if (found) {
        $("statusResult").innerHTML = `
          <div class="result">
            <strong>${found.id}</strong><br>
            <strong>সেবা:</strong> ${found.service}<br>
            <strong>স্ট্যাটাস:</strong> ${found.status}<br>
            <strong>আবেদন:</strong> ${found.date}
          </div>`;
      } else {
        $("statusResult").innerHTML = `
          <div class="result" style="border-left-color:#c92a2a;">
            ❌ সার্ভারে সংযোগ করা যাচ্ছে না। পরে চেষ্টা করুন।
          </div>`;
      }
    }
  });
}

// ===== Year in Footer =====
const yearEl = $("year");
if(yearEl) yearEl.textContent = new Date().getFullYear();