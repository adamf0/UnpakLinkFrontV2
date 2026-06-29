import { useKeycloak } from "@react-keycloak/web";
import { useAuth } from "@/Providers/AuthProvider";
import { Outlet } from "react-router-dom";

const BASEURL = import.meta.env.VITE_BASEURL;
export default function ProtectedRoute() {
  const { keycloak, initialized } = useKeycloak();
  const { isSessionExpired } = useAuth();
  
  const isRS512 = (token) => {
    try {
      const parts = token.split(".");

      if (parts.length !== 3) {
        return false;
      }

      // decode JWT header
      const header = JSON.parse(
        atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")),
      );

      return header.alg === "RS512";
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isSessionExpired() || !localStorage.getItem("token") || (isRS512(localStorage.getItem("token")) && !keycloak.authenticated)) {
    window.location.href = `${BASEURL}/login`;

    return null;
  }

  return <Outlet />;
}
