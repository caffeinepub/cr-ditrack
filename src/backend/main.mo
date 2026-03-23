import Text "mo:core/Text";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Order "mo:core/Order";
import List "mo:core/List";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  module Transaction {
    public type Status = { #pending; #paid; #overdue };

    public func compare(t1 : Transaction, t2 : Transaction) : Order.Order {
      Text.compare(t1.clientName, t2.clientName);
    };
  };

  type Transaction = {
    id : Text;
    clientName : Text;
    amount : Float;
    product : Text;
    transactionDate : Text;
    reminderDate : Text;
    status : Transaction.Status;
    createdAt : Time.Time;
  };

  let transactions = Map.empty<Text, Transaction>();

  func getTransactionInternal(id : Text) : Transaction {
    switch (transactions.get(id)) {
      case (null) {
        Runtime.trap("Transaction not found");
      };
      case (?transaction) { transaction };
    };
  };

  public query ({ caller }) func getTransactionById(id : Text) : async Transaction {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    getTransactionInternal(id);
  };

  public query ({ caller }) func getAllTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    transactions.values().toArray().sort();
  };

  public query ({ caller }) func getTransactionsByClientName(clientName : Text) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    transactions.values().toList<Transaction>().filter(func(t) { t.clientName == clientName }).toArray();
  };

  public shared ({ caller }) func addTransaction(transaction : Transaction) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add transactions");
    };
    if (transactions.containsKey(transaction.id)) {
      Runtime.trap("Transaction is already tracked");
    };
    let newTransaction : Transaction = {
      transaction with
      status = #pending : Transaction.Status;
      createdAt = Time.now();
    };
    transactions.add(transaction.id, newTransaction);
  };

  public shared ({ caller }) func markTransactionAsPaid(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark transactions as paid");
    };
    let transaction = getTransactionInternal(id);
    let updatedTransaction : Transaction = {
      transaction with
      status = #paid;
    };
    transactions.add(id, updatedTransaction);
  };

  public shared ({ caller }) func deleteTransaction(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete transactions");
    };
    ignore getTransactionInternal(id);
    transactions.remove(id);
  };

  public query ({ caller }) func getTotalBalance() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view balance");
    };
    transactions.values().toList<Transaction>().filter(func(t) { t.status != #paid }).map(func(t) { t.amount }).foldLeft(0.0, Float.add);
  };

  public query ({ caller }) func getTotalTransactionsForClient(clientName : Text) : async Int {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view client totals");
    };
    transactions.values().toList<Transaction>().filter(func(t) { t.clientName == clientName }).foldLeft(0, func(sum, t) { sum + 1 });
  };
};
