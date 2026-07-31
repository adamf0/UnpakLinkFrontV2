import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import keycloak from "./lib/keycloak";

import Dashboard from "./Page/Dashboard";
import LinkPage from "./Page/LinkPage";
import CallbackSSO from "./Page/CallbackSSO";
import Callback from "./Page/Callback";
import SmartLink from "./Page/SmartLink";
import Landing from "./Page/Landing";
import NotFoundRoute from "./Page/NotFoundRoute";

import Template from "./Template/Template";
import ProtectedRoute from "./Components/ProtectedRoute";

import { ToastProvider } from "./Providers/ToastProvider";
import { AuthProvider } from "./Providers/AuthProvider";
import { SidebarProvider } from "./Providers/SidebarProvider";

export default function App() {
  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{
        onLoad: "check-sso",
        checkLoginIframe: false,
        pkceMethod: "S256",
      }}
      // onTokens={(tokens) => {
      //   if (tokens?.token) {
      //     localStorage.setItem("token", tokens.token);
      //   }
      //   if (tokens?.refreshToken) {
      //     localStorage.setItem("refresh", tokens.refreshToken);
      //   }
      // }}
    >
      <SidebarProvider>
        <AuthProvider>
          <ToastProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Landing />} />

                <Route path="/callback" element={<Callback />} />
                <Route path="/callback_sso" element={<CallbackSSO />} />
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
    </ReactKeycloakProvider>
  );
}
