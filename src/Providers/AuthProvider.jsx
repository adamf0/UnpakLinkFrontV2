import keycloak from "@/lib/keycloak";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
const BASEAPI = import.meta.env.VITE_BASEAPI;

const decodeJWT = (jwt) => {
  try {
    const payload = jwt.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

const nowInSeconds = () => Math.floor(Date.now() / 1000);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);

  /* ======================
   * TOKEN CHECK
   * ====================== */

  const isTokenExpired = () => {
    const token = localStorage.getItem("token");
    if (!token) return true;

    const payload = decodeJWT(token);
    if (!payload?.exp) return true;

    return payload.exp <= nowInSeconds();
  };

  // const isRefreshExpired = () => {
  //   const refresh = localStorage.getItem("refresh");
  //   if (!refresh) return true;

  //   const payload = decodeJWT(refresh);
  //   if (!payload?.exp) return true;

  //   return payload.exp <= nowInSeconds();
  // };

  const isSessionExpired = () => {
    return isTokenExpired();
  };

  /* ======================
   * TOKEN PICKER
   * ====================== */

  const getValidToken = () => {
    if (!isTokenExpired()) return localStorage.getItem("token");
    // if (!isRefreshExpired()) return localStorage.getItem("refresh");
    return null;
  };

  const getDecodedToken = (token) => {
    try {
      return jwtDecode(token);
    } catch (e) {
      return null;
    }
  };

  const getNameInfo = () => {
    const info = JSON.parse(localStorage.getItem("info") ?? "{}");
    const info2 = getDecodedToken(localStorage.getItem("idToken"));

    return info2?.name ?? info?.Name ?? "";
  };
  const getLevelInfo = () => {
    const info = JSON.parse(localStorage.getItem("info") ?? "{}");
    const info2 = getDecodedToken(localStorage.getItem("idToken"));
    console.log(info2?.group);
    if ((info2?.group ?? []).includes("adm_pusat")) {
      return "PUTIK LINK";
    } else if ((info2?.group ?? []).includes("Mahasiswa")) {
      return "MAHASISWA";
    } else if ((info2?.group ?? []).includes("Dosen")) {
      return "DOSEN LINK";
    } else if ((info2?.group ?? []).includes("Tendik")) {
      return "TENDIK";
    }

    return info?.Level;
  };

  /* ======================
   * USER INFO
   * ====================== */

  const fetchUserInfo = async () => {
    setUserLoading(true);
    setUserError(null);

    try {
      const validToken = getValidToken();
      if (!validToken) throw new Error("Session expired");

      const res = await axios.get(`${BASEAPI}/whoami`, {
        validateStatus: () => true,
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
      });

      const data = res.data;

      setUser({
        uuid: data.UUID,
        name: data.Name,
        level: data.Level,
        extra_role: data.ExtraRole,
      });

      return data;
    } catch (err) {
      setUser(null);
      setUserError("Session expired");
      throw err;
    } finally {
      setUserLoading(false);
    }
  };

  /* ======================
   * LOGOUT
   * ====================== */

  const logout = async () => {
    await fetch(
      "https://gerbang.unpak.ac.id/realms/gateway/protocol/openid-connect/logout",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: "unpak_link_gate",
          refresh_token: localStorage.getItem("refresh"),
        }),
      },
    );
    // await keycloak.logout({
    //   redirectUri: window.location.origin,
    //   idTokenHint: keycloak.idToken,
    // });
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    localStorage.removeItem("info");
    localStorage.removeItem("idToken");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setToken,
        isSessionExpired,
        getValidToken,
        fetchUserInfo,
        getNameInfo,
        getLevelInfo,
        logout,
        userLoading,
        userError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
