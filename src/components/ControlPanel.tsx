import { useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import {
  Bookmark,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Download,
  Eraser,
  FileCode2,
  Focus,
  Image,
  ImagePlus,
  Layers,
  Link2,
  LoaderCircle,
  Minus,
  Moon,
  Palette,
  Plus,
  RotateCcw,
  Shuffle,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  WrapText,
} from "lucide-react";
import {
  BACKGROUNDS,
  DEFAULT_TITLES,
  EXPORT_FORMATS,
  FONTS,
  FRAMES,
  LANGUAGES,
  MAX_CODE_CHARS,
  SHADOWS,
  THEMES,
  type ExportFormatId,
  type FrameId,
} from "../lib/data";
import { PHOTO_TYPES, type BackgroundPhoto } from "../lib/photo";
import type { LibraryItem } from "../lib/library";
import type { LineInputs } from "../lib/rows";
import type { Settings, TabSize, WindowBorder, WindowStyle } from "../lib/settings";

export type PanelTab = "style" | "code" | "export";

const PATTERN_IDS = ["dots", "blueprint", "grid", "diagonal"];
const GRADIENT_BACKGROUNDS = BACKGROUNDS.filter((bg) => !PATTERN_IDS.includes(bg.id));
const TAB_OPTIONS: TabSize[] = [2, 4, 8];

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
  photo: BackgroundPhoto | null;
  onPickPhoto: (file: File) => void;
  onRemovePhoto: () => void;
  library: LibraryItem[];
  onSaveLibrary: (name: string) => void;
  onLoadLibrary: (id: string) => void;
  onDeleteLibrary: (id: string) => void;
  onClearLocalData: () => void;
  onReset: () => void;
  onShuffle: () => void;
  onSample: () => void;
  onFile: (file: File) => void;
  onCopyStyleJson: () => void;
  onImportStyleJson: () => void;
  onDownload: () => void;
  onCopy: () => void;
  onCopyLink: () => void;
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

function RangeField({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="field">
      <span className="field-label">
        {label} <span>{display}</span>
      </span>
      <input
        className="range"
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

export default function ControlPanel(p: Props) {
  const s = p.settings;
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const advancedRef = useRef<HTMLDetailsElement>(null);
  const tabEscape = useRef(false);
  const [libraryName, setLibraryName] = useState("");

  const backgroundMode =
    s.bgId === "solid" ? "solid" : s.bgId === "transparent" ? "none" : s.bgId === "photo" ? "photo" : "gradient";
  const backgroundName =
    BACKGROUNDS.find((bg) => bg.id === s.bgId)?.name ??
    ({ custom: "Custom", photo: "Photo", solid: "Solid", transparent: "None" } as Record<string, string>)[s.bgId] ??
    "";
  const currentTheme = THEMES.find((t) => t.id === s.themeId) ?? THEMES[0];
  const darkThemes = THEMES.filter((t) => t.dark);
  const lightThemes = THEMES.filter((t) => !t.dark);
  const exportFormat = EXPORT_FORMATS.find((f) => f.id === s.exportFormat) ?? EXPORT_FORMATS[0];
  const frame = FRAMES.find((f) => f.id === s.aspectRatio) ?? FRAMES[0];
  const isVector = s.exportFormat === "svg";
  const shadowIndex = Math.max(
    0,
    SHADOWS.findIndex((shadow) => shadow.id === s.shadowId),
  );
  const hasCode = p.code.trim().length > 0;

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
    const indent = " ".repeat(s.tabSize);
    if (p.code.length + indent.length > MAX_CODE_CHARS) return;
    p.onCode(p.code.slice(0, start) + indent + p.code.slice(end));
    requestAnimationFrame(() => target.setSelectionRange(start + indent.length, start + indent.length));
  };

  const toggleThemePolarity = () => {
    const targetTheme = currentTheme.dark ? lightThemes[0] : darkThemes[0];
    if (targetTheme) p.onSettings({ themeId: targetTheme.id });
  };

  // Selecting the mode reveals the photo panel, whose "Choose a photo" button opens the file picker.
  const choosePhotoMode = () => p.onSettings({ bgId: "photo" });

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
        {p.tab === "style" && (
          <>
            <div className="field-pair">
              <SelectField label="Language" value={p.language} onChange={p.onLanguage} id="language-select">
                <option value="auto">Auto-detect</option>
                {LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </SelectField>
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
            </div>

            <section className="control-group background-group" aria-label="Background settings">
              <div className="group-label">
                <h3>Background</h3>
                <span>{backgroundName}</span>
              </div>
              <div className="segmented background-modes four" role="group" aria-label="Background type">
                {(
                  [
                    ["gradient", "Gradient"],
                    ["solid", "Solid"],
                    ["photo", "Photo"],
                    ["none", "None"],
                  ] as const
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    className={backgroundMode === mode ? "selected" : ""}
                    aria-pressed={backgroundMode === mode}
                    onClick={() => {
                      if (mode === "gradient") p.onSettings({ bgId: GRADIENT_BACKGROUNDS[0].id });
                      else if (mode === "solid") p.onSettings({ bgId: "solid" });
                      else if (mode === "photo") choosePhotoMode();
                      else p.onSettings({ bgId: "transparent" });
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {backgroundMode === "gradient" && (
                <>
                  <div className="background-swatches">
                    {GRADIENT_BACKGROUNDS.map((bg) => (
                      <button
                        key={bg.id}
                        className={`background-swatch ${s.bgId === bg.id ? "selected" : ""}`}
                        aria-label={`${bg.name} background`}
                        title={bg.name}
                        aria-pressed={s.bgId === bg.id}
                        style={{ background: bg.swatch }}
                        onClick={() => p.onSettings({ bgId: bg.id })}
                      >
                        {s.bgId === bg.id && <Check size={13} strokeWidth={2.5} />}
                      </button>
                    ))}
                  </div>
                  <button
                    className="custom-colors-button"
                    onClick={() => p.onSettings({ bgId: s.bgId === "custom" ? GRADIENT_BACKGROUNDS[0].id : "custom" })}
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

              {backgroundMode === "photo" && (
                <div className="photo-panel">
                  {p.photo ? (
                    <div className="photo-row">
                      <span
                        className="photo-thumb"
                        style={{ backgroundImage: `url("${p.photo.url}")` }}
                        aria-hidden="true"
                      />
                      <span className="photo-name" title={p.photo.name}>
                        {p.photo.name}
                      </span>
                      <button type="button" className="text-button" onClick={() => photoRef.current?.click()}>
                        Replace
                      </button>
                      <button type="button" className="text-button danger" onClick={p.onRemovePhoto}>
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button type="button" className="secondary-button wide" onClick={() => photoRef.current?.click()}>
                      <ImagePlus size={14} />
                      Choose a photo
                    </button>
                  )}
                  <p className="field-hint">
                    PNG, JPEG, or WebP up to 8 MB. Processed on this device; metadata is removed.
                  </p>
                  {p.photo && (
                    <>
                      <RangeField
                        label="Dim"
                        value={s.photoDim}
                        display={`${s.photoDim}%`}
                        min={0}
                        max={80}
                        onChange={(photoDim) => p.onSettings({ photoDim })}
                      />
                      <RangeField
                        label="Blur"
                        value={s.photoBlur}
                        display={`${s.photoBlur} px`}
                        min={0}
                        max={24}
                        onChange={(photoBlur) => p.onSettings({ photoBlur })}
                      />
                    </>
                  )}
                  <input
                    ref={photoRef}
                    type="file"
                    className="sr-only"
                    tabIndex={-1}
                    accept={PHOTO_TYPES.join(",")}
                    aria-label="Choose background photo"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) p.onPickPhoto(file);
                      e.target.value = "";
                    }}
                  />
                </div>
              )}

              {backgroundMode === "none" && (
                <div className="transparent-info">
                  <span className="checkerboard" />
                  Transparent PNG and WebP background.
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
              <RangeField
                label="Letter spacing"
                value={s.letterSpacing}
                display={`${s.letterSpacing.toFixed(1)} px`}
                min={-0.5}
                max={2}
                step={0.1}
                onChange={(letterSpacing) => p.onSettings({ letterSpacing })}
              />
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
                <span>{SHADOWS[shadowIndex]?.name}</span>
              </div>
              <input
                id="shadow-range"
                className="range"
                type="range"
                min={0}
                max={SHADOWS.length - 1}
                value={shadowIndex}
                aria-valuetext={SHADOWS[shadowIndex]?.name}
                onChange={(e) => p.onSettings({ shadowId: SHADOWS[Number(e.target.value)].id })}
                style={{ "--range-fill": `${(shadowIndex / (SHADOWS.length - 1)) * 100}%` } as CSSProperties}
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
                    <option value="glow">Neon glow</option>
                  </SelectField>
                </div>
                <SelectField
                  label="Pattern"
                  id="pattern-background"
                  value={PATTERN_IDS.includes(s.bgId) ? s.bgId : ""}
                  onChange={(bgId) => p.onSettings({ bgId: bgId || GRADIENT_BACKGROUNDS[0].id })}
                >
                  <option value="">No pattern</option>
                  <option value="dots">Starfield</option>
                  <option value="blueprint">Blueprint</option>
                  <option value="grid">Studio grid</option>
                  <option value="diagonal">Diagonal</option>
                </SelectField>
                <RangeField
                  label="Line height"
                  value={s.lineHeight}
                  display={s.lineHeight.toFixed(2)}
                  min={1.4}
                  max={2.2}
                  step={0.05}
                  onChange={(lineHeight) => p.onSettings({ lineHeight })}
                />
                <RangeField
                  label="Corner radius"
                  value={s.radius}
                  display={`${s.radius} px`}
                  min={0}
                  max={36}
                  onChange={(radius) => p.onSettings({ radius })}
                />
                <RangeField
                  label="Custom padding"
                  value={s.padding}
                  display={`${s.padding} px`}
                  min={0}
                  max={120}
                  onChange={(padding) => p.onSettings({ padding })}
                />
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
                  <Toggle label="Grain texture" checked={s.grain} onChange={(grain) => p.onSettings({ grain })} />
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
            <SelectField label="Language" value={p.language} onChange={p.onLanguage} id="language-select">
              <option value="auto">Auto-detect</option>
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </SelectField>
            <label className="field">
              <span className="field-label">File name</span>
              <input
                value={p.title}
                onChange={(e) => p.onTitle(e.target.value)}
                maxLength={100}
                placeholder={DEFAULT_TITLES[p.language] ?? "snippet.txt"}
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

            <div className="field-pair code-format">
              <div className="field">
                <span className="field-label">Tab width</span>
                <div className="segmented" role="group" aria-label="Tab width">
                  {TAB_OPTIONS.map((size) => (
                    <button
                      key={size}
                      className={s.tabSize === size ? "selected" : ""}
                      aria-pressed={s.tabSize === size}
                      onClick={() => p.onSettings({ tabSize: size })}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field toggle-field">
                <Toggle
                  label="Wrap long lines"
                  checked={s.wrapLines}
                  onChange={(wrapLines) => p.onSettings({ wrapLines })}
                />
              </div>
            </div>

            <div className="annotations-box">
              <div className="group-label">
                <h3>
                  <Focus size={12} /> Highlights &amp; diff
                </h3>
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
              <Toggle
                label="Show only highlighted lines"
                checked={p.lineInputs.focusOnly}
                onChange={(focusOnly) => p.onLineInputs({ focusOnly })}
              />
              {p.lineInputs.focusOnly && (
                <RangeField
                  label="Context lines"
                  value={p.lineInputs.focusContext}
                  display={String(p.lineInputs.focusContext)}
                  min={0}
                  max={3}
                  onChange={(focusContext) => p.onLineInputs({ focusContext })}
                />
              )}
            </div>

            <details className="library-box" open={p.library.length > 0}>
              <summary>
                <span>
                  <Bookmark size={12} /> Saved snippets
                </span>
                <span className="library-count">{p.library.length}/30</span>
              </summary>
              <div className="library-save">
                <input
                  aria-label="Snippet name"
                  placeholder="Name this snippet"
                  maxLength={60}
                  value={libraryName}
                  onChange={(e) => setLibraryName(e.target.value)}
                />
                <button
                  type="button"
                  className="secondary-button"
                  disabled={!hasCode}
                  onClick={() => {
                    p.onSaveLibrary(libraryName);
                    setLibraryName("");
                  }}
                >
                  Save
                </button>
              </div>
              {p.library.length > 0 ? (
                <ul className="library-list">
                  {p.library.map((item) => (
                    <li key={item.id}>
                      <button type="button" className="library-load" onClick={() => p.onLoadLibrary(item.id)}>
                        <strong>{item.name}</strong>
                        <small>
                          {LANGUAGES.find((l) => l.id === item.language)?.name ?? "Auto-detect"} ·{" "}
                          {item.code.length.toLocaleString()} chars
                        </small>
                      </button>
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Delete ${item.name}`}
                        title="Delete snippet"
                        onClick={() => p.onDeleteLibrary(item.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="panel-hint">Saved snippets stay in this browser only.</p>
              )}
              <button type="button" className="text-button danger" onClick={p.onClearLocalData}>
                Delete all local data
              </button>
            </details>

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

            <div className="field">
              <span className="field-label">Format</span>
              <div className="segmented format-options" role="group" aria-label="Export format">
                {EXPORT_FORMATS.map((format) => (
                  <button
                    key={format.id}
                    className={s.exportFormat === format.id ? "selected" : ""}
                    aria-pressed={s.exportFormat === format.id}
                    onClick={() => p.onSettings({ exportFormat: format.id as ExportFormatId })}
                  >
                    {format.label}
                  </button>
                ))}
              </div>
              <p className="field-hint">{exportFormat.hint}</p>
            </div>

            {exportFormat.lossy && (
              <RangeField
                label="Quality"
                value={s.exportQuality}
                display={`${Math.round(s.exportQuality * 100)}%`}
                min={0.5}
                max={1}
                step={0.01}
                onChange={(exportQuality) => p.onSettings({ exportQuality })}
              />
            )}

            <SelectField
              label="Frame"
              id="frame-select"
              value={s.aspectRatio}
              onChange={(aspectRatio) => p.onSettings({ aspectRatio: aspectRatio as FrameId })}
            >
              {FRAMES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </SelectField>
            <p className="field-hint">
              <Layers size={11} /> {frame.hint}
              {frame.width ? " · code auto-fits inside the frame" : ""}
            </p>

            <fieldset className="resolution-options" disabled={isVector}>
              <legend>Export resolution</legend>
              {[2, 3, 4].map((scale) => (
                <label key={scale} className={s.exportScale === scale && !isVector ? "selected" : ""}>
                  <input
                    type="radio"
                    name="export-resolution"
                    value={scale}
                    checked={s.exportScale === scale}
                    onChange={() => p.onSettings({ exportScale: scale as 2 | 3 | 4 })}
                  />
                  <span>
                    <strong>
                      {scale}x <span>{scale === 2 ? "Retina" : scale === 3 ? "High resolution" : "Ultra crisp"}</span>
                    </strong>
                    <small>
                      {p.width * scale} x {p.height * scale} px
                    </small>
                  </span>
                  {s.exportScale === scale && !isVector && <Check size={15} />}
                </label>
              ))}
            </fieldset>
            {isVector && <p className="field-hint">SVG is vector, so resolution does not apply.</p>}

            <button className="primary-button wide" onClick={p.onDownload} disabled={p.exporting || !hasCode}>
              {p.exporting ? <LoaderCircle className="spin" size={16} /> : <Download size={16} />}
              Download {exportFormat.label}
            </button>
            <button className="secondary-button wide" onClick={p.onCopy} disabled={p.exporting || !hasCode}>
              <Copy size={15} />
              Copy image
            </button>
            <button className="secondary-button wide" onClick={p.onCopyLink} disabled={p.exporting || !hasCode}>
              <Link2 size={15} />
              Copy share link
            </button>
            <p className="panel-hint">
              Rendered privately on your device.
              <br />
              Share links keep the code inside the URL, never on a server.
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
      {p.tab === "code" && (
        <div className="panel-bottom">
          <button onClick={p.onSample}>
            <WrapText size={14} />
            Load an example
          </button>
        </div>
      )}
    </aside>
  );
}
