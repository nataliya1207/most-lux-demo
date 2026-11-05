'use strict';

// With JS disabled all content and all three comparisons stay visible.
document.documentElement.classList.add('js');
const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
const desktopCases=window.matchMedia('(min-width: 900px)');
const header=document.querySelector('.header');
const menu=document.querySelector('.menu-toggle');
const navigation=document.querySelector('#navigation');
const desktopMenu=window.matchMedia('(min-width: 761px)');
function setMenu(open){
  header.classList.toggle('menu-open',open);
  menu.setAttribute('aria-expanded',String(open));
  navigation.inert=!desktopMenu.matches&&!open;
}
menu.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
navigation.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&header.classList.contains('menu-open')){setMenu(false);menu.focus();}
});
document.addEventListener('click',event=>{if(!header.contains(event.target))setMenu(false);});
desktopMenu.addEventListener('change',()=>setMenu(false));
setMenu(false);

const cards=[...document.querySelectorAll('.service-card')];
const count=document.querySelector('#service-count');
function setFilter(button){
  document.querySelectorAll('[data-filter]').forEach(item=>{
    const selected=item===button;
    item.classList.toggle('active',selected);item.setAttribute('aria-pressed',String(selected));
  });
  cards.forEach(card=>{
    card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter;
    if(!card.hidden)card.classList.add('is-visible');
  });
  count.textContent=`Показано направлений: ${cards.filter(card=>!card.hidden).length}. Полный прайс подключим из вашего каталога.`;
}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>setFilter(button)));

// Reusable component: its image sources and initial position come from data attributes.
class Comparison {
  constructor(root){
    this.root=root;this.range=root.querySelector('input[type="range"]');
    this.start=Number(root.dataset.start)||80;
    this.interacted=false;this.hinted=false;this.frame=0;this.pointer=null;
    root.querySelector('.after-image').src=root.dataset.after;
    root.querySelector('.before-layer img').src=root.dataset.before;
    this.set(this.start);
    this.range.addEventListener('input',()=>{this.touch();this.set(this.range.value);});
    this.range.addEventListener('keydown',()=>this.touch());
    root.addEventListener('pointerdown',event=>{
      if(!event.isPrimary||(event.pointerType==='mouse'&&event.button!==0))return;
      this.touch();this.pointer=event.pointerId;
      root.setPointerCapture(event.pointerId);
      this.range.focus({preventScroll:true});this.fromPointer(event);
    });
    root.addEventListener('pointermove',event=>{
      if(event.pointerId===this.pointer)this.fromPointer(event);
    });
    const release=event=>{
      if(event.pointerId!==this.pointer)return;
      this.pointer=null;
      if(root.hasPointerCapture(event.pointerId))root.releasePointerCapture(event.pointerId);
    };
    root.addEventListener('pointerup',release);
    root.addEventListener('pointercancel',release);
    root.addEventListener('lostpointercapture',()=>{this.pointer=null;});
  }
  set(value){
    const percent=Math.min(100,Math.max(0,Number(value)));
    this.root.style.setProperty('--split',`${percent}%`);
    this.range.value=String(Math.round(percent));
    this.range.setAttribute('aria-valuetext',`${Math.round(percent)}% изображения до ремонта`);
  }
  fromPointer(event){
    const rect=this.root.getBoundingClientRect();
    if(rect.width)this.set((event.clientX-rect.left)/rect.width*100);
  }
  touch(){this.interacted=true;this.root.classList.add('is-interacted');cancelAnimationFrame(this.frame);}
  reset(){cancelAnimationFrame(this.frame);this.set(this.start);}
  hint(){
    if(this.hinted||this.interacted||motion.matches)return;
    this.hinted=true;
    const start=performance.now(),ease=t=>1-Math.pow(1-t,3);
    const animate=now=>{
      if(this.interacted||motion.matches)return;
      const progress=Math.min(1,(now-start)/1600);
      this.set(progress<.5?80-55*ease(progress*2):25+55*ease((progress-.5)*2));
      if(progress<1)this.frame=requestAnimationFrame(animate);else this.set(this.start);
    };
    this.frame=requestAnimationFrame(animate);
  }
}
const comparisons=[...document.querySelectorAll('[data-comparison]')].map(root=>new Comparison(root));
const caseCards=[...document.querySelectorAll('.case-card')];
const caseButtons=[...document.querySelectorAll('[data-case-target]')];
let activeCase=0;
const hintObserver='IntersectionObserver' in window?new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    const component=comparisons.find(item=>item.root===entry.target);
    if(!component.root.closest('.case-card').inert){component.hint();hintObserver.unobserve(entry.target);}
  });
},{threshold:.45}):null;
function selectCase(index,reset=false){
  activeCase=index;
  caseCards.forEach((card,i)=>{
    const active=i===index;
    card.classList.toggle('is-active',active);card.inert=!desktopCases.matches&&!active;
    if(card.inert)card.setAttribute('aria-hidden','true');else card.removeAttribute('aria-hidden');
    if(reset)comparisons[i].reset();
  });
  caseButtons.forEach((button,i)=>{
    button.classList.toggle('active',i===index);button.setAttribute('aria-pressed',String(i===index));
  });
  comparisons.forEach(component=>{
    if(hintObserver&&!component.hinted&&!component.interacted){hintObserver.unobserve(component.root);hintObserver.observe(component.root);}
  });
}
caseButtons.forEach(button=>button.addEventListener('click',()=>selectCase(Number(button.dataset.caseTarget),true)));
desktopCases.addEventListener('change',()=>selectCase(activeCase,true));
selectCase(0);

