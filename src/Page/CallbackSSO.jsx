import { useKeycloak } from "@react-keycloak/web";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CallbackSSO() {
  const { keycloak, initialized } = useKeycloak();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!initialized) return;

    if (keycloak?.authenticated && keycloak?.token) {
      localStorage.setItem("token", keycloak.token || "");
      localStorage.setItem("idToken", keycloak.idToken || "");
      localStorage.setItem("refresh", keycloak.refreshToken || "");

      navigate("/dashboard", { replace: true });
    } else {
      // Jika initialized bernilai true tapi keycloak.authenticated false,
      // kemungkinan terjadi kesalahan pada pertukaran token (misal Cloudflare WAF 403 Forbidden pada endpoint token)
      const timer = setTimeout(() => {
        if (!keycloak?.authenticated) {
          setError(
            "Gagal melakukan autentikasi SSO (Request ke token endpoint ditolak oleh server/Cloudflare WAF - HTTP 403 Forbidden). Silakan hubungi administrator infrastruktur Keycloak/Cloudflare."
          );
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [keycloak, keycloak?.authenticated, keycloak?.idToken, keycloak?.token, initialized, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-montserrat">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4 border border-gray-100">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-gray-800">Autentikasi Gagal</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{error}</p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                keycloak.login({
                  redirectUri: window.location.origin + "/callback_sso",
                });
              }}
              className="px-5 py-2.5 bg-[#49318f] text-white text-sm font-semibold rounded-xl hover:bg-[#382473] transition-colors cursor-pointer"
            >
              Coba Lagi
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-montserrat">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#49318f] mb-4"></div>
      <p className="text-gray-700 font-medium">Memproses Login SSO...</p>
    </div>
  );
}