import { useRef, type ReactNode } from "react";
import {
  ArrowUpRight,
  Box,
  Clapperboard,
  Columns2,
  EyeOff,
  LoaderCircle,
  MessageSquareText,
  Palette,
  Plus,
  Trash2,
  Upload,
  UserRound,
  Wand2,
} from "lucide-react";
import { LANGUAGES, THEMES, type EditorTheme } from "../lib/data";
import { AUTHOR_PLATFORMS, AUTHOR_PLATFORM_LABELS, type AuthorProfile } from "../lib/author";
import { CUSTOM_THEME_ID, TOKEN_KEYS, TOKEN_LABELS, lowContrastTokens, type TokenKey } from "../lib/custom-theme";
import { GIF_SPEEDS } from "../lib/gif";
import { OVERLAY_COLORS, type Overlay } from "../lib/overlays";
import type { LineInputs } from "../lib/rows";
import { TILTS, type DividerStyle, type Settings, type TiltId } from "../lib/settings";
import type { CompareWindow } from "./CodePreview";

interface Props {
  settings: Settings;
  onSettings: (patch: Partial<Settings>) => void;
  lineInputs: LineInputs;
  onLineInputs: (patch: Partial<LineInputs>) => void;
  overlays: Overlay[];
  selectedOverlayId: string | null;
  onSelectOverlay: (id: string | null) => void;
  onAddText: () => void;
  onAddArrow: () => void;
  onUpdateOverlay: (id: string, patch: Partial<Overlay>) => void;
  onRemoveOverlay: (id: string) => void;
  author: AuthorProfile;
  onAuthor: (patch: Partial<AuthorProfile>) => void;
  onPickAvatar: (file: File) => void;
  compare: CompareWindow;
  onCompare: (patch: Partial<CompareWindow>) => void;
  customTheme: EditorTheme;
  onCustomTheme: (patch: Partial<EditorTheme>) => void;
  onForkTheme: () => void;
  onExportGif: () => void;
  gifProgress: number | null;
  exporting: boolean;
  hasCode: boolean;
}

