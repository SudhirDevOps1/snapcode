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
  LoaderCircle,
  Maximize2,
  Minimize2,
  MonitorDown,
  Moon,
  MousePointer2,
  Pencil,
  Share2,
  ShieldCheck,
  Sparkles,
  Sun,
  Upload,
  X,
} from "lucide-react";
import Brand from "./components/Brand";
import CodePreview, { type LineAnnotations } from "./components/CodePreview";
import ControlPanel, { type LineInputs, type PanelTab } from "./components/ControlPanel";
import StudioDialog, { type DialogName } from "./components/StudioDialog";
import {
  BACKGROUNDS,
  DEFAULT_TITLES,
  FONTS,
  LANGUAGES,
  MAX_CODE_CHARS,
  SHADOWS,
  SAMPLES,
  STYLE_PRESETS,
  THEMES,
  type StylePreset,
} from "./lib/data";
import { DEFAULT_SETTINGS, loadSettings, sanitizeSettings, saveSettings, type Settings } from "./lib/settings";
import { detectLanguage } from "./lib/highlight";
import { formatCodeSnippet, parseLineSpec } from "./lib/lines";
import { downloadBlob, imageFilename, renderImage, renderSvgBlob } from "./lib/export";
import { readCodeFile } from "./lib/files";
import { usePwa } from "./hooks/usePwa";

