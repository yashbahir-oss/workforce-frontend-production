import { twClass } from "../../lib/tw";
import { useEffect, useState } from "react";
import { Bell, CheckCheck, ClipboardList, MessageCircle, ShieldCheck, CalendarDays } from "lucide-react";
import { Link } from "react-router";
import { notificationApi } from "../../lib/api";
import { toast } from "sonner";

type NotificationItem={id:string;title:string;message:string;type:string;path?:string;read:boolean;createdAt:string};
const iconFor=(type:string)=>type==="application"?ClipboardList:type==="booking"?CalendarDays:type==="message"?MessageCircle:type==="verification"?ShieldCheck:Bell;

export default function CustomerNotificationsPage(){
 const [items,setItems]=useState<NotificationItem[]>([]); const [loading,setLoading]=useState(true);
 const load=async()=>{setLoading(true);try{const r=await notificationApi.list();setItems((r.notifications||[]).map((n:any)=>({id:String(n.id||n._id),title:n.title,message:n.message,type:n.type,read:Boolean(n.read),path:n.path,createdAt:n.createdAt})));}catch(e){toast.error(e instanceof Error?e.message:"Unable to load notifications");}finally{setLoading(false)}};
 useEffect(()=>{void load()},[]);
 const read=async(id:string)=>{try{await notificationApi.markRead(id);setItems(v=>v.map(n=>n.id===id?{...n,read:true}:n));}catch(e){toast.error(e instanceof Error?e.message:"Unable to update notification");}};
 const readAll=async()=>{try{await notificationApi.markAllRead();setItems(v=>v.map(n=>({...n,read:true})));}catch(e){toast.error(e instanceof Error?e.message:"Unable to update notifications");}};
 return <div className={twClass('wf-page')}><div className={twClass('wf-wide')}><section className={twClass('wf-page-hero')}><div><span className={twClass('wf-kicker')}><Bell/> WORKFORCE NOTIFICATIONS</span><h1>Notifications</h1><p>Worker requests, bookings, messages and account updates.</p></div><button type="button" onClick={()=>void readAll()} className={twClass('wf-outline-btn')}><CheckCheck size={15}/> Mark all read</button></section>
 <section className={twClass('wf-panel overflow-hidden')}><div className={twClass('divide-y divide-slate-100')}>{loading&&<div className={twClass('wf-empty')}>Loading notifications…</div>}{!loading&&!items.length&&<div className={twClass('wf-empty')}>No notifications yet.</div>}{items.map(n=>{const Icon=iconFor(n.type);return <Link key={n.id} to={n.path||"/notifications"} onClick={()=>void read(n.id)} className={twClass(`flex items-start gap-3 p-4 transition hover:bg-slate-50 ${n.read?"bg-white":"bg-emerald-50/60"}`)}><span className={twClass('grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700')}><Icon size={17}/></span><span className={twClass('min-w-0 flex-1')}><b className={twClass('block text-sm text-slate-900')}>{n.title}</b><span className={twClass('mt-1 block text-xs leading-5 text-slate-600')}>{n.message}</span><small className={twClass('mt-1 block text-[10px] text-slate-400')}>{new Date(n.createdAt).toLocaleString()}</small></span>{!n.read&&<span className={twClass('mt-2 h-2.5 w-2.5 rounded-full bg-emerald-500')}/>}</Link>})}</div></section></div></div>;
}
