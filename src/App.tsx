import { useCallback, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  Code2,
  Copy,
  Download,
  Eye,
  FileCode2,
  Image,
  Keyboard,
  Link2,
  LoaderCircle,
  Maximize2,
  Minimize2,
  MonitorDown,
  Moon,
  MousePointer2,
  Pencil,
  Redo2,
  Share2,
  ShieldCheck,
  Sparkles,
  Sun,
  Undo2,
  Upload,
  X,
} from "lucide-react";
import Brand from "./components/Brand";
import CodePreview, { type CompareWindow, type LineClickModifiers } from "./components/CodePreview";
import ControlPanel, { type PanelTab } from "./components/ControlPanel";
import { loadAuthor, prepareAvatar, saveAuthor, type AuthorProfile } from "./lib/author";
import { CUSTOM_THEME_ID, forkTheme, loadCustomTheme, saveCustomTheme, sanitizeCustomTheme } from "./lib/custom-theme";
import { renderTypingGif } from "./lib/gif";
import { createArrowOverlay, createTextOverlay, MAX_OVERLAYS, type Overlay } from "./lib/overlays";
import StudioDialog, { type DialogName } from "./components/StudioDialog";
import {
  BACKGROUNDS,
  DEFAULT_TITLES,
  EXPORT_FORMATS,
  FONTS,
  LANGUAGES,
  MAX_CODE_CHARS,
  SAMPLES,
  SHADOWS,
  THEMES,
  type EditorTheme,
  type StylePreset,
} from "./lib/data";
import { detectLanguage } from "./lib/highlight";
import { addRangeToSpec, formatCodeSnippet, parseLineSpec, removeLineFromSpec, toggleLineInSpec } from "./lib/lines";
import { downloadBlob, imageFilename, renderImage } from "./lib/export";
import { readCodeFile } from "./lib/files";
import { preparePhoto, type BackgroundPhoto } from "./lib/photo";
import { EMPTY_LINE_INPUTS, type LineAnnotations, type LineInputs } from "./lib/rows";
import { DEFAULT_SETTINGS, loadSettings, sanitizeSettings, saveSettings, type Settings } from "./lib/settings";
import {
  clearAllLocalData,
  createItemId,
  loadLibrary,
  MAX_LIBRARY_ITEMS,
  saveLibrary,
  type LibraryItem,
} from "./lib/library";
import { buildShareUrl, decodeShare, encodeShare, readShareToken } from "./lib/share";
import { usePwa } from "./hooks/usePwa";

const DEFAULT_BG_ID = "aurora";
const ALL_DEFAULT_TITLES = Object.values(DEFAULT_TITLES);

interface Toast {
  message: string;
  error: boolean;
}

