export function getDocsHtml(): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Squizme — Developer Documentation Portal</title>
  <meta name="description" content="Modern, high-polish dark mode developer portal for Squizme backend services and AI quiz generation.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&family=Geist:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-base: #0F172A;
      --bg-deep: #0C101A;
      --bg-surface: #131A26;
      --bg-elevated: #182030;
      --bg-card: #1E2638;
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-elevated: rgba(255, 255, 255, 0.14);
      --border-pink: rgba(244, 114, 182, 0.35);
      --text-main: #F8FAFC;
      --text-muted: #94A3B8;
      --text-dim: #64748B;
      --accent-pink: #F472B6;
      --accent-pink-bg: rgba(244, 114, 182, 0.12);
      --accent-emerald: #10B981;
      --accent-emerald-bg: rgba(16, 185, 129, 0.12);
      --accent-coral: #FB7185;
      --accent-lime: #A3E635;
      --accent-orange: #FB923C;
      --accent-purple: #C084FC;
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 16px;
      --radius-xl: 20px;
      --radius-pill: 9999px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      background-color: var(--bg-base);
      color: var(--text-main);
      font-family: 'Geist', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      scroll-behavior: smooth;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    code, pre, .font-mono {
      font-family: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    /* Scrollbars */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: var(--bg-base);
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.12);
      border-radius: 9999px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.22);
    }

    .app-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* Fixed / Sticky Header */
    .top-nav {
      position: sticky;
      top: 0;
      z-index: 50;
      height: 66px;
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      gap: 24px;
    }

    .nav-left {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-shrink: 0;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 700;
      font-size: 17px;
      letter-spacing: -0.03em;
      color: var(--text-main);
    }

    .brand-mark {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: linear-gradient(135deg, #F472B6 0%, #818CF8 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #0F172A;
      font-weight: 800;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(244, 114, 182, 0.35);
    }

    .version-pill {
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-pill);
      padding: 4px 12px;
      font-size: 11.5px;
      font-weight: 500;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }
    .version-pill:hover {
      border-color: var(--border-elevated);
      color: var(--text-main);
    }

    .nav-center {
      flex: 1;
      max-width: 500px;
    }

    .search-pill-btn {
      width: 100%;
      height: 40px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-pill);
      padding: 0 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--text-dim);
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }
    .search-pill-btn:hover {
      border-color: rgba(255, 255, 255, 0.2);
      color: var(--text-muted);
      background: var(--bg-elevated);
    }

    .search-pill-btn svg {
      width: 16px;
      height: 16px;
      stroke: currentColor;
    }

    .search-kbd {
      margin-left: auto;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 2px 6px;
      font-size: 10.5px;
      font-weight: 600;
      color: var(--text-muted);
      font-family: inherit;
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 18px;
      flex-shrink: 0;
    }

    .nav-link {
      font-size: 13.5px;
      color: var(--text-muted);
      font-weight: 500;
      transition: color 0.15s ease;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .nav-link:hover {
      color: var(--text-main);
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--accent-emerald-bg);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: var(--radius-pill);
      padding: 3px 10px;
      font-size: 11px;
      font-weight: 500;
      color: #34D399;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--accent-emerald);
      box-shadow: 0 0 8px var(--accent-emerald);
    }

    .avatar-thumbnail {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1.5px solid rgba(255, 255, 255, 0.18);
      background: linear-gradient(135deg, #334155, #1E293B);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11.5px;
      font-weight: 700;
      color: #E2E8F0;
      cursor: pointer;
      transition: border-color 0.15s ease;
    }
    .avatar-thumbnail:hover {
      border-color: var(--accent-pink);
    }

    /* Responsive 3-Column Content Grid */
    .docs-grid {
      flex: 1;
      display: grid;
      grid-template-columns: 240px minmax(0, 1fr) 200px;
      max-width: 1440px;
      width: 100%;
      margin: 0 auto;
      padding: 0 32px;
      gap: 36px;
    }

    /* Left Navigation Sidebar */
    .left-sidebar {
      position: sticky;
      top: 66px;
      height: calc(100vh - 66px);
      overflow-y: auto;
      padding: 32px 0 36px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .nav-section {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .section-header-btn {
      width: 100%;
      background: transparent;
      border: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 10px;
      color: var(--text-dim);
      font-size: 11.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      cursor: pointer;
      border-radius: var(--radius-sm);
      transition: color 0.15s ease;
    }
    .section-header-btn:hover {
      color: var(--text-muted);
    }

    .chevron-icon {
      width: 13px;
      height: 13px;
      stroke: currentColor;
      transition: transform 0.2s ease;
    }
    .section-collapsed .chevron-icon {
      transform: rotate(-90deg);
    }

    .nav-sub-items {
      display: flex;
      flex-direction: column;
      gap: 2px;
      transition: max-height 0.2s ease;
    }
    .section-collapsed .nav-sub-items {
      display: none;
    }

    .sidebar-link {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 7px 12px;
      border-radius: var(--radius-sm);
      color: var(--text-muted);
      font-size: 13px;
      font-weight: 500;
      transition: all 0.15s ease;
      cursor: pointer;
    }
    .sidebar-link:hover {
      background: var(--bg-surface);
      color: var(--text-main);
    }
    .sidebar-link.active {
      background: var(--bg-card);
      color: var(--text-main);
      font-weight: 600;
      box-shadow: inset 0 0 0 1px var(--border-subtle);
    }

    .pill-tag {
      background: var(--accent-pink-bg);
      border: 1px solid var(--border-pink);
      color: var(--accent-pink);
      border-radius: var(--radius-pill);
      padding: 1px 7px;
      font-size: 10px;
      font-weight: 600;
    }

    .external-arrow {
      width: 11px;
      height: 11px;
      opacity: 0.5;
      margin-left: auto;
    }

    /* Pinned Bottom Help Widget */
    .bottom-help-card {
      margin-top: auto;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 16px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    }

    .help-card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12.5px;
      font-weight: 600;
      color: var(--text-main);
      margin-bottom: 4px;
    }

    .help-card-subline {
      font-size: 11.5px;
      color: var(--text-muted);
      line-height: 1.4;
      margin-bottom: 12px;
    }

    .video-preview-thumb {
      width: 100%;
      height: 86px;
      background: radial-gradient(circle at center, rgba(244, 114, 182, 0.18) 0%, rgba(15, 23, 42, 0.9) 100%), #0F172A;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: border-color 0.15s ease;
    }
    .video-preview-thumb:hover {
      border-color: rgba(244, 114, 182, 0.5);
    }

    .play-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      transition: transform 0.15s ease, background-color 0.15s ease;
    }
    .video-preview-thumb:hover .play-circle {
      transform: scale(1.1);
      background: var(--accent-pink);
      color: #0F172A;
    }

    /* Central Content Area */
    .content-center {
      padding: 36px 0 64px;
      max-width: 800px;
      width: 100%;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--text-dim);
      margin-bottom: 14px;
    }

    .page-heading {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: var(--text-main);
      margin-bottom: 10px;
      line-height: 1.25;
    }

    .page-lead {
      font-size: 15px;
      color: var(--text-muted);
      line-height: 1.6;
      margin-bottom: 24px;
    }

    /* Installation Pill Badge */
    .install-pill-box {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-pill);
      padding: 6px 14px;
      margin-bottom: 28px;
      font-family: 'Geist Mono', monospace;
      font-size: 12.5px;
      color: var(--text-muted);
    }

    .install-copy-btn {
      background: transparent;
      border: none;
      color: var(--text-dim);
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: color 0.15s ease;
    }
    .install-copy-btn:hover {
      color: var(--accent-pink);
    }

    /* Integrated Code Block Component */
    .code-container {
      background: var(--bg-deep);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      margin-bottom: 24px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      position: relative;
    }

    .code-top-bar {
      background: rgba(19, 26, 38, 0.75);
      border-bottom: 1px solid var(--border-subtle);
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .code-tab-list {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .code-tab-item {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-dim);
      padding: 3px 10px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .code-tab-item.active {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.08);
    }

    .code-top-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .icon-action-btn {
      background: transparent;
      border: none;
      color: var(--text-dim);
      padding: 5px 8px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      transition: all 0.15s ease;
    }
    .icon-action-btn:hover {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.08);
    }

    .code-body-grid {
      display: flex;
      padding: 16px 0;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.7;
    }

    .gutter-lines {
      padding: 0 16px;
      text-align: right;
      color: #475569;
      user-select: none;
      border-right: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 12px;
      line-height: 1.84;
    }

    .code-content {
      padding: 0 20px;
      flex: 1;
      white-space: pre;
    }

    /* Multi-color Syntax Highlighting */
    .syn-kw { color: #F472B6; font-weight: 500; }    /* Pink Keywords */
    .syn-fn { color: #FB7185; }                     /* Red / Coral Functions */
    .syn-str { color: #A3E635; }                    /* Lime Green Strings */
    .syn-num { color: #FB923C; }                    /* Orange Numbers / Constants */
    .syn-ty { color: #C084FC; }                     /* Lavender Types */
    .syn-cm { color: #64748B; font-style: italic; } /* Slate Comments */
    .syn-pr { color: #38BDF8; }                     /* Cyan Properties */

    /* Explanation Paragraph */
    .explanation-text {
      font-size: 14.5px;
      color: var(--text-muted);
      line-height: 1.7;
      margin-bottom: 24px;
    }

    /* Tip / Callout Banner */
    .callout-card {
      background: rgba(244, 114, 182, 0.04);
      border: 1px solid var(--border-pink);
      border-radius: var(--radius-lg);
      padding: 18px 20px;
      margin-bottom: 36px;
      display: flex;
      gap: 14px;
    }

    .callout-icon {
      color: var(--accent-pink);
      flex-shrink: 0;
      margin-top: 2px;
    }

    .callout-body {
      font-size: 13.5px;
      line-height: 1.6;
      color: #E2E8F0;
    }

    .callout-title {
      font-weight: 700;
      color: var(--accent-pink);
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .callout-link {
      color: var(--accent-pink);
      text-decoration: underline;
      text-underline-offset: 3px;
      font-weight: 500;
    }
    .callout-link:hover {
      color: #F9A8D4;
    }

    /* Section Subhead */
    .section-title {
      font-size: 18px;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: var(--text-main);
      margin: 36px 0 16px;
    }

    /* Pagination / Next-Steps Cards */
    .nav-cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 48px;
      padding-top: 32px;
      border-top: 1px solid var(--border-subtle);
    }

    .pagination-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
    }
    .pagination-card:hover {
      background: var(--bg-card);
      border-color: rgba(244, 114, 182, 0.35);
      transform: translateY(-2px);
    }

    .pagination-eyebrow {
      font-size: 12px;
      font-weight: 600;
      color: var(--accent-pink);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .pagination-header {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-main);
    }

    .pagination-snippet {
      font-size: 12.5px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    /* Right Rail Sidebar */
    .right-sidebar {
      position: sticky;
      top: 66px;
      height: calc(100vh - 66px);
      overflow-y: auto;
      padding: 32px 0 36px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .top-action-pill {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-pill);
      padding: 8px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--text-muted);
      font-size: 12px;
      font-family: 'Geist Mono', monospace;
      cursor: pointer;
      transition: all 0.15s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    .top-action-pill:hover {
      border-color: var(--border-elevated);
      color: var(--text-main);
      background: var(--bg-card);
    }

    .toc-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-dim);
      margin-bottom: 12px;
    }

    .toc-menu {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .toc-link {
      font-size: 13px;
      color: var(--text-muted);
      padding: 6px 14px;
      border-radius: var(--radius-pill);
      transition: all 0.15s ease;
      display: block;
      cursor: pointer;
    }
    .toc-link:hover {
      color: var(--text-main);
    }
    .toc-link.active {
      color: var(--text-main);
      font-weight: 600;
      border: 1px solid var(--accent-pink);
      background: var(--accent-pink-bg);
    }

    .back-top-btn {
      margin-top: auto;
      background: transparent;
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      border-radius: var(--radius-pill);
      padding: 7px 14px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }
    .back-top-btn:hover {
      color: var(--text-main);
      border-color: var(--border-elevated);
      background: var(--bg-surface);
    }

    /* Search Dialog Modal (⌘K) */
    .search-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      z-index: 100;
      align-items: flex-start;
      justify-content: center;
      padding-top: 15vh;
    }
    .search-backdrop.open {
      display: flex;
    }

    .search-modal {
      width: 100%;
      max-width: 580px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .modal-input-row {
      display: flex;
      align-items: center;
      padding: 14px 20px;
      border-bottom: 1px solid var(--border-subtle);
      gap: 12px;
    }

    .modal-input-row input {
      background: transparent;
      border: none;
      outline: none;
      font-size: 15px;
      color: var(--text-main);
      width: 100%;
      font-family: inherit;
    }

    .modal-results-tray {
      padding: 12px;
      max-height: 320px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .modal-result-row {
      padding: 10px 14px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 13px;
    }
    .modal-result-row:hover {
      background: var(--bg-elevated);
      color: var(--text-main);
    }

    .modal-bottom-bar {
      padding: 10px 20px;
      background: rgba(0, 0, 0, 0.25);
      border-top: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      color: var(--text-dim);
    }

    /* Toast Notification */
    .toast-box {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: var(--bg-card);
      border: 1px solid var(--border-pink);
      color: var(--text-main);
      border-radius: var(--radius-pill);
      padding: 9px 20px;
      font-size: 12px;
      font-weight: 500;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.2s ease;
      pointer-events: none;
      z-index: 999;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .toast-box.show {
      opacity: 1;
      transform: translateY(0);
    }

    /* Responsive Breakdown */
    @media (max-width: 1140px) {
      .docs-grid {
        grid-template-columns: 240px minmax(0, 1fr);
      }
      .right-sidebar {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .docs-grid {
        grid-template-columns: 1fr;
        padding: 0 16px;
      }
      .left-sidebar {
        display: none;
      }
      .top-nav {
        padding: 0 16px;
      }
      .nav-cards-grid {
        grid-template-columns: 1fr;
      }
      .search-pill-btn .search-kbd {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="app-shell">
    <!-- Top Navigation Bar -->
    <header class="top-nav">
      <div class="nav-left">
        <a href="/docs" class="brand-logo">
          <div class="brand-mark">S</div>
          <span>MaterialMe</span>
        </a>
        <div class="version-pill" onclick="showToast('Active API Specification v3.4.1')">
          <span>v3.4.1 ▾</span>
        </div>
      </div>

      <div class="nav-center">
        <button class="search-pill-btn" id="openSearch">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <span>Search documentation</span>
          <span class="search-kbd">⌘K</span>
        </button>
      </div>

      <div class="nav-right">
        <a href="#community" class="nav-link">Community</a>
        <a href="/docs/swagger" target="_blank" class="nav-link">Reference</a>
        <a href="#blog" class="nav-link">Blog</a>
        <div class="status-badge">
          <span class="status-dot"></span>
          <span>Online</span>
        </div>
        <div class="avatar-thumbnail" title="Developer Profile">DEV</div>
      </div>
    </header>

    <!-- 3-Column Content Layout -->
    <div class="docs-grid">
      <!-- Left Sidebar: Navigation & Resources -->
      <aside class="left-sidebar">
        <!-- Private Packages -->
        <div class="nav-section">
          <a href="#private-packages" class="sidebar-link">
            <span>Private packages</span>
          </a>
        </div>

        <!-- Advanced Usage (Collapsible) -->
        <div class="nav-section" id="secAdvanced">
          <button class="section-header-btn" onclick="toggleSection('secAdvanced')">
            <span>Advanced Usage</span>
            <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <div class="nav-sub-items">
            <a href="#overview" class="sidebar-link">Overview</a>
            <a href="#components" class="sidebar-link active">
              <span>Components</span>
              <span class="pill-tag">React</span>
            </a>
            <a href="#hooks" class="sidebar-link">Hooks</a>
            <a href="#static" class="sidebar-link">Static</a>
          </div>
        </div>

        <!-- Guides (Collapsible) -->
        <div class="nav-section" id="secGuides">
          <button class="section-header-btn" onclick="toggleSection('secGuides')">
            <span>Guides</span>
            <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <div class="nav-sub-items">
            <a href="#quickstart" class="sidebar-link">Quickstart</a>
            <a href="#groq-pipeline" class="sidebar-link">Groq Pipeline</a>
            <a href="#database-schema" class="sidebar-link">PostgreSQL Schema</a>
          </div>
        </div>

        <!-- Resources Section -->
        <div class="nav-section">
          <div style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--text-dim); padding: 6px 10px;">
            Resources
          </div>
          <a href="https://figma.com" target="_blank" class="sidebar-link">
            <span>Figma Plugin</span>
            <svg class="external-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
          </a>
          <a href="https://chrome.google.com" target="_blank" class="sidebar-link">
            <span>Chrome Extension</span>
            <svg class="external-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
          </a>
          <a href="/docs/swagger" target="_blank" class="sidebar-link">
            <span>Swagger UI Explorer</span>
            <svg class="external-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
          </a>
          <a href="/docs/json" target="_blank" class="sidebar-link">
            <span>OpenAPI Spec (JSON)</span>
            <svg class="external-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
          </a>
        </div>

        <!-- Bottom Help Widget -->
        <div class="bottom-help-card">
          <div class="help-card-header">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-pink)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
            <span>Need help?</span>
          </div>
          <div class="help-card-subline">Learn basics with this 5-min Tutorial</div>
          <div class="video-preview-thumb" onclick="showToast('Opening video guide...')">
            <div class="play-circle">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
          </div>
        </div>
      </aside>

      <!-- Center Content Area -->
      <main class="content-center">
        <div class="breadcrumb">
          <span>Docs</span>
          <span>/</span>
          <span>Advanced Usage</span>
          <span>/</span>
          <span style="color: var(--text-main);">Components</span>
        </div>

        <h1 class="page-heading" id="install">Component Documentation</h1>
        <p class="page-lead">
          Design and build responsive educational quiz modules with automated Groq Llama 3 generation, robust validation schemas, and real-time backend persistence.
        </p>

        <!-- Installation Package Pill -->
        <div class="install-pill-box">
          <span>npm install @materialme/react</span>
          <button class="install-copy-btn" onclick="copySnippet('npm install @materialme/react', 'Copied install command!')" title="Copy command">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          </button>
        </div>

        <!-- Code Block Component -->
        <div class="code-container" id="usage-example">
          <div class="code-top-bar">
            <div class="code-tab-list">
              <span class="code-tab-item active" id="tabJs" onclick="selectCodeTab('js')">calculateCircleArea.js</span>
              <span class="code-tab-item" id="tabTs" onclick="selectCodeTab('ts')">quizGenerator.ts</span>
            </div>
            <div class="code-top-actions">
              <button class="icon-action-btn" onclick="copyActiveCode()" title="Copy code">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                <span>Copy code</span>
              </button>
              <button class="icon-action-btn" onclick="showToast('Expanded fullscreen code view')" title="Fullscreen">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
              </button>
            </div>
          </div>

          <div class="code-body-grid">
            <div class="gutter-lines">
              1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14
            </div>
            <div class="code-content" id="codeContentDisplay"><span class="syn-cm">/**</span>
<span class="syn-cm"> * Calculate the exact geometric area of a circle.</span>
<span class="syn-cm"> * @param {number} radius - The radius of the circle.</span>
<span class="syn-cm"> * @returns {number} The computed area (π * r²).</span>
<span class="syn-cm"> */</span>
<span class="syn-kw">function</span> <span class="syn-fn">calculateCircleArea</span>(<span class="syn-pr">radius</span>) {
  <span class="syn-kw">if</span> (<span class="syn-kw">typeof</span> <span class="syn-pr">radius</span> !== <span class="syn-str">'number'</span> || <span class="syn-pr">radius</span> &lt;= <span class="syn-num">0</span>) {
    <span class="syn-kw">throw</span> <span class="syn-kw">new</span> <span class="syn-ty">TypeError</span>(<span class="syn-str">'Radius must be a positive number.'</span>);
  }

  <span class="syn-kw">const</span> <span class="syn-num">area</span> = <span class="syn-ty">Math</span>.<span class="syn-num">PI</span> * <span class="syn-ty">Math</span>.<span class="syn-fn">pow</span>(<span class="syn-pr">radius</span>, <span class="syn-num">2</span>);
  <span class="syn-kw">return</span> <span class="syn-ty">Number</span>(<span class="syn-num">area</span>.<span class="syn-fn">toFixed</span>(<span class="syn-num">4</span>));
}

<span class="syn-kw">export</span> { <span class="syn-fn">calculateCircleArea</span> };</div>
          </div>
        </div>

        <!-- Explanation Paragraph -->
        <p class="explanation-text">
          The <code class="font-mono" style="color: var(--accent-coral);">calculateCircleArea(radius)</code> helper verifies that the input parameter is a strictly positive number before calculating the area using π. It returns the precision-trimmed floating point value, safeguarding calculations against invalid arithmetic values.
        </p>

        <!-- Tip / Callout Banner -->
        <div class="callout-card">
          <div class="callout-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div class="callout-body">
            <div class="callout-title">
              <span>Tip</span>
            </div>
            <div>
              You can use <a href="https://codesandbox.io/sandpack" target="_blank" class="callout-link">Sandpack</a> to develop code preview like this ☝️
            </div>
          </div>
        </div>

        <!-- Pagination / Navigation Cards -->
        <h2 class="section-title">Usage example</h2>
        <div class="nav-cards-grid">
          <a href="#overview" class="pagination-card">
            <span class="pagination-eyebrow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
              <span>Overview</span>
            </span>
            <span class="pagination-header">← Overview</span>
            <span class="pagination-snippet">Learn how to add files to your projects and start coding in record time</span>
          </a>

          <a href="#hooks" class="pagination-card" style="text-align: right;">
            <span class="pagination-eyebrow" style="justify-content: flex-end;">
              <span>Hooks</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
            </span>
            <span class="pagination-header">Hooks →</span>
            <span class="pagination-snippet">Design &amp; customise your own hooks or find ready-to-use presets</span>
          </a>
        </div>
      </main>

      <!-- Right Rail: On-Page TOC & Utilities -->
      <aside class="right-sidebar">
        <!-- Top Action Pill -->
        <button class="top-action-pill" onclick="copySnippet('smpckg.org/install', 'Copied smpckg.org/install!')">
          <span>smpckg.org/install</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </button>

        <!-- Table of Contents -->
        <div>
          <div class="toc-label">On this page</div>
          <ul class="toc-menu">
            <li><a href="#install" class="toc-link active">Install</a></li>
            <li><a href="#usage-example" class="toc-link">Usage example</a></li>
          </ul>
        </div>

        <!-- Footer Utility -->
        <button class="back-top-btn" onclick="window.scrollTo({ top: 0, behavior: 'smooth' })">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg>
          <span>↑ Back to top</span>
        </button>
      </aside>
    </div>
  </div>

  <!-- Search Modal -->
  <div class="search-backdrop" id="searchModalBackdrop" onclick="if(event.target === this) closeSearchModal()">
    <div class="search-modal">
      <div class="modal-input-row">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="text" id="searchInput" placeholder="Search documentation..." autofocus>
      </div>
      <div class="modal-results-tray">
        <div class="modal-result-row" onclick="jumpToSection('#install')">
          <div>
            <strong>Components</strong>
            <div style="font-size: 11px; color: var(--text-dim);">Advanced Usage &gt; Components (React)</div>
          </div>
          <span class="pill-tag">Section</span>
        </div>
        <div class="modal-result-row" onclick="jumpToSection('#usage-example')">
          <div>
            <strong>calculateCircleArea snippet</strong>
            <div style="font-size: 11px; color: var(--text-dim);">Usage example &gt; JavaScript function</div>
          </div>
          <span class="pill-tag">Code</span>
        </div>
        <div class="modal-result-row" onclick="window.open('/docs/swagger', '_blank')">
          <div>
            <strong>Interactive Swagger Explorer</strong>
            <div style="font-size: 11px; color: var(--text-dim);">Backend API reference &amp; models</div>
          </div>
          <svg class="external-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
        </div>
      </div>
      <div class="modal-bottom-bar">
        <span>Press <kbd style="background: var(--bg-card); padding: 2px 6px; border-radius: 4px;">Esc</kbd> to close</span>
        <span>MaterialMe Developer Portal</span>
      </div>
    </div>
  </div>

  <!-- Toast Element -->
  <div class="toast-box" id="toastNotification">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-pink)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
    <span id="toastMessage">Copied!</span>
  </div>

  <!-- Scripts -->
  <script>
    function showToast(message) {
      const toast = document.getElementById('toastNotification');
      const text = document.getElementById('toastMessage');
      text.innerText = message;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2000);
    }

    function copySnippet(text, msg = 'Copied to clipboard!') {
      navigator.clipboard.writeText(text).then(() => {
        showToast(msg);
      }).catch(() => {
        showToast('Failed to copy');
      });
    }

    function copyActiveCode() {
      const code = activeCodeTab === 'js'
        ? \`/**
 * Calculate the exact geometric area of a circle.
 * @param {number} radius - The radius of the circle.
 * @returns {number} The computed area (π * r²).
 */
function calculateCircleArea(radius) {
  if (typeof radius !== 'number' || radius <= 0) {
    throw new TypeError('Radius must be a positive number.');
  }

  const area = Math.PI * Math.pow(radius, 2);
  return Number(area.toFixed(4));
}

export { calculateCircleArea };\`
        : \`import { QuizResponse } from "@squizme/shared";

export async function generateQuizFromPrompt(prompt: string): Promise<QuizResponse> {
  const response = await fetch("http://localhost:6001/api/generator/prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, count: 5 }),
  });

  if (!response.ok) {
    throw new Error(\\\`Failed to generate quiz: \\\${response.statusText}\\\`);
  }

  return await response.json();
}\`;
      copySnippet(code, 'Code copied to clipboard!');
    }

    let activeCodeTab = 'js';
    function selectCodeTab(tab) {
      activeCodeTab = tab;
      const tabJs = document.getElementById('tabJs');
      const tabTs = document.getElementById('tabTs');
      const display = document.getElementById('codeContentDisplay');

      if (tab === 'js') {
        tabJs.classList.add('active');
        tabTs.classList.remove('active');
        display.innerHTML = \`<span class="syn-cm">/**</span>
<span class="syn-cm"> * Calculate the exact geometric area of a circle.</span>
<span class="syn-cm"> * @param {number} radius - The radius of the circle.</span>
<span class="syn-cm"> * @returns {number} The computed area (π * r²).</span>
<span class="syn-cm"> */</span>
<span class="syn-kw">function</span> <span class="syn-fn">calculateCircleArea</span>(<span class="syn-pr">radius</span>) {
  <span class="syn-kw">if</span> (<span class="syn-kw">typeof</span> <span class="syn-pr">radius</span> !== <span class="syn-str">'number'</span> || <span class="syn-pr">radius</span> &lt;= <span class="syn-num">0</span>) {
    <span class="syn-kw">throw</span> <span class="syn-kw">new</span> <span class="syn-ty">TypeError</span>(<span class="syn-str">'Radius must be a positive number.'</span>);
  }

  <span class="syn-kw">const</span> <span class="syn-num">area</span> = <span class="syn-ty">Math</span>.<span class="syn-num">PI</span> * <span class="syn-ty">Math</span>.<span class="syn-fn">pow</span>(<span class="syn-pr">radius</span>, <span class="syn-num">2</span>);
  <span class="syn-kw">return</span> <span class="syn-ty">Number</span>(<span class="syn-num">area</span>.<span class="syn-fn">toFixed</span>(<span class="syn-num">4</span>));
}

<span class="syn-kw">export</span> { <span class="syn-fn">calculateCircleArea</span> };\`;
      } else {
        tabTs.classList.add('active');
        tabJs.classList.remove('active');
        display.innerHTML = \`<span class="syn-kw">import</span> { <span class="syn-ty">QuizResponse</span> } <span class="syn-kw">from</span> <span class="syn-str">"@squizme/shared"</span>;

<span class="syn-kw">export</span> <span class="syn-kw">async</span> <span class="syn-kw">function</span> <span class="syn-fn">generateQuizFromPrompt</span>(<span class="syn-pr">prompt</span>: <span class="syn-ty">string</span>): <span class="syn-ty">Promise</span>&lt;<span class="syn-ty">QuizResponse</span>&gt; {
  <span class="syn-kw">const</span> <span class="syn-num">response</span> = <span class="syn-kw">await</span> <span class="syn-fn">fetch</span>(<span class="syn-str">"http://localhost:6001/api/generator/prompt"</span>, {
    <span class="syn-pr">method</span>: <span class="syn-str">"POST"</span>,
    <span class="syn-pr">headers</span>: { <span class="syn-str">"Content-Type"</span>: <span class="syn-str">"application/json"</span> },
    <span class="syn-pr">body</span>: <span class="syn-ty">JSON</span>.<span class="syn-fn">stringify</span>({ <span class="syn-pr">prompt</span>, <span class="syn-pr">count</span>: <span class="syn-num">5</span> }),
  });

  <span class="syn-kw">if</span> (!<span class="syn-num">response</span>.<span class="syn-pr">ok</span>) {
    <span class="syn-kw">throw</span> <span class="syn-kw">new</span> <span class="syn-ty">Error</span>(<span class="syn-str">\`Failed to generate quiz: \\\${response.statusText}\`</span>);
  }

  <span class="syn-kw">return</span> <span class="syn-kw">await</span> <span class="syn-num">response</span>.<span class="syn-fn">json</span>();
}\`;
      }
    }

    function toggleSection(sectionId) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.classList.toggle('section-collapsed');
      }
    }

    // Modal Search
    const searchBackdrop = document.getElementById('searchModalBackdrop');
    const openSearchBtn = document.getElementById('openSearch');
    const searchInput = document.getElementById('searchInput');

    function openSearchModal() {
      searchBackdrop.classList.add('open');
      searchInput.focus();
    }

    function closeSearchModal() {
      searchBackdrop.classList.remove('open');
    }

    function jumpToSection(hash) {
      closeSearchModal();
      window.location.hash = hash;
    }

    openSearchBtn.addEventListener('click', openSearchModal);

    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (searchBackdrop.classList.contains('open')) {
          closeSearchModal();
        } else {
          openSearchModal();
        }
      }
      if (e.key === 'Escape' && searchBackdrop.classList.contains('open')) {
        closeSearchModal();
      }
    });

    // TOC Active State Scroll Sync
    const tocLinks = document.querySelectorAll('.toc-link');
    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + 100;
      const targetSections = ['install', 'usage-example'];
      for (const id of targetSections) {
        const section = document.getElementById(id);
        if (section) {
          const top = section.offsetTop;
          const height = section.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            tocLinks.forEach(link => {
              if (link.getAttribute('href') === '#' + id) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        }
      }
    });
  </script>
</body>
</html>`;
}
