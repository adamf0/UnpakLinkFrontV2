import keycloak from "@/lib/keycloak";
import { useAuth } from "@/Providers/AuthProvider";
import { Outlet } from "react-router-dom";

const BASEURL = import.meta.env.VITE_BASEURL;
export default function ProtectedRoute() {
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

  if (isSessionExpired() || !localStorage.getItem("token") || (isRS512(localStorage.getItem("token")) && !keycloak.authenticated)) {
    window.location.href = `${BASEURL}/login`;

    return null;
  }

  return <Outlet />;
}
