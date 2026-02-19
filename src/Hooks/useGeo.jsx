import { GeoProviderFactory } from "@/Service/GeoProviderFactory";

export const geoService = GeoProviderFactory.createGeo();
export const ipService = GeoProviderFactory.createIp();