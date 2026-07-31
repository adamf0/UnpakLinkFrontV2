import Keycloak from "keycloak-js";

// Intercept fetch dan XHR khusus request /token di dev mode agar melewati Vite proxy
if (import.meta.env.DEV && typeof window !== "undefined") {
  const originalFetch = window.fetch;
  window.fetch = function (resource, config) {
    let url = typeof resource === "string" ? resource : resource?.url;
    if (url && url.includes("gerbang.unpak.ac.id") && url.includes("/protocol/openid-connect/token")) {
      const proxiedUrl = url.replace("https://gerbang.unpak.ac.id", window.location.origin);
      if (typeof resource === "string") {
        resource = proxiedUrl;
      } else if (resource && resource.url) {
        resource = new Request(proxiedUrl, resource);
      }
    }
    return originalFetch.call(this, resource, config);
  };

  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...args) {
    if (typeof url === "string" && url.includes("gerbang.unpak.ac.id") && url.includes("/protocol/openid-connect/token")) {
      const proxiedUrl = url.replace("https://gerbang.unpak.ac.id", window.location.origin);
      url = proxiedUrl;
    }
    return originalOpen.call(this, method, url, ...args);
  };
}

const keycloak = new Keycloak({
  url: "https://gerbang.unpak.ac.id",
  realm: "gateway",
  clientId: "unpak_link_gate",
});

export default keycloak;