// Browse Token Attributes Macro for FoundryVTT
// Select a token before running this macro

(async () => {
  const token = canvas.tokens.controlled[0];
  if (!token) {
    ui.notifications.warn("Please select a token first.");
    return;
  }

  const actor = token.actor;
  if (!actor) {
    ui.notifications.warn("Selected token has no associated actor.");
    return;
  }

  // Recursively flatten an object into dot-notation key-value pairs
  function flattenObject(obj, prefix = "", result = {}) {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        !(value instanceof foundry.abstract.DataModel)
      ) {
        flattenObject(value, fullKey, result);
      } else {
        result[fullKey] = value;
      }
    }
    return result;
  }

  // Get the raw data object from the actor
  const rawData = actor.toObject();
  const flat = flattenObject(rawData);

  // Sort keys alphabetically
  const entries = Object.entries(flat).sort(([a], [b]) => a.localeCompare(b));

  // Build the dialog HTML
  const buildRows = (filter = "") => {
    const lower = filter.toLowerCase();
    const filtered = entries.filter(([k, v]) =>
      !filter || k.toLowerCase().includes(lower) || String(v).toLowerCase().includes(lower)
    );

    if (filtered.length === 0) {
      return `<div class="bta-no-results">No attributes match your filter.</div>`;
    }

    return filtered
      .map(([key, value]) => {
        const displayVal = value === null ? "<em>null</em>" :
                           value === undefined ? "<em>undefined</em>" :
                           Array.isArray(value) ? `[Array(${value.length})]` :
                           String(value);
        const safeVal = String(value ?? "");
        const safeKey = key.replace(/"/g, "&quot;");
        const safeKeyDisplay = key.replace(/</g, "&lt;");
        return `
          <div class="bta-row">
            <span class="bta-key" title="${safeKey}">${safeKeyDisplay}</span>
            <span class="bta-value" title="${displayVal}">${displayVal}</span>
            <button class="bta-copy-btn" data-copy="${safeKey}" title="Copy attribute path">
              <i class="fas fa-clipboard"></i>
            </button>
          </div>`;
      })
      .join("");
  };

  const style = `
    <style>
      #bta-dialog .window-content { padding: 0; }
      #bta-wrapper {
        display: flex;
        flex-direction: column;
        height: 500px;
        background: #1a1a2e;
        font-family: 'Courier New', monospace;
        color: #c8d6e5;
      }
      #bta-header {
        background: #12122a;
        padding: 8px 12px;
        border-bottom: 1px solid #2a5298;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      #bta-header i { color: #4fa3e0; font-size: 14px; }
      #bta-filter {
        flex: 1;
        background: #0d0d1f;
        border: 1px solid #2a5298;
        border-radius: 4px;
        padding: 5px 10px;
        color: #c8d6e5;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        outline: none;
      }
      #bta-filter:focus { border-color: #4fa3e0; box-shadow: 0 0 6px rgba(79,163,224,0.4); }
      #bta-filter::placeholder { color: #4a5568; }
      #bta-token-label {
        background: #12122a;
        padding: 4px 12px;
        font-size: 11px;
        color: #4fa3e0;
        border-bottom: 1px solid #1e3a6e;
        font-weight: bold;
        letter-spacing: 0.05em;
      }
      #bta-token-label span { color: #7ec8e3; }
      #bta-list {
        flex: 1;
        overflow-y: auto;
        padding: 4px 0;
      }
      #bta-list::-webkit-scrollbar { width: 6px; }
      #bta-list::-webkit-scrollbar-track { background: #12122a; }
      #bta-list::-webkit-scrollbar-thumb { background: #2a5298; border-radius: 3px; }
      .bta-row {
        display: flex;
        align-items: center;
        padding: 3px 12px;
        gap: 8px;
        border-bottom: 1px solid #1a1a3a;
        transition: background 0.1s;
        min-height: 26px;
      }
      .bta-row:hover { background: #1e2a4a; }
      .bta-key {
        flex: 0 0 46%;
        font-size: 11.5px;
        color: #7ec8e3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .bta-value {
        flex: 1;
        font-size: 11px;
        color: #a0aec0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: right;
      }
      .bta-value em { color: #4a5568; }
      .bta-copy-btn {
        flex: 0 0 22px;
        background: #1e3a5a;
        border: 1px solid #2a5298;
        border-radius: 3px;
        color: #4fa3e0;
        cursor: pointer;
        padding: 2px 4px;
        font-size: 10px;
        line-height: 1;
        transition: background 0.15s, color 0.15s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .bta-copy-btn:hover { background: #2a5298; color: #7ec8e3; }
      .bta-copy-btn.copied { background: #1a4a2a; border-color: #2d8a4a; color: #4ade80; }
      .bta-no-results {
        padding: 20px;
        text-align: center;
        color: #4a5568;
        font-size: 12px;
        font-style: italic;
      }
      #bta-count {
        padding: 4px 12px;
        font-size: 10px;
        color: #4a5568;
        border-top: 1px solid #1e3a6e;
        text-align: right;
        background: #12122a;
      }
    </style>
  `;

  const content = `
    ${style}
    <div id="bta-wrapper">
      <div id="bta-header">
        <i class="fas fa-search"></i>
        <input id="bta-filter" type="text" placeholder="Filter attributes..." autocomplete="off" />
      </div>
      <div id="bta-token-label">Token: <span>${actor.name}</span></div>
      <div id="bta-list">${buildRows()}</div>
      <div id="bta-count">${entries.length} attributes total</div>
    </div>
  `;

  new Dialog({
    title: "Browse Token Attributes",
    content,
    buttons: {
      close: { label: "Close", icon: '<i class="fas fa-times"></i>' }
    },
    default: "close",
    render: (html) => {
      const wrapper = html[0].closest(".dialog") || html[0].closest(".app");
      if (wrapper) wrapper.id = "bta-dialog";

      const filterInput = html.find("#bta-filter")[0];
      const list = html.find("#bta-list")[0];
      const count = html.find("#bta-count")[0];

      // Filter handler
      filterInput.addEventListener("input", () => {
        const f = filterInput.value;
        const visibleEntries = entries.filter(([k, v]) =>
          !f || k.toLowerCase().includes(f.toLowerCase()) || String(v).toLowerCase().includes(f.toLowerCase())
        );
        list.innerHTML = buildRows(f);
        count.textContent = `${visibleEntries.length} / ${entries.length} attributes`;
        attachCopyHandlers(html);
      });

      attachCopyHandlers(html);

      // Focus the filter input
      setTimeout(() => filterInput.focus(), 50);
    },
  }, {
    id: "browse-token-attributes",
    width: 480,
    height: 580,
  }).render(true);

  function attachCopyHandlers(html) {
    html.find(".bta-copy-btn").on("click", function () {
      const key = this.dataset.copy;
      navigator.clipboard.writeText(key).then(() => {
        this.classList.add("copied");
        const orig = this.innerHTML;
        this.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
          this.innerHTML = orig;
          this.classList.remove("copied");
        }, 1200);
      }).catch(() => {
        // Fallback for older browsers
        const el = document.createElement("textarea");
        el.value = key;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        ui.notifications.info(`Copied: ${key}`);
      });
    });
  }
})();