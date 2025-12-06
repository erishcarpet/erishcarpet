
function load(){
 let list=JSON.parse(localStorage.getItem('products')||'[]');
 let box=document.getElementById('list'); box.innerHTML='';
 list.forEach((p,i)=>{
   box.innerHTML+=`<div class="product-item">
   <b>${p.name}</b><br>
   <img src="${p.img}"><br>
   <small>${p.desc}</small><br>
   <button onclick="del(${i})">حذف</button>
   </div>`;
 });
}

function addProduct(){
 let n=document.getElementById('pname').value;
 let f=document.getElementById('pimg').files[0];
 let d=document.getElementById('pdesc').value;

 if(!f){ alert("تصویر انتخاب نشده"); return; }

 let reader=new FileReader();
 reader.onload=function(){
     let img64=reader.result;
     let list=JSON.parse(localStorage.getItem('products')||'[]');
     list.push({name:n,img:img64,desc:d});
     localStorage.setItem('products',JSON.stringify(list));
     load();
 }
 reader.readAsDataURL(f);
}

function del(i){
 let list=JSON.parse(localStorage.getItem('products')||'[]');
 list.splice(i,1);
 localStorage.setItem('products',JSON.stringify(list));
 load();
}

document.addEventListener('DOMContentLoaded',load);
