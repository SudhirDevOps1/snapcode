import { memo, useLayoutEffect, useMemo, useRef, type CSSProperties, type RefObject } from "react";
import { Minus, Square, Terminal, X } from "lucide-react";
import { FRAMES, HIGHLIGHT_COLORS, WINDOW_WIDTHS, type EditorTheme, type FontOption } from "../lib/data";
import { highlightCodeLines } from "../lib/highlight";
import { buildRows, type LineAnnotations } from "../lib/rows";
import type { Settings } from "../lib/settings";

const PLACEHOLDER = "// Your next great idea starts here.";

export interface LineClickModifiers {
  shiftKey: boolean;
  altKey: boolean;
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
  onLineClick?: (lineNumber: number, modifiers: LineClickModifiers) => void;
  shadowCss: string;
  bgStyle: CSSProperties;
  photoUrl: string | null;
  exportRef: RefObject<HTMLDivElement | null>;
}

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
  onLineClick,
  shadowCss,
  bgStyle,
  photoUrl,
  exportRef,
}: Props) {
  const lines = useMemo(() => highlightCodeLines(code || PLACEHOLDER, language), [code, language]);
  const allRows = useMemo(() => buildRows(lines, s.lineStart, annotations), [lines, s.lineStart, annotations]);
  const MAX_RENDERED_ROWS = 1_200;
  const rows = allRows.length > MAX_RENDERED_ROWS ? allRows.slice(0, MAX_RENDERED_ROWS) : allRows;
  const truncatedRowCount = allRows.length - rows.length;
  const lineHeight = Math.round(s.fontSize * s.lineHeight);
  const gutterDigits = String(s.lineStart + lines.length - 1).length;

  const frame = FRAMES.find((item) => item.id === s.aspectRatio);
  const frameWidth = frame?.width ?? 0;
  const frameHeight = frame?.height ?? 0;
  const framed = frameWidth > 0 && frameHeight > 0;

  const hlColor = HIGHLIGHT_COLORS.find((item) => item.id === s.highlightColor) ?? HIGHLIGHT_COLORS[0];
  const explicitWidth = WINDOW_WIDTHS.find((item) => item.id === s.windowWidth)?.px ?? null;
  const resolvedWindowWidth = explicitWidth ?? (s.wrapLines ? 760 : null);

  const windowRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);

  // In a fixed frame, shrink the code window (never enlarge it) so the whole snippet fits inside the padding.
  useLayoutEffect(() => {
    const fit = fitRef.current;
    if (!fit) return;
    if (!framed) {
      fit.style.transform = "";
      return;
    }
    const applyFit = () => {
      const win = windowRef.current;
      if (!win) return;
      const availableWidth = frameWidth - 2 * s.padding;
      const availableHeight = frameHeight - 2 * s.padding - (s.showWatermark ? 24 : 0);
      const scale = Math.min(1, availableWidth / win.offsetWidth, availableHeight / win.offsetHeight);
      fit.style.transform = `scale(${Math.max(0.05, scale).toFixed(4)})`;
    };
    applyFit();
    const observer = new ResizeObserver(applyFit);
    if (windowRef.current) observer.observe(windowRef.current);
    return () => observer.disconnect();
  }, [framed, frameWidth, frameHeight, s.padding, s.showWatermark]);

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

  const rootStyle: CSSProperties = {
    ...bgStyle,
    padding: s.padding,
    paddingBottom: s.showWatermark ? Math.max(s.padding, 38) : s.padding,
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
      ref={exportRef}
      data-testid="export-canvas"
      className={`export-canvas${framed ? " is-framed" : ""}`}
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
      {s.showHeadline && s.headlineText.trim() && (
        <div className={`canvas-headline tone-${s.headlineTone}`}>{s.headlineText.trim()}</div>
      )}

      <div ref={fitRef} className="frame-fit">
        <div
          ref={windowRef}
          className="code-window"
          style={{
            ...tokens,
            background: theme.bg,
            color: theme.text,
            borderRadius: s.radius,
            boxShadow: shadowCss,
            ...borderStyle,
            ...(resolvedWindowWidth ? { width: resolvedWindowWidth, minWidth: resolvedWindowWidth } : {}),
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
                  const classes = [
                    "code-line",
                    onLineClick && "is-interactive",
                    row.added && "is-added",
                    row.removed && "is-removed",
                    row.highlighted && "is-highlighted",
                    row.dimmed && (s.unfocusedMode === "blur" ? "is-blurred" : "is-dimmed"),
                  ]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <div
                      key={row.n}
                      data-line={row.n}
                      className={classes}
                      style={s.wrapLines ? { minHeight: lineHeight } : { height: lineHeight }}
                      title={
                        onLineClick
                          ? `Line ${row.n}: Click to highlight · Shift+Click for range · Alt+Click for + / - diff`
                          : undefined
                      }
                      onClick={
                        onLineClick
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
      </div>

      {s.showWatermark && <span className="canvas-watermark">{s.watermarkText || "made with snapcode."}</span>}
      {s.showBrandMark && s.brandMarkDataUrl && (
        <img
          className={`brand-mark ${s.brandMarkPosition}`}
          src={s.brandMarkDataUrl}
          alt=""
          style={{ bottom: s.brandMarkPosition === "bottom-right" ? (s.showWatermark ? 52 : 14) : undefined }}
        />
      )}
    </div>
  );
});
