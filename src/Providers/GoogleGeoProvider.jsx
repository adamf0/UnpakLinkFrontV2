import { GeoProvider } from "@/Abstract/GeoProvider";
import { safeCall } from "@/lib/safeCall";

export class GoogleGeoProvider extends GeoProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
  }

  async getLocation() {
    return safeCall(async () => {
      const url = `https://www.googleapis.com/geolocation/v1/geolocate?key=${this.apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      if (!res.ok) return null;

      const data = await res.json();
      return data.location || null;
    }, { lat: null, lng: null });
  }
}