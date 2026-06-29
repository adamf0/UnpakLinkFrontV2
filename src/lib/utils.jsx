import { geoService, ipService } from "@/Hooks/useGeo";
import {
  Globe,
} from "lucide-react";
import { FaAndroid, FaChrome, FaEdge, FaFirefox, FaSafari, FaOpera, FaInternetExplorer } from "react-icons/fa";

export async function getInformation() {
    const [geoRes, ipRes] = await Promise.all([
      geoService.getLocation(),
      ipService.getInfo()
    ]);

    // Keduanya harus sukses baru boleh merge & set
    if (!geoRes.success) throw geoRes.error;
    if (!ipRes.success) throw ipRes.error;

    return { ...geoRes.data, ...ipRes.data, time: new Date().toISOString().slice(0, 19).replace("T", " ")};
}

export function getVisitorIP(item) {
  return item.IpClient || item.IP || "unknown";
}

export function getBrowser(ua) {
  if (!ua) return "Other";
  if (ua.includes("Brave")) return "Brave";
  if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
  if (ua.includes("Edg") || ua.includes("Edge")) return "Edge";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("MSIE") || ua.includes("Trident")) return "IE";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "Other";
}

export function randomColor(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const h = hash % 360;
  return `hsl(${h}, 70%, 50%)`;
}

export function getBrowserIcon(browser) {
  const iconStyle = { width: 18, height: 18 };

  switch (browser) {
    case "Chrome":
      return <FaChrome style={{ ...iconStyle, color: "#4285F4" }} />;
    case "Safari":
    case "iOS":
      return <FaSafari style={{ ...iconStyle, color: "#007AFF" }} />;
    case "Firefox":
      return <FaFirefox style={{ ...iconStyle, color: "#FF7139" }} />;
    case "Edge":
      return <FaEdge style={{ ...iconStyle, color: "#0078D7" }} />;
    case "Opera":
      return <FaOpera style={{ ...iconStyle, color: "#FF1B2D" }} />;
    case "Android":
      return <FaAndroid style={{ ...iconStyle, color: "#3DDC84" }} />;
    case "IE":
      return <FaInternetExplorer style={{ ...iconStyle, color: "#0078D7" }} />;
    default:
      return <Globe style={{ ...iconStyle, color: "#6B7280" }} />;
  }
}
