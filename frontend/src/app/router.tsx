import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { useEffect } from "react";
import { useLocation } from "react-router";
import type { ReactNode } from "react";
import WorkforceLayout from "../features/workforce/WorkforceLayout";
import CustomerHomePage from "../features/workforce/CustomerHomePage";
import FindWorkersPage from "../features/workforce/FindWorkersPage";
import PostRequirementPage from "../features/workforce/PostRequirementPage";
import BookingsPage from "../features/workforce/BookingsPage";
import MessagesPage from "../features/workforce/MessagesPage";
import WorkGuidePage from "../features/workforce/WorkGuidePage";
import CustomerNotificationsPage from "../features/workforce/CustomerNotificationsPage";
import CustomerRequestsPage from "../features/workforce/CustomerRequestsPage";
import SupportPage from "../features/workforce/SupportPage";
import LoginPage from "../features/auth/LoginPage";
import ProfilePage from "../features/auth/ProfilePage";
import AdminLayout from "../features/admin/AdminLayout";
import AdminDashboard from "../features/admin/AdminDashboard";
import AdminUsers from "../features/admin/AdminUsers";
import AdminComplaints from "../features/admin/AdminComplaints";
import AdminAnalytics from "../features/admin/AdminAnalytics";
import AdminSettings from "../features/admin/AdminSettings";
import AdminVerification from "../features/admin/AdminVerification";
import AdminDocuments from "../features/admin/AdminDocuments";
import AdminJobs from "../features/admin/AdminJobs";
import AdminBookings from "../features/admin/AdminBookings";
import WorkerLayout from "../features/worker/WorkerLayout";
import WorkerDashboardPage from "../features/worker/WorkerDashboardPage";
import WorkerJobsPage from "../features/worker/WorkerJobsPage";
import WorkerBookingsPage from "../features/worker/WorkerBookingsPage";
import WorkerMessagesPage from "../features/worker/WorkerMessagesPage";
import WorkerWorkGuidePage from "../features/worker/WorkerWorkGuidePage";
import WorkerProfilePage from "../features/worker/WorkerProfilePage";
import WorkerApplicationsPage from "../features/worker/WorkerApplicationsPage";
import WorkerNotificationsPage from "../features/worker/WorkerNotificationsPage";
import WorkerBookingDetailsPage from "../features/worker/WorkerBookingDetailsPage";
import WorkerPendingPage from "../features/worker/WorkerPendingPage";
import WorkerPublicProfilePage from "../features/workforce/WorkerPublicProfilePage";
import { useAuthStore } from "../features/auth/auth.store";
import { useWorkerStore } from "../features/worker/worker.store";

function RoleGate({ role, children }:{role:"customer"|"worker"|"admin";children:ReactNode}){
 const {token,user}=useAuthStore();
 if(!token||!user) return <Navigate to="/login" replace/>;
 const actual=user.role==="user"?"customer":user.role;
 if(actual!==role) return <Navigate to={actual==="admin"?"/admin":actual==="worker"?"/worker":"/"} replace/>;
 return children;
}
function CustomerGate(){
 const {token,user}=useAuthStore();
 if(!token||!user) return <Navigate to="/login" replace/>;
 const actual=user.role==="user"?"customer":user.role;
 if(actual==="worker") return <Navigate to="/worker" replace/>;
 if(actual==="admin") return <Navigate to="/admin" replace/>;
 return <Outlet/>;
}
function WorkerRouteShell(){
 const {token,user}=useAuthStore();
 const {verificationStatus,setVerification}=useWorkerStore();
 const location=useLocation();
 useEffect(()=>{ if(user?.verificationStatus) setVerification(user.verificationStatus,user.verificationRejectionReason||""); },[user?.verificationStatus,user?.verificationRejectionReason,setVerification]);
 useEffect(()=>{ if(user?.role==="worker") void useWorkerStore.getState().load(); },[user?.id]);
 if(!token||!user) return <Navigate to="/login" replace/>;
 const actual=user.role==="user"?"customer":user.role;
 if(actual!=="worker") return <Navigate to={actual==="admin"?"/admin":"/"} replace/>;
 if(verificationStatus !== "verified" && !location.pathname.endsWith("/profile")) return <WorkerPendingPage/>;
 return <WorkerLayout/>;
}

export const router=createBrowserRouter([
 {path:"/",element:<WorkforceLayout/>,children:[
  {element:<CustomerGate/>,children:[
  {index:true,element:<CustomerHomePage/>},{path:"find-workers",element:<FindWorkersPage/>},{path:"find-workers/:id",element:<WorkerPublicProfilePage/>},{path:"post-requirement",element:<PostRequirementPage/>},{path:"bookings",element:<BookingsPage/>},{path:"messages",element:<MessagesPage/>},{path:"workguide",element:<WorkGuidePage/>},{path:"notifications",element:<CustomerNotificationsPage/>},{path:"requests",element:<CustomerRequestsPage/>},{path:"support",element:<SupportPage/>},{path:"profile",element:<ProfilePage/>},
 ]},
 ]},
 {path:"/login",element:<LoginPage/>},
 {path:"/worker",element:<RoleGate role="worker"><WorkerRouteShell/></RoleGate>,children:[{index:true,element:<WorkerDashboardPage/>},{path:"find-jobs",element:<WorkerJobsPage/>},{path:"applications",element:<WorkerApplicationsPage/>},{path:"bookings",element:<WorkerBookingsPage/>},{path:"bookings/:id",element:<WorkerBookingDetailsPage/>},{path:"messages",element:<WorkerMessagesPage/>},{path:"workguide",element:<WorkerWorkGuidePage/>},{path:"support",element:<SupportPage/>},{path:"notifications",element:<WorkerNotificationsPage/>},{path:"profile",element:<WorkerProfilePage/>}]},
 {path:"/admin",element:<RoleGate role="admin"><AdminLayout/></RoleGate>,children:[{index:true,element:<Navigate to="/admin/dashboard" replace/>},{path:"dashboard",element:<AdminDashboard/>},{path:"complaints",element:<AdminComplaints/>},{path:"users",element:<AdminUsers/>},{path:"verification",element:<AdminVerification/>},{path:"documents",element:<AdminDocuments/>},{path:"jobs",element:<AdminJobs/>},{path:"bookings",element:<AdminBookings/>},{path:"analytics",element:<AdminAnalytics/>},{path:"settings",element:<AdminSettings/>}]},
 {path:"*",element:<Navigate to="/login" replace/>},
]);
