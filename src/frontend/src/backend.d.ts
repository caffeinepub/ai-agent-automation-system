import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ExecutionLogEntry {
    status: string;
    iconType: string;
    stepName: string;
    timestamp: Time;
}
export interface Settings {
    googleSheetsId: string;
    slackWebhookUrl: string;
    sheetTabName: string;
}
export interface AnalyticsSummary {
    mostUsedCommands: Array<string>;
    totalTasks: bigint;
    successCount: bigint;
    failureCount: bigint;
}
export type Time = bigint;
export interface Credential {
    service: string;
    value: string;
    name: string;
}
export interface ScheduledTask {
    id: bigint;
    name: string;
    enabled: boolean;
    command: string;
    nextRun: Time;
    frequency: string;
}
export interface SavedAgent {
    id: bigint;
    name: string;
    createdAt: Time;
    command: string;
    triggerCount: bigint;
}
export interface TaskHistoryEntry {
    taskName: string;
    taskId: bigint;
    timestamp: Time;
    success: boolean;
    commandText: string;
}
export interface backendInterface {
    addCredential(name: string, value: string, service: string): Promise<void>;
    addExecutionLog(stepName: string, status: string, iconType: string): Promise<void>;
    addSavedAgent(id: bigint, name: string, command: string): Promise<void>;
    addScheduledTask(id: bigint, name: string, command: string, frequency: string, nextRun: Time): Promise<void>;
    addTaskHistory(taskId: bigint, taskName: string, commandText: string, success: boolean): Promise<void>;
    clearExecutionLogs(): Promise<void>;
    clearTaskHistory(): Promise<void>;
    deleteCredential(name: string): Promise<void>;
    deleteSavedAgent(id: bigint): Promise<void>;
    deleteScheduledTask(id: bigint): Promise<void>;
    deleteTaskById(taskId: bigint): Promise<void>;
    getAnalyticsSummary(): Promise<AnalyticsSummary>;
    getCredentialByName(name: string): Promise<Credential | null>;
    getCredentials(): Promise<Array<Credential>>;
    getExecutionLogs(): Promise<Array<ExecutionLogEntry>>;
    getSavedAgentById(id: bigint): Promise<SavedAgent | null>;
    getSavedAgents(): Promise<Array<SavedAgent>>;
    getScheduledTaskById(id: bigint): Promise<ScheduledTask | null>;
    getScheduledTasks(): Promise<Array<ScheduledTask>>;
    getSettings(): Promise<Settings | null>;
    getTaskById(taskId: bigint): Promise<TaskHistoryEntry>;
    getTaskHistory(): Promise<Array<TaskHistoryEntry>>;
    updateCredential(name: string, newValue: string): Promise<void>;
    updateSavedAgent(id: bigint, updatedAgent: SavedAgent): Promise<void>;
    updateScheduledTask(id: bigint, updatedTask: ScheduledTask): Promise<void>;
    updateSettings(newSettings: Settings): Promise<void>;
}
