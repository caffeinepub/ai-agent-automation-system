# AI Agent Automation System — Advanced Enhancement

## Current State
A full-stack ICP app with:
- Motoko backend storing task history, execution logs, and integration settings (Slack/Sheets)
- React frontend with chat interface, sidebar history/settings, animated workflow steps, logs panel
- Light/dark theme, toast notifications via sonner, motion animations

## Requested Changes (Diff)

### Add
- **Analytics dashboard view** — task counts, success rate, usage stats using stored history data
- **Task scheduler panel** — store scheduled tasks (daily/weekly) in backend; display and manage in sidebar
- **Saved agents panel** — auto-detect repeated commands and persist as named agents; replay from panel
- **Credential management UI** — extended settings with Email, CRM, Ollama endpoint fields
- **Voice input** — Web Speech API mic button in chat input
- **File upload** — file picker with drag-and-drop in chat, display filename before sending
- **Action preview modal** — confirm dialog showing parsed intent steps before executing
- **Parallel execution indicator** — show tasks running simultaneously in workflow steps
- **Glassmorphism + animation upgrades** — backdrop-blur cards, animated gradients, floating particles background
- **Advanced theme system** — CSS variable-driven themes with smooth transitions
- **Prompt history with replay** — dedicated History tab showing full prompt log with replay buttons (extends existing task history)
- **Smart AI intent detection UI** — show parsed intent labels (Slack / Sheets / Email / CRM) as colored chips before/during execution
- **Smart suggestions** — contextual suggestion chips based on recent command patterns
- **New backend fields**: scheduledTasks, savedAgents, credentials

### Modify
- `App.tsx` — add Analytics, Scheduler, Agents, Credentials views; restructure sidebar navigation with 5 tabs
- `Sidebar.tsx` — expand to multi-tab nav: History | Agents | Schedule | Settings | Analytics
- `ChatBox.tsx` — add voice input button, file upload zone, action preview modal
- `WorkflowSteps.tsx` — add parallel execution visual
- `LogsPanel.tsx` — keep as-is, minor style polish
- `index.css` — glassmorphism tokens, animated gradient background, particle layer
- Backend `main.mo` — add scheduledTasks, savedAgents, credentials storage

### Remove
- Standalone `SettingsPlaceholder` component (replaced by full settings tab in sidebar)

## Implementation Plan
1. Update `main.mo` with new types and functions for scheduledTasks, savedAgents, credentials
2. Update `backend.d.ts` to match new API
3. Rewrite `index.css` with glassmorphism tokens, animated gradient, theme transitions
4. Rewrite `App.tsx` with new view states, analytics logic, agent auto-detection
5. Rewrite `Sidebar.tsx` with 5-tab nav: History | Agents | Schedule | Analytics | Settings
6. Rewrite `ChatBox.tsx` with voice input, file upload, action preview modal, intent chips
7. Update `WorkflowSteps.tsx` with parallel task indicators
8. Add `AnalyticsDashboard.tsx` component
9. Add `AgentsPanel.tsx` component
10. Add `SchedulerPanel.tsx` component
