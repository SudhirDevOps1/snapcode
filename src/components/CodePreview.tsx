import { memo, useLayoutEffect, useMemo, useRef, type CSSProperties, type RefObject } from "react";
import { Minus, Square, Terminal, X } from "lucide-react";
import { FRAMES, HIGHLIGHT_COLORS, WINDOW_WIDTHS, type EditorTheme, type FontOption } from "../lib/data";
import { highlightCodeLines } from "../lib/highlight";
import { buildRows, type LineAnnotations } from "../lib/rows";
import { TILTS, type Settings } from "../lib/settings";
import type { Overlay } from "../lib/overlays";
import type { AuthorProfile } from "../lib/author";

const PLACEHOLDER = "// Your next great idea starts here.";
const MAX_RENDERED_ROWS = 1_200;

export interface LineClickModifiers {
  shiftKey: boolean;
  altKey: boolean;
}

/** A second code window shown beside the primary one in compare mode. */
export interface CompareWindow {
  code: string;
  language: string;
  title: string;
}

interface Props {
  code: string;
  language: string;
  languageName: string;
  languageColor: string;
  title: string;
  theme: EditorTheme;
  font: FontOption;
  settings: Settings;
  annotations: LineAnnotations;
  overlays: Overlay[];
  author: AuthorProfile;
  compare: CompareWindow | null;
  /** When set, only the first N lines render (used by the animated GIF exporter). */
  visibleLines?: number | null;
  selectedOverlayId?: string | null;
  onLineClick?: (lineNumber: number, modifiers: LineClickModifiers) => void;
  onOverlayPointerDown?: (id: string, handle: "body" | "end", event: React.PointerEvent) => void;
  shadowCss: string;
  bgStyle: CSSProperties;
  photoUrl: string | null;
  exportRef: RefObject<HTMLDivElement | null>;
}

const PLATFORM_GLYPH: Record<string, string> = {
  x: "𝕏",
  github: "⌥",
  linkedin: "in",
  youtube: "▶",
  instagram: "◎",
  none: "",
};

interface WindowProps {
  code: string;
  language: string;
  languageName: string;
  languageColor: string;
  title: string;
  theme: EditorTheme;
  font: FontOption;
  s: Settings;
  annotations: LineAnnotations;
  visibleLines: number | null | undefined;
  interactive: boolean;
  onLineClick?: (lineNumber: number, modifiers: LineClickModifiers) => void;
  windowRef?: RefObject<HTMLDivElement | null>;
  shadowCss: string;
  widthPx: number | null;
  testId?: string;
}

