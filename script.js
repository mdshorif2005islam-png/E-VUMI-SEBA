/* ============================================================
   E-Vumi Seba - script.js
   সম্পূর্ণ জাভাস্ক্রিপ্ট ফাইল
   ============================================================
   
   🔧 শুধু নিচের ২টি লাইন পরিবর্তন করুন:
   ১. API_URL — আপনার Google Apps Script URL
   ২. WHATSAPP — আপনার WhatsApp নম্বর
   
   ============================================================ */

/* ⬇️⬇️⬇️ এখানে পরিবর্তন করুন ⬇️⬇️⬇️ */

const API_URL = 'https://script.google.com/macros/s/AKfycbwYVr5xRMf3HSF_OpCNFXjiUyYHshG_zPITNJ9hHDV5TsctVgtlzUnsIeQbhNvgr2b_ww/exec';
const WHATSAPP = '8801332052506';

/* ⬆️⬆️⬆️ এখানে পরিবর্তন করুন ⬆️⬆️⬆️ */


const $ = id => document.getElementById(id);

/* ============================================================
   1. MENU TOGGLE (মোবাইল মেনু)
   ============================================================ */
function toggleMenu(){
  const menu = $("navMenu");
  if(menu) menu.classList.toggle("open");
}

document.querySelectorAll("nav a").forEach(link=>{
  link.addEventListener("click",()=>{
    const menu = $("navMenu");
    if(menu) menu.classList.remove("open");
  });
});

/* ============================================================
   2. ACTIVE NAV HIGHLIGHT (ক্লিক করা পেজ হাইলাইট)
   ============================================================ */
(function(){
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path) a.classList.add('active');
  });
})();

/* ============================================================
   3. HELPERS (সহায়ক ফাংশন)
   ============================================================ */
