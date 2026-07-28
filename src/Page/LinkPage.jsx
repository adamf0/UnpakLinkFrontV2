import { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Trash2,
  Lock,
  Clock,
  QrCode,
  Check,
  X,
  Clock9,
  LockKeyholeOpen,
  LockKeyhole,
  EyeClosed,
  Eye,
  LinkIcon,
  ChevronDown,
  ChevronUp,
  Archive,
  LucidePencil,
  Copy,
  Trash,
  Menu,
} from "lucide-react";

const logo_unpak = "https://assets.unpak.ac.id/images/logo/logo-unpak.png";

import { QRCodeCanvas as QR } from "qrcode.react";
import { useForm } from "react-hook-form";
import { useToast } from "@/Providers/ToastProvider";
import { useAuth } from "@/Providers/AuthProvider";
import { isEmpty } from "@/Common/Utils";
import axios from "axios";
import { toPng } from "html-to-image";
import { FiRotateCcw } from "react-icons/fi";
import { useSidebar } from "@/Providers/SidebarProvider";
import Swal from "sweetalert2";

const formatDateTime = (value) => {
  if (!value) return "";

  const formatted = value.replace("T", " ");

  // Kalau belum ada detik
  return formatted.length === 16 ? formatted + ":00" : formatted;
};

const BASEAPI = import.meta.env.VITE_BASEAPI;

