import { assetUrl } from "./asset-loader.js";

const AUDIO_CONFIG = {
  paperOpen: "audio/paper-open.mp3",
  paperSlide: "audio/paper-slide.mp3",
  ambientDark: "audio/ambient-dark.mp3",
  ambientCity: "audio/ambient-city.mp3"
};

const STORAGE_KEY = "next-generation-letter:muted";

function createAudio(src, options = {}) {
  const audio = new Audio(assetUrl(src));
  audio.preload = options.preload || "metadata";
  audio.volume = options.volume ?? 0.35;
  audio.loop = Boolean(options.loop);
  return audio;
}

export function setupAudioController(toggleButton) {
  const audio = {
    paperOpen: createAudio(AUDIO_CONFIG.paperOpen, { preload: "auto", volume: 0.42 }),
    paperSlide: createAudio(AUDIO_CONFIG.paperSlide, { preload: "auto", volume: 0.34 }),
    ambientDark: createAudio(AUDIO_CONFIG.ambientDark, { volume: 0.12, loop: true }),
    ambientCity: createAudio(AUDIO_CONFIG.ambientCity, { volume: 0.09, loop: true })
  };

  let muted = sessionStorage.getItem(STORAGE_KEY) === "true";
  let currentAmbient = audio.ambientDark;

  const applyMuted = () => {
    Object.values(audio).forEach((item) => {
      item.muted = muted;
    });
    if (toggleButton) {
      toggleButton.hidden = false;
      toggleButton.setAttribute("aria-pressed", String(muted));
      toggleButton.textContent = muted ? "开声" : "静音";
    }
  };

  const safePlay = (item) => {
    if (!item || muted) return;
    item.currentTime = 0;
    item.play().catch(() => {});
  };

  const playAmbient = (item) => {
    if (!item || muted) return;
    if (currentAmbient && currentAmbient !== item) currentAmbient.pause();
    currentAmbient = item;
    currentAmbient.play().catch(() => {});
  };

  toggleButton?.addEventListener("click", () => {
    muted = !muted;
    sessionStorage.setItem(STORAGE_KEY, String(muted));
    applyMuted();
    if (muted) {
      Object.values(audio).forEach((item) => item.pause());
    } else {
      playAmbient(currentAmbient);
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      Object.values(audio).forEach((item) => item.pause());
    } else if (!muted) {
      playAmbient(currentAmbient);
    }
  });

  applyMuted();

  return {
    playPaperOpen: () => safePlay(audio.paperOpen),
    playPaperSlide: () => safePlay(audio.paperSlide),
    startDarkAmbient: () => playAmbient(audio.ambientDark),
    startCityAmbient: () => playAmbient(audio.ambientCity)
  };
}
