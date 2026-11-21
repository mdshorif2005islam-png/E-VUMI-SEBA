
const menu=document.querySelector('.menu'), links=document.querySelector('.links');
if(menu&&links) menu.addEventListener('click',()=>links.classList.toggle('open'));
document.querySelectorAll('.links a').forEach(a=>a.addEventListener('click',()=>links?.classList.remove('open')));
const year=document.querySelectorAll('[data-year]');year.forEach(x=>x.textContent=new Date().getFullYear());
const form=document.querySelector('#contact-form');
if(form) form.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(form);const body=`Name: ${d.get('name')}%0D%0APhone: ${d.get('phone')}%0D%0AEmail: ${d.get('email')}%0D%0AEnquiry: ${d.get('type')}%0D%0A%0D%0AMessage: ${d.get('message')}`;alert('Your email app will open. Before publishing, replace the placeholder email address in contact.html.');location.href='mailto:YOUR-COMPANY-EMAIL@example.com?subject='+encodeURIComponent('Website enquiry — '+d.get('type'))+'&body='+body;});

const params=new URLSearchParams(location.search);const type=params.get('type');const select=document.querySelector('[name="type"]');
if(type&&select){const map={food:'Product sourcing',clothing:'Product sourcing',housing:'Service request',education:'Service request',healthcare:'Service request',transport:'Service request',funding:'Funding information',supplier:'Supplier partnership',entrepreneur:'Entrepreneur partnership',provider:'Service request'};select.value=map[type]||'General enquiry';}
