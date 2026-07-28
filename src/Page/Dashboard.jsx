import { useState, useRef, useEffect, useMemo } from "react";
import { Calendar, ChevronDown, Menu } from "lucide-react";
import { useAuth } from "@/Providers/AuthProvider";
import { useToast } from "@/Providers/ToastProvider";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";

import {
  getBrowser,
  getBrowserIcon,
} from "@/lib/utils";
import GeoCountryMap from "@/Components/GeoCountryMap";
import { useSidebar } from "@/Providers/SidebarProvider";

const BASEAPI = import.meta.env.VITE_BASEAPI;

export default function Dashboard() {
  const { toggleSidebar } = useSidebar();
  const { addToast } = useToast();
  const getNDaysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split("T")[0];
  };

  const getToday = () => {
    return new Date().toISOString().split("T")[0];
  };

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(getNDaysAgo(7));
  const [endDate, setEndDate] = useState(getToday());
  const { getValidToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [datas, setDatas] = useState([]);

  const dateRef = useRef(null);
  const [selectedLinks, setSelectedLinks] = useState([]);

  const linkList = useMemo(
    () => [...new Set(datas.map((d) => d.LinkShort))],
    [datas],
  );

  // =======================
  // FILTER DATA BY DATE
  // =======================
  const filteredByDate = useMemo(() => {
    return datas.filter((item) => {
      const dateStr = item.CreatedDate || item.Created.split("T")[0];
      return (!startDate || dateStr >= startDate) && (!endDate || dateStr <= endDate);
    });
  }, [datas, startDate, endDate]);

  // =======================
  // FILTER BY SELECTED LINKS
  // =======================
  const filteredData = useMemo(() => {
    if (selectedLinks.length === 0) return filteredByDate;
    return filteredByDate.filter((d) => selectedLinks.includes(d.LinkShort));
  }, [filteredByDate, selectedLinks]);

  const toggleLink = (link) => {
    setSelectedLinks((prev) =>
      prev.includes(link) ? prev.filter((l) => l !== link) : [...prev, link],
    );
  };

  // =======================
  // CLOSE DATE PICKER WHEN CLICK OUTSIDE
  // =======================
  useEffect(() => {
    function handleClickOutside(e) {
      if (dateRef.current && !dateRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =======================
  // LOAD DATA SSE WITH PROGRESSIVE UPDATES & CLEANUP
  // =======================
  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set("mode", "sse");
        if (startDate && endDate) {
          queryParams.set("filters", `created_at:gte:${startDate}T00:00:00Z;created_at:lte:${endDate}T23:59:59Z`);
        }
        const res = await fetch(`${BASEAPI}/clicks?${queryParams.toString()}`, {
          method: "GET",
          headers: {
            Accept: "text/event-stream",
            Authorization: `Bearer ${getValidToken()}`,
          },
          signal: controller.signal,
        });

        if (res.status >= 400) {
          const text = await res.text();
          let body;
          try {
            body = JSON.parse(text);
          } catch {
            body = text;
          }
          if (
            body?.code === "Link.Validation" &&
            typeof body?.message === "object"
          ) {
            const messages = Object.values(body.message).flat().join("\n");
            addToast("error", messages);
            return;
          }
          if (typeof body === "string") {
            addToast("error", body);
            return;
          }
          addToast("error", body?.message || "Terjadi kesalahan pada server");
          return;
        }

        if (!res.body) throw new Error("SSE not supported by browser");

        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        const result = [];
        let lastUpdate = Date.now();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let index;
          let hasNewData = false;
          while ((index = buffer.indexOf("\n\n")) !== -1) {
            const rawEvent = buffer.slice(0, index).trim();
            buffer = buffer.slice(index + 2);

            if (!rawEvent.startsWith("data:")) continue;
            const payload = rawEvent.replace(/^data:\s*/, "");
            if (!payload || payload === "start" || payload === "done") continue;

            try {
              const parsed = JSON.parse(payload);
              parsed.CreatedTime = new Date(parsed.Created).getTime();
              parsed.CreatedDate = parsed.Created.split("T")[0];
              result.push(parsed);
              hasNewData = true;
            } catch (err) {
              console.error("JSON parse error:", payload);
            }
          }

          // Progressive update at most once every 1500ms to keep UI responsive
          if (hasNewData && Date.now() - lastUpdate > 1500) {
            setDatas([...result]);
            lastUpdate = Date.now();
          }
        }

        setDatas(result);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("SSE error:", err);
          addToast("error", "Ada masalah pada aplikasi");
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();

    return () => {
      controller.abort();
    };
  }, [startDate, endDate]);

  // =======================
  // TIMELINE DATA
  // =======================
  const timelineData = useMemo(() => {
    const map = {};

    filteredByDate.forEach((item) => {
      const date = item.CreatedDate || item.Created.split("T")[0];
      const link = item.LinkShort;

      if (!map[date]) map[date] = { date, total: 0 };

      map[date].total++;

      if (!map[date][link]) map[date][link] = 0;
      map[date][link]++;
    });

    // 🔹 pastikan setiap tanggal punya semua selected links
    Object.values(map).forEach((row) => {
      selectedLinks.forEach((link) => {
        if (row[link] === undefined) row[link] = 0;
      });
    });

    return Object.values(map).sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );
  }, [filteredByDate, selectedLinks]);

  // 1️⃣ Palet warna unik
  const palette = [
    "#2563EB", // biru
    "#F59E0B", // kuning/orange
    "#10B981", // hijau
    "#EF4444", // merah
    "#8B5CF6", // ungu
    "#EC4899", // pink
    "#F97316", // orange
    "#3B82F6", // biru muda
    "#14B8A6", // teal
    "#6366F1", // indigo
  ];

  // 2️⃣ Mapping link ke warna
  const linkColors = useMemo(() => {
    const map = {};
    linkList.forEach((link, i) => {
      map[link] = palette[i % palette.length]; // jika lebih dari palette.length, warna diulang
    });
    return map;
  }, [linkList]);

  // =======================
  // GEO DATA
  // =======================
  const geoData = useMemo(() => {
    const map = {};
    filteredByDate.forEach((item) => {
      const id = item.ISO || "Unknown";
      if (!map[id]) map[id] = 0;
      map[id]++;
    });

    return Object.entries(map)
      .map(([id, value]) => ({ id, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredByDate]);

  // =======================
  // BROWSER DATA
  // =======================
  const browserData = useMemo(() => {
    const map = {};
    filteredByDate.forEach((item) => {
      const browser = getBrowser(item.UserAgent);
      if (!map[browser]) map[browser] = 0;
      map[browser]++;
    });

    return Object.entries(map)
      .map(([browser, total]) => ({ browser, total }))
      .sort((a, b) => b.total - a.total);
  }, [filteredByDate]);

  // =======================
  // STATS
  // =======================
  // const totalVisitor = filteredByDate.length;
  // const uniqueVisitor = useMemo(
  //   () => new Set(filteredByDate.map(getVisitorIP)).size,
  //   [filteredByDate],
  // );

  const LocalLoader = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-3">
      <div className="w-8 h-8 border-4 border-[#49318f]/20 border-t-[#49318f] rounded-full animate-spin"></div>
      <p className="text-xs text-gray-500 animate-pulse">Memuat data statistik...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ================= PAGE TITLE & SUBTITLE ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau statistik klik dan data pengunjung UnpakLink secara realtime.
          </p>
        </div>

        {/* DATE FILTER */}
        <div ref={dateRef} className="relative w-full md:w-auto md:min-w-[240px]">
          <button
            onClick={() => setShowDatePicker((prev) => !prev)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center justify-between w-full hover:bg-gray-50 transition shadow-sm"
          >
            <div className="flex items-center gap-3 text-gray-600 text-sm">
              <Calendar size={16} className="text-[#49318f]" />
              <span className="font-medium">
                {startDate && endDate
                  ? `${startDate} s/d ${endDate}`
                  : !startDate && !endDate
                  ? "Semua Rentang Waktu"
                  : "Pilih Rentang Tanggal"}
              </span>
            </div>
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${showDatePicker ? "rotate-180" : ""}`}
            />
          </button>

          {showDatePicker && (
            <div className="absolute right-0 z-50 mt-2 w-full md:w-80 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 animate-in fade-in zoom-in-95">
              <div className="space-y-4">
                {/* QUICK SELECT OPTIONS */}
                <div className="grid grid-cols-2 gap-2 border-b border-gray-100 pb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate(getToday());
                      setEndDate(getToday());
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      startDate === getToday() && endDate === getToday()
                        ? "bg-[#49318f]/10 text-[#49318f] border-[#49318f]/30"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Hari Ini
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate(getNDaysAgo(1));
                      setEndDate(getToday());
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      startDate === getNDaysAgo(1) && endDate === getToday()
                        ? "bg-[#49318f]/10 text-[#49318f] border-[#49318f]/30"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Kemarin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate(getNDaysAgo(7));
                      setEndDate(getToday());
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      startDate === getNDaysAgo(7) && endDate === getToday()
                        ? "bg-[#49318f]/10 text-[#49318f] border-[#49318f]/30"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    7 Hari Terakhir
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate(getNDaysAgo(30));
                      setEndDate(getToday());
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      startDate === getNDaysAgo(30) && endDate === getToday()
                        ? "bg-[#49318f]/10 text-[#49318f] border-[#49318f]/30"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    30 Hari Terakhir
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                    className={`col-span-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      !startDate && !endDate
                        ? "bg-[#49318f]/10 text-[#49318f] border-[#49318f]/30"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Semua Rentang Waktu (All Time)
                  </button>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (endDate && e.target.value > endDate) setEndDate("");
                    }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#49318f]/20 focus:border-[#49318f]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">End Date</label>
                  <input
                    type="date"
                    min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#49318f]/20 focus:border-[#49318f]"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="flex-1 bg-[#49318f] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#382278] transition shadow-sm"
                  >
                    Terapkan
                  </button>
                  <button
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= CONTENT GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ================= LEFT COLUMN (CHARTS) ================= */}
        <div className="lg:col-span-3 space-y-6">
          {/* TIMELINE */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-6">
            <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#49318f] rounded-full"></span>
              Visitor Timeline
            </h2>
            {datas.length === 0 && loading ? (
              <LocalLoader />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("id-ID", {
                        month: "short",
                        year: "2-digit",
                      });
                    }}
                    interval="preserveStartEnd"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    minTickGap={20}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload) return null;

                      return (
                        <div className="bg-white p-3 border border-gray-100 rounded-xl shadow-lg text-xs space-y-1.5">
                          <div className="font-bold text-gray-800 border-b pb-1 mb-1">
                            {new Date(label).toLocaleDateString("id-ID", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                          {payload.map((p) => (
                            <div
                              key={p.dataKey}
                              className="flex justify-between items-center gap-6"
                            >
                              <span className="text-gray-500 font-medium">{p.name}</span>
                              <span className="font-bold text-gray-800">{p.value}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#49318f"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 5 }}
                    name="Total Klik"
                  />
                  {selectedLinks.map((link) => (
                    <Line
                      key={link}
                      type="monotone"
                      dataKey={link}
                      stroke={linkColors[link]}
                      strokeWidth={2}
                      dot={false}
                      name={link}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ================= GEO + BROWSER (1 ROW) ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GEO MAP */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h2 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#06b6d4] rounded-full"></span>
                Top Country
              </h2>
              {datas.length === 0 && loading ? <LocalLoader /> : <GeoCountryMap data={geoData} />}
            </div>

            {/* BROWSER VERTICAL */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h2 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#ffc107] rounded-full"></span>
                Browser Usage
              </h2>
              {datas.length === 0 && loading ? (
                <LocalLoader />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart layout="vertical" data={browserData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis
                      type="category"
                      dataKey="browser"
                      tick={({ x, y, payload }) => (
                        <g transform={`translate(${x},${y})`}>
                          <foreignObject width="30" height="30" x="-15" y="-15">
                            <div className="flex items-center justify-center w-full h-full">
                              {getBrowserIcon(payload.value)}
                            </div>
                          </foreignObject>
                        </g>
                      )}
                    />
                    <Tooltip />
                    <Bar dataKey="total" fill="#ffc107" radius={[0, 6, 6, 0]} name="Total Pengguna" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN (FILTER) ================= */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 lg:max-h-[600px] flex flex-col">
          <h2 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2 border-b pb-3">
            <span className="w-1.5 h-5 bg-[#49318f] rounded-full"></span>
            Filter Link
          </h2>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-2">
            {datas.length === 0 && loading && <LocalLoader />}
            {!(datas.length === 0 && loading) && linkList.length === 0 && (
              <p className="text-sm text-gray-400 italic text-center py-6">Tidak ada link terdeteksi</p>
            )}
            {!(datas.length === 0 && loading) &&
              linkList.map((link) => (
                <label
                  key={link}
                  className={`flex items-center gap-3 text-sm px-3 py-2 rounded-xl border transition cursor-pointer ${
                    selectedLinks.includes(link)
                      ? "border-[#49318f] bg-[#49318f]/5 text-[#49318f] font-semibold"
                      : "border-gray-100 hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedLinks.includes(link)}
                    onChange={() => toggleLink(link)}
                    className="accent-[#49318f] rounded"
                  />
                  <span className="truncate">{link}</span>
                </label>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
