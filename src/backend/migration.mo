import List "mo:core/List";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";

module {
  // Old actor type (from previous version)
  type OldTaskHistoryEntry = {
    taskId : Nat;
    commandText : Text;
    timestamp : Time.Time;
    success : Bool;
  };

  type OldActor = {
    taskHistory : List.List<OldTaskHistoryEntry>;
    executionLogs : List.List<{
      stepName : Text;
      status : Text;
      timestamp : Time.Time;
      iconType : Text;
    }>;
    settings : ?{
      slackWebhookUrl : Text;
      googleSheetsId : Text;
      sheetTabName : Text;
    };
  };

  public func run(old : OldActor) : {
    taskHistory : List.List<{
      taskId : Nat;
      taskName : Text;
      commandText : Text;
      timestamp : Time.Time;
      success : Bool;
    }>;
    executionLogs : List.List<{
      stepName : Text;
      status : Text;
      timestamp : Time.Time;
      iconType : Text;
    }>;
    settings : ?{
      slackWebhookUrl : Text;
      googleSheetsId : Text;
      sheetTabName : Text;
    };
    scheduledTasks : List.List<{
      id : Nat;
      name : Text;
      command : Text;
      frequency : Text;
      enabled : Bool;
      nextRun : Time.Time;
    }>;
    savedAgents : List.List<{
      id : Nat;
      name : Text;
      command : Text;
      triggerCount : Nat;
      createdAt : Time.Time;
    }>;
    credentials : List.List<{
      name : Text;
      value : Text;
      service : Text;
    }>;
  } {
    let newTaskHistory = old.taskHistory.map<OldTaskHistoryEntry, { taskId : Nat; taskName : Text; commandText : Text; timestamp : Time.Time; success : Bool }>(
      func(oldEntry) {
        { oldEntry with taskName = "" }; // Default task name to empty string for migrated entries.
      }
    );
    {
      old with
      taskHistory = newTaskHistory;
      scheduledTasks = List.empty<{ id : Nat; name : Text; command : Text; frequency : Text; enabled : Bool; nextRun : Time.Time }>();
      savedAgents = List.empty<{ id : Nat; name : Text; command : Text; triggerCount : Nat; createdAt : Time.Time }>();
      credentials = List.empty<{ name : Text; value : Text; service : Text }>();
    };
  };
};
