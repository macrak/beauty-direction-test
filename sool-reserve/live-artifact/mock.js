(function(){
const D=__DATA__; const store={};
store["cat/v1"]=D.settings;
for(const c of ["products","breweries","articles","notices"]) for(const x of D[c]){const {id,...r}=x; store[`cat/v1/${c}/${id}`]=r;}
const subs=[];
const snapDoc=(p)=>({id:p.split("/").pop(),exists:p in store,data:()=>store[p]&&JSON.parse(JSON.stringify(store[p])),metadata:{}});
const collDocs=(c)=>Object.keys(store).filter(k=>k.startsWith(c+"/")&&k.split("/").length===c.split("/").length+1).sort().map(snapDoc);
const notify=()=>setTimeout(()=>subs.forEach(s=>s()),0);
const check=(d)=>{const walk=(v)=>{if(v===undefined)throw {code:"invalid_argument",message:"undefined"};if(v&&typeof v==="object")Object.values(v).forEach(walk);};walk(d);};
const doc=(p)=>({id:p.split("/").pop(),path:p,get:async()=>snapDoc(p),set:async(d)=>{check(d);store[p]=JSON.parse(JSON.stringify(d));window.__writes=(window.__writes||[]);window.__writes.push(p);notify();},update:async(d)=>{store[p]={...store[p],...d};notify();},delete:async()=>{delete store[p];notify();},onSnapshot:(n)=>{const f=()=>n(snapDoc(p));subs.push(f);setTimeout(f,10);return()=>{};},collection:(c)=>coll(p+"/"+c)});
const coll=(c)=>({path:c,doc:(id)=>doc(c+"/"+(id||Math.random().toString(36).slice(2))),add:async(d)=>{const r=doc(c+"/"+Math.random().toString(36).slice(2));await r.set(d);return r;},onSnapshot:(n)=>{const f=()=>{const docs=collDocs(c);n({docs,size:docs.length,empty:!docs.length,docChanges:()=>[],metadata:{}})};subs.push(f);setTimeout(f,20);return()=>{};},get:async()=>{const docs=collDocs(c);return {docs,size:docs.length,empty:!docs.length};},orderBy:function(){return this;},limit:function(){return this;},where:function(){return this;}});
const db={doc,collection:coll};
const ADMIN=!location.search.includes("viewer");
const user={canEdit:async()=>ADMIN,isOwner:async()=>ADMIN,id:async()=>"u_test",can:async()=>null};
window.__store=store;
let up=0;const assets={upload:async(b)=>{if(!/^image\//.test(b.type))throw {code:"unsupported_type"};up++;return {id:"asset"+up,url:"/_blob/asset"+up,sizeBytes:b.size,contentType:b.type};}};
window.claude={use:async(n)=>n==="db"?db:n==="user"?user:n==="assets"?(ADMIN?assets:null):null};
})();
