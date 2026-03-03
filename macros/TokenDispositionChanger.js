/**
 * Token Disposition Quick-Changer Macro for FoundryVTT
 * 
 * HOW TO USE:
 * 1. Open the Macros directory (hotbar or sidebar)
 * 2. Create a new Script macro
 * 3. Paste this entire script into the Command field
 * 4. Save and click the macro to run it
 *
 * Select one or more tokens on the canvas, then run the macro.
 * A dialog will appear letting you choose the disposition for all selected tokens at once.
 */

(async () => {
  // Get all currently controlled (selected) tokens
  const selectedTokens = canvas.tokens.controlled;

  if (selectedTokens.length === 0) {
    return ui.notifications.warn("No tokens selected! Please select one or more tokens first.");
  }

  // Disposition values as defined by FoundryVTT's CONST
  const dispositions = [
    { label: "👹 Hostile",  value: CONST.TOKEN_DISPOSITIONS.HOSTILE,  color: "#ff4444" },
    { label: "😐 Neutral",  value: CONST.TOKEN_DISPOSITIONS.NEUTRAL,  color: "#ffaa00" },
    { label: "😊 Friendly", value: CONST.TOKEN_DISPOSITIONS.FRIENDLY, color: "#44bb44" },
    { label: "🔒 Secret",   value: CONST.TOKEN_DISPOSITIONS.SECRET,   color: "#9966cc" },
  ];

  // Build button HTML for each disposition
  const buttons = dispositions.reduce((acc, d) => {
    acc[d.label] = {
      label: `<span style="color:${d.color}; font-weight:bold;">${d.label}</span>`,
      callback: async () => {
        // Update all selected tokens
        const updates = selectedTokens.map(t => ({
          _id: t.id,
          disposition: d.value
        }));
        await canvas.scene.updateEmbeddedDocuments("Token", updates);
        ui.notifications.info(
          `Set ${selectedTokens.length} token(s) to ${d.label.replace(/[^ -~]/g, "").trim()}`
        );
      }
    };
    return acc;
  }, {});

  // Show dialog
  new Dialog({
    title: `Change Disposition — ${selectedTokens.length} token(s) selected`,
    content: `
      <style>
        .disposition-dialog p { margin-bottom: 10px; font-size: 13px; color: #ccc; }
        .disposition-dialog .token-list {
          font-size: 11px;
          color: #aaa;
          margin-bottom: 8px;
          max-height: 80px;
          overflow-y: auto;
          border: 1px solid #444;
          padding: 4px 6px;
          border-radius: 4px;
          background: rgba(0,0,0,0.2);
        }
      </style>
      <div class="disposition-dialog">
        <p>Tokens affected:</p>
        <div class="token-list">${selectedTokens.map(t => `• ${t.name}`).join("<br>")}</div>
        <p>Select a disposition to apply to all selected tokens:</p>
      </div>
    `,
    buttons,
    default: "😐 Neutral",
    close: () => {}
  }, {
    width: 300,
    classes: ["dialog"]
  }).render(true);
})();