function CodeWindow({
  code,
  language,
  languageName,
  languageColor,
  title,
  theme,
  font,
  s,
  annotations,
  visibleLines,
  interactive,
  onLineClick,
  windowRef,
  shadowCss,
  widthPx,
  testId,
}: WindowProps) {
  const lines = useMemo(() => highlightCodeLines(code || PLACEHOLDER, language), [code, language]);
  const shownLines = useMemo(
    () => (typeof visibleLines === "number" ? lines.slice(0, Math.max(0, visibleLines)) : lines),
    [lines, visibleLines],
  );
  const allRows = useMemo(
    () => buildRows(shownLines, s.lineStart, annotations),
    [shownLines, s.lineStart, annotations],
  );
  const rows = allRows.length > MAX_RENDERED_ROWS ? allRows.slice(0, MAX_RENDERED_ROWS) : allRows;
  const truncatedRowCount = allRows.length - rows.length;
  const lineHeight = Math.round(s.fontSize * s.lineHeight);
  const gutterDigits = String(s.lineStart + lines.length - 1).length;
  const hlColor = HIGHLIGHT_COLORS.find((item) => item.id === s.highlightColor) ?? HIGHLIGHT_COLORS[0];

  const tokens = {
    "--tok-text": theme.text,
    "--tok-keyword": theme.keyword,
    "--tok-string": theme.string,
    "--tok-comment": theme.comment,
    "--tok-number": theme.number,
    "--tok-fn": theme.fn,
    "--tok-variable": theme.variable,
    "--tok-builtin": theme.builtin,
    "--tok-type": theme.type,
    "--tok-attr": theme.attr,
    "--tok-tag": theme.tag,
    "--tok-operator": theme.operator,
    "--hl-bg": theme.dark ? hlColor.darkBg : hlColor.lightBg,
    "--hl-bar": hlColor.bar,
    "--unfocused-opacity": String(s.unfocusedOpacity),
  } as CSSProperties;

  const borderStyle: CSSProperties = (() => {
    switch (s.windowBorder) {
      case "crisp":
        return { border: `1.5px solid ${theme.dark ? "rgba(255,255,255,0.28)" : "rgba(15,23,42,0.22)"}` };
      case "glass":
        return {
          border: `1px solid ${theme.dark ? "rgba(255,255,255,0.24)" : "rgba(255,255,255,0.75)"}`,
          boxShadow: `${shadowCss !== "none" ? `${shadowCss}, ` : ""}inset 0 1px 0 ${theme.dark ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.9)"}`,
        };
      case "glow":
        return {
          border: `1px solid ${theme.keyword}`,
          boxShadow: `${shadowCss !== "none" ? `${shadowCss}, ` : ""}0 0 32px ${theme.keyword}55`,
        };
      default:
        return { border: `1px solid ${theme.border}` };
    }
  })();

  const codeAreaStyle = {
    fontFamily: font.family,
    fontSize: s.fontSize,
    lineHeight: `${lineHeight}px`,
    letterSpacing: `${s.letterSpacing}px`,
    fontVariantLigatures: s.ligatures ? "normal" : "none",
    tabSize: s.tabSize,
    paddingTop: s.showHeader ? 6 : 24,
    "--gutter-ch": `${gutterDigits + 3}ch`,
  } as CSSProperties;

  return (
    <div
      ref={windowRef}
      data-testid={testId}
      className="code-window"
      style={{
        ...tokens,
        background: theme.bg,
        color: theme.text,
        borderRadius: s.radius,
        boxShadow: shadowCss,
        ...borderStyle,
        ...(widthPx ? { width: widthPx, minWidth: widthPx } : {}),
      }}
    >
      {s.showHeader && (
        <div className="window-header" style={{ background: theme.header }}>
          <div className="window-dots" aria-hidden="true">
            {s.windowStyle === "mac" && (
              <>
                <i />
                <i />
                <i />
              </>
            )}
            {s.windowStyle === "mac-outline" && (
              <>
                <i className="is-outline" />
                <i className="is-outline" />
                <i className="is-outline" />
              </>
            )}
            {s.windowStyle === "terminal" && (
              <span className="terminal-badge" style={{ color: theme.keyword, borderColor: theme.border }}>
                <Terminal size={12} />
                <span>bash</span>
              </span>
            )}
          </div>
          <span className="window-title">{title || "untitled"}</span>
          <div className="window-controls">
            {s.showBadge && (
              <span
                className="window-lang-badge"
                style={{
                  background: theme.dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                  color: theme.text,
                }}
              >
                <i style={{ background: languageColor }} />
                {languageName}
              </span>
            )}
            {s.windowStyle === "win" && (
              <span className="win-buttons" aria-hidden="true">
                <Minus size={12} />
                <Square size={10} />
                <X size={12} />
              </span>
            )}
          </div>
        </div>
      )}

      <div className="window-code" style={codeAreaStyle}>
        <div className="highlighted-code" data-wrap={s.wrapLines ? "true" : "false"}>
          <div className="hljs code-table">
            {rows.map((row, index) => {
              if (row.kind === "gap") {
                return (
                  <div key={`gap-${index}`} className="code-line is-gap" style={{ height: lineHeight }}>
                    {s.showLineNumbers && <span className="gutter line-numbers" aria-hidden="true" />}
                    <span className="cell">⋯</span>
                  </div>
                );
              }
              const unfocusedClass =
                s.unfocusedMode === "blur" ? "is-blurred" : s.unfocusedMode === "grayscale" ? "is-grayed" : "is-dimmed";
              const classes = [
                "code-line",
                interactive && "is-interactive",
                row.added && "is-added",
                row.removed && "is-removed",
                row.highlighted && "is-highlighted",
                row.dimmed && unfocusedClass,
                row.blurred && "is-blurred is-secret",
                row.grayed && "is-grayed",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <div
                  key={row.n}
                  className={classes}
                  style={s.wrapLines ? { minHeight: lineHeight } : { height: lineHeight }}
                  title={
                    interactive
                      ? `Line ${row.n}: Click to highlight · Shift+Click for range · Alt+Click for + / - diff`
                      : undefined
                  }
                  onMouseDown={
                    interactive
                      ? (e) => {
                          // Shift/Alt-click would otherwise start a native text selection across rows,
                          // which looks like a stray highlight in the preview.
                          if (e.shiftKey || e.altKey) e.preventDefault();
                        }
                      : undefined
                  }
                  onClick={
                    interactive && onLineClick
                      ? (e) => {
                          e.stopPropagation();
                          onLineClick(row.n, { shiftKey: e.shiftKey, altKey: e.altKey });
                        }
                      : undefined
                  }
                >
                  {s.showLineNumbers && (
                    <span className="gutter line-numbers" aria-hidden="true" style={{ color: theme.lineNumber }}>
                      <span className="diff-marker">{row.added ? "+" : row.removed ? "-" : ""}</span>
                      <span>{row.n}</span>
                    </span>
                  )}
                  <span className="cell" dangerouslySetInnerHTML={{ __html: row.html || " " }} />
                </div>
              );
            })}
            {truncatedRowCount > 0 && (
              <div className="code-line is-gap" style={{ height: lineHeight }}>
                {s.showLineNumbers && <span className="gutter line-numbers" aria-hidden="true" />}
                <span className="cell">
                  ⋯ {truncatedRowCount.toLocaleString()} more lines (use Focus Mode or Starting Line # to frame any
                  section)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Empty annotation set used for the secondary compare window. */
const NO_ANNOTATIONS: LineAnnotations = {
  highlight: new Set(),
  added: new Set(),
  removed: new Set(),
  blurred: new Set(),
  grayed: new Set(),
  dimUnfocused: false,
  focusOnly: false,
  focusContext: 1,
};

/**
 * The exact DOM that becomes the exported image. Every visual decision here is mirrored by the
 * export pipeline, so what you see in the preview is what you download.
 */
export default memo(function CodePreview({
  code,
  language,
  languageName,
  languageColor,
  title,
  theme,
  font,
  settings: s,
  annotations,
  overlays,
  author,
  compare,
  visibleLines,
  selectedOverlayId,
  onLineClick,
  onOverlayPointerDown,
  shadowCss,
  bgStyle,
  photoUrl,
  exportRef,
}: Props) {
  const frame = FRAMES.find((item) => item.id === s.aspectRatio);
  const frameWidth = frame?.width ?? 0;
  const frameHeight = frame?.height ?? 0;
  const framed = frameWidth > 0 && frameHeight > 0;

  const explicitWidth = WINDOW_WIDTHS.find((item) => item.id === s.windowWidth)?.px ?? null;
  const resolvedWindowWidth = explicitWidth ?? (s.wrapLines || (s.compareMode && compare) ? 760 : null);
  const tilt = TILTS.find((item) => item.id === s.tilt) ?? TILTS[0];

  const windowRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);

  // In a fixed frame, shrink the content (never enlarge it) so the whole snippet fits inside the padding.
  useLayoutEffect(() => {
    const fit = fitRef.current;
    if (!fit) return;
    if (!framed) {
      fit.style.transform = tilt.transform === "none" ? "" : tilt.transform;
      return;
    }
    const applyFit = () => {
      const win = fit.firstElementChild as HTMLElement | null;
      if (!win) return;
      const availableWidth = frameWidth - 2 * s.padding;
      const availableHeight = frameHeight - 2 * s.padding - (s.showWatermark ? 24 : 0) - (author.enabled ? 56 : 0);
      const scale = Math.min(1, availableWidth / win.offsetWidth, availableHeight / win.offsetHeight);
      const scaleCss = `scale(${Math.max(0.05, scale).toFixed(4)})`;
      fit.style.transform = tilt.transform === "none" ? scaleCss : `${tilt.transform} ${scaleCss}`;
    };
    applyFit();
    const observer = new ResizeObserver(applyFit);
    const win = fit.firstElementChild;
    if (win) observer.observe(win);
    return () => observer.disconnect();
  }, [framed, frameWidth, frameHeight, s.padding, s.showWatermark, author.enabled, tilt.transform]);

  const rootStyle: CSSProperties = {
    ...bgStyle,
    padding: s.padding,
    paddingBottom: s.showWatermark || author.enabled ? Math.max(s.padding, 38) : s.padding,
    ...(framed
      ? {
          width: frameWidth,
          height: frameHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
        }
      : {}),
  };

  const showCompare = s.compareMode && compare !== null;

  const windowCommon = {
    theme,
    font,
    s,
    shadowCss,
    widthPx: resolvedWindowWidth,
  };

  const content = showCompare ? (
    <div className={`compare-stage divider-${s.compareDivider}`} data-testid="compare-stage">
      <CodeWindow
        {...windowCommon}
        code={code}
        language={language}
        languageName={languageName}
        languageColor={languageColor}
        title={title}
        annotations={annotations}
        visibleLines={visibleLines}
        interactive={Boolean(onLineClick)}
        onLineClick={onLineClick}
        windowRef={windowRef}
        testId="compare-left"
      />
      <div className="compare-divider" aria-hidden="true" />
      <CodeWindow
        {...windowCommon}
        code={compare.code}
        language={compare.language}
        languageName={languageName}
        languageColor={languageColor}
        title={compare.title}
        annotations={NO_ANNOTATIONS}
        visibleLines={visibleLines}
        interactive={false}
        testId="compare-right"
      />
    </div>
  ) : (
    <CodeWindow
      {...windowCommon}
      code={code}
      language={language}
      languageName={languageName}
      languageColor={languageColor}
      title={title}
      annotations={annotations}
      visibleLines={visibleLines}
      interactive={Boolean(onLineClick)}
      onLineClick={onLineClick}
      windowRef={windowRef}
    />
  );

  return (
    <div
      ref={exportRef}
      data-testid="export-canvas"
      className={`export-canvas${framed ? " is-framed" : ""}${s.reflection ? " has-reflection" : ""}`}
      style={rootStyle}
    >
      {s.bgId === "transparent" && <div className="checkerboard export-checker" data-export-hide="true" />}
      {photoUrl && (
        <div
          className="bg-layer bg-photo"
          aria-hidden="true"
          style={{
            backgroundImage: `url("${photoUrl}")`,
            inset: -s.photoBlur * 2,
            filter: s.photoBlur > 0 ? `blur(${s.photoBlur}px)` : undefined,
          }}
        />
      )}
      {photoUrl && s.photoDim > 0 && (
        <div className="bg-layer bg-dim" aria-hidden="true" style={{ background: `rgba(0,0,0,${s.photoDim / 100})` }} />
      )}
      {s.grain && <div className="bg-layer bg-grain" aria-hidden="true" />}

      <div className="frame-stack">
        <div ref={fitRef} className={`frame-fit${tilt.id !== "none" ? " is-tilted" : ""}`}>
          {content}
        </div>
        {s.reflection && !framed && (
          <div className="window-reflection" aria-hidden="true" style={{ borderRadius: s.radius }} />
        )}
      </div>

      {author.enabled && (author.name || author.handle) && (
        <div className={`author-card pos-${author.position}`} data-testid="author-card">
          {author.avatarUrl ? (
            <img className="author-avatar" src={author.avatarUrl} alt="" />
          ) : (
            <span className="author-avatar author-avatar-fallback" aria-hidden="true">
              {(author.name || author.handle).slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="author-text">
            {author.name && <strong>{author.name}</strong>}
            {author.handle && (
              <span className="author-handle">
                {PLATFORM_GLYPH[author.platform] && (
                  <span className="author-glyph" aria-hidden="true">
                    {PLATFORM_GLYPH[author.platform]}
                  </span>
                )}
                @{author.handle}
              </span>
            )}
          </span>
        </div>
      )}

      {overlays.length > 0 && (
        <svg className="overlay-arrows" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            {overlays
              .filter((o): o is Extract<Overlay, { kind: "arrow" }> => o.kind === "arrow")
              .map((arrow) => (
                <marker
                  key={`m-${arrow.id}`}
                  id={`arrowhead-${arrow.id}`}
                  markerWidth="6"
                  markerHeight="6"
                  refX="4.5"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L6,3 L0,6 Z" fill={arrow.color} />
                </marker>
              ))}
          </defs>
          {overlays
            .filter((o): o is Extract<Overlay, { kind: "arrow" }> => o.kind === "arrow")
            .map((arrow) => (
              <line
                key={arrow.id}
                x1={arrow.x}
                y1={arrow.y}
                x2={arrow.x2}
                y2={arrow.y2}
                stroke={arrow.color}
                strokeWidth={arrow.width * 0.22}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                style={{ strokeWidth: arrow.width }}
                markerEnd={`url(#arrowhead-${arrow.id})`}
              />
            ))}
        </svg>
      )}

      {overlays.map((overlay) => {
        const selected = selectedOverlayId === overlay.id;
        if (overlay.kind === "text") {
          return (
            <div
              key={overlay.id}
              className={`overlay-text${selected ? " is-selected" : ""}${onOverlayPointerDown ? " is-draggable" : ""}`}
              style={{
                left: `${overlay.x}%`,
                top: `${overlay.y}%`,
                color: overlay.color,
                background: overlay.bg,
                fontSize: overlay.size,
              }}
              onPointerDown={onOverlayPointerDown ? (e) => onOverlayPointerDown(overlay.id, "body", e) : undefined}
            >
              {overlay.text}
            </div>
          );
        }
        if (!onOverlayPointerDown) return null;
        return (
          <span key={overlay.id} data-export-hide="true">
            <span
              className={`overlay-handle${selected ? " is-selected" : ""}`}
              style={{ left: `${overlay.x}%`, top: `${overlay.y}%`, borderColor: overlay.color }}
              onPointerDown={(e) => onOverlayPointerDown(overlay.id, "body", e)}
              title="Drag arrow start"
            />
            <span
              className={`overlay-handle overlay-handle-end${selected ? " is-selected" : ""}`}
              style={{ left: `${overlay.x2}%`, top: `${overlay.y2}%`, borderColor: overlay.color }}
              onPointerDown={(e) => onOverlayPointerDown(overlay.id, "end", e)}
              title="Drag arrow tip"
            />
          </span>
        );
      })}

      {s.showWatermark && <span className="canvas-watermark">{s.watermarkText || "made with snapcode."}</span>}
    </div>
  );
});
