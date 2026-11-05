'use strict';
const header=document.querySelector('.header');
const menu=document.querySelector('.menu-toggle');
function closeMenu(){header.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');}
menu.addEventListener('click',()=>{const opened=header.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(opened));});
document.querySelectorAll('#navigation a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&header.classList.contains('menu-open')){closeMenu();menu.focus();}});
window.matchMedia('(min-width:761px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
const cards=[...document.querySelectorAll('.service-card')];
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-filter]').forEach(item=>{const selected=item===button;item.classList.toggle('active',selected);item.setAttribute('aria-pressed',String(selected));});
 cards.forEach(card=>{card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter;});
 const count=cards.filter(card=>!card.hidden&&!card.classList.contains('service-help')).length;
 document.querySelector('#service-count').textContent=`Показано направлений: ${count}. Числовые цены не подтверждены — стоимость уточняйте у компании.`;
}));
const range=document.querySelector('#compare-range');
function updateComparison(){document.querySelector('.comparison').style.setProperty('--split',range.value+'%');range.setAttribute('aria-valuetext',`${range.value}% изображения до ремонта`);}
range.addEventListener('input',updateComparison);updateComparison();
document.querySelectorAll('[data-service]').forEach(link=>link.addEventListener('click',()=>{document.querySelector('#service-choice').value=link.dataset.service;}));
const form=document.querySelector('#demo-form');
const phone=document.querySelector('#client-phone');
function validatePhone(){const count=phone.value.replace(/\D/g,'').length;phone.setCustomValidity(count>=10&&count<=15?'':'Укажите телефон из 10–15 цифр.');}
phone.addEventListener('input',validatePhone);
form.addEventListener('submit',event=>{
 event.preventDefault();validatePhone();if(!form.reportValidity())return;
 const status=document.querySelector('#form-status');
 status.textContent='Демо-заявка заполнена корректно. Она НЕ отправлена: обработчик не подключён. Для записи свяжитесь с компанией по телефону или в Telegram.';
 status.focus();
});
form.addEventListener('input',()=>{document.querySelector('#form-status').textContent='';});
const dialog=document.querySelector('#photo-dialog');let opener=null;
document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{
 opener=button;const img=document.querySelector('#dialog-image');img.src=button.dataset.image;img.alt=button.dataset.caption;document.querySelector('#photo-caption').textContent=button.dataset.caption;dialog.showModal();
}));
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{if(opener)opener.focus();});
