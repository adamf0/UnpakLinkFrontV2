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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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
      const itemDate = new Date(item.Created);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      return (!start || itemDate >= start) && (!end || itemDate <= end);
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
        const res = await fetch(`${BASEAPI}/clicks?mode=sse`, {
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
              result.push(parsed);
              hasNewData = true;
            } catch (err) {
              console.error("JSON parse error:", payload);
            }
          }

          // Progressive update at most once every 400ms to keep UI responsive
          if (hasNewData && Date.now() - lastUpdate > 400) {
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
  }, []);

  // =======================
  // TIMELINE DATA
  // =======================
  const timelineData = useMemo(() => {
    const map = {};

    filteredByDate.forEach((item) => {
      const date = new Date(item.Created).toISOString().split("T")[0];
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

  return (
    <>
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        {/* ================= MOBILE TOGGLE ================= */}
        <div className="md:hidden">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Open Sidebar"
          >
            <Menu className="w-6 h-6 text-gray-800" />
          </button>
        </div>

        {/* ================= PAGE TITLE ================= */}
        <h1 className="text-xl font-semibold text-gray-800 cursor-pointer">
          Dashboard
        </h1>
      </header>

      <main className="h-[calc(100vh-64px)] overflow-y-auto p-6 bg-gray-100">
        {/* DATE FILTER */}
        <div ref={dateRef} className="relative max-w-md mb-6">
          <button
            onClick={() => setShowDatePicker((prev) => !prev)}
            className="bg-white border rounded-xl px-4 py-3 flex items-center justify-between w-full hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar size={18} />
              <span>
                {startDate && endDate
                  ? `${startDate} — ${endDate}`
                  : "Select date range"}
              </span>
            </div>
            <ChevronDown
              className={`transition ${showDatePicker ? "rotate-180" : ""}`}
            />
          </button>

          {showDatePicker && (
            <div className="absolute z-50 mt-2 w-full bg-white border rounded-xl shadow-lg p-4 animate-in fade-in zoom-in-95">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (endDate && e.target.value > endDate) setEndDate("");
                    }}
                    className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">End Date</label>
                  <input
                    type="date"
                    min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="flex-1 w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                    className="flex-1 w-full bg-gray-100 py-2 rounded-lg text-sm hover:bg-gray-200 transition"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ================= LEFT COLUMN ================= */}
          <div className="lg:col-span-3 space-y-6">
            {/* TIMELINE */}
            <div className="bg-white border rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold text-lg">Visitor Timeline</h2>
              {datas.length === 0 && loading ? (
                "Loading..."
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
                      tick={{ fontSize: 12 }}
                      minTickGap={20}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload) return null;

                        return (
                          <div className="bg-white p-2 border rounded shadow">
                            <div className="font-semibold mb-1">
                              {new Date(label).toLocaleDateString("id-ID")}
                            </div>
                            {payload.map((p) => (
                              <div
                                key={p.dataKey}
                                className="flex justify-between"
                              >
                                <span>{p.name}</span>
                                <span>{p.value}</span>
                              </div>
                            ))}
                          </div>
                        );
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                      name="Total"
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
              <div className="bg-white border rounded-2xl p-6">
                <h2 className="font-semibold text-lg mb-4">Top Country</h2>
                {datas.length === 0 && loading ? "Loading..." : <GeoCountryMap data={geoData} />}
              </div>

              {/* BROWSER VERTICAL */}
              <div className="bg-white border rounded-2xl p-6">
                <h2 className="font-semibold text-lg mb-4">Browser Usage</h2>
                {datas.length === 0 && loading ? (
                  "Loading..."
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart layout="vertical" data={browserData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="browser"
                        tick={({ x, y, payload }) => (
                          <g transform={`translate(${x},${y})`}>
                            <foreignObject width="30" height="30">
                              <div className="flex items-center justify-center">
                                {getBrowserIcon(payload.value)}
                              </div>
                            </foreignObject>
                          </g>
                        )}
                      />
                      <Tooltip />
                      <Bar dataKey="total" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div className="bg-white border rounded-2xl p-6 h-screen overflow-y-auto ">
            <h2 className="font-semibold text-lg mb-4">Filter Link</h2>

            <div className="space-y-3 mb-12">
              {datas.length === 0 && loading && "loading..."}
              {!(datas.length === 0 && loading) &&
                linkList.map((link) => (
                  <label key={link} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedLinks.includes(link)}
                      onChange={() => toggleLink(link)}
                    />
                    {link}
                  </label>
                ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