function createRequestId(){
  return "EVS-" + Math.floor(100000 + Math.random()*900000);
}
function createId(prefix){
  return prefix + "-" + Math.floor(1000 + Math.random()*9000);
}
function escapeHtml(str){
  if(!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}
function toBn(num){
  const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  return String(num).replace(/[0-9]/g, d => bn[d]);
}

/* ============================================================
   4. REQUEST FORM (service.html)
   ============================================================ */
const requestForm = $("requestForm");
if(requestForm){
  requestForm.addEventListener("submit", async function(e){
    e.preventDefault();
    const btn = this.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ পাঠানো হচ্ছে...';
    $("formMessage").textContent = '';

    const data = {
      type: 'request',
      id: createRequestId(),
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

      const local = JSON.parse(localStorage.getItem("evumiRequests") || "[]");
      local.push(data);
      localStorage.setItem("evumiRequests", JSON.stringify(local));

      $("formMessage").innerHTML = `
        ✅ <strong>আবেদন সফল হয়েছে!</strong><br>
        <span style="font-size:22px;color:#087f5b;letter-spacing:1px;">${data.id}</span><br>
        <small style="color:#666;">এই ID সংরক্ষণ করুন</small>`;
      $("formMessage").style.color = "#087f5b";
      this.reset();

      setTimeout(() => {
        if(confirm("আপনার Request ID: " + data.id + "\n\nস্ট্যাটাস পেজে যেতে চান?")){
          window.location.href = "status.html";
        }
      }, 1800);

    } catch (err) {
      $("formMessage").textContent = "❌ সমস্যা হয়েছে। আবার চেষ্টা করুন।";
      $("formMessage").style.color = "#c92a2a";
    } finally {
      btn.disabled = false;
      btn.textContent = orig;
    }
  });
}

/* ============================================================
   5. STATUS CHECK (status.html)
   ============================================================ */
const statusForm = $("statusForm");
if(statusForm){
  statusForm.addEventListener("submit", async function(e){
    e.preventDefault();
    const id = $("requestId").value.trim().toUpperCase();
    $("statusResult").innerHTML = '<div class="result">⏳ খোঁজা হচ্ছে...</div>';

    try {
      const res = await fetch(API_URL + '?action=requests');
      const list = await res.json();
      const found = list.find(r => String(r.ID).toUpperCase() === id);

      if (found) {
        const c =
          found.Status === 'সম্পন্ন' ? '#087f5b' :
          found.Status === 'প্রক্রিয়াধীন' ? '#f59e0b' : '#666';
        $("statusResult").innerHTML = `
          <div class="result">
            <strong style="font-size:18px;">${escapeHtml(found.ID)}</strong><br>
            <strong>সেবা:</strong> ${escapeHtml(found.Service)}<br>
            <strong>আবেদনকারী:</strong> ${escapeHtml(found.Name)}<br>
            <strong>স্ট্যাটাস:</strong>
            <span style="color:${c};font-weight:700;">${escapeHtml(found.Status)}</span><br>
            <strong>তারিখ:</strong> ${escapeHtml(found.Date)}
          </div>`;
      } else {
        $("statusResult").innerHTML = `
          <div class="result" style="border-left-color:#c92a2a;">
            ❌ এই Request ID পাওয়া যায়নি।
          </div>`;
      }
    } catch (err) {
      const local = JSON.parse(localStorage.getItem("evumiRequests") || "[]");
      const found = local.find(r => r.id.toUpperCase() === id);
      if (found) {
        $("statusResult").innerHTML = `
          <div class="result">
            <strong>${escapeHtml(found.id)}</strong><br>
            সেবা: ${escapeHtml(found.service)}<br>
            স্ট্যাটাস: <strong>${escapeHtml(found.status)}</strong>
          </div>`;
      } else {
        $("statusResult").innerHTML = `
          <div class="result" style="border-left-color:#c92a2a;">
            ❌ সার্ভারে সংযোগ করা যাচ্ছে না।
          </div>`;
      }
    }
  });
}

/* ============================================================
   6. QUESTIONS (questions.html)
   ============================================================ */
const questionForm = $("questionForm");
if(questionForm){
  loadQuestions();

  questionForm.addEventListener("submit", async function(e){
    e.preventDefault();
    const btn = this.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ পাঠানো হচ্ছে...';

    const data = {
      type: 'question',
      id: createId('Q'),
      name: $("qName").value.trim(),
      location: $("qLocation") ? $("qLocation").value.trim() : "",
      question: $("qText").value.trim(),
      answer: "",
      date: new Date().toLocaleString("bn-BD")
    };

    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(data)
      });

      $("qMessage").textContent = "✅ আপনার প্রশ্ন পাঠানো হয়েছে!";
      $("qMessage").style.color = "#087f5b";
      questionForm.reset();

      const ab = $("askBox");
      if(ab) ab.open = false;

      setTimeout(loadQuestions, 2000);
      setTimeout(()=> $("qMessage").textContent = '', 6000);

    } catch (err) {
      $("qMessage").textContent = "❌ সমস্যা হয়েছে।";
      $("qMessage").style.color = "#c92a2a";
    } finally {
      btn.disabled = false;
      btn.textContent = orig;
    }
  });
}

async function loadQuestions(){
  const list = $("questionsList");
  if(!list) return;
  list.innerHTML = '<p class="loading-text">⏳ লোড হচ্ছে...</p>';

  try {
    const res = await fetch(API_URL + '?action=questions');
    const data = await res.json();

    if(!data || data.length === 0){
      list.innerHTML = '<p class="loading-text">এখনো কোনো প্রশ্ন করা হয়নি। আপনি প্রথম প্রশ্ন করুন!</p>';
      if($("qCount")) $("qCount").textContent = "0";
      return;
    }

    const reversed = [...data].reverse();
    if($("qCount")) $("qCount").textContent = reversed.length;

    list.innerHTML = reversed.map(q => {
      const initial = (q.Name || 'অ').trim().charAt(0);
      return `
        <div class="q-item">
          <div class="q-head">
            <div class="q-user">
              <div class="q-avatar">${escapeHtml(initial)}</div>
              <div>
                <div class="q-name">${escapeHtml(q.Name || 'অজ্ঞাত')}</div>
                <div class="q-date">${escapeHtml(q.Date || '')}</div>
              </div>
            </div>
          </div>
          <div class="q-text">❓ ${escapeHtml(q.Question || '')}</div>
          ${q.Answer && String(q.Answer).trim() !== ''
            ? `<div class="q-answer"><strong>✅ উত্তর:</strong> ${escapeHtml(q.Answer)}</div>`
            : `<div class="q-pending">⏳ উত্তর দেওয়া হয়নি — শীঘ্রই পাবেন</div>`}
        </div>`;
    }).join('');
  } catch (err) {
    list.innerHTML = '<p class="loading-text" style="color:#c92a2a;">❌ লোড করা যায়নি।</p>';
  }
}

