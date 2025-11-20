import React, { useState } from "react";
import "./App.css";
import ColorPalette from "./components/ColorPalette";
import { NAME_TO_HEX } from "./components/colorMixTable";
import { mixHexColors } from "./components/colorUtils";
import Loading from "./components/Loading";

export default function App() {

  const DEFAULT_COLORS = [
    { name: "Red", hex: NAME_TO_HEX.Red },
    { name: "Blue", hex: NAME_TO_HEX.Blue },
    { name: "Green", hex: NAME_TO_HEX.Green },
    { name: "Yellow", hex: NAME_TO_HEX.Yellow },
    { name: "Purple", hex: NAME_TO_HEX.Purple },
    { name: "Orange", hex: NAME_TO_HEX.Orange },
    { name: "White", hex: NAME_TO_HEX.White },
    { name: "Black", hex: NAME_TO_HEX.Black },
  ];

  // Helpers: convert hex -> rgb and find nearest named color from DEFAULT_COLORS
  function hexToRgb(hex) {
    const clean = (hex || "").replace('#', '');
    const bigint = parseInt(clean, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  }

  function colorDistance(a, b) {
    return Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2);
  }

  function getNearestColorName(hex) {
    if (!hex) return null;
    const target = hexToRgb(hex);
    let best = { name: null, dist: Infinity };
    for (const c of DEFAULT_COLORS) {
      const rgb = hexToRgb(c.hex);
      const d = colorDistance(target, rgb);
      if (d < best.dist) {
        best = { name: c.name, dist: d };
      }
    }
    return best.name;
  }

  const [bucket, setBucket] = useState(null); // hex color
  const [sessionId] = useState(() => Date.now().toString());
  const [currentColorName, setCurrentColorName] = useState(null);

  // AI / question state
  const [aiStage, setAiStage] = useState(null);
  const [aiMessage, setAiMessage] = useState(null);
  const [answerInput, setAnswerInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [lastAiRequest, setLastAiRequest] = useState(null);

  const handleAddColor = (c) => {
    if (!bucket) {
      setBucket(c.hex);
      setCurrentColorName(c.name);
      // start the conversation for this color
      startConversationApi(c.name, sessionId).catch((e) => console.error(e));
      return;
    }
    const mixed = mixHexColors(bucket, c.hex);
    setBucket(mixed);
    // determine nearest named color for the mixed result so the app treats it accordingly
    const nearestName = getNearestColorName(mixed) || c.name;
    setCurrentColorName(nearestName);
    // also notify backend when user adds another color (mix) using the derived name
    startConversationApi(nearestName, sessionId).catch((e) => console.error(e));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("text/plain");

    let dropped;
    try {
      dropped = JSON.parse(raw);
    } catch {
      return;
    }

    handleAddColor(dropped);
  };

  async function startConversationApi(colorName, sessionId) {
    setAiLoading(true);
    setAiError(null);
    setLastAiRequest({ type: "start", colorName, sessionId });
    try {
      const res = await fetch("https://rihlat-al-alwan.onrender.com/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colorName: (colorName || "").toLowerCase(), sessionId }),
      });
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }
      const data = await res.json();
      setAiStage(data.stage || null);
      setAiMessage(data.message || null);
      setAnswerInput("");
    } catch (err) {
      console.error("startConversationApi error:", err);
      setAiError("Something went wrong — please try again.");
    } finally {
      setAiLoading(false);
    }
  }

  async function submitAnswerApiWithPayload(payload) {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("https://rihlat-al-alwan.onrender.com/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }
      const data = await res.json();
      setAiStage(data.stage || null);
      setAiMessage(data.message || null);
      setAnswerInput("");
    } catch (err) {
      console.error("submitAnswerApi error:", err);
      setAiError("Something went wrong — please try again.");
    } finally {
      setAiLoading(false);
    }
  }

  async function submitAnswerApi() {
    if (!aiStage) return;
    const payload = {
      stage: aiStage,
      userAnswer: answerInput,
      colorName: (currentColorName || "").toLowerCase(),
      sessionId,
    };
    setLastAiRequest({ type: "answer", payload });
    await submitAnswerApiWithPayload(payload);
  }

  async function retryLastAiRequest() {
    if (!lastAiRequest) return;
    if (aiLoading) return;
    if (lastAiRequest.type === "start") {
      const { colorName, sessionId: sid } = lastAiRequest;
      await startConversationApi(colorName, sid);
    } else if (lastAiRequest.type === "answer") {
      await submitAnswerApiWithPayload(lastAiRequest.payload);
    }
  }

  function handleInputKeyDown(e) {
    // Submit on Enter (no Shift) like a chat input
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!aiLoading && answerInput && aiMessage) {
        submitAnswerApi();
      }
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* LOGO */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <img src="/Alwan-IMG.png" alt="Logo" className="logo" />
      </div>

      {/* AI Question Panel (centered) */}
      <div className="ai-panel-center">
        <div className="ai-panel">
          <div className="ai-header">
            <div>
              {aiLoading ? <Loading /> : null}
            </div>
          </div>

          {aiError ? (
            <div className="ai-error">
              <div style={{ fontWeight: 700 }}>Try again</div>
              <div style={{ marginTop: 6 }}>{aiError}</div>
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <button className="ai-send" onClick={() => retryLastAiRequest()} disabled={aiLoading || !lastAiRequest}>Retry</button>
                <button onClick={() => setAiError(null)} style={{ padding: '10px 12px', borderRadius: 8 }}>Dismiss</button>
              </div>
            </div>
          ) : (
            <>
              <div className="ai-body">
                {aiMessage ? (
                  <div className="ai-message">{aiMessage}</div>
                ) : (
                  <div style={{ color: '#9aa6bf', padding: 8 }}>No active question yet — pick a color to start the conversation.</div>
                )}
              </div>

              <div className="ai-input-row">
                <input
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder={aiMessage ? "Type your answer here" : "Pick a color to begin..."}
                  className="ai-input"
                  disabled={aiLoading || !aiMessage}
                />
                <button
                  className="ai-send"
                  onClick={() => submitAnswerApi()}
                  disabled={!answerInput || aiLoading || !aiMessage}
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="app-grid">
        <div className="palette">
          <ColorPalette colors={DEFAULT_COLORS} onAdd={handleAddColor} />
        </div>

        <div className="bucket">
          

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="bucket-box"
            style={{ background: bucket || '#ffffff' }}
          />

          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => {
                setBucket(null);
                setAiStage(null);
                setAiMessage(null);
                setAnswerInput("");
                setCurrentColorName(null);
              }}
              style={{ padding: '10px 12px', borderRadius: 8 }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
