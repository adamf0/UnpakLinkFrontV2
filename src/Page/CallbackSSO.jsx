import { useKeycloak } from "@react-keycloak/web";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CallbackSSO() {
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(keycloak)
    if (keycloak?.idToken) {
      localStorage.setItem("token", keycloak.token || "");
      localStorage.setItem("idToken", keycloak.idToken || "");
      localStorage.setItem("refresh", keycloak.refreshToken || "");

      navigate("/dashboard", {replace: true});
    }
  }, [keycloak?.idToken]);

  return <div>Processing login...</div>;
}