import { IpProvider } from "@/Abstract/IpProvider";
import { safeCall } from "@/lib/safeCall";

export class IpInfoProvider extends IpProvider {
  async getInfo() {
    return safeCall(async () => {
      const res = await fetch("https://ipinfo.io/json");

      if (!res.ok) return null;

      const data = await res.json();
      return {
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country,
        loc: data.loc,
        org: data.org,
        postal: data.postal,
        timezone: data.timezone,
      };
    }, {
      ip: null,
      city: null,
      region: null,
      country: null,
      loc: null,
      org: null,
      postal: null,
      timezone: null
    });
  }
}