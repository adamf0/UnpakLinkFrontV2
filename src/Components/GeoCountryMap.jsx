import { useEffect, useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps";
import { scaleLog } from "d3-scale";

const geoUrl =
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

export default function GeoCountryMap({ data }) {
  const [tooltip, setTooltip] = useState(null);
  const [iso2to3, setIso2to3] = useState({});
  const [position, setPosition] = useState({
    coordinates: [118, -2.5], // 🇮🇩 Indonesia default
    zoom: 2.5
  });

  // Build ISO2 → ISO3 mapping
  useEffect(() => {
    fetch(geoUrl)
      .then((res) => res.json())
      .then((geo) => {
        const mapping = {};
        geo.features.forEach((f) => {
          const iso2 = f.properties["ISO3166-1-Alpha-2"];
          const iso3 = f.properties["ISO3166-1-Alpha-3"];
          if (iso2 && iso3) mapping[iso2] = iso3;
        });
        setIso2to3(mapping);
      });
  }, []);

  // Format data
  const formatted = useMemo(() => {
    if (!data || !Object.keys(iso2to3).length) return [];

    return data
      .filter((d) => d.id !== "Unknown")
      .map((d) => ({
        id: iso2to3[d.id],
        value: d.value
      }))
      .filter((d) => d.id);
  }, [data, iso2to3]);

  const maxValue =
    formatted.length > 0
      ? Math.max(...formatted.map((d) => d.value))
      : 1;

  const colorScale = scaleLog()
    .domain([1, maxValue])
    .range(["#c7d2fe", "#1e3a8a"]);

  const handleMoveEnd = (pos) => {
    setPosition(pos);
  };

  const handleCountryClick = (geo) => {
    const coords =
      geo.geometry.type === "MultiPolygon"
        ? geo.geometry.coordinates[0][0][0]
        : geo.geometry.coordinates[0][0];

    setPosition({
      coordinates: coords,
      zoom: 4
    });
  };

  const resetZoom = () => {
    setPosition({
      coordinates: [118, -2.5],
      zoom: 2.5
    });
  };

  return (
    <div style={{ position: "relative", height: 500 }}>
      {/* Reset Button */}
      <button
        onClick={resetZoom}
        style={{
          position: "absolute",
          top: 15,
          right: 15,
          zIndex: 10,
          padding: "6px 12px",
          background: "white",
          borderRadius: 6,
          border: "1px solid #ddd",
          cursor: "pointer"
        }}
      >
        Reset
      </button>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: "fixed",
            top: tooltip.y + 10,
            left: tooltip.x + 10,
            background: "white",
            padding: "8px 12px",
            borderRadius: 6,
            boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
            fontSize: 14,
            pointerEvents: "none",
            zIndex: 999
          }}
        >
          <strong>{tooltip.name}</strong>
          <div>Total Visitors: {tooltip.value?.toLocaleString() ?? 0}</div>
        </div>
      )}

      {/* Map */}
      <ComposableMap projection="geoNaturalEarth1">
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies
                .filter(
                  (geo) =>
                    geo.properties["ISO3166-1-Alpha-3"] !== "-99"
                )
                .map((geo) => {
                  const iso3 =
                    geo.properties["ISO3166-1-Alpha-3"];

                  const found = formatted.find(
                    (d) => d.id === iso3
                  );

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleCountryClick(geo)}
                      onMouseEnter={(evt) => {
                        setTooltip({
                          name: geo.properties.name,
                          value: found ? found.value : 0,
                          x: evt.clientX,
                          y: evt.clientY
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      style={{
                        default: {
                          fill: found
                            ? colorScale(found.value)
                            : "#f3f4f6",
                          outline: "none"
                        },
                        hover: {
                          fill: "#f59e0b",
                          outline: "none"
                        },
                        pressed: {
                          fill: "#ea580c",
                          outline: "none"
                        }
                      }}
                    />
                  );
                })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
