import { BRAND_MARK_PATH } from "@/components/BrandMark";

// The SwitchYard chat widget (switchyard-fx-chat.js, loaded in index.html) mounts a shadow root
// at #syfx-chat-root with a fixed .syfx-launcher button and .syfx-panel. Page CSS can't reach
// inside a shadow root, so this adds a small stylesheet to it once it appears:
// - the launcher sits in the same bottom-right column as the WhatsApp button (WhatsApp above it);
// - it rests as a round icon and expands to show its label on hover or keyboard focus;
// - while the chat panel is open the page is told (data-chat-open), so WhatsApp steps aside.
// The offsets come from CSS variables set on the host in index.css (variables cross into the
// shadow root), so the cookie banner can lift the whole column on small screens.

const STYLE_ID = "syfx-site-overrides";

const css = `
  .syfx-launcher {
    position: fixed !important;
    right: var(--syfx-right, 16px) !important;
    bottom: var(--syfx-bottom, 16px) !important;
    left: auto !important;
    top: auto !important;
    box-sizing: border-box !important;
    height: 56px !important;
    min-height: 56px !important;
    width: auto !important;
    max-width: 56px !important;
    padding: 0 16px !important;
    border-radius: 999px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 20px !important; /* label starts beyond the 56px circle even if it is a bare text node */
    overflow: hidden !important;
    white-space: nowrap !important;
    box-shadow: 0 12px 32px rgba(18, 38, 31, .24) !important;
    transition: max-width .35s cubic-bezier(.22, 1, .36, 1), bottom .3s ease, box-shadow .3s ease !important;
  }
  .syfx-launcher > * { flex-shrink: 0 !important; }
  /* At rest only the icon shows; the label fades in as the pill widens. */
  .syfx-launcher > :not(:first-child) { opacity: 0 !important; transition: opacity .2s ease !important; }
  .syfx-launcher:hover,
  .syfx-launcher:focus-visible {
    max-width: 280px !important;
    box-shadow: 0 16px 40px rgba(18, 38, 31, .3) !important;
  }
  .syfx-launcher:hover > :not(:first-child),
  .syfx-launcher:focus-visible > :not(:first-child) { opacity: 1 !important; transition-delay: .08s !important; }

  /* Give the hosted conversation window the same calm, rounded surfaces as the site. */
  .syfx-panel {
    box-sizing: border-box !important;
    width: min(380px, calc(100vw - 32px)) !important;
    max-height: min(620px, calc(100dvh - 112px)) !important;
    border: 1px solid #dce5e1 !important;
    border-radius: 24px !important;
    overflow: hidden !important;
    background: #f5f7f6 !important;
    color: #12261f !important;
    box-shadow: 0 24px 64px rgba(18, 38, 31, .24) !important;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
  }
  .syfx-panel header,
  .syfx-panel [class*="header"] {
    background-color: #12261f !important;
    color: #fff !important;
  }
  .syfx-panel input,
  .syfx-panel textarea {
    box-sizing: border-box !important;
    border: 1px solid #dce5e1 !important;
    border-radius: 14px !important;
    color: #12261f !important;
    font: inherit !important;
  }
  .syfx-panel input:focus,
  .syfx-panel textarea:focus {
    outline: 2px solid rgba(45, 106, 79, .2) !important;
    border-color: #2d6a4f !important;
  }
  .syfx-panel button { font-family: inherit !important; }
  @media (max-width: 480px) {
    .syfx-panel {
      right: 16px !important;
      bottom: calc(var(--syfx-bottom, 16px) + 68px) !important;
      width: calc(100vw - 32px) !important;
      max-height: min(620px, calc(100dvh - var(--syfx-bottom, 16px) - 100px)) !important;
      border-radius: 22px !important;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .syfx-launcher { transition: none !important; }
  }
`;

function applyCompanyMark(root: ShadowRoot): void {
  const launcher = root.querySelector<HTMLElement>(".syfx-launcher");
  const icon = launcher?.querySelector("svg, img");
  if (!launcher || !icon || launcher.dataset.syfxBrandMark === "true") return;

  const mark = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  mark.setAttribute("viewBox", "0 0 678 1111");
  mark.setAttribute("width", "16");
  mark.setAttribute("height", "26");
  mark.setAttribute("aria-hidden", "true");
  mark.setAttribute("focusable", "false");
  mark.style.cssText = "display:block;flex:none;color:#a8c5ba";
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", BRAND_MARK_PATH);
  path.setAttribute("fill", "currentColor");
  mark.append(path);
  icon.replaceWith(mark);
  launcher.dataset.syfxBrandMark = "true";
}

function isVisible(element: Element | null): boolean {
  if (!element) return false;
  const style = getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function adapt(host: Element): boolean {
  const root = host.shadowRoot;
  // A closed shadow root can't be styled; the page CSS still keeps WhatsApp clear of it.
  if (!root) return false;
  if (!root.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    root.appendChild(style);
  }
  applyCompanyMark(root);
  const syncOpen = () => {
    document.body.toggleAttribute("data-chat-open", isVisible(root.querySelector(".syfx-panel")));
    applyCompanyMark(root);
  };
  syncOpen();
  new MutationObserver(syncOpen).observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "style", "hidden", "aria-hidden", "open"] });
  return true;
}

export function installChatWidgetAdapter() {
  const tryAdapt = () => {
    const host = document.getElementById("syfx-chat-root");
    if (!host) return false;
    document.body.setAttribute("data-chat-widget", host.shadowRoot ? "styled" : "present");
    return adapt(host) || true;
  };
  if (tryAdapt()) return;
  // The widget script loads asynchronously; watch for its host, then stop watching.
  const observer = new MutationObserver(() => { if (tryAdapt()) observer.disconnect(); });
  observer.observe(document.body, { childList: true, subtree: true });
  window.setTimeout(() => observer.disconnect(), 30_000);
}
