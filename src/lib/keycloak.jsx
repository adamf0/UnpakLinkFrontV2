import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "https://gerbang.unpak.ac.id", // sesuaikan dengan server Keycloak kamu
  realm: "gateway",          // ganti realm
  clientId: "unpak_link_gate",
});

export default keycloak;