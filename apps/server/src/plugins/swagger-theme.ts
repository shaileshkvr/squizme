export const customSwaggerCss = `
/* Squizme Modern Minimal Dark Swagger UI Theme */

:root {
  --bg-main: #020617;
  --bg-surface: #0b0f19;
  --bg-card: #0f172a;
  --bg-input: #020617;
  --border-subtle: #1e293b;
  --border-focus: #3b82f6;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --text-dim: #64748b;
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --emerald: #10b981;
  --rose: #ef4444;
  --amber: #f59e0b;
}

body {
  background-color: var(--bg-main) !important;
  color: var(--text-main) !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
  margin: 0;
  padding: 0;
}

/* Hide Default Swagger Header Bar */
.swagger-ui .topbar {
  display: none !important;
}

/* Custom Header Wrapper */
.swagger-ui .wrapper {
  max-width: 1080px !important;
  padding: 32px 24px 80px !important;
  margin: 0 auto !important;
}

/* Info Section (Header) */
.swagger-ui .info {
  margin: 0 0 32px !important;
  border-bottom: 1px solid var(--border-subtle) !important;
  padding-bottom: 28px !important;
}

.swagger-ui .info .title {
  color: var(--text-main) !important;
  font-size: 30px !important;
  font-weight: 700 !important;
  letter-spacing: -0.03em !important;
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
}

.swagger-ui .info .title small {
  background: rgba(59, 130, 246, 0.12) !important;
  border: 1px solid rgba(59, 130, 246, 0.25) !important;
  color: #60a5fa !important;
  border-radius: 9999px !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  padding: 3px 10px !important;
  top: 0 !important;
  vertical-align: middle;
}

.swagger-ui .info .description p,
.swagger-ui .info .description {
  color: var(--text-muted) !important;
  font-size: 14px !important;
  line-height: 1.6 !important;
  margin-top: 8px !important;
}

.swagger-ui .scheme-container {
  background: var(--bg-surface) !important;
  box-shadow: none !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: 12px !important;
  padding: 16px 20px !important;
  margin-bottom: 28px !important;
}

.swagger-ui .scheme-container .schemes-title {
  color: var(--text-muted) !important;
  font-size: 13px !important;
}

.swagger-ui select {
  background: var(--bg-input) !important;
  color: var(--text-main) !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: 8px !important;
  padding: 6px 12px !important;
  font-size: 13px !important;
}

/* Filter Input Box */
.swagger-ui .filter .operation-filter-input {
  background: var(--bg-surface) !important;
  border: 1px solid var(--border-subtle) !important;
  color: var(--text-main) !important;
  border-radius: 10px !important;
  padding: 10px 14px !important;
  font-size: 13px !important;
  margin: 16px 0 24px !important;
  transition: border-color 0.15s ease;
  width: 100% !important;
  box-sizing: border-box !important;
}

.swagger-ui .filter .operation-filter-input:focus {
  border-color: var(--border-focus) !important;
  outline: none !important;
}

/* Tag Sections */
.swagger-ui .opblock-tag-section {
  margin-bottom: 28px !important;
}

.swagger-ui .opblock-tag {
  color: var(--text-main) !important;
  font-size: 18px !important;
  font-weight: 600 !important;
  letter-spacing: -0.01em !important;
  border-bottom: 1px solid var(--border-subtle) !important;
  padding: 14px 0 10px !important;
}

.swagger-ui .opblock-tag small {
  color: var(--text-dim) !important;
  font-size: 13px !important;
  font-weight: 400 !important;
  margin-left: 10px !important;
}

/* Operation Blocks (Cards) */
.swagger-ui .opblock {
  background: var(--bg-surface) !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: 10px !important;
  box-shadow: none !important;
  margin: 0 0 12px 0 !important;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.swagger-ui .opblock:hover {
  border-color: #334155 !important;
}

.swagger-ui .opblock .opblock-summary {
  padding: 10px 14px !important;
}

.swagger-ui .opblock .opblock-summary-method {
  border-radius: 6px !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  letter-spacing: 0.04em !important;
  min-width: 68px !important;
  padding: 5px 0 !important;
  text-align: center !important;
  text-shadow: none !important;
}

.swagger-ui .opblock.opblock-get .opblock-summary-method {
  background: rgba(16, 185, 129, 0.15) !important;
  color: #34d399 !important;
  border: 1px solid rgba(16, 185, 129, 0.25) !important;
}

.swagger-ui .opblock.opblock-post .opblock-summary-method {
  background: rgba(59, 130, 246, 0.15) !important;
  color: #60a5fa !important;
  border: 1px solid rgba(59, 130, 246, 0.25) !important;
}

.swagger-ui .opblock.opblock-delete .opblock-summary-method {
  background: rgba(239, 68, 68, 0.15) !important;
  color: #f87171 !important;
  border: 1px solid rgba(239, 68, 68, 0.25) !important;
}

.swagger-ui .opblock.opblock-put .opblock-summary-method,
.swagger-ui .opblock.opblock-patch .opblock-summary-method {
  background: rgba(245, 158, 11, 0.15) !important;
  color: #fbbf24 !important;
  border: 1px solid rgba(245, 158, 11, 0.25) !important;
}

.swagger-ui .opblock .opblock-summary-path,
.swagger-ui .opblock .opblock-summary-path__deprecated {
  color: var(--text-main) !important;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
  font-size: 13px !important;
  font-weight: 500 !important;
}

.swagger-ui .opblock .opblock-summary-description {
  color: var(--text-dim) !important;
  font-size: 13px !important;
}

.swagger-ui .opblock-body {
  background: #060a12 !important;
  border-top: 1px solid var(--border-subtle) !important;
  padding: 16px 20px 24px !important;
}

/* Subheadings & Sections inside Opblock */
.swagger-ui .opblock-section-header {
  background: transparent !important;
  box-shadow: none !important;
  border-bottom: 1px solid var(--border-subtle) !important;
  padding: 10px 0 !important;
}

.swagger-ui .opblock-section-header h4 {
  color: var(--text-muted) !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  letter-spacing: 0.02em !important;
  text-transform: uppercase !important;
}

.swagger-ui .tabheader {
  border-bottom: 1px solid var(--border-subtle) !important;
}

.swagger-ui .tabheader li {
  color: var(--text-muted) !important;
  font-size: 12px !important;
}

/* Parameters Table */
.swagger-ui table thead tr th,
.swagger-ui table thead tr td {
  color: var(--text-muted) !important;
  font-size: 12px !important;
  border-bottom: 1px solid var(--border-subtle) !important;
  padding: 8px 12px !important;
}

.swagger-ui table tbody tr td {
  color: var(--text-main) !important;
  font-size: 13px !important;
  border-bottom: 1px solid rgba(30, 41, 59, 0.5) !important;
  padding: 12px !important;
}

.swagger-ui .parameter__name {
  color: var(--text-main) !important;
  font-family: ui-monospace, monospace !important;
  font-size: 13px !important;
}

.swagger-ui .parameter__type {
  color: var(--text-dim) !important;
  font-size: 12px !important;
}

/* Form Inputs, Textareas inside Swagger */
.swagger-ui input[type="text"],
.swagger-ui textarea {
  background: var(--bg-input) !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: 8px !important;
  color: var(--text-main) !important;
  font-family: ui-monospace, monospace !important;
  font-size: 13px !important;
  padding: 8px 12px !important;
}

.swagger-ui input[type="text"]:focus,
.swagger-ui textarea:focus {
  border-color: var(--border-focus) !important;
  outline: none !important;
}

/* Buttons */
.swagger-ui .btn {
  border-radius: 8px !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  padding: 6px 16px !important;
  transition: all 0.15s ease !important;
  box-shadow: none !important;
}

.swagger-ui .btn.try-out__btn {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-subtle) !important;
  color: var(--text-main) !important;
}

.swagger-ui .btn.try-out__btn:hover {
  background: #1e293b !important;
  border-color: #334155 !important;
}

.swagger-ui .btn.execute {
  background: var(--primary) !important;
  border: 1px solid var(--primary) !important;
  color: #ffffff !important;
}

.swagger-ui .btn.execute:hover {
  background: var(--primary-hover) !important;
}

.swagger-ui .btn.cancel {
  background: rgba(239, 68, 68, 0.1) !important;
  border: 1px solid rgba(239, 68, 68, 0.3) !important;
  color: #f87171 !important;
}

/* Response Section */
.swagger-ui .responses-table {
  background: transparent !important;
}

.swagger-ui .response-col_status {
  color: var(--text-main) !important;
  font-weight: 600 !important;
  font-family: ui-monospace, monospace !important;
}

.swagger-ui .response-col_description {
  color: var(--text-muted) !important;
  font-size: 13px !important;
}

.swagger-ui .highlight-code {
  background: #020617 !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: 8px !important;
}

.swagger-ui .microlight {
  background: #020617 !important;
  color: #e2e8f0 !important;
  font-family: ui-monospace, monospace !important;
  font-size: 12px !important;
  line-height: 1.5 !important;
}

/* Models / Schemas Accordion Section */
.swagger-ui section.models {
  background: var(--bg-surface) !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: 12px !important;
  margin-top: 36px !important;
}

.swagger-ui section.models h4 {
  color: var(--text-main) !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  border-bottom: 1px solid var(--border-subtle) !important;
  padding: 16px 20px !important;
}

.swagger-ui .model-box {
  background: #060a12 !important;
}

.swagger-ui .model-title {
  color: var(--text-main) !important;
}

.swagger-ui .prop-type {
  color: #60a5fa !important;
}

.swagger-ui .prop-format {
  color: var(--text-dim) !important;
}

/* Scrollbars */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-main);
}

::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #334155;
}
`;
