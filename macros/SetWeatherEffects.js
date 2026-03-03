// Dolmenwood Weather Macro — Foundry Built-in Effects
const WEATHER_OPTIONS = {
  "":          { label: "☀️ Clear & Calm",     description: "The skies are clear. An unsettling stillness hangs over the wood." },
  "rain":      { label: "🌧️ Rain",              description: "A steady rain patters on the leaves above, pooling in the gnarled roots below." },
  "rainStorm": { label: "⛈️ Rain Storm",        description: "A violent storm lashes the wood. Thunder rolls between the ancient trees. Best find shelter." },
  "fog":       { label: "🌫️ Fog",               description: "A pale mist clings to the ground, muffling sound and swallowing landmarks whole." },
  "snow":      { label: "🌨️ Snow",              description: "Snow falls silently through the bare branches. The wood is hushed. Something watches from the white." },
  "blizzard":  { label: "❄️ Blizzard",          description: "A howling blizzard tears through Dolmenwood. The cold bites deep. The path is lost." },
};

// Build dialog HTML
const optionRows = Object.entries(WEATHER_OPTIONS).map(([key, w]) => `
  <label style="display:flex; align-items:center; gap:8px; margin-bottom:8px; cursor:pointer;">
    <input type="radio" name="weather" value="${key}" ${key === (canvas.scene.weather ?? "") ? "checked" : ""} style="margin:0;">
    <span>${w.label}</span>
  </label>
`).join("");

const content = `
  <style>
    .weather-dialog { padding: 8px 4px; }
    .weather-dialog h3 { margin: 0 0 12px; font-family: serif; color: #5a3e2b; }
    .weather-dialog label:hover span { color: #a07850; }
  </style>
  <div class="weather-dialog">
    <h3>🌲 Set the Weather</h3>
    ${optionRows}
  </div>
`;

new Dialog({
  title: "Dolmenwood Weather",
  content,
  buttons: {
    apply: {
      label: "Apply",
      callback: async (html) => {
        const selected = html.find("input[name='weather']:checked").val();

        if (selected === undefined) {
          ui.notifications.warn("No weather selected.");
          return;
        }

        const weather = WEATHER_OPTIONS[selected];
        const scene = canvas.scene;

        if (!scene) {
          ui.notifications.error("No active scene found.");
          return;
        }

        await scene.update({ weather: selected });

        ChatMessage.create({
          content: `<div style="font-family:serif; font-style:italic; color:#3a2a1a; padding:4px 0;">
            <strong>${weather.label}</strong><br>${weather.description}
          </div>`,
          speaker: { alias: "The Wood" }
        });

        ui.notifications.info(`Weather set to: ${weather.label}`);
      }
    },
    cancel: {
      label: "Cancel"
    }
  },
  default: "apply"
}).render(true);