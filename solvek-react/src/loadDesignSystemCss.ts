export function loadDesignSystemCss() {
  const href = window.location.hostname.endsWith("github.io") ? "/GHC_repo/css/index.css" : "./css/index.css";

  if (document.querySelector(`link[href="${href}"]`)) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}
