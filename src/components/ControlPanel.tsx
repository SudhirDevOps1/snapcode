import { useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import {
  Check,
  ChevronDown,
  Code2,
  Download,
  Eraser,
  FileCode2,
  Image,
  Minus,
  Moon,
  Palette,
  Plus,
  RotateCcw,
  Shuffle,
  Sparkles,
  Sun,
  Upload,
  Copy,
  LoaderCircle,
} from "lucide-react";
import { ASPECT_RATIOS, BACKGROUNDS, FONTS, LANGUAGES, MAX_CODE_CHARS, SHADOWS, THEMES } from "../lib/data";
import type { AspectRatioId, Settings, WindowBorder, WindowStyle } from "../lib/settings";

export type PanelTab = "style" | "code" | "export";

export interface LineInputs {
  highlightSpec: string;
  addedSpec: string;
  removedSpec: string;
  dimUnfocused: boolean;
}

interface Props {
  tab: PanelTab;
  onTab: (tab: PanelTab) => void;
  code: string;
  onCode: (value: string) => void;
  onFormatCode: () => void;
  language: string;
  onLanguage: (value: string) => void;
  title: string;
  onTitle: (value: string) => void;
  settings: Settings;
  onSettings: (patch: Partial<Settings>) => void;
  lineInputs: LineInputs;
  onLineInputs: (patch: Partial<LineInputs>) => void;
  onReset: () => void;
  onShuffle: () => void;
  onSample: () => void;
  onFile: (file: File) => void;
  onCopyStyleJson: () => void;
  onImportStyleJson: () => void;
  onDownload: () => void;
  onDownloadSvg: () => void;
  onCopy: () => void;
  onNotice: (message: string, error?: boolean) => void;
  exporting: boolean;
  width: number;
  height: number;
}

export function SelectField({
  label,
  value,
  onChange,
  children,
  id,
  icon,
  labelAction,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  id: string;
  icon?: ReactNode;
  labelAction?: ReactNode;
}) {
  return (
    <div className="field">
      <div className="field-label">
        <label id={`${id}-label`} htmlFor={id}>
          {label}
        </label>
        {labelAction}
      </div>
      <span className={`select-wrap ${icon ? "with-icon" : ""}`}>
        {icon}
        <select id={id} aria-labelledby={`${id}-label`} value={value} onChange={(e) => onChange(e.target.value)}>
          {children}
        </select>
        <ChevronDown size={13} className="select-chevron" />
      </span>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      className="toggle-row"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span>{label}</span>
      <span className={`toggle-track ${checked ? "is-on" : ""}`}>
        <span />
      </span>
    </button>
  );
}

export default function ControlPanel(p: Props) {
  const s = p.settings;
  const fileRef = useRef<HTMLInputElement>(null);
  const advancedRef = useRef<HTMLDetailsElement>(null);
  const tabEscape = useRef(false);
  const backgroundMode = s.bgId === "solid" ? "solid" : s.bgId === "transparent" ? "transparent" : "gradient";
  const backgroundName = BACKGROUNDS.find((bg) => bg.id === s.bgId)?.name ?? (s.bgId === "custom" ? "Custom" : "");
  const currentTheme = THEMES.find((t) => t.id === s.themeId) ?? THEMES[0];
  const darkThemes = THEMES.filter((t) => t.dark);
  const lightThemes = THEMES.filter((t) => !t.dark);

  const tabs = [
    { id: "style", name: "Style", icon: Palette },
    { id: "code", name: "Code", icon: Code2 },
    { id: "export", name: "Export", icon: Image },
  ] as const;

  const editorKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape") {
      tabEscape.current = true;
      return;
    }
    if (event.key !== "Tab" || event.shiftKey || tabEscape.current) {
      tabEscape.current = false;
      return;
    }
    event.preventDefault();
    const target = event.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    if (p.code.length + 2 > MAX_CODE_CHARS) return;
    p.onCode(p.code.slice(0, start) + "  " + p.code.slice(end));
    requestAnimationFrame(() => target.setSelectionRange(start + 2, start + 2));
  };

  const toggleThemePolarity = () => {
    const targetTheme = currentTheme.dark ? lightThemes[0] : darkThemes[0];
    if (targetTheme) p.onSettings({ themeId: targetTheme.id });
  };

  return (
    <aside className="control-panel" aria-label="Snippet settings">
      <div className="panel-heading">
        <h2>Make it yours</h2>
        <button className="icon-button" title="Reset styling" aria-label="Reset styling" onClick={p.onReset}>
          <RotateCcw size={15} />
        </button>
      </div>
      <div className="panel-tabs" role="tablist" aria-label="Editor controls">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={p.tab === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={p.tab === tab.id ? 0 : -1}
            className={p.tab === tab.id ? "active" : ""}
            onClick={() => p.onTab(tab.id)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                event.preventDefault();
                const next = tabs[(index + (event.key === "ArrowRight" ? 1 : 2)) % 3].id;
                p.onTab(next);
                document.getElementById(`tab-${next}`)?.focus();
              }
            }}
          >
            <tab.icon size={14} />
            {tab.name}
          </button>
        ))}
      </div>
      <div key={p.tab} className="panel-content" role="tabpanel" id={`panel-${p.tab}`} aria-labelledby={`tab-${p.tab}`}>
        {p.tab !== "export" && (
          <div className={p.tab === "style" ? "field-pair" : "code-language"}>
            <SelectField label="Language" value={p.language} onChange={p.onLanguage} id="language-select">
              <option value="auto">Auto-detect</option>
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </SelectField>
            {p.tab === "style" && (
              <SelectField
                label="Theme"
                value={s.themeId}
                onChange={(themeId) => p.onSettings({ themeId })}
                id="theme-select"
                labelAction={
                  <button
                    type="button"
                    className="theme-polarity-pill"
                    onClick={toggleThemePolarity}
                    title={`Switch to ${currentTheme.dark ? "a light" : "a dark"} editor theme`}
                  >
                    {currentTheme.dark ? <Moon size={10} /> : <Sun size={10} />}
                    {currentTheme.dark ? "Dark" : "Light"}
                  </button>
                }
              >
                <optgroup label="Dark Themes">
                  {darkThemes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Light Themes">
                  {lightThemes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </optgroup>
              </SelectField>
            )}
          </div>
        )}
        {p.tab === "style" && (
          <>
            <section className="control-group background-group" aria-label="Background settings">
              <div className="group-label">
                <h3>Background</h3>
                <span>{backgroundName}</span>
              </div>
              <div className="segmented background-modes" aria-label="Background type">
                {(["gradient", "solid", "transparent"] as const).map((mode) => (
                  <button
                    key={mode}
                    className={backgroundMode === mode ? "selected" : ""}
                    aria-pressed={backgroundMode === mode}
                    onClick={() => p.onSettings({ bgId: mode === "gradient" ? "aurora" : mode })}
                  >
                    {mode === "gradient" ? "Gradient" : mode === "solid" ? "Solid" : "None"}
                  </button>
                ))}
              </div>
              {backgroundMode === "gradient" && (
                <>
                  <div className="background-swatches">
                    {BACKGROUNDS.slice(0, 16).map((bg) => (
                      <button
                        key={bg.id}
                        className={`background-swatch ${s.bgId === bg.id ? "selected" : ""}`}
                        aria-label={`${bg.name} background`}
                        title={bg.name}
                        aria-pressed={s.bgId === bg.id}
                        style={{ background: bg.swatch }}
                        onClick={() => {
                          p.onSettings({ bgId: bg.id });
                        }}
                      >
                        {s.bgId === bg.id && <Check size={13} strokeWidth={2.5} />}
                      </button>
                    ))}
                  </div>
                  <button
                    className="custom-colors-button"
                    onClick={() => {
                      p.onSettings({ bgId: s.bgId === "custom" ? "aurora" : "custom" });
                    }}
                    aria-expanded={s.bgId === "custom"}
                  >
                    <span className="custom-color-icon" />
                    <span>Custom gradient</span>
                    <Plus size={13} />
                  </button>
                  {s.bgId === "custom" && (
                    <div className="custom-colors">
                      <label>
                        From
                        <input
                          type="color"
                          aria-label="Gradient start"
                          value={s.customFrom}
                          onChange={(e) => p.onSettings({ customFrom: e.target.value })}
                        />
                      </label>
                      <label>
                        To
                        <input
                          type="color"
                          aria-label="Gradient end"
                          value={s.customTo}
                          onChange={(e) => p.onSettings({ customTo: e.target.value })}
                        />
                      </label>
                      <label>
                        Angle
                        <input
                          type="number"
                          aria-label="Gradient angle"
                          min={0}
                          max={360}
                          value={s.customAngle}
                          onChange={(e) => p.onSettings({ customAngle: Number(e.target.value) })}
                        />
                      </label>
                    </div>
                  )}
                </>
              )}
              {backgroundMode === "solid" && (
                <label className="solid-color">
                  <input
                    type="color"
                    aria-label="Solid background color"
                    value={s.solidColor}
                    onChange={(e) => p.onSettings({ solidColor: e.target.value })}
                  />
                  <span>{s.solidColor.toUpperCase()}</span>
                  <span>Choose color</span>
                </label>
              )}
              {backgroundMode === "transparent" && (
                <div className="transparent-info">
                  <span className="checkerboard" />
                  Transparent PNG background.
                </div>
              )}
            </section>
            <section className="control-group typography-group" aria-label="Typography">
              <SelectField
                label="Font family"
                value={s.fontId}
                onChange={(fontId) => p.onSettings({ fontId })}
                id="font-select"
                icon={<span className="font-icon">Aa</span>}
              >
                {FONTS.map((f) => (
                  <option value={f.id} key={f.id}>
                    {f.name}
                  </option>
                ))}
              </SelectField>
              <div className="inline-setting">
                <label htmlFor="font-size">Font size</label>
                <div className="stepper">
                  <button
                    aria-label="Decrease font size"
                    disabled={s.fontSize <= 11}
                    onClick={() => p.onSettings({ fontSize: s.fontSize - 1 })}
                  >
                    <Minus size={13} />
                  </button>
                  <input
                    id="font-size"
                    type="number"
                    min={11}
                    max={24}
                    value={s.fontSize}
                    onChange={(e) => p.onSettings({ fontSize: Number(e.target.value) })}
                  />
                  <span>px</span>
                  <button
                    aria-label="Increase font size"
                    disabled={s.fontSize >= 24}
                    onClick={() => p.onSettings({ fontSize: s.fontSize + 1 })}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            </section>
            <section className="control-group layout-group" aria-label="Layout">
              <div className="group-label">
                <span>Padding</span>
                <span>{s.padding} px</span>
              </div>
              <div className="segmented padding-options">
                {[16, 32, 64, 96].map((padding) => (
                  <button
                    key={padding}
                    aria-label={`${padding} pixels padding`}
                    aria-pressed={s.padding === padding}
                    className={s.padding === padding ? "selected" : ""}
                    onClick={() => p.onSettings({ padding })}
                  >
                    {padding}
                  </button>
                ))}
              </div>
              <div className="shadow-label">
                <label htmlFor="shadow-range">Shadow</label>
                <span>{SHADOWS.find((shadow) => shadow.id === s.shadowId)?.name}</span>
              </div>
              <input
                id="shadow-range"
                className="range"
                type="range"
                min={0}
                max={4}
                value={SHADOWS.findIndex((shadow) => shadow.id === s.shadowId)}
                aria-valuetext={SHADOWS.find((shadow) => shadow.id === s.shadowId)?.name}
                onChange={(e) => p.onSettings({ shadowId: SHADOWS[Number(e.target.value)].id })}
                style={
                  {
                    "--range-fill": `${SHADOWS.findIndex((shadow) => shadow.id === s.shadowId) * 25}%`,
                  } as CSSProperties
                }
              />
            </section>
            <section className="control-group toggle-group" aria-label="Window appearance">
              <Toggle
                label="Window controls"
                checked={s.showHeader}
                onChange={(showHeader) => p.onSettings({ showHeader })}
              />
              <Toggle
                label="Line numbers"
                checked={s.showLineNumbers}
                onChange={(showLineNumbers) => p.onSettings({ showLineNumbers })}
              />
            </section>
            <details className="advanced-options" ref={advancedRef} id="advanced-options">
              <summary>
                More options <ChevronDown size={13} />
              </summary>
              <div className="advanced-content">
                <div className="field-pair">
                  <SelectField
                    label="Window style"
                    id="window-style"
                    value={s.windowStyle}
                    onChange={(windowStyle) => p.onSettings({ windowStyle: windowStyle as WindowStyle })}
                  >
                    <option value="mac">macOS</option>
                    <option value="mac-outline">macOS Outline</option>
                    <option value="win">Windows</option>
                    <option value="terminal">Terminal</option>
                    <option value="none">No buttons</option>
                  </SelectField>
                  <SelectField
                    label="Frame border"
                    id="window-border"
                    value={s.windowBorder}
                    onChange={(windowBorder) => p.onSettings({ windowBorder: windowBorder as WindowBorder })}
                  >
                    <option value="subtle">Subtle</option>
                    <option value="crisp">Crisp</option>
                    <option value="glass">Glass</option>
                    <option value="glow">Neon Glow</option>
                  </SelectField>
                </div>
                <div className="field-pair">
                  <SelectField
                    label="Aspect ratio"
                    id="aspect-ratio"
                    value={s.aspectRatio}
                    onChange={(aspectRatio) => p.onSettings({ aspectRatio: aspectRatio as AspectRatioId })}
                  >
                    {ASPECT_RATIOS.map((ar) => (
                      <option key={ar.id} value={ar.id}>
                        {ar.name}
                      </option>
                    ))}
                  </SelectField>
                  <SelectField
                    label="Pattern"
                    id="pattern-background"
                    value={["dots", "blueprint", "grid", "diagonal"].includes(s.bgId) ? s.bgId : ""}
                    onChange={(bgId) => p.onSettings({ bgId: bgId || "aurora" })}
                  >
                    <option value="">No pattern</option>
                    <option value="dots">Starfield</option>
                    <option value="blueprint">Blueprint</option>
                    <option value="grid">Studio Grid</option>
                    <option value="diagonal">Diagonal</option>
                  </SelectField>
                </div>
                <label className="field">
                  <span className="field-label">
                    Line height <span>{s.lineHeight.toFixed(2)}</span>
                  </span>
                  <input
                    className="range"
                    type="range"
                    aria-label="Line height"
                    min={1.4}
                    max={2.2}
                    step={0.05}
                    value={s.lineHeight}
                    onChange={(e) => p.onSettings({ lineHeight: Number(e.target.value) })}
                  />
                </label>
                <label className="field">
                  <span className="field-label">
                    Corner radius <span>{s.radius} px</span>
                  </span>
                  <input
                    className="range"
                    type="range"
                    aria-label="Corner radius"
                    min={0}
                    max={36}
                    value={s.radius}
                    onChange={(e) => p.onSettings({ radius: Number(e.target.value) })}
                  />
                </label>
                <label className="field">
                  <span className="field-label">
                    Custom padding <span>{s.padding} px</span>
                  </span>
                  <input
                    className="range"
                    type="range"
                    aria-label="Custom padding"
                    min={0}
                    max={120}
                    value={s.padding}
                    onChange={(e) => p.onSettings({ padding: Number(e.target.value) })}
                  />
                </label>
                <label className="field">
                  <span className="field-label">
                    Starting line # <span>{s.lineStart}</span>
                  </span>
                  <input
                    type="number"
                    aria-label="Starting line number"
                    min={1}
                    max={9999}
                    value={s.lineStart}
                    onChange={(e) => p.onSettings({ lineStart: Number(e.target.value) })}
                  />
                </label>
                <div className="advanced-toggles">
                  <Toggle
                    label="Font ligatures"
                    checked={s.ligatures}
                    onChange={(ligatures) => p.onSettings({ ligatures })}
                  />
                  <Toggle
                    label="Language badge"
                    checked={s.showBadge}
                    onChange={(showBadge) => p.onSettings({ showBadge })}
                  />
                  <Toggle
                    label="Snapcode watermark"
                    checked={s.showWatermark}
                    onChange={(showWatermark) => p.onSettings({ showWatermark })}
                  />
                </div>
                <div className="preset-io">
                  <button type="button" className="secondary-button" onClick={p.onCopyStyleJson}>
                    <Copy size={13} /> Copy style JSON
                  </button>
                  <button type="button" className="secondary-button" onClick={p.onImportStyleJson}>
                    <Upload size={13} /> Paste JSON
                  </button>
                </div>
              </div>
            </details>
          </>
        )}
        {p.tab === "code" && (
          <div className="code-editing">
            <label className="field">
              <span className="field-label">File name</span>
              <input
                value={p.title}
                onChange={(e) => p.onTitle(e.target.value)}
                maxLength={100}
                placeholder="snippet.js"
              />
            </label>
            <div className="editor-label">
              <label htmlFor="code-input">Your code</label>
              <div className="editor-label-actions">
                <button type="button" className="text-button" onClick={p.onFormatCode}>
                  <Sparkles size={11} /> Tidy
                </button>
                <button type="button" className="text-button" onClick={p.onSample}>
                  Load example
                </button>
              </div>
            </div>
            <textarea
              id="code-input"
              className="code-input"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              wrap="off"
              maxLength={MAX_CODE_CHARS}
              value={p.code}
              onChange={(e) => p.onCode(e.target.value)}
              onKeyDown={editorKeyDown}
              onPaste={(e) => {
                if (
                  e.clipboardData.getData("text").length +
                    p.code.length -
                    (e.currentTarget.selectionEnd - e.currentTarget.selectionStart) >
                  MAX_CODE_CHARS
                ) {
                  e.preventDefault();
                  p.onNotice("Please keep snippets under 100,000 characters.", true);
                }
              }}
              placeholder="// Paste something worth sharing..."
              aria-describedby="editor-help"
            />
            <div className="editor-count">
              <span>{p.code ? p.code.split("\n").length : 0} lines</span>
              <span>{p.code.length.toLocaleString()} characters</span>
            </div>
            <div className="editor-actions">
              <button className="secondary-button" onClick={() => fileRef.current?.click()}>
                <Upload size={14} />
                Open file
              </button>
              <button className="icon-button" aria-label="Clear code" title="Clear code" onClick={() => p.onCode("")}>
                <Eraser size={16} />
              </button>
            </div>
            <div className="annotations-box">
              <div className="group-label">
                <h3>Line highlights &amp; diff</h3>
                <span>e.g. 2, 4-6</span>
              </div>
              <label className="field">
                <span className="field-label">Focus lines</span>
                <input
                  value={p.lineInputs.highlightSpec}
                  onChange={(e) => p.onLineInputs({ highlightSpec: e.target.value })}
                  placeholder="2, 5-7"
                  maxLength={120}
                />
              </label>
              <div className="field-pair">
                <label className="field">
                  <span className="field-label">Added (+)</span>
                  <input
                    value={p.lineInputs.addedSpec}
                    onChange={(e) => p.onLineInputs({ addedSpec: e.target.value })}
                    placeholder="4"
                    maxLength={120}
                  />
                </label>
                <label className="field">
                  <span className="field-label">Removed (-)</span>
                  <input
                    value={p.lineInputs.removedSpec}
                    onChange={(e) => p.onLineInputs({ removedSpec: e.target.value })}
                    placeholder="3"
                    maxLength={120}
                  />
                </label>
              </div>
              <Toggle
                label="Dim unfocused lines"
                checked={p.lineInputs.dimUnfocused}
                onChange={(dimUnfocused) => p.onLineInputs({ dimUnfocused })}
              />
            </div>
            <input
              ref={fileRef}
              type="file"
              className="sr-only"
              tabIndex={-1}
              aria-label="Open code file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) p.onFile(file);
                e.target.value = "";
              }}
            />
            <p id="editor-help" className="panel-hint">
              Paste, type, or drop a code file onto the preview.
              <br />
              Tab indents. Escape, then Tab leaves the editor.
            </p>
          </div>
        )}
        {p.tab === "export" && (
          <div className="export-options">
            <div className="export-intro">
              <div className="export-file-icon">
                <FileCode2 size={24} />
              </div>
              <h3>Ready for the world.</h3>
              <p>Your code, in all its pixel-perfect glory.</p>
            </div>
            <label className="field">
              <span className="field-label">File name</span>
              <input
                value={p.title}
                onChange={(e) => p.onTitle(e.target.value)}
                maxLength={100}
                placeholder="snippet.js"
              />
            </label>
            <fieldset className="resolution-options">
              <legend>Export resolution</legend>
              {[2, 3, 4].map((scale) => (
                <label key={scale} className={s.exportScale === scale ? "selected" : ""}>
                  <input
                    type="radio"
                    name="export-resolution"
                    value={scale}
                    checked={s.exportScale === scale}
                    onChange={() => p.onSettings({ exportScale: scale })}
                  />
                  <span>
                    <strong>
                      {scale}x <span>{scale === 2 ? "Retina" : scale === 3 ? "High resolution" : "Ultra crisp"}</span>
                    </strong>
                    <small>
                      {p.width * scale} x {p.height * scale} px
                    </small>
                  </span>
                  {s.exportScale === scale && <Check size={15} />}
                </label>
              ))}
            </fieldset>
            <button className="primary-button wide" onClick={p.onDownload} disabled={p.exporting || !p.code.trim()}>
              {p.exporting ? <LoaderCircle className="spin" size={16} /> : <Download size={16} />}
              Download PNG
            </button>
            <div className="preset-io" style={{ marginTop: 9 }}>
              <button
                type="button"
                className="secondary-button"
                onClick={p.onCopy}
                disabled={p.exporting || !p.code.trim()}
              >
                <Copy size={14} />
                Copy image
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={p.onDownloadSvg}
                disabled={p.exporting || !p.code.trim()}
              >
                <Download size={14} />
                Export SVG
              </button>
            </div>
            <p className="panel-hint">
              Lossless PNG. No watermarks by default.
              <br />
              Rendered privately on your device.
            </p>
          </div>
        )}
      </div>
      {p.tab === "style" && (
        <div className="panel-bottom">
          <button onClick={p.onShuffle}>
            <Shuffle size={14} />
            Surprise me
          </button>
          <button
            aria-controls="advanced-options"
            onClick={() => {
              if (advancedRef.current) {
                advancedRef.current.open = true;
                advancedRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
              }
            }}
          >
            More options <ChevronDown size={12} />
          </button>
        </div>
      )}
    </aside>
  );
}