export default function App() {
  const [code, setCode] = useState(SAMPLES.javascript);
  const [language, setLanguage] = useState("javascript");
  const [title, setTitle] = useState("hello-world.js");
  const [settings, setSettings] = useState(loadSettings);
  const [lineInputs, setLineInputs] = useState<LineInputs>({
    highlightSpec: "",
    addedSpec: "",
    removedSpec: "",
    dimUnfocused: false,
  });
  const [tab, setTab] = useState<PanelTab>("style");
  const [dialog, setDialog] = useState<DialogName | null>(null);
  const [notice, setNotice] = useState<{ message: string; error: boolean } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [actualSize, setActualSize] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [fit, setFit] = useState({ width: 728, height: 520, scale: 1 });
  const [shareFile, setShareFile] = useState<File | null>(null);
  const [sharePreview, setSharePreview] = useState<string>();
  const exportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLElement>(null);
  const exportLock = useRef(false);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pwa = usePwa();
  const previewCode = useDeferredValue(code);
  const theme = THEMES.find((item) => item.id === settings.themeId) ?? THEMES[0];
  const font = FONTS.find((item) => item.id === settings.fontId) ?? FONTS[0];
  const shadow = SHADOWS.find((item) => item.id === settings.shadowId)?.css ?? "none";
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
      dimUnfocused: lineInputs.dimUnfocused,
    }),
    [lineInputs],
  );

  const bgStyle = useMemo(() => {
    if (settings.bgId === "transparent") return { background: "transparent" };
    if (settings.bgId === "solid") return { background: settings.solidColor };
    if (settings.bgId === "custom")
      return {
        background: `linear-gradient(${settings.customAngle}deg, ${settings.customFrom}, ${settings.customTo})`,
      };
    return BACKGROUNDS.find((item) => item.id === settings.bgId)?.style ?? BACKGROUNDS[0].style;
  }, [settings.bgId, settings.solidColor, settings.customFrom, settings.customTo, settings.customAngle]);

  const canShare = useMemo(() => {
    try {
      return !!navigator.canShare?.({ files: [new File(["png"], "snippet.png", { type: "image/png" })] });
    } catch {
      return false;
    }
  }, []);
  const canExport = code.trim().length > 0 && !exporting && code === previewCode;

  const notify = useCallback((message: string, error = false) => {
    clearTimeout(noticeTimer.current);
    setNotice({ message, error });
    noticeTimer.current = setTimeout(() => setNotice(null), error ? 6000 : 3500);
  }, []);
  useEffect(() => () => clearTimeout(noticeTimer.current), []);
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

  const patch = useCallback(
    (next: Partial<Settings>) => setSettings((current) => sanitizeSettings({ ...current, ...next })),
    [],
  );
  const patchLineInputs = useCallback(
    (next: Partial<LineInputs>) => setLineInputs((current) => ({ ...current, ...next })),
    [],
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
    if (Object.values(DEFAULT_TITLES).includes(title) || title === "hello-world.js" || !title)
      setTitle(DEFAULT_TITLES[value]);
  };

  const loadSample = () => {
    if (
      code.trim() &&
      !Object.values(SAMPLES).includes(code) &&
      !window.confirm("Replace your current code with an example?")
    )
      return;
    const id = language === "auto" ? "javascript" : language;
    setCode(SAMPLES[id]);
    setTitle(DEFAULT_TITLES[id]);
    setLineInputs({ highlightSpec: "", addedSpec: "", removedSpec: "", dimUnfocused: false });
    notify("Example loaded. Make it your own.");
  };

  const formatCode = () => {
    const formatted = formatCodeSnippet(code);
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
      setLineInputs({ highlightSpec: "", addedSpec: "", removedSpec: "", dimUnfocused: false });
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
    const candidates = STYLE_PRESETS.filter(
      (preset) => preset.theme !== settings.themeId || preset.bg !== settings.bgId,
    );
    applyPreset(candidates[Math.floor(Math.random() * candidates.length)]);
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
      const parsed = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("Invalid format");
      }
      setSettings(sanitizeSettings({ ...settings, ...parsed }));
      setDialog(null);
      notify("Applied imported style preset.");
    } catch {
      notify("Invalid style JSON. Please check the syntax.", true);
    }
  };

  const performExport = useCallback(
    async (action: "download" | "svg" | "copy" | "share") => {
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
        if (action === "svg") {
          const svgBlob = await renderSvgBlob(node, settings.fontId);
          downloadBlob(svgBlob, imageFilename(title, "svg"));
          notify("Vector SVG is ready. Download started.");
          return;
        }
        if (action === "copy" && (!navigator.clipboard?.write || !window.ClipboardItem))
          throw new Error("Image copying is unavailable in this browser. Download the PNG instead.");
        const render = renderImage(node, settings.exportScale, settings.fontId);
        if (action === "copy") {
          // Passing the promise immediately preserves Safari's user-activation requirement.
          const results = await Promise.allSettled([
            navigator.clipboard.write([new ClipboardItem({ "image/png": render })]),
            render,
          ]);
          for (const result of results) if (result.status === "rejected") throw result.reason;
          notify("Image copied. Paste it somewhere great.");
        } else {
          const blob = await render;
          if (action === "download") {
            downloadBlob(blob, imageFilename(title));
            notify(`${settings.exportScale}x PNG is ready. Download started.`);
          } else {
            setShareFile(new File([blob], imageFilename(title), { type: "image/png" }));
            setDialog("share");
          }
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
    [code, previewCode, editCode, notify, settings.exportScale, settings.fontId, title],
  );

  const shareImage = async () => {
    if (!shareFile) return;
    try {
      await navigator.share({ files: [shareFile], title: title || "My code snippet" });
      setDialog(null);
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError"))
        notify("Sharing is unavailable. Use Download PNG instead.", true);
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
        if (event.key.toLowerCase() === "s") {
          event.preventDefault();
          void performExport("download");
        }
        if (event.key.toLowerCase() === "e") {
          event.preventDefault();
          editCode();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [performExport, editCode, dialog]);

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
              onReset={() => {
                setSettings({ ...DEFAULT_SETTINGS, uiTheme: settings.uiTheme });
                setLineInputs({ highlightSpec: "", addedSpec: "", removedSpec: "", dimUnfocused: false });
                notify("A fresh start. Your code is unchanged.");
              }}
              onShuffle={shuffle}
              onSample={loadSample}
              onFile={loadFile}
              onCopyStyleJson={() => void copyStyleJson()}
              onImportStyleJson={() => setDialog("import-style")}
              onDownload={() => void performExport("download")}
              onDownloadSvg={() => void performExport("svg")}
              onCopy={() => void performExport("copy")}
              onNotice={notify}
              exporting={exporting}
              width={fit.width}
              height={fit.height}
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
                        shadowCss={shadow}
                        bgStyle={bgStyle}
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
                  PNG <i />
                  {settings.exportScale}x
                </span>
                <span className="output-dimensions">
                  {fit.width * settings.exportScale} <span aria-hidden="true">&times;</span>{" "}
                  {fit.height * settings.exportScale} px
                </span>
              </div>
              <div className="preview-actions">
                {canShare && (
                  <button className="text-button" disabled={!canExport} onClick={() => void performExport("share")}>
                    <Share2 size={15} />
                    Share
                  </button>
                )}
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
          Export PNG
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
