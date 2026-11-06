import { memo, useMemo, type CSSProperties, type RefObject } from "react";
import { Minus, Square, Terminal, X } from "lucide-react";
import { ASPECT_RATIOS, type EditorTheme, type FontOption } from "../lib/data";
import { highlightCodeLines } from "../lib/highlight";
import type { Settings } from "../lib/settings";

export interface LineAnnotations {
  highlight: Set<number>;
  added: Set<number>;
  removed: Set<number>;
  dimUnfocused: boolean;
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
  shadowCss: string;
  bgStyle: CSSProperties;
  exportRef: RefObject<HTMLDivElement | null>;
}

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
  shadowCss,
  bgStyle,
  exportRef,
}: Props) {
  const lines = useMemo(
    () => highlightCodeLines(code || "// Your next great idea starts here.", language),
    [code, language],
  );
  const lineHeightPx = Math.round(s.fontSize * s.lineHeight);
  const hasAnnotations = annotations.highlight.size > 0 || annotations.added.size > 0 || annotations.removed.size > 0;

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
  } as CSSProperties;

  const aspectSpec = ASPECT_RATIOS.find((item) => item.id === s.aspectRatio)?.ratio ?? null;

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

  return (
    <div
      ref={exportRef}
      data-testid="export-canvas"
      className={`export-canvas ${aspectSpec ? "has-aspect" : ""}`}
      style={{
        ...bgStyle,
        padding: s.padding,
        paddingBottom: s.showWatermark ? Math.max(s.padding, 38) : s.padding,
        ...(aspectSpec ? { aspectRatio: `${aspectSpec}` } : {}),
      }}
    >
      {s.bgId === "transparent" && <div className="checkerboard export-checker" data-export-hide="true" />}
      <div
        className="code-window"
        style={{
          ...tokens,
          background: theme.bg,
          color: theme.text,
          borderRadius: s.radius,
          boxShadow: shadowCss,
          ...borderStyle,
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
        <div
          className="window-code"
          style={{
            fontFamily: font.family,
            fontSize: s.fontSize,
            lineHeight: `${lineHeightPx}px`,
            fontVariantLigatures: s.ligatures ? "normal" : "none",
            paddingTop: s.showHeader ? 6 : 24,
          }}
        >
          {s.showLineNumbers && (
            <div className="line-numbers" aria-hidden="true" style={{ color: theme.lineNumber }}>
              {lines.map((_, index) => {
                const displayNum = s.lineStart + index;
                const isAdded = annotations.added.has(displayNum);
                const isRemoved = annotations.removed.has(displayNum);
                const isHighlighted = annotations.highlight.has(displayNum);
                const isDimmed = annotations.dimUnfocused && hasAnnotations && !isAdded && !isRemoved && !isHighlighted;
                return (
                  <div
                    key={index}
                    className={`line-num-row ${isAdded ? "is-added" : ""} ${isRemoved ? "is-removed" : ""} ${isHighlighted ? "is-highlighted" : ""} ${isDimmed ? "is-dimmed" : ""}`}
                    style={{ height: lineHeightPx }}
                  >
                    <span className="diff-marker">{isAdded ? "+" : isRemoved ? "-" : ""}</span>
                    <span>{displayNum}</span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="highlighted-code">
            <code className="hljs">
              {lines.map((lineHtml, index) => {
                const displayNum = s.lineStart + index;
                const isAdded = annotations.added.has(displayNum);
                const isRemoved = annotations.removed.has(displayNum);
                const isHighlighted = annotations.highlight.has(displayNum);
                const isDimmed = annotations.dimUnfocused && hasAnnotations && !isAdded && !isRemoved && !isHighlighted;
                return (
                  <div
                    key={index}
                    className={`code-line ${isAdded ? "is-added" : ""} ${isRemoved ? "is-removed" : ""} ${isHighlighted ? "is-highlighted" : ""} ${isDimmed ? "is-dimmed" : ""}`}
                    style={{ height: lineHeightPx }}
                    dangerouslySetInnerHTML={{ __html: lineHtml || " " }}
                  />
                );
              })}
            </code>
          </div>
        </div>
      </div>
      {s.showWatermark && <span className="canvas-watermark">made with snapcode.</span>}
    </div>
  );
});
