import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { assetUrl } from "./asset-loader.js";

gsap.registerPlugin(Draggable);

const AUDIO_CONFIG = {
  paperOpen: "audio/paper-open.mp3",
  paperSlide: "audio/paper-slide.mp3",
  ambientDark: "audio/ambient-dark.mp3",
  ambientCity: "audio/ambient-city.mp3"
};

const POSITION_KEY = "next-generation-letter:audio-player-position";
const SESSION_KEY = "next-generation-letter:audio-playback";
const AMBIENT_VOLUME = {
  dark: 0.12,
  city: 0.09
};

function createAudio(src, options = {}) {
  const audio = new Audio(assetUrl(src));
  audio.preload = options.preload || "metadata";
  audio.volume = options.volume ?? 0.35;
  audio.loop = Boolean(options.loop);
  return audio;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function readPosition() {
  try {
    return JSON.parse(localStorage.getItem(POSITION_KEY) || "null");
  } catch {
    return null;
  }
}

function writePosition(position) {
  localStorage.setItem(POSITION_KEY, JSON.stringify(position));
}

export function setupAudioController(button) {
  const disc = button?.querySelector(".audio-player__disc");
  const statusText = button?.querySelector(".audio-player__status");
  const tracks = {
    paperOpen: createAudio(AUDIO_CONFIG.paperOpen, { preload: "auto", volume: 0.42 }),
    paperSlide: createAudio(AUDIO_CONFIG.paperSlide, { preload: "auto", volume: 0.34 }),
    dark: createAudio(AUDIO_CONFIG.ambientDark, { volume: AMBIENT_VOLUME.dark, loop: true }),
    city: createAudio(AUDIO_CONFIG.ambientCity, { volume: AMBIENT_VOLUME.city, loop: true })
  };

  const state = {
    currentAmbient: "dark",
    userPaused: sessionStorage.getItem(SESSION_KEY) !== "playing",
    muted: false,
    isPlaying: false
  };
  const listeners = new Set();
  let suppressClick = false;
  let wasPlayingBeforeHidden = false;

  const spinTween = disc ? gsap.to(disc, {
    rotation: "+=360",
    duration: 5.5,
    ease: "none",
    repeat: -1,
    paused: true
  }) : null;

  const notify = () => {
    state.isPlaying = Boolean(tracks[state.currentAmbient] && !tracks[state.currentAmbient].paused && !tracks[state.currentAmbient].ended);
    button?.classList.toggle("is-playing", state.isPlaying);
    button?.setAttribute("aria-pressed", String(state.isPlaying));
    button?.setAttribute("aria-label", state.isPlaying ? "暂停背景音乐" : "播放背景音乐");
    button?.setAttribute("title", state.isPlaying ? "暂停背景音乐" : "播放背景音乐");
    if (statusText) statusText.textContent = state.isPlaying ? "背景音乐正在播放" : "背景音乐已暂停";
    listeners.forEach((listener) => listener({ ...state }));
  };

  const startRotation = () => {
    spinTween?.play();
    notify();
  };

  const stopRotation = () => {
    spinTween?.pause();
    notify();
  };

  [tracks.dark, tracks.city].forEach((track) => {
    track.addEventListener("play", startRotation);
    track.addEventListener("pause", stopRotation);
    track.addEventListener("ended", stopRotation);
  });

  const safePlay = async (track, { restart = false } = {}) => {
    if (!track || state.muted) return false;
    if (restart) track.currentTime = 0;
    try {
      await track.play();
      return true;
    } catch {
      stopRotation();
      return false;
    }
  };

  const pauseAllAmbient = () => {
    tracks.dark.pause();
    tracks.city.pause();
    stopRotation();
  };

  const setAmbient = async (ambient, { crossfade = true } = {}) => {
    if (!tracks[ambient]) return false;
    const previous = tracks[state.currentAmbient];
    const next = tracks[ambient];
    if (previous === next) {
      if (!state.userPaused) return safePlay(next);
      notify();
      return true;
    }

    state.currentAmbient = ambient;
    if (state.userPaused || state.muted) {
      previous.pause();
      notify();
      return true;
    }

    next.volume = crossfade ? 0 : AMBIENT_VOLUME[ambient];
    const started = await safePlay(next);
    if (!started) {
      state.userPaused = true;
      sessionStorage.setItem(SESSION_KEY, "paused");
      notify();
      return false;
    }

    if (crossfade) {
      gsap.to(next, { volume: AMBIENT_VOLUME[ambient], duration: 1.1, ease: "power1.out" });
      gsap.to(previous, {
        volume: 0,
        duration: 1.1,
        ease: "power1.out",
        onComplete: () => {
          previous.pause();
          previous.currentTime = 0;
          previous.volume = AMBIENT_VOLUME[previous === tracks.dark ? "dark" : "city"];
        }
      });
    } else {
      previous.pause();
    }
    notify();
    return true;
  };

  const play = async () => {
    state.userPaused = false;
    sessionStorage.setItem(SESSION_KEY, "playing");
    const ok = await safePlay(tracks[state.currentAmbient]);
    if (!ok) {
      state.userPaused = true;
      sessionStorage.setItem(SESSION_KEY, "paused");
    }
    notify();
    return ok;
  };

  const pause = () => {
    state.userPaused = true;
    sessionStorage.setItem(SESSION_KEY, "paused");
    pauseAllAmbient();
    notify();
  };

  const toggle = () => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const playPaperOpen = () => {
    safePlay(tracks.paperOpen, { restart: true });
  };

  const playPaperSlide = () => {
    safePlay(tracks.paperSlide, { restart: true });
  };

  const getBounds = () => {
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width || 52, rect.height || 52);
    const top = 72 + (window.visualViewport?.offsetTop || 0);
    const bottom = window.innerHeight - size - 92;
    return {
      minX: 12,
      maxX: window.innerWidth - size - 12,
      minY: top,
      maxY: Math.max(top, bottom)
    };
  };

  const saveCurrentPosition = () => {
    if (!button) return;
    const bounds = getBounds();
    const x = gsap.getProperty(button, "x");
    const y = gsap.getProperty(button, "y");
    const side = x + button.offsetWidth / 2 < window.innerWidth / 2 ? "left" : "right";
    const yRatio = (y - bounds.minY) / Math.max(1, bounds.maxY - bounds.minY);
    writePosition({ side, yRatio: Number(clamp(yRatio, 0, 1).toFixed(4)) });
  };

  const placeButton = () => {
    if (!button) return;
    button.hidden = false;
    const bounds = getBounds();
    const saved = readPosition();
    const side = saved?.side === "left" ? "left" : "right";
    const defaultRatio = window.matchMedia("(max-width: 768px)").matches ? 0.62 : 0.68;
    const yRatio = Number.isFinite(saved?.yRatio) ? saved.yRatio : defaultRatio;
    gsap.set(button, {
      left: 0,
      top: 0,
      right: "auto",
      bottom: "auto",
      x: side === "left" ? bounds.minX : bounds.maxX,
      y: clamp(bounds.minY + (bounds.maxY - bounds.minY) * yRatio, bounds.minY, bounds.maxY)
    });
  };

  const snapToEdge = () => {
    if (!button) return;
    const bounds = getBounds();
    const x = gsap.getProperty(button, "x");
    const targetX = x + button.offsetWidth / 2 < window.innerWidth / 2 ? bounds.minX : bounds.maxX;
    const targetY = clamp(gsap.getProperty(button, "y"), bounds.minY, bounds.maxY);
    gsap.to(button, {
      x: targetX,
      y: targetY,
      duration: 0.32,
      ease: "power3.out",
      onComplete: saveCurrentPosition
    });
  };

  if (button) {
    placeButton();
    let dragStart = { x: 0, y: 0 };
    Draggable.create(button, {
      type: "x,y",
      bounds: getBounds(),
      edgeResistance: 0.78,
      cursor: "grab",
      onPress() {
        this.applyBounds(getBounds());
        dragStart = { x: this.pointerX, y: this.pointerY };
      },
      onDragEnd() {
        const distance = Math.hypot(this.pointerX - dragStart.x, this.pointerY - dragStart.y);
        suppressClick = distance > 6;
        snapToEdge();
        if (suppressClick) window.setTimeout(() => { suppressClick = false; }, 80);
      }
    });

    button.addEventListener("click", (event) => {
      if (suppressClick) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      toggle();
    });

    window.addEventListener("resize", () => {
      placeButton();
      snapToEdge();
    });
    window.addEventListener("orientationchange", () => window.setTimeout(() => {
      placeButton();
      snapToEdge();
    }, 160));
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      wasPlayingBeforeHidden = state.isPlaying;
      pauseAllAmbient();
    } else if (wasPlayingBeforeHidden && !state.userPaused) {
      play();
    }
  });

  notify();

  return {
    play,
    pause,
    toggle,
    setAmbient,
    playPaperOpen,
    playPaperSlide,
    startDarkAmbient: () => {
      state.currentAmbient = "dark";
      return play();
    },
    startCityAmbient: () => setAmbient("city", { crossfade: true }),
    getState: () => ({ ...state }),
    subscribe(listener) {
      listeners.add(listener);
      listener({ ...state });
      return () => listeners.delete(listener);
    }
  };
}
