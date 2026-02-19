import { GeoProvider } from "@/Abstract/GeoProvider";

export class FakeGeoProvider extends GeoProvider {
  async getLocation() {
    return {
      success: true,
      data: { lat: -6.2, lng: 106.82 },
      error: null
    };
  }
}