const form=document.querySelector('#demo-form');
const fields=form.querySelector('.form-fields');
const success=form.querySelector('.form-success');
const phone=document.querySelector('#client-phone');
form.querySelector('[type="submit"]').disabled=false;
function validatePhone(){
  const digits=phone.value.replace(/\D/g,'').length;
  phone.setCustomValidity(digits>=10&&digits<=15?'':'Укажите телефон из 10–15 цифр.');
}
phone.addEventListener('input',validatePhone);
function restoreForm(){form.style.minHeight='';success.hidden=true;fields.hidden=false;}
document.querySelectorAll('[data-service]').forEach(link=>link.addEventListener('click',()=>{
  restoreForm();document.querySelector('#service-choice').value=link.dataset.service;
}));
form.addEventListener('submit',event=>{
  event.preventDefault();validatePhone();if(!form.reportValidity())return;
  // Preserve the form footprint to avoid page-layout jumps on success.
  form.style.minHeight=`${form.getBoundingClientRect().height}px`;
  fields.hidden=true;success.hidden=false;success.focus({preventScroll:true});
  success.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'center'});
});
document.querySelector('#form-reset').addEventListener('click',()=>{
  form.reset();phone.setCustomValidity('');restoreForm();document.querySelector('#client-name').focus({preventScroll:true});
});
// Demo only: no handler, requests, analytics or persistent storage.

const dialog=document.querySelector('#photo-dialog');let opener=null;
document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{
  opener=button;const image=document.querySelector('#dialog-image');
  image.src=button.dataset.image;image.alt=button.dataset.caption;
  document.querySelector('#photo-caption').textContent=button.dataset.caption;dialog.showModal();
}));
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const rect=dialog.getBoundingClientRect();
  if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();
});
dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));

const revealElements=[...document.querySelectorAll('.section-heading,.service-card,.portfolio-grid figure,.review,.facts-grid article,#contacts>.eyebrow,#contacts h2')];
revealElements.forEach(element=>{
  element.classList.add('reveal');const parent=element.parentElement;
  if(parent.matches('.services-grid,.portfolio-grid,.review-grid,.facts-grid')){
    element.style.setProperty('--reveal-delay',`${[...parent.children].indexOf(element)%3*90}ms`);
  }
});
const revealObserver='IntersectionObserver' in window?new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}});
},{threshold:.08}):null;
revealElements.forEach(element=>{
  if(motion.matches||!revealObserver)element.classList.add('is-visible');else revealObserver.observe(element);
});
const rating=document.querySelector('[data-rating]');let ratingFrame=0,ratingStarted=false;
function countRating(){
  if(ratingStarted)return;ratingStarted=true;if(motion.matches)return;
  const start=performance.now(),target=Number(rating.dataset.rating);
  const tick=now=>{
    const progress=Math.min(1,(now-start)/1000);
    rating.textContent=(target*(1-Math.pow(1-progress,3))).toFixed(1).replace('.',',');
    if(progress<1)ratingFrame=requestAnimationFrame(tick);
  };
  ratingFrame=requestAnimationFrame(tick);
}
const ratingObserver='IntersectionObserver' in window?new IntersectionObserver(entries=>{
  if(entries.some(entry=>entry.isIntersecting)){countRating();ratingObserver.disconnect();}
},{threshold:.5}):null;
if(ratingObserver)ratingObserver.observe(rating);else countRating();
motion.addEventListener('change',()=>{
  if(motion.matches){
    revealElements.forEach(element=>element.classList.add('is-visible'));
    comparisons.forEach(component=>component.reset());cancelAnimationFrame(ratingFrame);rating.textContent='4,6';
  }
});
