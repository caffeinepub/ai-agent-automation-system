import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Array "mo:core/Array";

actor {
  type TaskHistoryEntry = {
    taskId : Nat;
    commandText : Text;
    timestamp : Time.Time;
    success : Bool;
  };

  type ExecutionLogEntry = {
    stepName : Text;
    status : Text;
    timestamp : Time.Time;
    iconType : Text;
  };

  type Settings = {
    slackWebhookUrl : Text;
    googleSheetsId : Text;
    sheetTabName : Text;
  };

  module TaskHistoryEntry {
    public func compare(a : TaskHistoryEntry, b : TaskHistoryEntry) : Order.Order {
      Text.compare(a.commandText, b.commandText);
    };
  };

  module ExecutionLogEntry {
    public func compare(a : ExecutionLogEntry, b : ExecutionLogEntry) : Order.Order {
      Text.compare(a.stepName, b.stepName);
    };
  };

  let taskHistory = List.empty<TaskHistoryEntry>();
  let executionLogs = List.empty<ExecutionLogEntry>();
  var settings : ?Settings = null;

  public shared ({ caller }) func addTaskHistory(taskId : Nat, commandText : Text, success : Bool) : async () {
    let entry = {
      taskId;
      commandText;
      timestamp = Time.now();
      success;
    };
    taskHistory.add(entry);
  };

  public shared ({ caller }) func addExecutionLog(stepName : Text, status : Text, iconType : Text) : async () {
    let entry = {
      stepName;
      status;
      timestamp = Time.now();
      iconType;
    };
    executionLogs.add(entry);
  };

  public shared ({ caller }) func clearTaskHistory() : async () {
    taskHistory.clear();
  };

  public shared ({ caller }) func clearExecutionLogs() : async () {
    executionLogs.clear();
  };

  public shared ({ caller }) func updateSettings(newSettings : Settings) : async () {
    settings := ?newSettings;
  };

  public query ({ caller }) func getTaskHistory() : async [TaskHistoryEntry] {
    taskHistory.toArray().sort();
  };

  public query ({ caller }) func getExecutionLogs() : async [ExecutionLogEntry] {
    executionLogs.toArray().sort();
  };

  public query ({ caller }) func getSettings() : async ?Settings {
    settings;
  };

  public query ({ caller }) func getTaskById(taskId : Nat) : async TaskHistoryEntry {
    switch (taskHistory.values().find(func(entry) { entry.taskId == taskId })) {
      case (null) { Runtime.trap("No entry found for the given ID!") };
      case (?entry) { entry };
    };
  };

  public shared ({ caller }) func deleteTaskById(taskId : Nat) : async () {
    let filteredEntries = taskHistory.values().filter(func(entry) { entry.taskId != taskId });
    taskHistory.clear();
    for (entry in filteredEntries) {
      taskHistory.add(entry);
    };
  };
};
