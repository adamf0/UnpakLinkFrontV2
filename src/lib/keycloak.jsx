import Keycloak from "keycloak-js";

// Intercept fetch dan XHR request ke /token di Dev & Production
// if (typeof window !== "undefined") {
//   const originalFetch = window.fetch;
//   window.fetch = function (resource, config) {
//     let url = typeof resource === "string" ? resource : resource?.url;
//     if (url && url.includes("gerbang.unpak.ac.id") && url.includes("/protocol/openid-connect/token")) {
//       const targetUrl = import.meta.env.DEV
//         ? url.replace("https://gerbang.unpak.ac.id", window.location.origin)
//         : `${import.meta.env.VITE_BASEAPI || "/api"}/sso/token`;

//       console.log("[Keycloak Proxy Interceptor] Rerouting POST /token to:", targetUrl);

//       if (typeof resource === "string") {
//         resource = targetUrl;
//       } else if (resource && resource.url) {
//         resource = new Request(targetUrl, resource);
//       }
//     }
//     return originalFetch.call(this, resource, config);
//   };

//   const originalOpen = XMLHttpRequest.prototype.open;
//   XMLHttpRequest.prototype.open = function (method, url, ...args) {
//     if (typeof url === "string" && url.includes("gerbang.unpak.ac.id") && url.includes("/protocol/openid-connect/token")) {
//       const targetUrl = import.meta.env.DEV
//         ? url.replace("https://gerbang.unpak.ac.id", window.location.origin)
//         : `${import.meta.env.VITE_BASEAPI || "/api"}/sso/token`;

//       console.log("[Keycloak Proxy Interceptor XHR] Rerouting POST /token to:", targetUrl);
//       url = targetUrl;
//     }
//     return originalOpen.call(this, method, url, ...args);
//   };
// }

const keycloak = new Keycloak({
  url: "https://gerbang.unpak.ac.id",
  realm: "gateway",
  clientId: "unpak_link_gate",
});

export default keycloak;