/* ============================================================
   7. REVIEWS (reviews.html)
   ============================================================ */
let selectedRating = 5;
const starInput = $("starInput");

if(starInput){
  const stars = starInput.querySelectorAll('.star');
  const ratingInput = $("rRating");

  function setRating(val){
    selectedRating = val;
    if(ratingInput) ratingInput.value = val;
    stars.forEach(s => {
      const v = parseInt(s.dataset.value);
      s.classList.toggle('active', v <= val);
    });
  }

  stars.forEach(s => {
    s.addEventListener('click', () => setRating(parseInt(s.dataset.value)));
    s.addEventListener('mouseenter', () => {
      const v = parseInt(s.dataset.value);
      stars.forEach(x => x.classList.toggle('active', parseInt(x.dataset.value) <= v));
    });
  });
  starInput.addEventListener('mouseleave', () => setRating(selectedRating));
  setRating(5);
}

const reviewForm = $("reviewForm");
if(reviewForm){
  loadReviews();

  reviewForm.addEventListener("submit", async function(e){
    e.preventDefault();
    const btn = this.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ পাঠানো হচ্ছে...';

    const data = {
      type: 'review',
      id: createId('R'),
      name: $("rName").value.trim(),
      location: $("rLocation") ? $("rLocation").value.trim() : "",
      rating: $("rRating").value,
      review: $("rText").value.trim(),
      date: new Date().toLocaleString("bn-BD")
    };

    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(data)
      });

      $("rMessage").textContent = "✅ আপনার রিভিউ পাঠানো হয়েছে!";
      $("rMessage").style.color = "#087f5b";
      reviewForm.reset();
      if(starInput){
        const stars = starInput.querySelectorAll('.star');
        stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.value) <= 5));
        if($("rRating")) $("rRating").value = 5;
      }

      const rb = $("addReviewBox");
      if(rb) rb.open = false;

      setTimeout(loadReviews, 2000);
      setTimeout(()=> $("rMessage").textContent = '', 6000);

    } catch (err) {
      $("rMessage").textContent = "❌ সমস্যা হয়েছে।";
      $("rMessage").style.color = "#c92a2a";
    } finally {
      btn.disabled = false;
      btn.textContent = orig;
    }
  });
}