export default function App() {
  const [code, setCode] = useState(SAMPLES.javascript);
  const [language, setLanguage] = useState("javascript");
  const [title, setTitle] = useState("hello-world.js");
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [lineInputs, setLineInputs] = useState<LineInputs>(EMPTY_LINE_INPUTS);
  const [photo, setPhoto] = useState<BackgroundPhoto | null>(null);
  const [library, setLibrary] = useState<LibraryItem[]>(() => loadLibrary());
  const [tab, setTab] = useState<PanelTab>("style");
  const [dialog, setDialog] = useState<DialogName | null>(null);
  const [notice, setNotice] = useState<Toast | null>(null);
  const [exporting, setExporting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [actualSize, setActualSize] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [fit, setFit] = useState({ width: 728, height: 520, scale: 1 });
  const [shareFile, setShareFile] = useState<File | null>(null);
  const [sharePreview, setSharePreview] = useState<string>();
  /* ---- Pro state (v1.3) ---- */
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [author, setAuthor] = useState<AuthorProfile>(() => loadAuthor());
  const [compare, setCompare] = useState<CompareWindow>({ code: "", language: "auto", title: "after.ts" });
  const [customTheme, setCustomTheme] = useState<EditorTheme>(() => loadCustomTheme());
  const [visibleLines, setVisibleLines] = useState<number | null>(null);
  const [gifProgress, setGifProgress] = useState<number | null>(null);
  const dragRef = useRef<{ id: string; handle: "body" | "end" } | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLElement>(null);
  const exportLock = useRef(false);
  const lastClickedLineRef = useRef<number | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  interface Snapshot {
    code: string;
    language: string;
    title: string;
    settings: Settings;
    lineInputs: LineInputs;
  }
  const notify = useCallback((message: string, error = false) => {
    clearTimeout(noticeTimer.current);
    setNotice({ message, error });
    noticeTimer.current = setTimeout(() => setNotice(null), error ? 6000 : 3500);
  }, []);
  useEffect(() => () => clearTimeout(noticeTimer.current), []);

  const undoStack = useRef<Snapshot[]>([]);
  const redoStack = useRef<Snapshot[]>([]);
  const [, setHistoryTick] = useState(0);

  const pushHistory = useCallback(() => {
    undoStack.current = [...undoStack.current.slice(-29), { code, language, title, settings, lineInputs }];
    redoStack.current = [];
    setHistoryTick((n) => n + 1);
  }, [code, language, title, settings, lineInputs]);

  const handleUndo = useCallback(() => {
    const prev = undoStack.current.pop();
    if (!prev) return;
    redoStack.current.push({ code, language, title, settings, lineInputs });
    setCode(prev.code);
    setLanguage(prev.language);
    setTitle(prev.title);
    setSettings(prev.settings);
    setLineInputs(prev.lineInputs);
    setHistoryTick((n) => n + 1);
    notify("Undid last change.");
  }, [code, language, title, settings, lineInputs, notify]);

  const handleRedo = useCallback(() => {
    const next = redoStack.current.pop();
    if (!next) return;
    undoStack.current.push({ code, language, title, settings, lineInputs });
    setCode(next.code);
    setLanguage(next.language);
    setTitle(next.title);
    setSettings(next.settings);
    setLineInputs(next.lineInputs);
    setHistoryTick((n) => n + 1);
    notify("Redid change.");
  }, [code, language, title, settings, lineInputs, notify]);
  const pwa = usePwa();
  const previewCode = useDeferredValue(code);

  const theme =
    settings.themeId === CUSTOM_THEME_ID
      ? customTheme
      : (THEMES.find((item) => item.id === settings.themeId) ?? THEMES[0]);
  const font = FONTS.find((item) => item.id === settings.fontId) ?? FONTS[0];
  const shadow = SHADOWS.find((item) => item.id === settings.shadowId)?.css ?? "none";
  const exportFormat = EXPORT_FORMATS.find((item) => item.id === settings.exportFormat) ?? EXPORT_FORMATS[0];
  const previewLanguage = useMemo(
    () => (language === "auto" ? (detectLanguage(previewCode.slice(0, 16_000)) ?? "plaintext") : language),
    [language, previewCode],
  );
  const activeLanguage = LANGUAGES.find((item) => item.id === previewLanguage);
  const languageName = activeLanguage?.name ?? "Plain text";
  const languageColor = activeLanguage?.color ?? "#8E8A9E";

  const annotations = useMemo<LineAnnotations>(
    () => ({
      highlight: parseLineSpec(lineInputs.highlightSpec),
      added: parseLineSpec(lineInputs.addedSpec),
      removed: parseLineSpec(lineInputs.removedSpec),
      blurred: parseLineSpec(lineInputs.blurSpec),
      grayed: parseLineSpec(lineInputs.graySpec),
      dimUnfocused: lineInputs.dimUnfocused,
      focusOnly: lineInputs.focusOnly,
      focusContext: lineInputs.focusContext,
    }),
    [lineInputs],
  );

  /* ---- Pro: persistence for author card and custom theme ---- */
  // Debounced saves keep typing smooth; `pagehide` flushes immediately so a fast reload or tab close
  // never loses the latest keystrokes (the debounce alone would drop them).
  const authorRef = useRef(author);
  const customThemeRef = useRef(customTheme);
  const settingsRef = useRef(settings);
  authorRef.current = author;
  customThemeRef.current = customTheme;
  settingsRef.current = settings;
  useEffect(() => {
    const timer = setTimeout(() => saveAuthor(author), 250);
    return () => clearTimeout(timer);
  }, [author]);
  useEffect(() => {
    const timer = setTimeout(() => saveCustomTheme(customTheme), 250);
    return () => clearTimeout(timer);
  }, [customTheme]);
  useEffect(() => {
    const flush = () => {
      saveAuthor(authorRef.current);
      saveCustomTheme(customThemeRef.current);
      saveSettings(settingsRef.current);
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
    };
  }, []);

  const patchAuthor = useCallback((next: Partial<AuthorProfile>) => {
    setAuthor((current) => ({ ...current, ...next }));
  }, []);
  const patchCustomTheme = useCallback((next: Partial<EditorTheme>) => {
    setCustomTheme((current) => sanitizeCustomTheme({ ...current, ...next }));
  }, []);
  const patchCompare = useCallback((next: Partial<CompareWindow>) => {
    setCompare((current) => ({ ...current, ...next }));
  }, []);

  const addTextOverlay = useCallback(() => {
    setOverlays((current) => {
      if (current.length >= MAX_OVERLAYS) return current;
      const o = createTextOverlay({ y: 10 + (current.length % 5) * 8 });
      setSelectedOverlayId(o.id);
      return [...current, o];
    });
  }, []);
  const addArrowOverlay = useCallback(() => {
    setOverlays((current) => {
      if (current.length >= MAX_OVERLAYS) return current;
      const o = createArrowOverlay({ y: 15 + (current.length % 5) * 8, y2: 40 + (current.length % 5) * 6 });
      setSelectedOverlayId(o.id);
      return [...current, o];
    });
  }, []);
  const updateOverlay = useCallback((id: string, next: Partial<Overlay>) => {
    setOverlays((current) => current.map((o) => (o.id === id ? ({ ...o, ...next } as Overlay) : o)));
  }, []);
  const removeOverlay = useCallback((id: string) => {
    setOverlays((current) => current.filter((o) => o.id !== id));
    setSelectedOverlayId((current) => (current === id ? null : current));
  }, []);

  // Drag annotations across the canvas. Positions are stored as percentages of the export canvas.
  const handleOverlayPointerDown = useCallback((id: string, handle: "body" | "end", event: React.PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = { id, handle };
    setSelectedOverlayId(id);
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  }, []);
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      const node = exportRef.current;
      if (!drag || !node) return;
      const rect = node.getBoundingClientRect();
      const x = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
      const y = Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100));
      setOverlays((current) =>
        current.map((o) => {
          if (o.id !== drag.id) return o;
          if (o.kind === "arrow" && drag.handle === "end") return { ...o, x2: x, y2: y };
          if (o.kind === "arrow") {
            const dx = o.x2 - o.x;
            const dy = o.y2 - o.y;
            return { ...o, x, y, x2: Math.min(100, Math.max(0, x + dx)), y2: Math.min(100, Math.max(0, y + dy)) };
          }
          return { ...o, x, y };
        }),
      );
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const pickAvatar = async (file: File) => {
    try {
      const url = await prepareAvatar(file);
      setAuthor((current) => ({ ...current, avatarUrl: url, enabled: true }));
      notify("Avatar added. Stored only in this browser.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "That avatar could not be used.", true);
    }
  };

  const forkCurrentTheme = () => {
    setCustomTheme(forkTheme(theme));
    patch({ themeId: CUSTOM_THEME_ID });
    notify(`Forked “${theme.name}” into My Theme. Tune any token below.`);
  };

  // A photo background only exists in memory; after a reload the app falls back to the default gradient.
  const effectiveBgId = settings.bgId === "photo" && !photo ? DEFAULT_BG_ID : settings.bgId;
  const photoUrl = effectiveBgId === "photo" && photo ? photo.url : null;
  const bgStyle = useMemo(() => {
    if (effectiveBgId === "transparent") return { background: "transparent" };
    if (effectiveBgId === "solid") return { background: settings.solidColor };
    if (effectiveBgId === "photo") return { background: "#0B0B10" };
    if (effectiveBgId === "custom") {
      return {
        background: `linear-gradient(${settings.customAngle}deg, ${settings.customFrom}, ${settings.customTo})`,
      };
    }
    return BACKGROUNDS.find((item) => item.id === effectiveBgId)?.style ?? BACKGROUNDS[0].style;
  }, [effectiveBgId, settings.solidColor, settings.customFrom, settings.customTo, settings.customAngle]);

  const canShare = useMemo(() => {
    try {
      return !!navigator.canShare?.({ files: [new File(["png"], "snippet.png", { type: "image/png" })] });
    } catch {
      return false;
    }
  }, []);
  const hasCode = code.trim().length > 0;
  const canExport = hasCode && !exporting && code === previewCode;

  useEffect(() => {
    const timer = setTimeout(() => saveSettings(settings), 200);
    return () => clearTimeout(timer);
  }, [settings]);

  useEffect(() => {
    if (!shareFile) return;
    const url = URL.createObjectURL(shareFile);
    setSharePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [shareFile]);

  // Releases the decoded photo's object URL when it is replaced or the app unmounts.
  useEffect(
    () => () => {
      if (photo) URL.revokeObjectURL(photo.url);
    },
    [photo],
  );

  // Opens snippets from share links (`#s=...`). The fragment never leaves the browser.
  useEffect(() => {
    const token = readShareToken(window.location.hash);
    if (!token) return;
    decodeShare(token)
      .then((shared) => {
        setCode(shared.code);
        setLanguage(shared.language);
        setTitle(shared.title);
        setLineInputs(shared.lineInputs);
        setSettings(shared.settings);
        setOverlays(shared.overlays ?? []);
        if (shared.compareCode) {
          setCompare({
            code: shared.compareCode,
            title: shared.compareTitle || "after.ts",
            language: shared.compareLanguage || "auto",
          });
        }
        notify("Shared snippet loaded. Changes stay on this device unless you share again.");
      })
      .catch((error: unknown) =>
        notify(error instanceof Error ? error.message : "This share link could not be opened.", true),
      );
  }, [notify]);

  const patch = useCallback(
    (next: Partial<Settings>) => {
      pushHistory();
      setSettings((current) => sanitizeSettings({ ...current, ...next }));
    },
    [pushHistory],
  );
  const patchLineInputs = useCallback(
    (next: Partial<LineInputs>) => {
      pushHistory();
      setLineInputs((current) => ({ ...current, ...next }));
    },
    [pushHistory],
  );
  const clearAnnotations = useCallback(() => {
    pushHistory();
    setLineInputs(EMPTY_LINE_INPUTS);
    lastClickedLineRef.current = null;
    notify("Line highlights cleared.");
  }, [pushHistory, notify]);

  const handlePreviewLineClick = useCallback(
    (lineNumber: number, modifiers: LineClickModifiers) => {
      pushHistory();
      if (modifiers.altKey) {
        setLineInputs((current) => {
          const isHl = parseLineSpec(current.highlightSpec).has(lineNumber);
          const isAdd = parseLineSpec(current.addedSpec).has(lineNumber);
          const isRem = parseLineSpec(current.removedSpec).has(lineNumber);
          if (isHl) {
            return {
              ...current,
              highlightSpec: removeLineFromSpec(current.highlightSpec, lineNumber),
              addedSpec: toggleLineInSpec(current.addedSpec, lineNumber),
            };
          }
          if (isAdd) {
            return {
              ...current,
              addedSpec: removeLineFromSpec(current.addedSpec, lineNumber),
              removedSpec: toggleLineInSpec(current.removedSpec, lineNumber),
            };
          }
          if (isRem) {
            return {
              ...current,
              removedSpec: removeLineFromSpec(current.removedSpec, lineNumber),
            };
          }
          return {
            ...current,
            highlightSpec: toggleLineInSpec(current.highlightSpec, lineNumber),
          };
        });
        lastClickedLineRef.current = lineNumber;
        return;
      }

      if (modifiers.shiftKey && lastClickedLineRef.current !== null) {
        const anchor = lastClickedLineRef.current;
        setLineInputs((current) => ({
          ...current,
          highlightSpec: addRangeToSpec(current.highlightSpec, anchor, lineNumber),
        }));
        lastClickedLineRef.current = lineNumber;
        return;
      }

      setLineInputs((current) => ({
        ...current,
        highlightSpec: toggleLineInSpec(current.highlightSpec, lineNumber),
      }));
      lastClickedLineRef.current = lineNumber;
    },
    [pushHistory],
  );

  const editCode = useCallback(() => {
    const focusEditor = () => {
      setTab("code");
      requestAnimationFrame(() => {
        const input = document.getElementById("code-input");
        input?.focus({ preventScroll: true });
        if (window.innerWidth < 900) input?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    };
    if (document.fullscreenElement) void document.exitFullscreen().then(focusEditor, focusEditor);
    else focusEditor();
  }, []);

  const changeLanguage = (value: string) => {
    setLanguage(value);
    if (value === "auto") return;
    if (Object.values(SAMPLES).includes(code)) setCode(SAMPLES[value]);
    if (ALL_DEFAULT_TITLES.includes(title) || title === "hello-world.js" || !title) setTitle(DEFAULT_TITLES[value]);
  };

  const loadSample = () => {
    if (
      hasCode &&
      !Object.values(SAMPLES).includes(code) &&
      !window.confirm("Replace your current code with an example?")
    ) {
      return;
    }
    const id = language === "auto" ? "javascript" : language;
    setCode(SAMPLES[id]);
    setTitle(DEFAULT_TITLES[id]);
    setLineInputs(EMPTY_LINE_INPUTS);
    notify("Example loaded. Make it your own.");
  };

  const formatCode = () => {
    const formatted = formatCodeSnippet(code, settings.tabSize);
    if (formatted === code) {
      notify("Code indentation is already tidy.");
      return;
    }
    setCode(formatted);
    notify("Tidied indentation and trailing spaces.");
  };

  const loadFile = async (file: File) => {
    if (exportLock.current) return;
    try {
      const result = await readCodeFile(file);
      setCode(result.code);
      setLanguage(result.language);
      setTitle(result.title);
      setLineInputs(EMPTY_LINE_INPUTS);
      notify(`Opened ${file.name}`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "This file could not be opened.", true);
    }
  };

  const applyPreset = (preset: StylePreset) => {
    if (exportLock.current) return;
    patch({ themeId: preset.theme, bgId: preset.bg, fontId: preset.font, shadowId: preset.shadow });
    setDialog(null);
    notify(`${preset.name}. Looking good.`);
  };

  const shuffle = () => {
    const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];
    const candidateThemes = THEMES.filter((item) => item.id !== settings.themeId);
    const nextTheme = pick(candidateThemes.length > 0 ? candidateThemes : THEMES);
    const lightBackgroundIds = new Set(["porcelain", "warm-sand", "peach", "honey", "mint-breeze", "grid", "polka"]);
    const matchingBackgrounds = BACKGROUNDS.filter((bg) =>
      nextTheme.dark ? !lightBackgroundIds.has(bg.id) : lightBackgroundIds.has(bg.id),
    );
    const nextBg = pick(matchingBackgrounds.length > 0 ? matchingBackgrounds : BACKGROUNDS);
    const nextFont = pick(FONTS);
    const nextShadow = pick(SHADOWS.slice(1));
    patch({
      themeId: nextTheme.id,
      bgId: nextBg.id,
      fontId: nextFont.id,
      shadowId: nextShadow.id,
    });
    notify(`${nextTheme.name} + ${nextBg.name}. Fresh look.`);
  };

  const pickPhoto = async (file: File) => {
    try {
      const next = await preparePhoto(file);
      setPhoto(next);
      patch({ bgId: "photo" });
      notify("Photo background added. It stays on this device.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "That photo could not be used.", true);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    if (settings.bgId === "photo") patch({ bgId: DEFAULT_BG_ID });
  };

  const copyStyleJson = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
      notify("Style JSON copied to clipboard.");
    } catch {
      notify("Could not copy style JSON in this browser.", true);
    }
  };

  const importStyleJson = (raw: string) => {
    if (raw.length > 8_000) {
      notify("Style JSON is too large.", true);
      return;
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("Invalid format");
      setSettings(sanitizeSettings({ ...settings, ...parsed }));
      setDialog(null);
      notify("Applied imported style preset.");
    } catch {
      notify("Invalid style JSON. Please check the syntax.", true);
    }
  };

  const saveSnippet = (name: string) => {
    if (!hasCode) return;
    const item: LibraryItem = {
      id: createItemId(),
      name: name.trim().slice(0, 60) || title || "Untitled",
      code,
      language,
      title,
      savedAt: Date.now(),
    };
    const next = [item, ...library].slice(0, MAX_LIBRARY_ITEMS);
    if (!saveLibrary(next)) {
      notify("This browser has no room for more saved snippets. Delete some first.", true);
      return;
    }
    setLibrary(next);
    notify(`Saved “${item.name}” to your library on this device.`);
  };

  const loadSnippet = (id: string) => {
    const item = library.find((entry) => entry.id === id);
    if (!item) return;
    if (hasCode && code !== item.code && !window.confirm("Replace the code in the editor with this saved snippet?")) {
      return;
    }
    setCode(item.code);
    setLanguage(item.language);
    setTitle(item.title);
    notify(`Loaded “${item.name}”.`);
  };

  const deleteSnippet = (id: string) => {
    const next = library.filter((entry) => entry.id !== id);
    if (!saveLibrary(next)) {
      notify("Could not update your library in this browser.", true);
      return;
    }
    setLibrary(next);
    notify("Snippet deleted from this device.");
  };

  const clearLocalData = () => {
    if (!window.confirm("Delete every saved snippet and style preference stored in this browser?")) return;
    clearAllLocalData();
    setLibrary([]);
    setPhoto(null);
    setSettings({ ...DEFAULT_SETTINGS, uiTheme: settings.uiTheme });
    notify("Local data cleared from this browser.");
  };

  const copyShareLink = async () => {
    try {
      const token = await encodeShare({
        code,
        title,
        language,
        lineInputs,
        settings,
        overlays,
        compareCode: settings.compareMode ? compare.code : "",
        compareTitle: compare.title,
        compareLanguage: compare.language,
      });
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(buildShareUrl(token, window.location));
      notify("Share link copied. It contains your code, so share it only with people you trust.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not copy the share link.", true);
    }
  };

  const performExport = useCallback(
    async (action: "download" | "copy" | "share") => {
      const node = exportRef.current;
      if (!node || exportLock.current) return;
      if (previewCode !== code) {
        notify("The preview is updating. Please export again in a moment.");
        return;
      }
      if (!code.trim()) {
        notify("Add a little code first.", true);
        editCode();
        return;
      }
      exportLock.current = true;
      setExporting(true);
      try {
        if (action === "copy" && (!navigator.clipboard?.write || !window.ClipboardItem)) {
          throw new Error("Image copying is unavailable in this browser. Download the image instead.");
        }
        const format = action === "download" ? settings.exportFormat : "png";
        const render = renderImage(node, {
          scale: settings.exportScale,
          fontId: settings.fontId,
          format,
          quality: settings.exportQuality,
          background: "#ffffff",
        });

        if (action === "copy") {
          // The clipboard receives the render promise directly, which keeps Safari's user-activation window.
          await navigator.clipboard.write([new ClipboardItem({ "image/png": render.then((result) => result.blob) })]);
          notify("Image copied. Paste it somewhere great.");
        } else if (action === "download") {
          const result = await render;
          const meta = EXPORT_FORMATS.find((item) => item.id === result.format) ?? EXPORT_FORMATS[0];
          downloadBlob(result.blob, imageFilename(title, meta.ext));
          notify(
            result.format === format
              ? `${meta.label} ready. Download started.`
              : `${exportFormat.label} isn't supported in this browser, so ${meta.label} was exported instead.`,
          );
        } else {
          const result = await render;
          setShareFile(new File([result.blob], imageFilename(title), { type: "image/png" }));
          setDialog("share");
        }
      } catch (error) {
        notify(
          error instanceof Error && error.name !== "NotAllowedError"
            ? error.message
            : "Permission wasn't granted. Try downloading your image instead.",
          true,
        );
      } finally {
        exportLock.current = false;
        setExporting(false);
      }
    },
    [code, previewCode, editCode, notify, settings, title, exportFormat.label],
  );

  const exportGif = useCallback(async () => {
    const node = exportRef.current;
    if (!node || exportLock.current || !code.trim()) return;
    exportLock.current = true;
    setExporting(true);
    setGifProgress(0);
    const totalLines = code.split("\n").length;
    try {
      const blob = await renderTypingGif(node, {
        fontId: settings.fontId,
        speed: settings.gifSpeed,
        totalLines,
        onProgress: setGifProgress,
        setVisibleLines: (count) =>
          new Promise<void>((resolve) => {
            setVisibleLines(count);
            // Two frames: one for React commit, one for layout, so html-to-image sees the new rows.
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
          }),
      });
      downloadBlob(blob, imageFilename(title, "gif"));
      notify(`Typing GIF ready (${Math.round(blob.size / 1024)} KB). Download started.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "The GIF could not be created.", true);
    } finally {
      setVisibleLines(null);
      setGifProgress(null);
      exportLock.current = false;
      setExporting(false);
    }
  }, [code, settings.fontId, settings.gifSpeed, title, notify]);

  const shareImage = async () => {
    if (!shareFile) return;
    try {
      await navigator.share({ files: [shareFile], title: title || "My code snippet" });
      setDialog(null);
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) {
        notify("Sharing is unavailable. Use Download instead.", true);
      }
    }
  };

  useLayoutEffect(() => {
    const node = exportRef.current;
    const stage = stageRef.current;
    if (!node || !stage) return;
    const update = () => {
      const width = node.offsetWidth;
      const height = node.offsetHeight;
      const padding = window.innerWidth < 600 ? 20 : 36;
      const scale = Math.max(
        0.01,
        Math.min(1, (stage.clientWidth - padding) / width, (stage.clientHeight - padding) / height),
      );
      setFit((current) =>
        current.width === width && current.height === height && current.scale === scale
          ? current
          : { width, height, scale },
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onFullscreen = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => document.removeEventListener("fullscreenchange", onFullscreen);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!dialog && (event.ctrlKey || event.metaKey)) {
        const key = event.key.toLowerCase();
        const inField =
          event.target instanceof HTMLTextAreaElement ||
          (event.target instanceof HTMLInputElement && event.target.type !== "range" && event.target.type !== "radio");
        if (key === "s") {
          event.preventDefault();
          void performExport("download");
        } else if (key === "e") {
          event.preventDefault();
          editCode();
        } else if (key === "z" && !inField) {
          event.preventDefault();
          if (event.shiftKey) handleRedo();
          else handleUndo();
        } else if (key === "y" && !inField) {
          event.preventDefault();
          handleRedo();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [performExport, editCode, handleUndo, handleRedo, dialog]);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (previewRef.current?.requestFullscreen) await previewRef.current.requestFullscreen();
      else notify("Fullscreen isn't available in this browser. Try rotating your device.", true);
    } catch {
      notify("Your browser has blocked fullscreen mode.", true);
    }
  };

  const install = async () => {
    if (!pwa.canInstall) {
      setDialog("install");
      return;
    }
    try {
      if (await pwa.install()) notify("Snapcode is now a little closer.");
    } catch {
      setDialog("install");
    }
  };

  const zoom = actualSize ? 1 : fit.scale;
  const exportScaleLabel = settings.exportFormat === "svg" ? "Vector" : `${settings.exportScale}x`;

  return (
    <div className="app-shell" data-ui-theme={settings.uiTheme}>
      <a className="skip-link" href="#studio">
        Skip to editor
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand-link" href="#studio" aria-label="Snapcode home">
            <Brand />
          </a>
          <span className="header-divider" />
          <nav className="primary-nav" aria-label="Main navigation">
            <button
              className={!dialog ? "nav-active" : ""}
              onClick={() => {
                setDialog(null);
                document.getElementById("studio")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
              }}
            >
              Editor
            </button>
            <button className={dialog === "templates" ? "nav-active" : ""} onClick={() => setDialog("templates")}>
              Templates
            </button>
            <button className={dialog === "guide" ? "nav-active" : ""} onClick={() => setDialog("guide")}>
              How it works <ArrowRight size={13} />
            </button>
          </nav>
          <div className="header-actions">
            <div className="history-buttons" role="group" aria-label="History">
              <button
                type="button"
                className="icon-button"
                aria-label="Undo"
                title="Undo (Ctrl / Cmd + Z)"
                disabled={undoStack.current.length === 0}
                onClick={handleUndo}
              >
                <Undo2 size={15} />
              </button>
              <button
                type="button"
                className="icon-button"
                aria-label="Redo"
                title="Redo (Ctrl / Cmd + Shift + Z)"
                disabled={redoStack.current.length === 0}
                onClick={handleRedo}
              >
                <Redo2 size={15} />
              </button>
            </div>
            <button
              type="button"
              className="icon-button ui-theme-button"
              aria-label={settings.uiTheme === "dark" ? "Switch to light studio" : "Switch to dark studio"}
              title={settings.uiTheme === "dark" ? "Light studio" : "Dark studio"}
              onClick={() => patch({ uiTheme: settings.uiTheme === "dark" ? "light" : "dark" })}
            >
              {settings.uiTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {!pwa.installed && (
              <button className="install-button" aria-label="Install app" onClick={install}>
                <MonitorDown size={15} />
                <span>Install app</span>
              </button>
            )}
            <div className="export-split">
              <button className="primary-button" disabled={!canExport} onClick={() => void performExport("download")}>
                {exporting ? <LoaderCircle className="spin" size={16} /> : <ArrowDownToLine size={16} />}
                <span>{exporting ? "Rendering..." : "Export image"}</span>
              </button>
              <button
                className="export-menu-button"
                aria-label="Export options"
                onClick={() => {
                  setTab("export");
                  if (window.innerWidth < 900)
                    document.querySelector(".control-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                <ChevronDown size={15} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="workspace-intro">
          <div>
            <h1>
              Your code. A little more <span>beautiful.</span>
            </h1>
            <p>Turn your snippets into something worth sharing.</p>
          </div>
          <div className="private-note">
            <ShieldCheck size={16} />
            <span>
              Your code stays yours.
              <br />
              <strong>100% in your browser.</strong>
            </span>
          </div>
        </div>

        <div className="studio" id="studio">
          <fieldset className="control-fieldset" disabled={exporting}>
            <legend className="sr-only">Customize your code image</legend>
            <ControlPanel
              tab={tab}
              onTab={setTab}
              code={code}
              onCode={(value) => setCode(value.slice(0, MAX_CODE_CHARS).replace(/\r\n?/g, "\n"))}
              onFormatCode={formatCode}
              language={language}
              onLanguage={changeLanguage}
              title={title}
              onTitle={setTitle}
              settings={settings}
              onSettings={patch}
              lineInputs={lineInputs}
              onLineInputs={patchLineInputs}
              onClearAnnotations={clearAnnotations}
              photo={photo}
              onPickPhoto={(file) => void pickPhoto(file)}
              onRemovePhoto={removePhoto}
              library={library}
              onSaveLibrary={saveSnippet}
              onLoadLibrary={loadSnippet}
              onDeleteLibrary={deleteSnippet}
              onClearLocalData={clearLocalData}
              onReset={() => {
                setSettings({ ...DEFAULT_SETTINGS, uiTheme: settings.uiTheme });
                setLineInputs(EMPTY_LINE_INPUTS);
                notify("A fresh start. Your code is unchanged.");
              }}
              onShuffle={shuffle}
              onSample={loadSample}
              onFile={(file) => void loadFile(file)}
              onCopyStyleJson={() => void copyStyleJson()}
              onImportStyleJson={() => setDialog("import-style")}
              onDownload={() => void performExport("download")}
              onCopy={() => void performExport("copy")}
              onCopyLink={() => void copyShareLink()}
              onNotice={notify}
              exporting={exporting}
              width={fit.width}
              height={fit.height}
              pro={{
                settings,
                onSettings: patch,
                lineInputs,
                onLineInputs: patchLineInputs,
                overlays,
                selectedOverlayId,
                onSelectOverlay: setSelectedOverlayId,
                onAddText: addTextOverlay,
                onAddArrow: addArrowOverlay,
                onUpdateOverlay: updateOverlay,
                onRemoveOverlay: removeOverlay,
                author,
                onAuthor: patchAuthor,
                onPickAvatar: (file) => void pickAvatar(file),
                compare,
                onCompare: patchCompare,
                customTheme,
                onCustomTheme: patchCustomTheme,
                onForkTheme: forkCurrentTheme,
                onExportGif: () => void exportGif(),
                gifProgress,
                exporting,
                hasCode,
              }}
            />
          </fieldset>

          <section ref={previewRef} className="preview-panel" aria-label="Image preview">
            <div className="preview-toolbar">
              <div className="preview-heading">
                <h2>Preview</h2>
                <span className="live-label">
                  <i />
                  Live
                </span>
              </div>
              <div className="preview-tools">
                <button className="edit-code-button" onClick={editCode} disabled={exporting}>
                  <Code2 size={15} />
                  Edit code
                </button>
                <span className="tool-divider" />
                <button
                  className="icon-button fullscreen-button"
                  onClick={toggleFullscreen}
                  aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen preview"}
                  title="Fullscreen preview"
                >
                  {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
              </div>
            </div>

            <div className="preview-area">
              <div className="canvas-document">
                <div className="document-name">
                  <FileCode2 size={14} />
                  <input
                    className="preview-title-input"
                    aria-label="Preview file name"
                    value={title}
                    maxLength={100}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={exporting}
                  />
                  <Pencil size={11} />
                </div>
                <span>
                  {languageName} · {theme.name}
                  {settings.aspectRatio !== "auto" && ` · ${FRAMES_LABEL[settings.aspectRatio] ?? ""}`}
                </span>
              </div>

              <div
                ref={stageRef}
                className={`preview-stage ${dragging ? "dragging" : ""} ${actualSize ? "actual-size" : ""}`}
                onDragOver={(event) => {
                  if (event.dataTransfer.types.includes("Files")) {
                    event.preventDefault();
                    setDragging(true);
                  }
                }}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  const file = event.dataTransfer.files[0];
                  if (file) void loadFile(file);
                }}
              >
                <div className="preview-center">
                  <div className="scaled-canvas" style={{ width: fit.width * zoom, height: fit.height * zoom }}>
                    <div className="canvas-transform" style={{ transform: `scale(${zoom})` }}>
                      <CodePreview
                        code={previewCode}
                        language={previewLanguage}
                        languageName={languageName}
                        languageColor={languageColor}
                        title={title}
                        theme={theme}
                        font={font}
                        settings={settings}
                        annotations={annotations}
                        overlays={overlays}
                        author={author}
                        compare={settings.compareMode ? compare : null}
                        visibleLines={visibleLines}
                        selectedOverlayId={selectedOverlayId}
                        onOverlayPointerDown={handleOverlayPointerDown}
                        onLineClick={handlePreviewLineClick}
                        shadowCss={shadow}
                        bgStyle={bgStyle}
                        photoUrl={photoUrl}
                        exportRef={exportRef}
                      />
                    </div>
                  </div>
                </div>
                {dragging && (
                  <div className="drop-overlay">
                    <Upload size={32} />
                    <strong>Drop a little inspiration.</strong>
                    <span>Code or text files, up to 1 MB.</span>
                  </div>
                )}
              </div>

              <div className="canvas-underbar">
                <span>
                  <MousePointer2 size={13} />
                  Your next great snippet starts with <button onClick={editCode}>Edit code</button>
                </span>
                <button
                  className="zoom-button"
                  onClick={() => setActualSize(!actualSize)}
                  title={actualSize ? "Fit preview to screen" : "Show actual size"}
                >
                  <Maximize2 size={12} />
                  {actualSize ? "100%" : "Fit"}
                  <ChevronDown size={12} />
                </button>
              </div>
            </div>

            <div className="preview-bottom">
              <div className="output-info">
                <Image size={16} />
                <span>
                  {exportFormat.label} <i />
                  {exportScaleLabel}
                </span>
                <span className="output-dimensions">
                  {fit.width * (settings.exportFormat === "svg" ? 1 : settings.exportScale)}{" "}
                  <span aria-hidden="true">&times;</span>{" "}
                  {fit.height * (settings.exportFormat === "svg" ? 1 : settings.exportScale)} px
                </span>
              </div>
              <div className="preview-actions">
                {canShare && (
                  <button className="text-button" disabled={!canExport} onClick={() => void performExport("share")}>
                    <Share2 size={15} />
                    Share
                  </button>
                )}
                <button className="text-button" disabled={!hasCode || exporting} onClick={() => void copyShareLink()}>
                  <Link2 size={15} />
                  Copy link
                </button>
                <button className="copy-image-button" disabled={!canExport} onClick={() => void performExport("copy")}>
                  <Copy size={15} />
                  Copy image
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="workspace-footnote">
          <span>
            <Keyboard size={14} />A shortcut to beautiful.<kbd>Ctrl / Cmd + S</kbd>to export.
          </span>
          <button onClick={() => setDialog("templates")}>
            <Sparkles size={14} />
            Need a little inspiration? <strong>Explore templates</strong>
            <ArrowRight size={14} />
          </button>
        </div>
      </main>

      <footer className="site-footer">
        <span>Made for your next README, post, or big idea.</span>
        <div>
          <span className="offline-status">
            <i className={pwa.offlineReady ? "ready" : ""} />
            {pwa.online ? (pwa.offlineReady ? "Offline ready" : "Local-first. Always.") : "Working offline"}
          </span>
          <span className="footer-dot">/</span>
          <button onClick={() => setDialog("guide")}>
            Documentation <CircleHelp size={13} />
          </button>
        </div>
      </footer>

      <div className="mobile-export-bar">
        <button
          className="secondary-button preview-jump"
          aria-label="Back to preview"
          title="Back to preview"
          onClick={() => previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        >
          <Eye size={17} />
        </button>
        <button className="secondary-button" onClick={editCode}>
          <Code2 size={15} />
          Edit code
        </button>
        <button className="primary-button" disabled={!canExport} onClick={() => void performExport("download")}>
          {exporting ? <LoaderCircle className="spin" size={16} /> : <Download size={16} />}
          Export {exportFormat.label}
        </button>
      </div>

      {dialog && (
        <StudioDialog
          name={dialog}
          onClose={() => setDialog(null)}
          onPreset={applyPreset}
          onShare={shareImage}
          onImportJson={importStyleJson}
          sharePreview={sharePreview}
        />
      )}

      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {notice && (
          <div className={`toast ${notice.error ? "toast-error" : ""}`}>
            <span className="toast-symbol">{notice.error ? <CircleHelp size={17} /> : <Check size={17} />}</span>
            <span>{notice.message}</span>
            <button aria-label="Dismiss notification" onClick={() => setNotice(null)}>
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const FRAMES_LABEL: Record<string, string> = {
  "16:9": "Wide 16:9",
  "1:1": "Square 1:1",
  "4:5": "Portrait 4:5",
  og: "Social card",
  story: "Story 9:16",
};
