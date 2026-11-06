import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Check, Download, Moon, ShieldCheck, Sparkles, Sun, X } from "lucide-react";
import { BACKGROUNDS, STYLE_PRESETS, THEMES, type StylePreset } from "../lib/data";

export type DialogName = "templates" | "guide" | "install" | "share" | "import-style";
interface Props {
  name: DialogName;
  onClose: () => void;
  onPreset: (preset: StylePreset) => void;
  onShare: () => void;
  onImportJson?: (raw: string) => void;
  sharePreview?: string;
}

function Dialog({
  title,
  subtitle,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = ref.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    element?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
      previousFocus?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`studio-dialog ${wide ? "dialog-wide" : ""}`}
      aria-labelledby="dialog-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            onClose();
        }
      }}
    >
      <div className="dialog-heading">
        <div>
          <h2 id="dialog-title">{title}</h2>
          <p>{subtitle}</p>
        </div>
        <button className="icon-button" aria-label="Close dialog" onClick={onClose}>
          <X size={19} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export default function StudioDialog({ name, onClose, onPreset, onShare, onImportJson, sharePreview }: Props) {
  const [filter, setFilter] = useState<"all" | "dark" | "light">("all");
  const [jsonInput, setJsonInput] = useState("");

  if (name === "templates") {
    const filtered = STYLE_PRESETS.filter((preset) => filter === "all" || preset.mode === filter);
    return (
      <Dialog
        title="A head start on beautiful."
        subtitle="Curated dark and light looks. One click to make one yours."
        onClose={onClose}
        wide
      >
        <div className="segmented template-filter" aria-label="Filter templates by theme mode">
          {(
            [
              ["all", `All looks (${STYLE_PRESETS.length})`],
              ["dark", "Dark themes"],
              ["light", "Light themes"],
            ] as const
          ).map(([id, label]) => (
            <button key={id} className={filter === id ? "selected" : ""} onClick={() => setFilter(id)}>
              {label}
            </button>
          ))}
        </div>
        <div className="template-grid">
          {filtered.map((preset) => {
            const theme = THEMES.find((t) => t.id === preset.theme)!;
            const background = BACKGROUNDS.find((b) => b.id === preset.bg)!;
            return (
              <button className="template-option" key={preset.id} onClick={() => onPreset(preset)}>
                <div className="template-preview" style={background.style}>
                  <div className="mini-window" style={{ background: theme.bg }}>
                    <div className="mini-dots">
                      <i />
                      <i />
                      <i />
                    </div>
                    <div className="mini-code">
                      <span style={{ color: theme.comment }}>// Make something great</span>
                      <span>
                        <b style={{ color: theme.keyword }}>const</b> <b style={{ color: theme.text }}>idea = </b>
                        <b style={{ color: theme.string }}>"hello, world";</b>
                      </span>
                      <span style={{ color: theme.fn }}>createSomething(idea);</span>
                    </div>
                  </div>
                </div>
                <span className="template-name">
                  <span>
                    {preset.name}
                    <small className="template-mode-tag">
                      {preset.mode === "dark" ? <Moon size={10} /> : <Sun size={10} />}
                      {preset.mode === "dark" ? "Dark" : "Light"}
                    </small>
                  </span>
                  <ArrowRight size={15} />
                </span>
              </button>
            );
          })}
        </div>
        <p className="dialog-footnote">
          <Sparkles size={14} />
          Templates only change styling. Your code stays exactly as it is.
        </p>
      </Dialog>
    );
  }
  if (name === "import-style") {
    return (
      <Dialog
        title="Paste style JSON"
        subtitle="Import a Snapcode style configuration. All values are validated safely."
        onClose={onClose}
      >
        <label className="field">
          <span className="field-label">Style JSON</span>
          <textarea
            className="code-input"
            style={{ minHeight: 150 }}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='{"themeId":"catppuccin-mocha","bgId":"cyber","fontId":"cascadia"}'
            spellCheck={false}
          />
        </label>
        <button
          type="button"
          className="primary-button wide"
          style={{ marginTop: 16 }}
          disabled={!jsonInput.trim()}
          onClick={() => onImportJson?.(jsonInput)}
        >
          Apply style JSON <ArrowRight size={15} />
        </button>
      </Dialog>
    );
  }
  if (name === "install")
    return (
      <Dialog
        title="Your little creative companion."
        subtitle="Keep Snapcode one click away, even when you're offline."
        onClose={onClose}
      >
        <div className="guide-steps">
          <article>
            <span>01</span>
            <div>
              <h3>Chrome or Edge</h3>
              <p>Use the install icon in your address bar, or choose "Install Snapcode" from the browser menu.</p>
            </div>
          </article>
          <article>
            <span>02</span>
            <div>
              <h3>iPhone or iPad</h3>
              <p>Open this site in Safari, tap Share, then "Add to Home Screen".</p>
            </div>
          </article>
          <article>
            <span>03</span>
            <div>
              <h3>Give it one online visit</h3>
              <p>
                In production, Snapcode caches the app and all its fonts. Once the footer says "Offline ready", you can
                create and export without a connection.
              </p>
            </div>
          </article>
        </div>
        <p className="dialog-footnote">
          <ShieldCheck size={16} />
          Installation requires HTTPS and a supported browser.
        </p>
      </Dialog>
    );
  if (name === "share")
    return (
      <Dialog title="Your image is ready." subtitle="Choose where your code goes next." onClose={onClose}>
        {sharePreview && (
          <img className="share-preview" src={sharePreview} alt="Your rendered code image, ready to share" />
        )}
        <button className="primary-button wide" onClick={onShare}>
          Open share sheet <ArrowRight size={16} />
        </button>
        <p className="panel-hint">Only the image is shared, and only with the app you choose.</p>
      </Dialog>
    );
  return (
    <Dialog
      title="Small steps. Beautiful snippets."
      subtitle="Everything you need, nothing in your way."
      onClose={onClose}
    >
      <div className="guide-steps">
        <article>
          <span>01</span>
          <div>
            <h3>Start with your code</h3>
            <p>
              Open the Code tab to paste a snippet, highlight specific lines or diffs, or import a text file across 25
              supported languages.
            </p>
          </div>
        </article>
        <article>
          <span>02</span>
          <div>
            <h3>Find your signature style</h3>
            <p>
              Switch between 20 dark and light themes, 11 coding fonts, custom gradients, window chrome, and aspect
              ratios. Toggle Dark/Light studio mode from the top bar anytime.
            </p>
          </div>
        </article>
        <article>
          <span>03</span>
          <div>
            <h3>Make it shareable</h3>
            <p>Export a lossless PNG at 2x, 3x, or 4x. Use Copy image to paste it into a post, document, or message.</p>
          </div>
        </article>
      </div>
      <div className="shortcut-list">
        <span>
          Export PNG <kbd>Ctrl / Cmd + S</kbd>
        </span>
        <span>
          Edit code <kbd>Ctrl / Cmd + E</kbd>
        </span>
        <span>
          Close a dialog <kbd>Esc</kbd>
        </span>
      </div>
      <div className="privacy-note">
        <ShieldCheck size={20} />
        <div>
          <strong>Your code is yours. Always.</strong>
          <p>
            No accounts, uploads, analytics, or third-party font requests. Only your style preferences are saved. Code
            is kept in this tab, not persisted.
          </p>
        </div>
      </div>
      <a className="secondary-button wide" href="/docs/README.md" download>
        <Download size={15} />
        Download README <Check size={14} />
      </a>
    </Dialog>
  );
}