function Section({
  icon,
  title,
  badge,
  children,
  defaultOpen = false,
}: {
  icon: ReactNode;
  title: string;
  badge?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="pro-section" open={defaultOpen}>
      <summary>
        <span className="pro-section-title">
          {icon}
          {title}
        </span>
        {badge && <span className="pro-badge">{badge}</span>}
      </summary>
      <div className="pro-section-body">{children}</div>
    </details>
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

export default function ProPanel(p: Props) {
  const s = p.settings;
  const avatarRef = useRef<HTMLInputElement>(null);
  const selected = p.overlays.find((o) => o.id === p.selectedOverlayId) ?? null;
  const warnings = lowContrastTokens(p.customTheme);
  const usingCustom = s.themeId === CUSTOM_THEME_ID;

  return (
    <div className="pro-panel">
      <p className="pro-intro">Everything other tools charge for. Free, private, and rendered on this device.</p>

      <Section icon={<MessageSquareText size={13} />} title="Text & arrow annotations" badge="Pro" defaultOpen>
        <div className="pro-actions">
          <button type="button" className="secondary-button" onClick={p.onAddText} disabled={p.overlays.length >= 20}>
            <Plus size={13} /> Text note
          </button>
          <button type="button" className="secondary-button" onClick={p.onAddArrow} disabled={p.overlays.length >= 20}>
            <ArrowUpRight size={13} /> Arrow
          </button>
        </div>
        <p className="field-hint">Drag notes and arrow handles directly on the preview. Up to 20 annotations.</p>
        {p.overlays.length > 0 && (
          <ul className="overlay-list">
            {p.overlays.map((o, i) => (
              <li key={o.id} className={o.id === p.selectedOverlayId ? "selected" : ""}>
                <button type="button" className="overlay-pick" onClick={() => p.onSelectOverlay(o.id)}>
                  {o.kind === "text" ? <MessageSquareText size={12} /> : <ArrowUpRight size={12} />}
                  <span>{o.kind === "text" ? o.text || `Note ${i + 1}` : `Arrow ${i + 1}`}</span>
                </button>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`Delete ${o.kind === "text" ? "note" : "arrow"} ${i + 1}`}
                  onClick={() => p.onRemoveOverlay(o.id)}
                >
                  <Trash2 size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}
        {selected && selected.kind === "text" && (
          <div className="overlay-editor">
            <label className="field">
              <span className="field-label">Note text</span>
              <input
                aria-label="Note text"
                value={selected.text}
                maxLength={140}
                onChange={(e) => p.onUpdateOverlay(selected.id, { text: e.target.value })}
              />
            </label>
            <div className="field-pair">
              <label className="field">
                <span className="field-label">Size {selected.size}px</span>
                <input
                  className="range"
                  type="range"
                  aria-label="Note size"
                  min={10}
                  max={32}
                  value={selected.size}
                  onChange={(e) => p.onUpdateOverlay(selected.id, { size: Number(e.target.value) })}
                />
              </label>
              <div className="field">
                <span className="field-label">Colors</span>
                <div className="overlay-colors">
                  {OVERLAY_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`hl-swatch ${selected.bg === c ? "selected" : ""}`}
                      style={{ background: c }}
                      aria-label={`Note background ${c}`}
                      onClick={() =>
                        p.onUpdateOverlay(selected.id, {
                          bg: c,
                          color:
                            c === "#FFFFFF" || c === "#A3E635" || c === "#22D3EE" || c === "#F59E0B"
                              ? "#111827"
                              : "#FFFFFF",
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {selected && selected.kind === "arrow" && (
          <div className="overlay-editor">
            <div className="field-pair">
              <label className="field">
                <span className="field-label">Thickness {selected.width}px</span>
                <input
                  className="range"
                  type="range"
                  aria-label="Arrow thickness"
                  min={1}
                  max={8}
                  value={selected.width}
                  onChange={(e) => p.onUpdateOverlay(selected.id, { width: Number(e.target.value) })}
                />
              </label>
              <div className="field">
                <span className="field-label">Color</span>
                <div className="overlay-colors">
                  {OVERLAY_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`hl-swatch ${selected.color === c ? "selected" : ""}`}
                      style={{ background: c }}
                      aria-label={`Arrow color ${c}`}
                      onClick={() => p.onUpdateOverlay(selected.id, { color: c })}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Section>

      <Section icon={<EyeOff size={13} />} title="Blur secrets & gray-out" badge="Pro">
        <p className="field-hint">Hide API keys or de-emphasise boilerplate. Accepts ranges like 3, 7-9.</p>
        <div className="field-pair">
          <label className="field">
            <span className="field-label">Blur lines</span>
            <input
              aria-label="Blur lines"
              value={p.lineInputs.blurSpec}
              placeholder="e.g. 4"
              maxLength={120}
              onChange={(e) => p.onLineInputs({ blurSpec: e.target.value })}
            />
          </label>
          <label className="field">
            <span className="field-label">Gray-out lines</span>
            <input
              aria-label="Gray-out lines"
              value={p.lineInputs.graySpec}
              placeholder="e.g. 1-2"
              maxLength={120}
              onChange={(e) => p.onLineInputs({ graySpec: e.target.value })}
            />
          </label>
        </div>
        <label className="field">
          <span className="field-label">
            Unfocused opacity <span>{Math.round(s.unfocusedOpacity * 100)}%</span>
          </span>
          <input
            className="range"
            type="range"
            aria-label="Unfocused opacity"
            min={0.1}
            max={0.8}
            step={0.02}
            value={s.unfocusedOpacity}
            onChange={(e) => p.onSettings({ unfocusedOpacity: Number(e.target.value) })}
          />
        </label>
      </Section>

      <Section icon={<UserRound size={13} />} title="Author branding" badge="Pro">
        <Toggle label="Show author card" checked={p.author.enabled} onChange={(enabled) => p.onAuthor({ enabled })} />
        <div className="field-pair">
          <label className="field">
            <span className="field-label">Name</span>
            <input
              aria-label="Author name"
              value={p.author.name}
              maxLength={40}
              placeholder="Sudhir Singh"
              onChange={(e) => p.onAuthor({ name: e.target.value })}
            />
          </label>
          <label className="field">
            <span className="field-label">Handle</span>
            <input
              aria-label="Author handle"
              value={p.author.handle}
              maxLength={40}
              placeholder="SudhirDevOps1"
              onChange={(e) => p.onAuthor({ handle: e.target.value })}
            />
          </label>
        </div>
        <div className="field-pair">
          <div className="field">
            <label className="field-label" htmlFor="author-platform">
              Platform
            </label>
            <span className="select-wrap">
              <select
                id="author-platform"
                value={p.author.platform}
                onChange={(e) => p.onAuthor({ platform: e.target.value as AuthorProfile["platform"] })}
              >
                {AUTHOR_PLATFORMS.map((id) => (
                  <option key={id} value={id}>
                    {AUTHOR_PLATFORM_LABELS[id]}
                  </option>
                ))}
              </select>
            </span>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="author-position">
              Position
            </label>
            <span className="select-wrap">
              <select
                id="author-position"
                value={p.author.position}
                onChange={(e) => p.onAuthor({ position: e.target.value as AuthorProfile["position"] })}
              >
                <option value="bottom-left">Bottom left</option>
                <option value="bottom-right">Bottom right</option>
                <option value="top-right">Top right</option>
              </select>
            </span>
          </div>
        </div>
        <div className="pro-actions">
          <button type="button" className="secondary-button" onClick={() => avatarRef.current?.click()}>
            <Upload size={13} /> {p.author.avatarUrl ? "Replace avatar" : "Add avatar"}
          </button>
          {p.author.avatarUrl && (
            <button type="button" className="text-button danger" onClick={() => p.onAuthor({ avatarUrl: null })}>
              Remove avatar
            </button>
          )}
        </div>
        <input
          ref={avatarRef}
          type="file"
          className="sr-only"
          tabIndex={-1}
          accept="image/png,image/jpeg,image/webp"
          aria-label="Choose avatar"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) p.onPickAvatar(file);
            e.target.value = "";
          }}
        />
        <p className="field-hint">
          Avatar is resized to 128px on-device; metadata is removed. Saved only in this browser.
        </p>
      </Section>

      <Section icon={<Columns2 size={13} />} title="Compare two snippets" badge="Pro">
        <Toggle
          label="Side-by-side compare"
          checked={s.compareMode}
          onChange={(compareMode) => p.onSettings({ compareMode })}
        />
        {s.compareMode && (
          <>
            <div className="field-pair">
              <label className="field">
                <span className="field-label">Right title</span>
                <input
                  aria-label="Compare title"
                  value={p.compare.title}
                  maxLength={100}
                  placeholder="after.ts"
                  onChange={(e) => p.onCompare({ title: e.target.value })}
                />
              </label>
              <div className="field">
                <label className="field-label" htmlFor="compare-language">
                  Right language
                </label>
                <span className="select-wrap">
                  <select
                    id="compare-language"
                    value={p.compare.language}
                    onChange={(e) => p.onCompare({ language: e.target.value })}
                  >
                    <option value="auto">Auto-detect</option>
                    {LANGUAGES.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </span>
              </div>
            </div>
            <label className="field">
              <span className="field-label">Right code</span>
              <textarea
                className="code-input compare-input"
                aria-label="Compare code"
                spellCheck={false}
                value={p.compare.code}
                placeholder="// Paste the 'after' version here"
                onChange={(e) => p.onCompare({ code: e.target.value.slice(0, 100_000) })}
              />
            </label>
            <div className="field">
              <span className="field-label">Divider</span>
              <div className="segmented" role="group" aria-label="Compare divider">
                {(["none", "line", "glow"] as DividerStyle[]).map((d) => (
                  <button
                    key={d}
                    className={s.compareDivider === d ? "selected" : ""}
                    aria-pressed={s.compareDivider === d}
                    onClick={() => p.onSettings({ compareDivider: d })}
                  >
                    {d === "none" ? "None" : d === "line" ? "Line" : "Glow"}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </Section>

      <Section icon={<Box size={13} />} title="3D tilt & reflection" badge="Pro">
        <div className="field">
          <span className="field-label">Perspective</span>
          <div className="segmented" role="group" aria-label="Tilt">
            {TILTS.map((t) => (
              <button
                key={t.id}
                className={s.tilt === t.id ? "selected" : ""}
                aria-pressed={s.tilt === t.id}
                onClick={() => p.onSettings({ tilt: t.id as TiltId })}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
        <Toggle
          label="Floor reflection"
          checked={s.reflection}
          onChange={(reflection) => p.onSettings({ reflection })}
        />
      </Section>

      <Section icon={<Palette size={13} />} title="Custom theme editor" badge="Pro">
        <div className="pro-actions">
          <button type="button" className="secondary-button" onClick={p.onForkTheme}>
            <Wand2 size={13} /> Start from current theme
          </button>
          <button
            type="button"
            className={`secondary-button ${usingCustom ? "is-active" : ""}`}
            onClick={() => p.onSettings({ themeId: usingCustom ? THEMES[0].id : CUSTOM_THEME_ID })}
          >
            {usingCustom ? "Using My Theme ✓" : "Use My Theme"}
          </button>
        </div>
        <label className="field">
          <span className="field-label">Theme name</span>
          <input
            aria-label="Custom theme name"
            value={p.customTheme.name}
            maxLength={32}
            onChange={(e) => p.onCustomTheme({ name: e.target.value })}
          />
        </label>
        <div className="token-grid">
          {TOKEN_KEYS.map((key: TokenKey) => (
            <label key={key} className={`token-row ${warnings.includes(key) ? "low-contrast" : ""}`}>
              <input
                type="color"
                aria-label={`${TOKEN_LABELS[key]} color`}
                value={p.customTheme[key]}
                onChange={(e) => p.onCustomTheme({ [key]: e.target.value } as Partial<EditorTheme>)}
              />
              <span>{TOKEN_LABELS[key]}</span>
              {warnings.includes(key) && <small title="Below WCAG AA 4.5:1 contrast">low contrast</small>}
            </label>
          ))}
        </div>
        <p className="field-hint">
          {warnings.length === 0
            ? "All tokens meet WCAG AA contrast against the background."
            : `${warnings.length} token${warnings.length > 1 ? "s" : ""} below 4.5:1 contrast. Readable exports need higher contrast.`}
        </p>
      </Section>

      <Section icon={<Clapperboard size={13} />} title="Animated typing GIF" badge="Pro">
        <p className="field-hint">
          Reveals your code line by line. Up to 60 frames, max 1400px, encoded on this device.
        </p>
        <div className="field">
          <span className="field-label">Speed</span>
          <div className="segmented" role="group" aria-label="GIF speed">
            {GIF_SPEEDS.map((sp) => (
              <button
                key={sp.id}
                className={s.gifSpeed === sp.id ? "selected" : ""}
                aria-pressed={s.gifSpeed === sp.id}
                onClick={() => p.onSettings({ gifSpeed: sp.id })}
              >
                {sp.label}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="primary-button wide"
          onClick={p.onExportGif}
          disabled={p.exporting || !p.hasCode}
        >
          {p.gifProgress !== null ? (
            <>
              <LoaderCircle className="spin" size={15} /> Encoding {Math.round(p.gifProgress * 100)}%
            </>
          ) : (
            <>
              <Clapperboard size={15} /> Export typing GIF
            </>
          )}
        </button>
      </Section>
    </div>
  );
}
