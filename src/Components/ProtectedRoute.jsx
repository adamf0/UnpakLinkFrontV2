import { useAuth } from "@/Providers/AuthProvider";
import { Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const { isSessionExpired } = useAuth();

  if (
    isSessionExpired() ||
    !sessionStorage.getItem("token")
  ) {
    window.location.href =
      "https://portal.unpak.ac.id/login";

    return null;
  }

  return <Outlet />;
}