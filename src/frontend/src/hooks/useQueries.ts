import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SavedAgent, ScheduledTask, Settings } from "../backend.d";
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

export function useGetAnalyticsSummary() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAnalyticsSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSavedAgents() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["savedAgents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSavedAgents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetScheduledTasks() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["scheduledTasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getScheduledTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCredentials() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["credentials"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCredentials();
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
      taskName,
      commandText,
      success,
    }: {
      taskId: bigint;
      taskName: string;
      commandText: string;
      success: boolean;
    }) => {
      if (!actor) return;
      return actor.addTaskHistory(taskId, taskName, commandText, success);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["taskHistory"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["taskHistory"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
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

export function useAddSavedAgent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      command,
    }: { id: bigint; name: string; command: string }) => {
      if (!actor) return;
      return actor.addSavedAgent(id, name, command);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["savedAgents"] }),
  });
}

export function useDeleteSavedAgent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) return;
      return actor.deleteSavedAgent(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["savedAgents"] }),
  });
}

export function useUpdateSavedAgent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updatedAgent,
    }: { id: bigint; updatedAgent: SavedAgent }) => {
      if (!actor) return;
      return actor.updateSavedAgent(id, updatedAgent);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["savedAgents"] }),
  });
}

export function useAddScheduledTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      command,
      frequency,
      nextRun,
    }: {
      id: bigint;
      name: string;
      command: string;
      frequency: string;
      nextRun: bigint;
    }) => {
      if (!actor) return;
      return actor.addScheduledTask(id, name, command, frequency, nextRun);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scheduledTasks"] }),
  });
}

export function useDeleteScheduledTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) return;
      return actor.deleteScheduledTask(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scheduledTasks"] }),
  });
}

export function useUpdateScheduledTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updatedTask,
    }: { id: bigint; updatedTask: ScheduledTask }) => {
      if (!actor) return;
      return actor.updateScheduledTask(id, updatedTask);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scheduledTasks"] }),
  });
}

export function useAddCredential() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      value,
      service,
    }: { name: string; value: string; service: string }) => {
      if (!actor) return;
      return actor.addCredential(name, value, service);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["credentials"] }),
  });
}

export function useDeleteCredential() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) return;
      return actor.deleteCredential(name);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["credentials"] }),
  });
}

export function useUpdateCredential() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      newValue,
    }: { name: string; newValue: string }) => {
      if (!actor) return;
      return actor.updateCredential(name, newValue);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["credentials"] }),
  });
}
