import { create } from "zustand";
import { bookingsApi, jobsApi, notificationApi, workerApi, type WorkerProfile } from "../../lib/api";
import { toast } from "sonner";

export type Availability = "available" | "busy" | "unavailable";
export type VerificationStatus = "pending" | "verified" | "rejected";
export type ApplicationStatus = "pending" | "accepted" | "rejected" | "withdrawn";
export type BookingStatus = "requested" | "accepted" | "rejected" | "confirmed" | "active" | "completed" | "cancelled";
export type WorkerJob = { id:string; title:string; customer:string; customerId?:string; imageUrl?:string; location:string; date:string; duration:string; workersNeeded:number; skills:string[]; description:string; status?:"open"|"expired"|"filled" };
export type Application = { id:string; jobId:string; jobTitle:string; customer:string; location:string; date:string; status:ApplicationStatus; note:string; createdAt:string };
export type Booking = { id:string; jobId:string; title:string; customer:string; customerId?:string; customerImage?:string; location:string; date:string; duration:string; agreedAmount?:number|null; status:BookingStatus; startedAt?:string; completedAt?:string };
export type Notification = { id:string; title:string; message:string; type:string; path:string; read:boolean; createdAt:string };

type WorkerState = {
  availability: Availability; verificationStatus: VerificationStatus; rejectionReason: string; profile: WorkerProfile | null;
  applications: Application[]; bookings: Booking[]; notifications: Notification[]; savedJobs: string[]; jobs: WorkerJob[]; loading: boolean;
  load: () => Promise<void>; setVerification:(status:VerificationStatus, reason?:string)=>void; setAvailability:(value:Availability)=>Promise<void>; saveJob:(id:string)=>void; apply:(job:WorkerJob,note:string)=>Promise<void>; withdrawApplication:(id:string)=>Promise<void>; markNotificationRead:(id:string)=>Promise<void>; markAllNotificationsRead:()=>Promise<void>; startBooking:(id:string, selfie?:File)=>Promise<void>; completeBooking:(id:string)=>Promise<void>; confirmCompletion:(id:string)=>Promise<void>;
};

const mapJob=(j:any):WorkerJob=>({id:String(j._id||j.id),title:j.title||"Untitled work",customer:j.customer?.name||"Customer",customerId:j.customer?._id?String(j.customer._id):undefined,imageUrl:j.imageKey?jobsApi.imageUrl(String(j._id||j.id)):"",location:[j.locality,j.taluka,j.district].filter(Boolean).join(", "),date:j.date?new Date(j.date).toLocaleDateString():"",duration:j.startTime&&j.endTime?`${j.startTime} - ${j.endTime}`:"",workersNeeded:Number(j.workersNeeded||1),skills:j.skillNames||j.skills?.map((x:any)=>x.name||x)||[],description:j.description||"",status:j.status});
const mapApplication=(a:any):Application=>({id:String(a._id),jobId:String(a.job?._id||a.job||""),jobTitle:a.job?.title||"Work",customer:a.job?.customer?.name||"Customer",location:[a.job?.locality,a.job?.taluka,a.job?.district].filter(Boolean).join(", "),date:a.job?.date?new Date(a.job.date).toLocaleDateString():"",status:a.status,note:a.note||"",createdAt:a.createdAt});
const mapBooking=(b:any):Booking=>({id:String(b._id),jobId:String(b.job?._id||b.job||""),title:b.job?.title||"Booking",customer:b.customer?.name||"Customer",customerId:b.customer?._id?String(b.customer._id):undefined,customerImage:b.customer?.profileImageData?.length?`/api/profile/image/${b.customer._id}`:b.customer?.profileImage||"",location:[b.job?.locality,b.job?.taluka,b.job?.district].filter(Boolean).join(", "),date:b.job?.date?new Date(b.job.date).toLocaleDateString():"",duration:b.job?.startTime&&b.job?.endTime?`${b.job.startTime} - ${b.job.endTime}`:"",agreedAmount:b.agreedAmount,status:b.status,startedAt:b.startedAt,completedAt:b.completedAt});

