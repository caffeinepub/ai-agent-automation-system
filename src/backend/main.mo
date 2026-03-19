import List "mo:core/List";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Existing Types
  type TaskHistoryEntry = {
    taskId : Nat;
    taskName : Text;
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

  // New Types
  type ScheduledTask = {
    id : Nat;
    name : Text;
    command : Text;
    frequency : Text; // "daily"/"weekly"
    enabled : Bool;
    nextRun : Time.Time;
  };

  type SavedAgent = {
    id : Nat;
    name : Text;
    command : Text;
    triggerCount : Nat;
    createdAt : Time.Time;
  };

  type Credential = {
    name : Text;
    value : Text;
    service : Text;
  };

  type AnalyticsSummary = {
    totalTasks : Nat;
    successCount : Nat;
    failureCount : Nat;
    mostUsedCommands : [Text];
  };

  module TaskHistoryEntry {
    public func compare(a : TaskHistoryEntry, b : TaskHistoryEntry) : Order.Order {
      Text.compare(a.commandText, b.commandText);
    };
  };

  module ScheduledTask {
    public func compare(a : ScheduledTask, b : ScheduledTask) : Order.Order {
      Text.compare(a.name, b.name);
    };
  };

  module SavedAgent {
    public func compare(a : SavedAgent, b : SavedAgent) : Order.Order {
      Text.compare(a.name, b.name);
    };
  };

  module Credential {
    public func compare(a : Credential, b : Credential) : Order.Order {
      Text.compare(a.name, b.name);
    };
  };

  // Existing Storage
  let taskHistory = List.empty<TaskHistoryEntry>();
  let executionLogs = List.empty<ExecutionLogEntry>();
  var settings : ?Settings = null;

  // New Storage
  let scheduledTasks = List.empty<ScheduledTask>();
  let savedAgents = List.empty<SavedAgent>();
  let credentials = List.empty<Credential>();

  // Existing Methods
  public shared ({ caller }) func addTaskHistory(taskId : Nat, taskName : Text, commandText : Text, success : Bool) : async () {
    let entry = {
      taskId;
      taskName;
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

  // Getters
  public query ({ caller }) func getTaskHistory() : async [TaskHistoryEntry] {
    taskHistory.toArray().sort();
  };

  public query ({ caller }) func getExecutionLogs() : async [ExecutionLogEntry] {
    executionLogs.toArray();
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

  // Scheduled Tasks CRUD
  public shared ({ caller }) func addScheduledTask(id : Nat, name : Text, command : Text, frequency : Text, nextRun : Time.Time) : async () {
    let newTask = {
      id;
      name;
      command;
      frequency;
      enabled = true;
      nextRun;
    };
    scheduledTasks.add(newTask);
  };

  public query ({ caller }) func getScheduledTasks() : async [ScheduledTask] {
    scheduledTasks.toArray().sort();
  };

  public query ({ caller }) func getScheduledTaskById(id : Nat) : async ?ScheduledTask {
    scheduledTasks.toArray().find(func(task) { task.id == id });
  };

  public shared ({ caller }) func updateScheduledTask(id : Nat, updatedTask : ScheduledTask) : async () {
    let filteredTasks = scheduledTasks.values().filter(func(task) { task.id != id });
    scheduledTasks.clear();
    for (task in filteredTasks) {
      scheduledTasks.add(task);
    };
    scheduledTasks.add(updatedTask);
  };

  public shared ({ caller }) func deleteScheduledTask(id : Nat) : async () {
    let filteredTasks = scheduledTasks.values().filter(func(task) { task.id != id });
    scheduledTasks.clear();
    for (task in filteredTasks) {
      scheduledTasks.add(task);
    };
  };

  // Saved Agents CRUD
  public shared ({ caller }) func addSavedAgent(id : Nat, name : Text, command : Text) : async () {
    let newAgent = {
      id;
      name;
      command;
      triggerCount = 0;
      createdAt = Time.now();
    };
    savedAgents.add(newAgent);
  };

  public query ({ caller }) func getSavedAgents() : async [SavedAgent] {
    savedAgents.toArray().sort();
  };

  public query ({ caller }) func getSavedAgentById(id : Nat) : async ?SavedAgent {
    savedAgents.toArray().find(func(agent) { agent.id == id });
  };

  public shared ({ caller }) func updateSavedAgent(id : Nat, updatedAgent : SavedAgent) : async () {
    let updatedAgents = savedAgents.toArray().map(
      func(agent) {
        if (agent.id == id) { updatedAgent } else { agent };
      }
    );
    savedAgents.clear();
    for (agent in updatedAgents.values()) {
      savedAgents.add(agent);
    };
  };

  public shared ({ caller }) func deleteSavedAgent(id : Nat) : async () {
    let filteredAgents = savedAgents.values().filter(func(agent) { agent.id != id });
    savedAgents.clear();
    for (agent in filteredAgents) {
      savedAgents.add(agent);
    };
  };

  // Credentials CRUD
  public shared ({ caller }) func addCredential(name : Text, value : Text, service : Text) : async () {
    let credential = {
      name;
      value;
      service;
    };
    credentials.add(credential);
  };

  public query ({ caller }) func getCredentials() : async [Credential] {
    credentials.toArray().sort();
  };

  public query ({ caller }) func getCredentialByName(name : Text) : async ?Credential {
    credentials.toArray().find(func(cred) { cred.name == name });
  };

  public shared ({ caller }) func updateCredential(name : Text, newValue : Text) : async () {
    let updatedCredentials = credentials.toArray().map(
      func(cred) {
        if (cred.name == name) { { name = cred.name; value = newValue; service = cred.service } } else {
          cred;
        };
      }
    );
    credentials.clear();
    for (cred in updatedCredentials.values()) {
      credentials.add(cred);
    };
  };

  public shared ({ caller }) func deleteCredential(name : Text) : async () {
    let filteredCredentials = credentials.values().filter(func(cred) { cred.name != name });
    credentials.clear();
    for (cred in filteredCredentials) {
      credentials.add(cred);
    };
  };

  // Analytics
  public query ({ caller }) func getAnalyticsSummary() : async AnalyticsSummary {
    let totalTasks = taskHistory.size();
    var successCount = 0;
    var failureCount = 0;

    // Command usage count
    let commandUsage = taskHistory.toArray();
    var mostUsedCommands : [Text] = [];

    for (entry in commandUsage.values()) {
      if (entry.success) {
        successCount += 1;
      } else {
        failureCount += 1;
      };

      // Find most used commands based on frequency
      if (commandUsage.find(func(e) { e.commandText == entry.commandText }) != null) {
        mostUsedCommands := mostUsedCommands.concat([entry.commandText]);
      };
    };

    {
      totalTasks;
      successCount;
      failureCount;
      mostUsedCommands;
    };
  };
};
