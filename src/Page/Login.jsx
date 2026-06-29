import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useToast } from "@/Providers/ToastProvider";
// import { FaGoogle, FaKey } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Logo from "@/assets/logo.svg";
import { useKeycloak } from "@react-keycloak/web";
import sso_unpak from "@/assets/sso_unpak.png";

const BASEAPI = import.meta.env.VITE_BASEAPI;

export default function Login() {
  const { keycloak, initialized } = useKeycloak();
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Cek jika sudah login via SSO Keycloak
    if (initialized && keycloak?.authenticated) {
      localStorage.setItem("token", keycloak.token || "");
      localStorage.setItem("idToken", keycloak.idToken || "");
      localStorage.setItem("refresh", keycloak.refreshToken || "");
      navigate("/dashboard", { replace: true });
      return;
    }

    // 2. Cek jika sudah login secara lokal (token masih valid)
    const localToken = localStorage.getItem("token");
    if (localToken) {
      try {
        const payload = JSON.parse(atob(localToken.split(".")[1]));
        if (payload && payload.exp > Math.floor(Date.now() / 1000)) {
          navigate("/dashboard", { replace: true });
        }
      } catch (e) {
        // Token tidak valid, abaikan
      }
    }
  }, [initialized, keycloak?.authenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onTouched" });

  const onSubmit = async (data) => {
    console.log(data);
    const dataForm = new FormData();
    dataForm.append("username", data.username);
    dataForm.append("password", data.password);

    setLoading(true);

    try {
      const res = await axios.post(`${BASEAPI}/login`, dataForm, {
        validateStatus: () => true,
      });
      const body = res.data;
      console.log(body);

      if (body.error || res.status >= 400) {
        addToast(
          "error",
          typeof body === "string" ? "ada masalah pada server" : body?.message,
        );
        // setErrorMessage(body.error);
      } else {
        const res = await axios.get(`${BASEAPI}/whoami`, {
          validateStatus: () => true,
          headers: {
            Authorization: `Bearer ${body.access_token}`,
          },
        });

        const data = res.data;
        if (body.error || res.status >= 400) {
          // 🔥 Handle validation error khusus
          if (
            body?.code === "Login.Validation" &&
            typeof body.message === "object"
          ) {
            const messages = Object.values(body.message).flat().join("\n");

            addToast("error", messages);
            return;
          }

          // 🔥 Kalau string
          if (typeof body === "string") {
            addToast("error", body);
            return;
          }

          // 🔥 Generic object
          addToast("error", body?.message || "Terjadi kesalahan pada server");
          return;
        } else {
          localStorage.setItem("token", body.access_token);
          localStorage.setItem("refresh", body.refresh_token);
          localStorage.setItem("info", JSON.stringify(data));

          navigate("/dashboard");
        }
      }
    } catch (err) {
      console.error(err);
      const data = err.response.data;

      if (typeof data === "object" && data !== null) {
        addToast("error", data.message);
      } else {
        addToast("error", "ada masalah pada aplikasi");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 text-sm font-medium">Memeriksa sesi autentikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-xl overflow-hidden flex">
        {/* LEFT SIDE */}
        <div className="hidden md:block w-1/2 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-300 via-blue-300 to-indigo-400 blur-2xl"></div>
          <div className="absolute inset-2 bg-gradient-to-tr from-indigo-500/40 via-purple-400/30 to-blue-400/40 scale-110"></div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center items-center relative">
          {/* Logo */}
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <img src={Logo} />
          </div>

          <h1 className="text-3xl font-bold mb-2">Masuk</h1>
          <p className="text-gray-500 mb-8 text-center">
            Silahkan pilih metode autentikasi
          </p>

          {/* Buttons */}
          <div className="w-full max-w-md space-y-4">
            <AuthButton
              text="Login menggunakan SSO Unpak"
              onClick={() =>
                keycloak.login({
                  redirectUri: window.location.origin + "/callback_sso",
                })
              }
            />
          </div>

          <div className="flex items-center my-6 w-full max-w-md">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-sm text-gray-500">atau</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Register */}
          <form
            className="w-full max-w-md flex flex-col gap-2"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-600 mb-2"
              >
                Username
              </label>
              <input
                type="text"
                placeholder="Masukkan NPM / NIDN Simak"
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                // value="admin_rbac@yopmail.com"
                {...register("username", {
                  required: "username harus diisi",
                })}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-600"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  className={`w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  {...register("password", {
                    required: "Password harus diisi",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.008 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.008-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.59 16.392 7.46 19.5 12 19.5c.993 0 1.953-.138 2.86-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.639 0 8.574 3.008 9.963 7.178a10.523 10.523 0 01-4.379 5.043M6.228 6.228L3 3m3.228 3.228l12.544 12.544"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
              {loading ? "Loading..." : "Login"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-xs text-gray-400 mt-8">
            © Unpak.link 2026 |{" "}
            <span className="underline cursor-pointer">Terms</span> |{" "}
            <span className="underline cursor-pointer">Privacy</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function AuthButton({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 border rounded-xl px-4 py-3 hover:bg-gray-50 transition"
    >
      <img src={sso_unpak} alt="sso_unpak" width={36} height={36}/>
      <span className="text-sm font-medium">{text}</span>
    </button>
  );
}