const savedKey="workforce_saved_jobs";
const readSaved=()=>{try{return JSON.parse(localStorage.getItem(savedKey)||"[]") as string[]}catch{return []}};

export const useWorkerStore=create<WorkerState>((set,get)=>({
  availability:"unavailable", verificationStatus:"pending", rejectionReason:"", profile:null, applications:[], bookings:[], notifications:[], savedJobs:readSaved(), jobs:[], loading:false,
  load:async()=>{set({loading:true});try{const [profileRes,jobsRes,appsRes,bookingsRes,notificationsRes]=await Promise.all([workerApi.me(),jobsApi.list(),jobsApi.applicationsMine(),bookingsApi.mine(),notificationApi.list()]);const p=profileRes.profile;set({profile:p,availability:p.availability,verificationStatus:p.verificationStatus==='approved'?"verified":p.verificationStatus,rejectionReason:p.verificationRejectionReason||"",jobs:(jobsRes.jobs||[]).map(mapJob),applications:(appsRes.applications||[]).map(mapApplication),bookings:(bookingsRes.bookings||[]).map(mapBooking),notifications:(notificationsRes.notifications||[]).map((n:any)=>({id:String(n.id||n._id),title:n.title,message:n.message,type:n.type,path:n.path||"/worker",read:Boolean(n.read),createdAt:n.createdAt}))});}catch(e){toast.error(e instanceof Error?e.message:"Unable to load worker data");}finally{set({loading:false});}},
  setVerification:(status,reason="")=>set({verificationStatus:status,rejectionReason:reason}),
  setAvailability:async(value)=>{try{await workerApi.update({availability:value});set({availability:value,profile:get().profile?{...get().profile!,availability:value}:null});toast.success(`Availability set to ${value}`);}catch(e){toast.error(e instanceof Error?e.message:"Unable to update availability");}},
  saveJob:(id)=>{const next=get().savedJobs.includes(id)?get().savedJobs.filter(x=>x!==id):[...get().savedJobs,id];localStorage.setItem(savedKey,JSON.stringify(next));set({savedJobs:next});},
  apply:async(job,note)=>{try{const r=await jobsApi.apply(job.id,note);set({applications:[mapApplication({...r.application,job}) ,...get().applications]});toast.success("Application sent");}catch(e){toast.error(e instanceof Error?e.message:"Application failed");}},
  withdrawApplication:async(id)=>{try{await jobsApi.withdrawApplication(id);set({applications:get().applications.map(a=>a.id===id?{...a,status:"withdrawn"}:a)});toast.success("Application withdrawn");}catch(e){toast.error(e instanceof Error?e.message:"Unable to withdraw application");}},
  markNotificationRead:async(id)=>{try{await notificationApi.markRead(id);set({notifications:get().notifications.map(n=>n.id===id?{...n,read:true}:n)});}catch(e){toast.error(e instanceof Error?e.message:"Unable to update notification");}},
  markAllNotificationsRead:async()=>{try{await notificationApi.markAllRead();set({notifications:get().notifications.map(n=>({...n,read:true}))});}catch(e){toast.error(e instanceof Error?e.message:"Unable to update notifications");}},
  startBooking:async(id,selfie)=>{try{const r=await bookingsApi.updateStatus(id,"active",undefined,selfie);set({bookings:get().bookings.map(b=>b.id===id?mapBooking(r.booking):b),availability:"busy"});toast.success("Work started");}catch(e){toast.error(e instanceof Error?e.message:"Unable to start booking");}},
  completeBooking:async(id)=>{try{const r=await bookingsApi.updateStatus(id,"completed");set({bookings:get().bookings.map(b=>b.id===id?mapBooking(r.booking):b)});toast.success("Booking marked completed");}catch(e){toast.error(e instanceof Error?e.message:"Unable to complete booking");}},
  confirmCompletion:async(id)=>{try{const r=await bookingsApi.complete(id);set({bookings:get().bookings.map(b=>b.id===id?mapBooking(r.booking):b)});toast.success("Completion confirmed");}catch(e){toast.error(e instanceof Error?e.message:"Unable to confirm completion");}},
}));
