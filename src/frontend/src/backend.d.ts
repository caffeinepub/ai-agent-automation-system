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
export type Time = bigint;
export interface TaskHistoryEntry {
    taskId: bigint;
    timestamp: Time;
    success: boolean;
    commandText: string;
}
export interface backendInterface {
    addExecutionLog(stepName: string, status: string, iconType: string): Promise<void>;
    addTaskHistory(taskId: bigint, commandText: string, success: boolean): Promise<void>;
    clearExecutionLogs(): Promise<void>;
    clearTaskHistory(): Promise<void>;
    deleteTaskById(taskId: bigint): Promise<void>;
    getExecutionLogs(): Promise<Array<ExecutionLogEntry>>;
    getSettings(): Promise<Settings | null>;
    getTaskById(taskId: bigint): Promise<TaskHistoryEntry>;
    getTaskHistory(): Promise<Array<TaskHistoryEntry>>;
    updateSettings(newSettings: Settings): Promise<void>;
}
