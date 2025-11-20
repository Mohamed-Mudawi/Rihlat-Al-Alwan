import React from "react";

export default function ColorPalette({ colors, onAdd }) {
  return (
    <div className="palette">
      <h3>Color Palette</h3>

      {/* Main palette grid (excludes White and Black) */}
      {(() => {
        const mainColors = colors.filter((c) => {
          const n = (c.name || "").toLowerCase();
          return n !== "white" && n !== "black";
        });

        return (
          <div
            className="palette-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(60px, 60px))",
              gap: 10,
              justifyContent: "center",
            }}
          >
            {mainColors.map((c) => (
              <div key={c.name} style={{ textAlign: "center" }}>
                <div
                  className="swatch"
                  draggable
                  onDragStart={(e) =>
                    e.dataTransfer.setData("text/plain", JSON.stringify(c))
                  }
                  onClick={() => onAdd(c)}
                  style={{
                    width: 50,
                    height: 50,
                    backgroundColor: c.hex,
                    borderRadius: 6,
                    border: "2px solid #333",
                    cursor: "grab",
                  }}
                  title={c.name}
                />
                <div style={{ fontSize: 12, marginTop: 4 }}>{c.name}</div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* White and Black should always be on their own centered row */}
      {(() => {
        const special = colors
          .filter((c) => {
            const n = (c.name || "").toLowerCase();
            return n === "white" || n === "black";
          })
          .sort((a, b) => {
            // Keep White before Black if both exist
            const order = { white: 0, black: 1 };
            return (order[(a.name || "").toLowerCase()] || 0) -
              (order[(b.name || "").toLowerCase()] || 0);
          });

        if (special.length === 0) return null;

        return (
          <div
            className="palette-special"
            style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 12 }}
          >
            {special.map((c) => (
              <div key={c.name} style={{ textAlign: "center" }}>
                <div
                  className="swatch"
                  draggable
                  onDragStart={(e) =>
                    e.dataTransfer.setData("text/plain", JSON.stringify(c))
                  }
                  onClick={() => onAdd(c)}
                  style={{
                    width: 50,
                    height: 50,
                    backgroundColor: c.hex,
                    borderRadius: 6,
                    border: "2px solid #333",
                    cursor: "grab",
                  }}
                  title={c.name}
                />
                <div style={{ fontSize: 12, marginTop: 4 }}>{c.name}</div>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}
