import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Page/Dashboard";
import LinkPage from "./Page/LinkPage";
import Login from "./Page/Login";
import { ToastProvider } from "./Providers/ToastProvider";
import Template from "./Template/Template";
import { AuthProvider } from "./Providers/AuthProvider";
import SmartLink from "./Page/SmartLink";
import { SidebarProvider } from "./Providers/SidebarProvider";
import ProtectedRoute from "./Components/ProtectedRoute";
import Landing from "./Page/Landing";
import NotFoundRoute from "./Page/NotFoundRoute";

export default function App() {
  return (
    <SidebarProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/:shorturl" element={<SmartLink />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<Template />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/link" element={<LinkPage />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFoundRoute />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </SidebarProvider>
  );
}
