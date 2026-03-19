import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  MessageSquare,
  RotateCcw,
  Settings,
  Trash2,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { TaskHistoryEntry } from "../backend.d";
import {
  useClearTaskHistory,
  useDeleteTaskById,
  useGetSettings,
  useGetTaskHistory,
  useUpdateSettings,
} from "../hooks/useQueries";

interface SidebarProps {
  activeView: "chat" | "settings";
  onViewChange: (view: "chat" | "settings") => void;
  onRerun: (command: string) => void;
}

function relativeTime(nsTimestamp: bigint): string {
  const ms = Number(nsTimestamp / 1_000_000n);
  const diff = Date.now() - ms;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} hr ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

const SAMPLE_TASKS: TaskHistoryEntry[] = [
  {
    taskId: 1n,
    commandText: "Send Q3 report to Slack #general",
    success: true,
    timestamp: BigInt(Date.now() - 5 * 60_000) * 1_000_000n,
  },
  {
    taskId: 2n,
    commandText: "Update team spreadsheet with new entries",
    success: true,
    timestamp: BigInt(Date.now() - 23 * 60_000) * 1_000_000n,
  },
  {
    taskId: 3n,
    commandText: "Notify #devops and log deployment",
    success: false,
    timestamp: BigInt(Date.now() - 65 * 60_000) * 1_000_000n,
  },
  {
    taskId: 4n,
    commandText: "Sync CRM contacts to Sheets",
    success: true,
    timestamp: BigInt(Date.now() - 2 * 3_600_000) * 1_000_000n,
  },
];

export default function Sidebar({
  activeView,
  onViewChange,
  onRerun,
}: SidebarProps) {
  const { data: tasks } = useGetTaskHistory();
  const clearHistory = useClearTaskHistory();
  const deleteTask = useDeleteTaskById();
  const { data: settings } = useGetSettings();
  const updateSettings = useUpdateSettings();

  const [slackUrl, setSlackUrl] = useState(settings?.slackWebhookUrl ?? "");
  const [sheetsId, setSheetsId] = useState(settings?.googleSheetsId ?? "");
  const [tabName, setTabName] = useState(settings?.sheetTabName ?? "");

  const displayTasks = tasks && tasks.length > 0 ? tasks : SAMPLE_TASKS;

  const handleSaveSettings = () => {
    updateSettings.mutate({
      slackWebhookUrl: slackUrl,
      googleSheetsId: sheetsId,
      sheetTabName: tabName,
    });
    localStorage.setItem(
      "nexus-settings",
      JSON.stringify({
        slackWebhookUrl: slackUrl,
        googleSheetsId: sheetsId,
        sheetTabName: tabName,
      }),
    );
    toast.success("Settings saved!");
  };

  return (
    <div className="nexus-card h-full flex flex-col overflow-hidden">
      <div className="flex border-b border-border flex-shrink-0">
        <button
          type="button"
          data-ocid="sidebar.chat.tab"
          onClick={() => onViewChange("chat")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors ${
            activeView === "chat"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          History
        </button>
        <button
          type="button"
          data-ocid="sidebar.settings.tab"
          onClick={() => onViewChange("settings")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors ${
            activeView === "settings"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Settings
        </button>
      </div>

      {activeView === "chat" ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
            <h3 className="text-sm font-semibold text-foreground">
              Task History
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => clearHistory.mutate()}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
              data-ocid="sidebar.history.delete_button"
            >
              Clear
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
            {displayTasks.length === 0 ? (
              <p
                className="text-center text-muted-foreground text-xs py-8"
                data-ocid="sidebar.history.empty_state"
              >
                No task history yet
              </p>
            ) : (
              displayTasks.map((task, i) => (
                <motion.div
                  key={String(task.taskId)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  data-ocid={`sidebar.history.item.${i + 1}`}
                  className="group flex items-start gap-2.5 p-3 rounded-xl bg-muted/50 border border-border hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => onRerun(task.commandText)}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${
                      task.success ? "text-success" : "text-destructive"
                    }`}
                  >
                    {task.success ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {task.commandText}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">
                        {relativeTime(task.timestamp)}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          task.success
                            ? "bg-success/15 text-success"
                            : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {task.success ? "Done" : "Failed"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      data-ocid={`sidebar.history.delete_button.${i + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask.mutate(task.taskId);
                      }}
                      className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      data-ocid={`sidebar.history.button.${i + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRerun(task.commandText);
                      }}
                      className="p-1 rounded hover:bg-primary/20 text-muted-foreground hover:text-primary"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">
            Integration Settings
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="slack-url-input"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Slack Webhook URL
                </label>
                <span
                  className={`w-2 h-2 rounded-full ${slackUrl ? "bg-success" : "bg-muted-foreground"}`}
                />
              </div>
              <input
                id="slack-url-input"
                type="url"
                value={slackUrl}
                onChange={(e) => setSlackUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                data-ocid="settings.slack_url.input"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="sheets-id-input"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Google Sheets ID
                </label>
                <span
                  className={`w-2 h-2 rounded-full ${sheetsId ? "bg-success" : "bg-muted-foreground"}`}
                />
              </div>
              <input
                id="sheets-id-input"
                type="text"
                value={sheetsId}
                onChange={(e) => setSheetsId(e.target.value)}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
                data-ocid="settings.sheets_id.input"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="tab-name-input"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Sheet Tab Name
                </label>
                <span
                  className={`w-2 h-2 rounded-full ${tabName ? "bg-success" : "bg-muted-foreground"}`}
                />
              </div>
              <input
                id="tab-name-input"
                type="text"
                value={tabName}
                onChange={(e) => setTabName(e.target.value)}
                placeholder="Sheet1"
                data-ocid="settings.tab_name.input"
                className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={handleSaveSettings}
            disabled={updateSettings.isPending}
            data-ocid="settings.save.submit_button"
            className="w-full rounded-xl text-sm"
          >
            {updateSettings.isPending ? "Saving..." : "Save Settings"}
          </Button>

          <div className="pt-2 space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Connection Status
            </p>
            {[
              { label: "Slack", connected: !!slackUrl },
              { label: "Google Sheets", connected: !!sheetsId },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 border border-border"
              >
                <span className="text-xs text-foreground">{item.label}</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${item.connected ? "bg-success" : "bg-muted-foreground"}`}
                  />
                  <span
                    className={`text-[11px] font-medium ${item.connected ? "text-success" : "text-muted-foreground"}`}
                  >
                    {item.connected ? "Connected" : "Not configured"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className="flex-shrink-0 px-4 py-3 border-t border-border text-center">
        <p className="text-[10px] text-muted-foreground">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with ❤️ caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