export default function LinkPage() {
  const { addToast } = useToast();
  const { toggleSidebar } = useSidebar();
  const controller = new AbortController();
  const { getValidToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [datas, setDatas] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("active");
  const [_, setNow] = useState(Date.now());
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchTerm]);

  const filterRef = useRef(null);

  // Close filter when click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000); // tiap 1 detik

    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    setLoading(true);

    try {
      const res = await fetch(
        `${BASEAPI}/links?mode=sse&filters=status:eq:${activeFilter}`,
        {
          method: "GET",
          headers: {
            Accept: "text/event-stream",
            Authorization: `Bearer ${getValidToken()}`,
          },
          signal: controller.signal,
        },
      );

      // 🔥 Kalau HTTP error
      if (res.status >= 400) {
        const text = await res.text();

        let body;
        try {
          body = JSON.parse(text);
        } catch {
          body = text;
        }

        // 🔥 Handle validation error khusus
        if (
          body?.code === "Link.Validation" &&
          typeof body?.message === "object"
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
      }

      // 🔥 Kalau bukan SSE
      if (!res.body) {
        throw new Error("SSE not supported by browser");
      }

      // 🔥 Lanjut baca stream
      const reader = res.body.getReader();

      const decoder = new TextDecoder("utf-8");

      let buffer = "";
      const result = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let index;
        while ((index = buffer.indexOf("\n\n")) !== -1) {
          const rawEvent = buffer.slice(0, index).trim();
          buffer = buffer.slice(index + 2);

          if (!rawEvent.startsWith("data:")) continue;

          const payload = rawEvent.replace(/^data:\s*/, "");

          if (!payload || payload === "start" || payload === "done") continue;

          try {
            const parsed = JSON.parse(payload);

            result.push(parsed);
          } catch (err) {
            console.error("JSON parse error:", payload);
          }
        }
      }

      // kalau mau bulk update setelah stream selesai
      console.log(result);
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

  useEffect(() => {
    loadData();
  }, [activeFilter]);

  const parseDate = (value) => {
    if (!value) return null;

    const date = new Date(value);

    const pad = (n) => String(n).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate(),
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const getStatus = (start, end) => {
    if (isEmpty(start) || isEmpty(end)) {
      return null;
    }

    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (now < startDate) return "belum berlangsung";
    if (now >= startDate && now <= endDate) return "berlangsung";
    return "expired";
  };

  const filteredData = (datas ?? []).filter((data) => {
    const term = searchTerm.toLowerCase();
    return (
      data.ShortUrl?.toLowerCase().includes(term) ||
      data.LongUrl?.toLowerCase().includes(term)
    );
  });

  const sortedData = useMemo(() => {
    const list = [...(filteredData ?? [])];
    if (list.length > 0 && list[0].CreatedAt) {
      return list.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
    }
    if (list.length > 0 && list[0].ID) {
      return list.sort((a, b) => b.ID - a.ID);
    }
    return list.reverse();
  }, [filteredData]);

  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  function renderContent() {
    if (loading) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center py-12 space-y-3">
          <div className="w-8 h-8 border-4 border-[#49318f]/20 border-t-[#49318f] rounded-full animate-spin"></div>
          <p className="text-xs text-gray-500 animate-pulse">Memuat daftar link...</p>
        </div>
      );
    }

    if (paginatedData.length === 0) {
      return (
        <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <p className="text-gray-400 text-sm italic">Tidak ada link ditemukan.</p>
        </div>
      );
    }

    return (
      <>
        {paginatedData.map((data) => (
          <LinkCard
            key={data.UUID}
            uuid={data.UUID}
            shortUrl={data.ShortUrl}
            originalUrl={data.LongUrl}
            start={parseDate(data.StartAccess)}
            end={parseDate(data.EndAccess)}
            status={getStatus(data?.StartAccess, data?.EndAccess)}
            state={data?.Status}
            password={data.Password}
            renderAction={() => loadData()}
          />
        ))}
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* ================= PAGE TITLE & SUBTITLE ================= */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Daftar Link</h1>
        <p className="text-sm text-gray-500 mt-1">
          Buat baru, kelola filter, dan pantau status link pendek Anda secara terpusat.
        </p>
      </div>

      <div className="space-y-6">
        <ShortLinkForm renderAction={() => loadData()} />

        {/* SEARCH + FILTER */}
        <div className="flex gap-3 relative" ref={filterRef}>
          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2.5 w-full shadow-sm hover:shadow-md transition duration-300">
            <Search size={18} className="text-gray-400" />
            <input
              placeholder="Cari link pendek atau URL asli..."
              className="ml-2 w-full outline-none text-sm text-gray-700 bg-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setFilterOpen((prev) => !prev)}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition"
            >
              <Filter size={16} className="text-[#49318f]" />
              Filter
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 z-50 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    setActiveFilter("active");
                    setFilterOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full px-4 py-3 text-left text-sm font-semibold ${
                    activeFilter === "active"
                      ? "bg-[#49318f] text-white"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <Check size={16} />
                  Link Aktif
                </button>

                <button
                  onClick={() => {
                    setActiveFilter("archive");
                    setFilterOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full px-4 py-3 text-left text-sm font-semibold ${
                    activeFilter === "archive"
                      ? "bg-[#49318f] text-white"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <Archive size={16} />
                  Diarsipkan
                </button>
                <button
                  onClick={() => {
                    setActiveFilter("delete");
                    setFilterOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full px-4 py-3 text-left text-sm font-semibold ${
                    activeFilter === "delete"
                      ? "bg-[#49318f] text-white"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <Trash2 size={16} />
                  Sampah
                </button>
              </div>
            )}
          </div>
        </div>

        {/* LINK CARD LIST */}
        <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(450px,1fr))] auto-rows-min">
          {renderContent()}
        </div>

        {/* PAGINATION CONTROLS */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mt-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <span>Tampilkan</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-200 rounded-lg px-2.5 py-1 text-sm font-semibold text-gray-700 bg-white outline-none focus:border-[#49318f]/50 transition cursor-pointer"
              >
                {[10, 25, 50, 100, 500].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span>link per halaman</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-4 py-2 border border-gray-200 hover:border-[#49318f]/50 hover:bg-[#49318f]/5 hover:text-[#49318f] rounded-xl text-sm font-semibold text-gray-600 transition disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-600 disabled:hover:border-gray-200 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                Sebelumnya
              </button>

              <span className="text-sm font-bold text-gray-700">
                Halaman {currentPage} dari {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="px-4 py-2 border border-gray-200 hover:border-[#49318f]/50 hover:bg-[#49318f]/5 hover:text-[#49318f] rounded-xl text-sm font-semibold text-gray-600 transition disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-600 disabled:hover:border-gray-200 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ShortLinkForm({ renderAction = () => {} }) {
  const { getValidToken } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("protected");
  const [showPassword, setShowPassword] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    clearErrors,
    resetField,
    reset,
    trigger,
  } = useForm({
    mode: "onSubmit",
    defaultValues: {
      longUrl: "",
      shorturl: "",
      password: "",
      start: "",
      end: "",
    },
  });

  const startValue = watch("start");

  // 🔥 Revalidate END setiap START berubah
  useEffect(() => {
    trigger("end");

    if (!startValue) {
      clearErrors("end");
    }
  }, [startValue, trigger, clearErrors]);

  const onSave = async (data) => {
    console.log("Submit form", data);

    setLoading(true);

    try {
      const dataForm = new FormData();
      dataForm.append("longUrl", data.longUrl);
      dataForm.append("shortUrl", data.shorturl);
      if (!isEmpty(data.password)) {
        dataForm.append("password", data.password);
      }
      if (!isEmpty(data.start)) {
        dataForm.append("start", formatDateTime(data.start));
      }
      if (!isEmpty(data.end)) {
        dataForm.append("end", formatDateTime(data.end));
      }

      const res = await axios.post(`${BASEAPI}/link`, dataForm, {
        validateStatus: () => true,
        headers: {
          Authorization: `Bearer ${getValidToken()}`,
        },
      });
      const body = res.data;
      console.log(body);

      if (body.error || res.status >= 400) {
        // 🔥 Handle validation error khusus
        if (
          body?.code === "LinkCreate.Validation" &&
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
        renderAction();
        reset({
          longUrl: "",
          shorturl: "",
          password: "",
          start: "",
          end: "",
        });

        console.log("Create Link API Success Response:", body);

        const findKeyVal = (obj, targetKey) => {
          if (!obj || typeof obj !== "object") return null;
          const loweredTarget = targetKey.toLowerCase().replace(/[^a-z0-9]/g, "");
          for (let k of Object.keys(obj)) {
            const normalizedK = k.toLowerCase().replace(/[^a-z0-9]/g, "");
            if (normalizedK === loweredTarget) {
              return obj[k];
            }
          }
          for (let k of Object.keys(obj)) {
            if (obj[k] && typeof obj[k] === "object") {
              const resVal = findKeyVal(obj[k], targetKey);
              if (resVal) return resVal;
            }
          }
          return null;
        };

        const uuid = findKeyVal(body, "UUID") || findKeyVal(body, "uuid") || findKeyVal(body, "id") || findKeyVal(body, "Id");
        const endAccess = findKeyVal(body, "EndAccess") || findKeyVal(body, "endaccess") || findKeyVal(body, "end_access");

        const formatAlertDate = (dateStr) => {
          if (!dateStr) return "";
          try {
            const date = new Date(dateStr);
            const pad = (n) => String(n).padStart(2, "0");
            return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
          } catch {
            return dateStr;
          }
        };

        const formattedDate = endAccess ? formatAlertDate(endAccess) : null;

        const makePermanent = async () => {
          try {
            const updateRes = await axios.put(`${BASEAPI}/link/rollback-time/${uuid}`, {}, {
              headers: {
                Authorization: `Bearer ${getValidToken()}`,
              },
            });
            const updateBody = updateRes.data;
            if (updateRes.status === 200 || !updateBody?.error) {
              addToast("success", "Link Anda sekarang bersifat permanen!");
              renderAction();
            } else {
              addToast("error", "Gagal memperbarui masa aktif link");
            }
          } catch (err) {
            console.error(err);
            addToast("error", "Terjadi kesalahan saat memproses link permanen");
          }
        };

        if (uuid) {
          Swal.fire({
            title: "Link Berhasil Dibuat!",
            html: `Link pendek Anda berhasil dibuat.<br/><br/>
                   ⚠️ <b>Penting:</b> Secara default, link ini akan kedaluwarsa pada:<br/>
                   <span style="color: #ea580c; font-weight: 700; font-size: 1.125rem;">${formattedDate || "7 hari mendatang"}</span>.<br/><br/>
                   Apakah Anda ingin membuat link ini menjadi <b>Permanen</b> (tanpa batas waktu)?`,
            icon: "success",
            showCancelButton: true,
            confirmButtonColor: "#0891b2",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Ya, Buat Permanen",
            cancelButtonText: "Biarkan Kedaluwarsa",
          }).then((resultSwal) => {
            if (resultSwal.isConfirmed) {
              makePermanent();
            } else {
              addToast("success", "Link disimpan dengan masa aktif bawaan.");
            }
          });
        } else {
          Swal.fire({
            title: "Link Berhasil Dibuat!",
            html: `Link pendek Anda berhasil dibuat dengan masa aktif default.<br/><br/>
                   ⚠️ <b>Penting:</b> Secara default, link ini memiliki batas waktu aktif agar database tidak penuh.`,
            icon: "success",
            confirmButtonColor: "#0891b2",
            confirmButtonText: "Selesai",
          });
        }
      }
    } catch (err) {
      console.error(err); //respon selain 2xx masuk nya kesini harusnya masih bagian dari try
      const data = err.response.data;

      if (typeof data === "object" && data !== null) {
        addToast("error", data.message);
      } else {
        addToast("error", "ada masalah pada aplikasi");
      }
    } finally {
      setLoading(false);
      renderAction();
    }
  };

  // 🔥 Toggle detail + reset
  const handleToggleDetail = () => {
    if (showDetail) {
      resetField("password");
      resetField("start");
      resetField("end");

      clearErrors(["password", "start", "end"]);
      setActiveTab("protected");
      setShowPassword(false);
    }

    setShowDetail((prev) => !prev);
  };

  return (
    <form onSubmit={handleSubmit(onSave)}>
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
        {/* URL */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="https://yourdomain.id/very-long-links"
              {...register("longUrl", {
                required: "URL is required",
                validate: (value) => {
                  try {
                    new URL(value);
                    return true;
                  } catch {
                    return "Invalid URL format";
                  }
                },
              })}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#49318f]/20 focus:border-[#49318f] text-sm ${
                errors.longUrl ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.longUrl && (
              <p className="text-red-500 text-sm mt-1">
                {errors.longUrl.message}
              </p>
            )}
          </div>

          <div className="flex-shrink-0">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-[#49318f] hover:bg-[#382278] active:bg-[#2d1b60] text-white px-6 py-3 rounded-xl font-bold transition disabled:bg-gray-300 w-full md:w-auto justify-center shadow-sm cursor-pointer"
            >
              <LinkIcon size={18} />
              {loading ? "Loading..." : "Shorten it!"}
            </button>
          </div>
        </div>

        {/* shorturl */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-0 items-start sm:items-center">
          <div className="flex w-full sm:flex-1 rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#49318f]/20 focus-within:border-[#49318f] transition-all">
            <span className="px-4 py-3 bg-gray-50 text-gray-500 text-sm font-semibold select-none border-r">
              unpak.link/
            </span>

            <input
              type="text"
              placeholder="shorturl-kamu"
              {...register("shorturl", {
                required: "Short link is required",
                pattern: {
                  value: /^[a-zA-Z0-9-]+$/,
                  message: "Only letters, numbers, and dash allowed",
                },
              })}
              className={`flex-1 px-4 py-3 outline-none text-sm text-gray-700 bg-transparent ${
                errors.shorturl ? "border-red-500" : ""
              }`}
            />
          </div>

          {errors.shorturl && (
            <p className="text-red-500 text-sm mt-1 sm:mt-0 sm:ml-2">
              {errors.shorturl.message}
            </p>
          )}
        </div>

        {/* DETAIL */}
        {showDetail && (
          <div className="mt-8 flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full md:w-64 border-r md:pr-4 space-y-2 flex-shrink-0">
              <SidebarItem
                icon={<Lock size={18} />}
                label="Protected Link"
                active={activeTab === "protected"}
                onClick={() => setActiveTab("protected")}
              />
              <SidebarItem
                icon={<Clock size={18} />}
                label="Time-based Link"
                active={activeTab === "time"}
                onClick={() => setActiveTab("time")}
              />
            </div>

            <div className="flex-1 min-w-0">
              {/* PASSWORD */}
              {activeTab === "protected" && (
                <div className="space-y-4">
                  <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-1 h-4 bg-[#49318f] rounded-full"></span>
                    Protected Link
                  </h2>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password (Optional)"
                      {...register("password", {
                        minLength: {
                          value: 6,
                          message: "Minimum 6 characters",
                        },
                      })}
                      className={`w-full px-4 py-3 pr-12 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#49318f]/20 focus:border-[#49318f] text-sm ${
                        errors.password ? "border-red-500" : "border-gray-200"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <Eye size={18} />
                      ) : (
                        <EyeClosed size={18} />
                      )}
                    </button>
                  </div>

                  {errors.password?.message && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              )}

              {/* TIME */}
              {activeTab === "time" && (
                <div className="space-y-4">
                  <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-1 h-4 bg-[#ffc107] rounded-full"></span>
                    Time-based Link
                  </h2>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Start (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        {...register("start")}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#49318f]/20 focus:border-[#49318f]"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        End (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        min={startValue}
                        {...register("end", {
                          validate: (value) => {
                            const start = watch("start");

                            if (value && !start)
                              return "Start is required if End is set";
                            if (start && !value)
                              return "End is required if Start is set";
                            if (
                              start &&
                              value &&
                              new Date(value) <= new Date(start)
                            )
                              return "End must be after Start";

                            return true;
                          },
                        })}
                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#49318f]/20 focus:border-[#49318f] ${
                          errors.end ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      {errors.end?.message && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.end.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TOGGLE */}
        <div className="mt-4 flex justify-center text-gray-500">
          <button
            type="button"
            className="flex gap-2 items-center text-sm font-semibold hover:text-[#49318f] transition-colors"
            onClick={handleToggleDetail}
          >
            {showDetail ? "Sembunyikan Pengaturan Detail" : "Tampilkan Pengaturan Detail"}
            {showDetail ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>
    </form>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition
      ${
        active ? "bg-[#49318f]/10 text-[#49318f] font-bold" : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function LinkCard({
  uuid,
  title,
  shortUrl,
  originalUrl,
  password,
  start,
  end,
  status,
  state,
  renderAction = () => {},
}) {
  const { getValidToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showProtected, setShowProtected] = useState(false);
  const [protectedSet, setProtectedSet] = useState(!isEmpty(password));
  const [showTime, setShowTime] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { addToast } = useToast();
  const qrRef = useRef(null);
  const BASEURL = import.meta.env.VITE_BASEURL;

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const [datePart, timePart] = dateStr.split("T");
      const [year, month, day] = datePart.split("-");
      return `${day}/${month}/${year} ${timePart}`;
    } catch {
      return dateStr;
    }
  };

  const copyToClipboard = async (slug) => {
    try {
      const url = `${BASEURL}/${slug}`;
      await navigator.clipboard.writeText(url);

      addToast("success", "Success copy link");
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to copy link");
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    getValues,
  } = useForm({
    defaultValues: {
      password: password || "",
      start: start || "",
      end: end || "",
      shorturl: shortUrl || "",
    },
  });

  useEffect(() => {
    reset({
      password: password || "",
      start: start || "",
      end: end || "",
      shorturl: shortUrl || "",
    });
  }, [password, start, end, shortUrl, reset]);

  const onUpdate = async (data) => {
    console.log("Submit form", data);

    setLoading(true);

    try {
      const dataForm = new FormData();
      dataForm.append("shortUrl", data.shorturl);

      const res = await axios.put(`${BASEAPI}/link/${uuid}`, dataForm, {
        validateStatus: () => true,
        headers: {
          Authorization: `Bearer ${getValidToken()}`,
        },
      });
      const body = res.data;
      console.log(body);

      if (body.error || res.status >= 400) {
        // 🔥 Handle validation error khusus
        if (
          body?.code === "LinkUpdate.Validation" &&
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
        renderAction();
        addToast("success", "berhasil update link");
        reset({
          longUrl: "",
          shorturl: "",
          password: "",
          start: "",
          end: "",
        });
      }
    } catch (err) {
      console.error(err); //respon selain 2xx masuk nya kesini harusnya masih bagian dari try
      const data = err.response.data;

      if (typeof data === "object" && data !== null) {
        addToast("error", data.message);
      } else {
        addToast("error", "ada masalah pada aplikasi");
      }
    } finally {
      setLoading(false);
      renderAction();
    }
  };

  const onProtectedSubmit = async (data) => {
    setLoading(true);

    try {
      const dataForm = new FormData();
      dataForm.append("password", data.password);

      const res = await axios.put(
        `${BASEAPI}/link/password/${uuid}`,
        dataForm,
        {
          validateStatus: () => true,
          headers: {
            Authorization: `Bearer ${getValidToken()}`,
          },
        },
      );
      const body = res.data;
      console.log(body);

      if (body.error || res.status >= 400) {
        // 🔥 Handle validation error khusus
        if (
          body?.code === "LinkPassword.Validation" &&
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
        addToast("success", "berhasil pemberian password pada link");
        setProtectedSet(true);
        reset();
      }
    } catch (err) {
      console.error(err); //respon selain 2xx masuk nya kesini harusnya masih bagian dari try
      const data = err.response.data;

      if (typeof data === "object" && data !== null) {
        addToast("error", data.message);
      } else {
        addToast("error", "ada masalah pada aplikasi");
      }
    } finally {
      setLoading(false);
      renderAction();
    }
  };

  const removePasswordHandler = async () => {
    setLoading(true);

    try {
      const res = await axios.put(
        `${BASEAPI}/link/rollback-password/${uuid}`,
        {},
        {
          validateStatus: () => true,
          headers: {
            Authorization: `Bearer ${getValidToken()}`,
          },
        },
      );
      const body = res.data;
      console.log(body);

      if (body.error || res.status >= 400) {
        // 🔥 Handle validation error khusus
        if (
          body?.code === "LinkRollbackPassword.Validation" &&
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
        addToast("success", "berhasil hapus password pada link");
        setProtectedSet(true);
        reset();
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
      renderAction();
    }
  };

  const removeTimeHandler = async () => {
    setLoading(true);

    try {
      const res = await axios.put(
        `${BASEAPI}/link/rollback-time/${uuid}`,
        {},
        {
          validateStatus: () => true,
          headers: {
            Authorization: `Bearer ${getValidToken()}`,
          },
        },
      );
      const body = res.data;
      console.log(body);

      if (body.error || res.status >= 400) {
        // 🔥 Handle validation error khusus
        if (
          body?.code === "LinkRollbackTime.Validation" &&
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
        addToast("success", "berhasil hapus waktu pada link");
        setProtectedSet(true);
        reset();
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
      renderAction();
    }
  };

  const onTimeSubmit = async (data) => {
    setLoading(true);

    try {
      const dataForm = new FormData();
      dataForm.append("start", formatDateTime(data.start));
      dataForm.append("end", formatDateTime(data.end));

      const res = await axios.put(`${BASEAPI}/link/time/${uuid}`, dataForm, {
        validateStatus: () => true,
        headers: {
          Authorization: `Bearer ${getValidToken()}`,
        },
      });
      const body = res.data;
      console.log(body);

      if (body.error || res.status >= 400) {
        // 🔥 Handle validation error khusus
        if (
          body?.code === "LinkTime.Validation" &&
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
        addToast("success", "berhasil pemberian waktu akses pada link");
        setShowTime(false);
        reset();
      }
    } catch (err) {
      console.error(err); //respon selain 2xx masuk nya kesini harusnya masih bagian dari try
      const data = err.response.data;

      if (typeof data === "object" && data !== null) {
        addToast("error", data.message);
      } else {
        addToast("error", "ada masalah pada aplikasi");
      }
    } finally {
      setLoading(false);
      renderAction();
    }
  };

  const removeHandler = async () => {
    setLoading(true);

    try {
      const res = await axios.delete(`${BASEAPI}/link/${uuid}`, {
        validateStatus: () => true,
        headers: {
          Authorization: `Bearer ${getValidToken()}`,
        },
      });
      const body = res.data;
      console.log(body);

      if (body.error || res.status >= 400) {
        // 🔥 Handle validation error khusus
        if (
          body?.code === "LinkDelete.Validation" &&
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
        addToast("success", "Link berhasil dihapus secara permanen");
        setProtectedSet(true);
        reset();
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
      renderAction();
    }
  };

  const deleteHandler = async () => {
    setLoading(true);

    try {
      const res = await axios.put(
        `${BASEAPI}/link/${uuid}/delete`,
        {},
        {
          validateStatus: () => true,
          headers: {
            Authorization: `Bearer ${getValidToken()}`,
          },
        },
      );
      const body = res.data;
      console.log(body);

      if (body.error || res.status >= 400) {
        // 🔥 Handle validation error khusus
        if (
          body?.code === "LinkDelete.Validation" &&
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
        addToast("success", "berhasil hapus waktu pada link");
        setProtectedSet(true);
        reset();
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
      renderAction();
    }
  };

  const archiveHandler = async () => {
    setLoading(true);

    try {
      const res = await axios.put(
        `${BASEAPI}/link/${uuid}/archive`,
        {},
        {
          validateStatus: () => true,
          headers: {
            Authorization: `Bearer ${getValidToken()}`,
          },
        },
      );
      const body = res.data;
      console.log(body);

      if (body.error || res.status >= 400) {
        // 🔥 Handle validation error khusus
        if (
          body?.code === "LinkDelete.Validation" &&
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
        addToast("success", "berhasil hapus waktu pada link");
        setProtectedSet(true);
        reset();
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
      renderAction();
    }
  };

  const activeHandler = async () => {
    setLoading(true);

    try {
      const res = await axios.put(
        `${BASEAPI}/link/${uuid}/active`,
        {},
        {
          validateStatus: () => true,
          headers: {
            Authorization: `Bearer ${getValidToken()}`,
          },
        },
      );
      const body = res.data;
      console.log(body);

      if (body.error || res.status >= 400) {
        // 🔥 Handle validation error khusus
        if (
          body?.code === "LinkActive.Validation" &&
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
        addToast("success", "berhasil active pada link");
        setProtectedSet(true);
        reset();
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
      renderAction();
    }
  };

  const handleDownload = async () => {
    if (!qrRef.current) return;

    try {
      const dataUrl = await toPng(qrRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `QR.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      addToast("error", "Gagal download QR");
    }
  };

  function renderButton(state) {
    if (state === "active") {
      return (
        <>
          <IconButton
            icon={<Copy size={16} />}
            tooltip="Copy link"
            onClick={() => copyToClipboard(shortUrl)}
          />

          <IconButton
            icon={<QrCode size={16} />}
            tooltip="Show QR"
            onClick={() => setShowQR(true)}
          />

          <IconButton
            icon={<LucidePencil size={16} />}
            tooltip="Edit link"
            onClick={() => setShowEdit(true)}
          />

          <IconButton
            icon={<Trash size={16} />}
            tooltip="Delete link"
            onClick={() => removeHandler()}
          />

          <IconButton
            icon={<Archive size={16} />}
            tooltip="Archive link"
            onClick={() => archiveHandler()}
          />
        </>
      );
    } else if (state == "delete") {
      return (
        <>
          <IconButton
            icon={<FiRotateCcw size={16} />}
            tooltip="Activate link"
            onClick={() => activeHandler()}
          />
          <IconButton
            icon={<Trash size={16} />}
            tooltip="Delete link"
            onClick={() => removeHandler()}
          />
        </>
      );
    } else {
      return (
        <IconButton
          icon={<FiRotateCcw size={16} />}
          tooltip="Activate link"
          onClick={() => activeHandler()}
        />
      );
    }
  }

  return (
    <>
      {/* CARD */}
      <div
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 
flex flex-col sm:flex-row gap-5 hover:shadow-lg hover:-translate-y-0.5 transition duration-300 relative group/card"
      >
        {/* QR */}
        <div
          className="w-full sm:w-24 h-24 shrink-0 
  bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center shadow-inner"
        >
          <QR
            value={`${BASEURL}/${shortUrl}`}
            level="H"
            includeMargin
            imageSettings={{
              src: logo_unpak,
              height: 50,
              width: 50,
              excavate: false,
            }}
          />
        </div>

        {/* CONTENT */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          {/* HEADER */}
          <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
            {/* TEXT */}
            <div className="min-w-0 w-full">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 truncate">
                {title}
              </h3>

              <p className="text-[#49318f] font-extrabold text-lg sm:text-xl break-all my-0.5">
                unpak.link/{shortUrl}
              </p>

              <p className="text-gray-400 text-sm truncate">{originalUrl}</p>

              {start && end && (
                <p className="text-xs text-amber-700 font-semibold mt-1.5 flex items-center gap-1.5 bg-amber-50 border border-amber-200/50 px-2.5 py-1.5 rounded-lg w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Aktif: {formatDisplayDate(start)} s/d {formatDisplayDate(end)}
                </p>
              )}
              {start && !end && (
                <p className="text-xs text-amber-700 font-semibold mt-1.5 flex items-center gap-1.5 bg-amber-50 border border-amber-200/50 px-2.5 py-1.5 rounded-lg w-fit">
                  Mulai: {formatDisplayDate(start)}
                </p>
              )}
              {!start && end && (
                <p className="text-xs text-amber-700 font-semibold mt-1.5 flex items-center gap-1.5 bg-amber-50 border border-amber-200/50 px-2.5 py-1.5 rounded-lg w-fit">
                  Expired: {formatDisplayDate(end)}
                </p>
              )}

              <div className="flex wrap gap-2.5 my-3.5">{renderButton(state)}</div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-2 border-t border-gray-50 pt-3">
            <div className="flex flex-wrap gap-2.5 items-center">
              {!isEmpty(password) ? (
                <button
                  onClick={() => setShowProtected(true)}
                  className="bg-[#49318f]/10 text-[#49318f] border border-[#49318f]/20 hover:bg-[#49318f]/20 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition"
                >
                  <LockKeyhole size={13} /> Terproteksi
                </button>
              ) : (
                <button
                  onClick={() => setShowProtected(true)}
                  className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
                >
                  <LockKeyholeOpen size={13} /> Proteksi
                </button>
              )}

              {status === "expired" ? (
                <button
                  className="bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition"
                  onClick={() => setShowTime(true)}
                >
                  <Clock9 size={13} /> Expired
                </button>
              ) : (
                <button
                  onClick={() => setShowTime(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition
                    ${status ? "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                >
                  <Clock9 size={13} /> {status ? "Masa Aktif" : "Set Waktu"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= Edit MODAL ================= */}
      {/* EDIT MODAL */}
      {showEdit && (
        <Modal title="Edit Link" onClose={() => setShowEdit(false)}>
          <form className="space-y-4" onSubmit={handleSubmit(onUpdate)}>
            <div className="flex w-full sm:flex-1 rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#49318f]/20 focus-within:border-[#49318f] transition-all">
              <span className="px-4 py-3 bg-gray-50 text-gray-500 text-sm font-semibold select-none border-r">
                unpak.link/
              </span>

              <input
                type="text"
                placeholder="shorturl-kamu"
                {...register("shorturl", {
                  required: "Short link is required",
                  pattern: {
                    value: /^[a-zA-Z0-9-]+$/,
                    message: "Only letters, numbers, and dash allowed",
                  },
                })}
                className={`flex-1 px-4 py-3 outline-none text-sm text-gray-700 bg-transparent ${
                  errors.shorturl ? "border-red-500" : ""
                }`}
              />
            </div>
            {errors.shorturl && (
              <p className="text-red-500 text-sm mt-1">
                {errors.shorturl.message}
              </p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                onClick={() => setShowEdit(false)}
              >
                Batal
              </button>
              <button className="px-5 py-2 rounded-xl bg-[#49318f] hover:bg-[#382278] active:bg-[#2d1b60] text-white text-sm font-bold shadow-sm transition">
                Simpan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================= PROTECTED MODAL ================= */}
      {showProtected && (
        <Modal title="Protected Link" onClose={() => setShowProtected(false)}>
          {!protectedSet ? (
            <form
              onSubmit={handleSubmit(onProtectedSubmit)}
              className="space-y-4"
            >
              <div className="flex bg-background mt-2 p-2 border rounded-md">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                    className="mt-1 w-4"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </div>
                <div className="pl-3 text-sm">
                  A protected link can be given a secret key/passphrase for
                  access before being redirected to the original link
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>

                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#49318f]/20 focus:border-[#49318f] text-sm ${
                      errors.password ? "border-red-500" : ""
                    }`}
                    {...register("password", {
                      required: "Password wajib diisi",
                      minLength: {
                        value: 6,
                        message: "Minimal 6 karakter",
                      },
                    })}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeClosed size={18} />}
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
                className="w-full bg-[#49318f] hover:bg-[#382278] active:bg-[#2d1b60] text-white py-2.5 rounded-xl font-bold transition shadow-sm cursor-pointer"
              >
                Simpan
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex bg-background mt-2 p-2 border rounded-md">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                    className="mt-1 w-4"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </div>
                <div className="pl-3 text-sm">
                  A protected link can be given a secret key/passphrase for
                  access before being redirected to the original link
                </div>
              </div>
              <p className="font-semibold">Passphrase has been set</p>
              <pre className="bg-secondary/10 px-3 py-2 pr-28 border rounded-md overflow-x-auto font-mono">
                *****
              </pre>
              <p className="text-sm">
                Click "Remove" to return the link to its public form.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => removePasswordHandler()}
                  disabled={loading}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white rounded-xl font-bold transition shadow-sm cursor-pointer"
                >
                  Hapus Proteksi
                </button>

                <button
                  onClick={() => setProtectedSet(false)}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:bg-gray-300 rounded-xl font-semibold transition cursor-pointer"
                >
                  Ubah Sandi
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* ================= TIME MODAL ================= */}
      {showTime && (
        <Modal title="Time-based Link" onClose={() => setShowTime(false)}>
          <form onSubmit={handleSubmit(onTimeSubmit)} className="space-y-4">
            {/* START DATETIME */}
            <div>
              <label className="text-sm font-medium">Start Date & Time</label>
              <input
                type="datetime-local"
                className={`w-full border rounded-lg px-3 py-2 mt-1 ${
                  errors.start ? "border-red-500" : "border-gray-300"
                }`}
                {...register("start", {
                  required: "Start datetime wajib diisi",
                })}
              />
              {errors.start && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.start.message}
                </p>
              )}
            </div>

            {/* END DATETIME */}
            <div>
              <label className="text-sm font-medium">End Date & Time</label>
              <input
                type="datetime-local"
                min={watch("start") || undefined}
                className={`w-full border rounded-lg px-3 py-2 mt-1 ${
                  errors.end ? "border-red-500" : "border-gray-300"
                }`}
                {...register("end", {
                  required: "End datetime wajib diisi",
                  validate: (value) => {
                    const start = getValues("start");
                    if (!start) return "Start harus diisi dulu";

                    if (new Date(value) < new Date(start)) {
                      return "End tidak boleh lebih kecil dari Start";
                    }

                    return true;
                  },
                })}
              />
              {errors.end && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.end.message}
                </p>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => removeTimeHandler()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition shadow-sm cursor-pointer text-sm"
              >
                Hapus Waktu
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-[#49318f] hover:bg-[#382278] text-white rounded-xl font-bold transition shadow-sm cursor-pointer text-sm"
              >
                Simpan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================= QR MODAL ================= */}
      {showQR && (
        <Modal title="QR Code Image" onClose={() => setShowQR(false)}>
          <div className="text-center space-y-4">
            <div className="w-48 h-48 mx-auto bg-gray-200 flex items-center justify-center rounded-xl">
              <QR
                ref={qrRef}
                value={`${BASEURL}/${shortUrl}`}
                size={220}
                level="H"
                includeMargin
                imageSettings={{
                  src: logo_unpak,
                  x: undefined,
                  y: undefined,
                  height: 50,
                  width: 50,
                  excavate: false,
                }}
              />
            </div>

            <p className="text-sm text-gray-500">
              {BASEURL}/{shortUrl}
            </p>

            <button
              className="w-full py-2.5 bg-[#49318f] hover:bg-[#382278] active:bg-[#2d1b60] text-white rounded-xl font-bold transition shadow-sm cursor-pointer text-sm"
              onClick={handleDownload}
            >
              Unduh Gambar QR
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in">
        <button onClick={onClose} className="absolute top-4 right-4">
          <X />
        </button>

        <h2 className="text-xl text-center font-semibold mb-6">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function IconButton({ icon, tooltip, onClick, className = "" }) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`w-9 h-9 flex items-center justify-center border border-gray-200 rounded-xl text-gray-600 hover:border-[#49318f]/50 hover:bg-[#49318f]/5 hover:text-[#49318f] transition-all duration-200 active:scale-95 shadow-sm hover:shadow ${className}`}
      >
        {icon}
      </button>

      {/* Tooltip */}
      <span className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-gray-800 text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow-md">
        {tooltip}
      </span>
    </div>
  );
}
