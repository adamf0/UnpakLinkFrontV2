// Callback.jsx

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function Callback() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const accessToken = params.get("token");
    const idToken = params.get("ctx");

    /* =========================
     * TOKEN CHECK
     * ========================= */
    if (!accessToken || !idToken) {
      window.location.href = "https://portal.unpak.ac.id/login";
      return;
    }

    try {
      /* =========================
       * DECODE ID TOKEN
       * ========================= */
      const payload = jwtDecode(idToken);

      console.log("ACCESS TOKEN:", accessToken);
      console.log("ID TOKEN:", payload);

      /* =========================
       * LEVEL MAPPING
       * ========================= */
      let level = "USER";

      if (payload?.group?.includes("adm_pusat")) {
        level = "ADMIN";
      } else if (payload?.group?.includes("Mahasiswa")) {
        level = "MAHASISWA";
      } else if (payload?.group?.includes("Dosen")) {
        level = "DOSEN";
      } else if (payload?.group?.includes("Tendik")) {
        level = "TENDIK";
      }

      /* =========================
       * SESSION INFO FORMAT
       * ========================= */
      const info = {
        UserId: payload.employeeid ?? payload.preferred_username,
        UUID: null,
        Username: payload.preferred_username,
        Level: level,
        Name: payload.name,
        ExtraRole: [],
      };

      /* =========================
       * SAVE SESSION
       * ========================= */
      localStorage.setItem("token", idToken);
      localStorage.setItem("info", JSON.stringify(info));

      /* =========================
       * REDIRECT DASHBOARD
       * ========================= */
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);

      localStorage.clear();

      alert("Token invalid");

      window.location.href = "https://portal.unpak.ac.id/login";
    }
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Processing SSO Login...
    </div>
  );
}