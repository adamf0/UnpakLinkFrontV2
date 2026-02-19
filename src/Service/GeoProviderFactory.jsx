import { FakeGeoProvider } from "@/Providers/FakeGeoProvider";
// import { FakeIpProvider } from "@/Providers/FakeIpProvider";
import { GoogleGeoProvider } from "@/Providers/GoogleGeoProvider";
import { IpInfoProvider } from "@/Providers/IpInfoProvider";

const SOURCE = import.meta.env.VITE_SOURCE;
const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_KEY;

export const GeoProviderFactory = {
  createGeo() {
    if (SOURCE === "fake") return new FakeGeoProvider();
    return new GoogleGeoProvider(GOOGLE_KEY);
  },

  createIp() {
    // if (SOURCE === "fake") return new IpInfoProvider();
    return new IpInfoProvider();
  }
};