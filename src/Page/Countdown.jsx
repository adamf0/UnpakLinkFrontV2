import React, { useEffect, useState } from "react";

export default function Countdown() {
  // 🔹 SET TANGGAL DI SINI
  const startDate = new Date("2026-02-14T10:00:00");
  const endDate = new Date("2026-02-18T23:59:59");

  const getStatus = () => {
    const now = new Date();

    console.log(now, now < startDate, now >= startDate && now <= endDate)
    if (now < startDate) return "waiting";
    if (now >= startDate && now <= endDate) return "active";
    return "expired";
  };

  const calculateTimeLeft = () => {
    const now = new Date();
    const status = getStatus();

    let target;

    if (status === "waiting") target = startDate;
    else if (status === "active") target = endDate;
    else return null;

    const difference = target - now;
    if (difference <= 0) return null;

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [status, setStatus] = useState(getStatus());
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setStatus(getStatus());
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Redirect to google.com after 1 second delay if active
  useEffect(() => {
    if (status === "active") {
      const redirectTimer = setTimeout(() => {
        window.location.href = "https://google.com";
      }, 5000);

      return () => clearTimeout(redirectTimer);
    }
  }, [status]);

  const format = (num) => String(num).padStart(2, "0");

  const isExpired = status === "expired";

  return (
    <div className="min-h-screen bg-[#0f2a33] flex items-center justify-center px-4">
      <div className="flex flex-col items-center text-center">

        {/* 1️⃣ Circle Logo */}
        <div className="relative w-52 h-52 mb-8">
          <div
            className={`absolute inset-0 rounded-full border-4 transition duration-500 ${
              isExpired
                ? "border-red-500 animate-pulse"
                : status === "active"
                ? "border-green-400"
                : "border-orange-400"
            }`}
          ></div>

          <div
            className={`absolute inset-3 rounded-full shadow-xl
              bg-[url('https://unpak.link/assets/logo.svg')]
              bg-contain bg-center bg-no-repeat
              transition duration-500
              ${isExpired ? "grayscale opacity-60 scale-95" : ""}
            `}
          ></div>
        </div>

        {/* 2️⃣ Countdown Card */}
        {!isExpired && timeLeft && (
          <div className="bg-white text-gray-800 rounded-2xl shadow-lg px-8 py-4 flex gap-8 mb-8">
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

        {isExpired && (
          <div className="mb-8 bg-red-600 text-white px-6 py-2 rounded-full shadow-md">
            Expired
          </div>
        )}

        {/* 3️⃣ Title */}
        <h1 className="text-white text-2xl font-semibold">
          unpak.link{" "}
          <span className="text-gray-300 font-normal">
            |{" "}
            {status === "waiting"
              ? "Event Not Started"
              : status === "active"
              ? "Event Countdown"
              : "Link Expired"}
          </span>
        </h1>

        {/* 4️⃣ Description */}
        <p className="text-gray-400 mt-3 text-sm max-w-md">
          {status === "waiting" &&
            "The event has not started yet. Countdown to start time."}

          {status === "active" && (
            <>
              The link will remain active until the timer reaches zero.
              <br />
              <LoadingDots />
            </>
          )}

          {status === "expired" &&
            "This link has expired or is no longer available."}
        </p>
      </div>
    </div>
  );
}

// Komponen LoadingDots dengan animasi titik-titik berjalan
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
