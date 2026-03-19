import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Settings } from "../backend.d";
import { useActor } from "./useActor";

export function useGetTaskHistory() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["taskHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTaskHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetExecutionLogs() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["executionLogs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExecutionLogs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSettings() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTaskHistory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      commandText,
      success,
    }: { taskId: bigint; commandText: string; success: boolean }) => {
      if (!actor) return;
      return actor.addTaskHistory(taskId, commandText, success);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["taskHistory"] }),
  });
}

export function useClearTaskHistory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) return;
      return actor.clearTaskHistory();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["taskHistory"] }),
  });
}

export function useDeleteTaskById() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) return;
      return actor.deleteTaskById(taskId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["taskHistory"] }),
  });
}

export function useAddExecutionLog() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      stepName,
      status,
      iconType,
    }: { stepName: string; status: string; iconType: string }) => {
      if (!actor) return;
      return actor.addExecutionLog(stepName, status, iconType);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["executionLogs"] }),
  });
}

export function useClearExecutionLogs() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) return;
      return actor.clearExecutionLogs();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["executionLogs"] }),
  });
}

export function useUpdateSettings() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Settings) => {
      if (!actor) return;
      return actor.updateSettings(settings);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });
}
