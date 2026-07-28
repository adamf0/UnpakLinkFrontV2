import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useParams } from "react-router-dom";
import { useToast } from "@/Providers/ToastProvider";
import { useAuth } from "@/Providers/AuthProvider";
import { getInformation } from "@/lib/utils";
import countries from "i18n-iso-countries";
import Logo from "@/assets/logo.svg";
import id from "i18n-iso-countries/langs/id.json";
countries.registerLocale(id);

// ================= LOADING DOTS ======================
function LoadingDots() {
  return (
    <span className="inline-flex space-x-1 mt-2 text-green-400 italic text-xl font-semibold">
      Loading link
      <span className="animate-pulse">.</span>
      <span className="animate-pulse animation-delay-200">.</span>
      <span className="animate-pulse animation-delay-400">.</span>
      <style jsx>{`
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </span>
  );
}

const BASEAPI = import.meta.env.VITE_BASEAPI;

function LoadingDataDots() {
  return (
    <span className="inline-flex space-x-1 mt-2 text-green-400 italic text-xl font-semibold">
      Loading
      <span className="animate-pulse">.</span>
      <span className="animate-pulse animation-delay-200">.</span>
      <span className="animate-pulse animation-delay-400">.</span>
      <style jsx>{`
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </span>
  );
}

export default function SmartLink() {
  const { shorturl } = useParams();
  const { addToast } = useToast();
  const { getValidToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(null); // notfound | protect | count | default
  const [status, setStatus] = useState(null); // waiting | active | expired

  const [password, setPassword] = useState(null);
  const [long, setLong] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [timeLeft, setTimeLeft] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");

  // ================= LOAD DATA ======================
  async function loadData() {
    setLoading(true);

    try {
      const res = await fetch(
        `${BASEAPI}/link/short/${shorturl}?`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getValidToken()}`,
            "Content-Type": "application/json",
            "X-API-KEY": "putiklink",
          },
        },
      );

      if (res.status === 404) {
        setMode("notfound");
        return;
      }

      const body = await res.json();

      // 🔴 Backend status validation
      if (
        body.Status === "deleted" ||
        body.Status === "archive" ||
        body.Status == null
      ) {
        setMode("notfound");
        return;
      }

      setPassword(body.Password);
      setLong(body.LongUrl);

      // ================= COUNT MODE ======================
      if (body.StartAccess && body.EndAccess) {
        const start = new Date(body.StartAccess);
        const end = new Date(body.EndAccess);

        setStartDate(start);
        setEndDate(end);
        setMode("count");

        // gunakan timestamp absolute
        const now = Date.now();
        const startTime = start.getTime();
        const endTime = end.getTime();

        if (now < startTime) setStatus("waiting");
        else if (now >= startTime && now <= endTime) setStatus("active");
        else setStatus("expired");

        return;
      }

      // ================= PROTECT MODE ======================
      if (body.Password) {
        setMode("protect");
        return;
      }

      // ================= DEFAULT MODE ======================
      setMode("default");
    } catch (err) {
      console.error(err);
      setMode("notfound");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // ================= STATUS HELPER ======================
  const getStatus = () => {
    if (!startDate || !endDate) return null;

    const now = Date.now();
    const start = startDate.getTime();
    const end = endDate.getTime();

    if (now < start) return "waiting";
    if (now >= start && now <= end) return "active";
    return "expired";
  };

  // ================= REALTIME COUNTDOWN ======================
  useEffect(() => {
    if (mode !== "count") return;

    const interval = setInterval(() => {
      const newStatus = getStatus();
      setStatus(newStatus);

      if (newStatus === "expired") {
        setTimeLeft(null);
        return;
      }

      const now = Date.now();
      const target =
        newStatus === "waiting" ? startDate.getTime() : endDate.getTime();

      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, startDate, endDate]);

  // ================= REDIRECT ======================
  useEffect(() => {
    if (!long) return;

    if (mode === "default" || (mode === "count" && status === "active")) {
      // const timer = setTimeout(() => {
        window.location.href = long;
      // }, 5000);

      return () => clearTimeout(timer);
    }
  }, [mode, status, long]);

  const format = (num) => String(num).padStart(2, "0");
  const isExpired = status === "expired";

  function unlockHandler() {
    if (code === password) {
      window.location.href = long ?? "https://unpak.ac.id";
    } else {
      addToast("error", "Password not match");
    }
  }

  if (loading) {
    return null;
  }

  // ================= NOT FOUND ======================
  if (mode === "notfound") {
    return (
      <div className="min-h-screen bg-[#1f1f1f] flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-[110px] md:text-[150px] font-extrabold text-gray-300 leading-none">
            404
          </h1>

          <div className="relative flex justify-center mt-6 mb-8">
            <div className="relative">
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-8 bg-black/40 rounded-full blur-md"></div>
              <div className="relative w-48 h-48 flex items-center justify-center">
                <img
                  src={Logo}
                  alt="Logo"
                  className="w-48 h-48 object-contain"
                />
                <div className="absolute top-10 left-14 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow">
                  <div className="w-3 h-3 bg-black rounded-full"></div>
                </div>
                <div className="absolute top-10 right-14 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow">
                  <div className="w-3 h-3 bg-black rounded-full"></div>
                </div>
              </div>
              <span className="absolute -right-5 top-6 rotate-25 text-orange-400 text-5xl font-bold">
                ?
              </span>
            </div>
          </div>

          <p className="text-gray-400 text-base md:text-lg mb-5">
            The link you’re want visit is not found on our universe
          </p>

          <div className="mt-6 text-gray-300 font-semibold text-lg">
            unpak.link/{shorturl ?? "---"}
          </div>
        </div>
      </div>
    );
  }

  // ================= PROTECT ======================
  if (mode === "protect") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
          <div className="flex items-center gap-2 mb-10">
            <img src={Logo} className="w-12 h-12" />
            <span className="text-xl font-semibold text-gray-800">
              unpak.link
            </span>
          </div>

          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-gray-500" />
              <span className="text-xl font-semibold text-gray-800">
                <span className="text-red-500">unpak.link</span>/
                {shorturl ?? "---"}
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              Masukan Kode Rahasia untuk melanjutkan
            </p>
          </div>

          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="------"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          <button
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg transition duration-200"
            onClick={unlockHandler}
          >
            Lanjutkan
          </button>
        </div>
      </div>
    );
  }

  // ================= DEFAULT & COUNT ======================
  return (
    <div className="min-h-screen bg-[#0f2a33] flex items-center justify-center px-4">
      <div className="flex flex-col items-center text-center">
        <div className="relative w-52 h-52 mb-8">
          <div
            className={`absolute inset-0 rounded-full border-4 transition duration-500 ${
              isExpired
                ? "border-red-500 animate-pulse"
                : status === "active" || mode === "default"
                  ? "border-green-400"
                  : "border-orange-400"
            }`}
          ></div>

          <div
            className={`absolute inset-3 rounded-full shadow-xl
              bg-contain bg-center bg-no-repeat
              transition duration-500
              ${isExpired ? "grayscale opacity-60 scale-95" : ""}
            `}
            style={{
              backgroundImage: `url(${Logo})`,
            }}
          ></div>
        </div>

        {mode === "count" && !isExpired && timeLeft && (
          <div className="bg-white text-gray-800 rounded-2xl shadow-lg px-8 py-4 flex gap-8 mb-4">
            {[
              { label: "Days", value: format(timeLeft.days) },
              { label: "Hours", value: format(timeLeft.hours) },
              { label: "Minutes", value: format(timeLeft.minutes) },
              { label: "Seconds", value: format(timeLeft.seconds) },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <span className="text-2xl font-bold">{item.value}</span>
                <span className="text-xs text-gray-500">{item.label}</span>
              </div>
            ))}
          </div>
        )}

        {(mode === "default" || (mode === "count" && status === "active")) && (
          <LoadingDots />
        )}

        {isExpired && (
          <div className="mb-8 bg-red-600 text-white px-6 py-2 rounded-full shadow-md">
            Expired
          </div>
        )}

        <h1 className="text-white text-2xl font-semibold mt-4">
          <span className="text-gray-300">unpak.link/{shorturl ?? "---"}</span>
        </h1>

        <p className="text-gray-400 mt-3 text-sm max-w-md">
          {status === "waiting" &&
            "The event has not started yet. Countdown to start time."}
          {(status === "active" || mode === "default") &&
            "The link is now active. You will be redirected in 5 seconds."}
          {isExpired && "This link has expired or is no longer available."}
        </p>
      </div>
    </div>
  );
}
