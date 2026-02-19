import { geoService, ipService } from "@/Hooks/useGeo";
import {
  Globe,
} from "lucide-react";
import { FaAndroid, FaChrome, FaEdge, FaFirefox, FaSafari } from "react-icons/fa";

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
  if (!ua) return "Unknown";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
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

  const icons = {
    Chrome: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg",
    Safari: "https://upload.wikimedia.org/wikipedia/commons/5/52/Safari_browser_logo.svg",
    Firefox: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Firefox_logo%2C_2019.svg",
    Edge: "https://upload.wikimedia.org/wikipedia/commons/9/98/Microsoft_Edge_logo_%282019%29.svg",
    Opera: "https://upload.wikimedia.org/wikipedia/commons/4/49/Opera_2015_icon.svg",
    Android: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Android_robot.svg",
    iOS: "https://upload.wikimedia.org/wikipedia/commons/5/52/Safari_browser_logo.svg", // sama dengan Safari
    Brave: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Brave-logo.svg",
    Vivaldi: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Vivaldi_web_browser_logo.svg",
    IE: "https://upload.wikimedia.org/wikipedia/commons/1/18/Internet_Explorer_10%2B11_logo.svg",
  };

  const src = icons[browser] || "https://upload.wikimedia.org/wikipedia/commons/c/c4/Globe_icon.svg";

  return <img src={src} alt={browser} style={iconStyle} />;
}