async function loadReviews(){
  const list = $("reviewsList");
  if(!list) return;
  list.innerHTML = '<p class="loading-text">⏳ লোড হচ্ছে...</p>';

  try {
    const res = await fetch(API_URL + '?action=reviews');
    const data = await res.json();

    if(!data || data.length === 0){
      list.innerHTML = '<p class="loading-text">এখনো কোনো রিভিউ নেই। আপনি প্রথম রিভিউ দিন!</p>';
      if($("rCount")) $("rCount").textContent = "0";
      if($("avgRating")) $("avgRating").textContent = "০";
      if($("totalReviews")) $("totalReviews").textContent = "০";
      if($("avgStars")) $("avgStars").textContent = "☆☆☆☆☆";
      updateRatingBars([]);
      return;
    }

    const reversed = [...data].reverse();
    if($("rCount")) $("rCount").textContent = reversed.length;

    const sum = data.reduce((a,b) => a + (parseFloat(b.Rating) || 0), 0);
    const avg = (sum / data.length).toFixed(1);
    if($("avgRating")) $("avgRating").textContent = toBn(avg);
    if($("totalReviews")) $("totalReviews").textContent = toBn(data.length);

    const rounded = Math.round(avg);
    if($("avgStars")) $("avgStars").textContent = '⭐'.repeat(rounded) + '☆'.repeat(5-rounded);

    updateRatingBars(data);

    list.innerHTML = reversed.map(r => {
      const initial = (r.Name || 'অ').trim().charAt(0);
      const rating = parseInt(r.Rating) || 5;
      return `
        <div class="review-card">
          <div class="stars">${'⭐'.repeat(rating)}</div>
          <p>"${escapeHtml(r.Review || '')}"</p>
          <div class="review-author">
            <div class="avatar">${escapeHtml(initial)}</div>
            <div>
              <strong>${escapeHtml(r.Name || 'অজ্ঞাত')}</strong>
              <small>${escapeHtml(r.Location || 'বাংলাদেশ')}</small>
            </div>
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    list.innerHTML = '<p class="loading-text" style="color:#c92a2a;">❌ লোড করা যায়নি।</p>';
  }
}

function updateRatingBars(data){
  const container = $("ratingBars");
  if(!container) return;
  const total = data.length;

  if(total === 0){
    container.innerHTML = '<p style="color:var(--muted);font-size:13px;text-align:center;">এখনো কোনো রেটিং নেই</p>';
    return;
  }

  const counts = {5:0,4:0,3:0,2:0,1:0};
  data.forEach(r => {
    const v = Math.round(parseFloat(r.Rating) || 5);
    if(counts[v] !== undefined) counts[v]++;
  });

  container.innerHTML = [5,4,3,2,1].map(star => {
    const pct = (counts[star] / total * 100).toFixed(0);
    return `
      <div>
        <span>${star}★</span>
        <div class="bar"><div style="width:${pct}%"></div></div>
        <span>${pct}%</span>
      </div>`;
  }).join('');
}

/* ============================================================
   8. LOGIN SYSTEM
   ============================================================ */
function openLogin(){
  const modal = $("loginModal");
  if(modal){
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }
}
function closeLogin(){
  const modal = $("loginModal");
  if(modal){
    modal.classList.remove("show");
    document.body.style.overflow = "";
  }
}

const loginModal = $("loginModal");
if(loginModal){
  loginModal.addEventListener("click", (e) => {
    if(e.target.id === "loginModal") closeLogin();
  });
}

document.addEventListener("keydown", (e) => {
  if(e.key === "Escape") closeLogin();
});

function switchLoginTab(tab){
  document.querySelectorAll(".login-tab").forEach(t => {
    t.classList.toggle("active", t.dataset.tab === tab);
  });
  document.querySelectorAll(".login-form").forEach(f => {
    f.classList.toggle("active", f.id === tab + "Form");
  });
}

/* SIGN UP */
const signupForm = $("signupForm");
if(signupForm){
  signupForm.addEventListener("submit", async function(e){
    e.preventDefault();
    const btn = this.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ তৈরি হচ্ছে...';

    const user = {
      type: 'user',
      id: 'U-' + Date.now(),
      name: $("signupName").value.trim(),
      phone: $("signupPhone").value.trim(),
      email: $("signupEmail") ? $("signupEmail").value.trim() : "",
      password: $("signupPass").value,
      date: new Date().toLocaleString("bn-BD")
    };

    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(user)
      });

      const users = JSON.parse(localStorage.getItem("evumiUsers") || "[]");
      users.push(user);
      localStorage.setItem("evumiUsers", JSON.stringify(users));
      localStorage.setItem("evumiCurrentUser", JSON.stringify(user));

      $("signupMsg").textContent = "✅ সফল!";
      $("signupMsg").className = "login-msg success";
      signupForm.reset();

      setTimeout(() => {
        closeLogin();
        updateLoginUI(user);
        showToast("স্বাগতম, " + user.name + "! 🎉");
      }, 1000);

    } catch (err) {
      $("signupMsg").textContent = "❌ সমস্যা হয়েছে।";
      $("signupMsg").className = "login-msg error";
    } finally {
      btn.disabled = false;
      btn.textContent = orig;
    }
  });
}

/* SIGN IN */
const signinForm = $("signinForm");
if(signinForm){
  signinForm.addEventListener("submit", async function(e){
    e.preventDefault();
    const btn = this.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ চেক করা হচ্ছে...';

    const phone = $("signinPhone").value.trim();
    const pass = $("signinPass").value;

    try {
      const users = JSON.parse(localStorage.getItem("evumiUsers") || "[]");
      let found = users.find(u => u.phone === phone && u.password === pass);

      if(!found){
        try {
          const res = await fetch(API_URL + '?action=users');
          const remoteUsers = await res.json();
          if(Array.isArray(remoteUsers)){
            const r = remoteUsers.find(u =>
              String(u.Phone) === phone && String(u.Password) === pass
            );
            if(r){
              found = { id: r.ID, name: r.Name, phone: r.Phone, email: r.Email };
            }
          }
        } catch(e){}
      }

      if(found){
        localStorage.setItem("evumiCurrentUser", JSON.stringify(found));
        $("signinMsg").textContent = "✅ সফল লগইন!";
        $("signinMsg").className = "login-msg success";

        setTimeout(() => {
          closeLogin();
          updateLoginUI(found);
          showToast("স্বাগতম, " + found.name + "! 👋");
        }, 700);
      } else {
        $("signinMsg").textContent = "❌ ভুল মোবাইল বা পাসওয়ার্ড";
        $("signinMsg").className = "login-msg error";
      }

    } catch (err) {
      $("signinMsg").textContent = "❌ সমস্যা হয়েছে।";
      $("signinMsg").className = "login-msg error";
    } finally {
      btn.disabled = false;
      btn.textContent = orig;
    }
  });
}

/* WhatsApp Alternative */
function continueWithWhatsApp(){
  window.open("https://wa.me/" + WHATSAPP + "?text=আমি E-Vumi Seba-তে লগইন করতে চাই", "_blank");
}

/* Continue as Guest */
function continueAsGuest(){
  closeLogin();
  showToast("অতিথি হিসেবে ব্যবহার করছেন 👤");
}

/* Update Login UI */
function updateLoginUI(user){
  const nav = $("navMenu");
  if(!nav) return;

  const oldBtn = nav.querySelector(".login-btn, .user-menu");
  if(oldBtn) oldBtn.remove();

  const userBtn = document.createElement("div");
  userBtn.className = "user-menu";
  userBtn.innerHTML = `
    <button class="user-btn" onclick="toggleUserMenu()">
      👤 ${escapeHtml(user.name.split(" ")[0])}
    </button>
    <div class="user-dropdown" id="userDropdown">
      <a href="service.html">📝 নতুন আবেদন</a>
      <a href="status.html">🔎 স্ট্যাটাস</a>
      <a href="#" onclick="logout(event)">🚪 লগআউট</a>
    </div>
  `;
  nav.appendChild(userBtn);
}

function toggleUserMenu(){
  const dd = $("userDropdown");
  if(dd) dd.classList.toggle("show");
}

document.addEventListener("click", (e) => {
  const dd = $("userDropdown");
  if(dd && !e.target.closest(".user-menu")){
    dd.classList.remove("show");
  }
});

function logout(e){
  if(e) e.preventDefault();
  localStorage.removeItem("evumiCurrentUser");
  showToast("লগআউট সম্পন্ন ✅");
  setTimeout(() => window.location.reload(), 700);
}

(function(){
  const user = JSON.parse(localStorage.getItem("evumiCurrentUser") || "null");
  if(user) updateLoginUI(user);
})();

/* Toast */
function showToast(message){
  const toast = document.createElement("div");
  toast.className = "evumi-toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 50);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

/* ============================================================
   9. YEAR IN FOOTER
   ============================================================ */
const yearEl = $("year");
if(yearEl) yearEl.textContent = new Date().getFullYear();