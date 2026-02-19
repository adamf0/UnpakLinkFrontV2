import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useToast } from "@/Providers/ToastProvider";
import { FaGoogle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      const res = await axios.post("http://localhost:3000/login", dataForm, {
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
        const res = await axios.get("http://localhost:3000/whoami", {
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
          sessionStorage.setItem("token", body.access_token);
          sessionStorage.setItem("refresh", body.refresh_token);
          sessionStorage.setItem("info", JSON.stringify(data));

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
            <img src="https://unpak.link/assets/logo.svg" />
          </div>

          <h1 className="text-3xl font-bold mb-2">Masuk</h1>
          <p className="text-gray-500 mb-8 text-center">
            Silahkan pilih metode autentikasi
          </p>

          {/* Buttons */}
          <div className="w-full max-w-md space-y-4">
            <AuthButton
              icon={<FaGoogle />}
              text="Lanjutkan menggunakan Google"
              onClick={() => alert("fitur sso unpak belum aktif")}
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

function AuthButton({ icon, text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 border rounded-xl px-4 py-3 hover:bg-gray-50 transition"
    >
      <div className="text-lg">{icon}</div>
      <span className="text-sm font-medium">{text}</span>
    </button>
  );
}
