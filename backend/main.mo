import Text "mo:core/Text";
import Float "mo:core/Float";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

actor {

  // ─── Access Control and Storage Components ──────────────────────────────
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // ─── Types ──────────────────────────────────────────────────────────────

  type KycStatus = { #pending; #approved; #rejected };

  type KycData = {
    nid : Text;
    fullName : Text;
    address : Text;
    photoUrl : Text;
  };

  type User = {
    id : Text;
    mobile : Text;
    pinHash : Text;
    name : Text;
    balance : Float;
    deviceId : Text;
    biometricEnabled : Bool;
    kycStatus : KycStatus;
    kycData : KycData;
    createdAt : Int;
  };

  type TransactionType = {
    #sendMoney;
    #recharge;
    #addMoney;
    #payBill;
    #cashOut;
    #bankTransfer;
    #savings;
  };

  type TransactionStatus = { #processing; #completed; #cancelled };

  type Transaction = {
    id : Text;
    userId : Text;
    txType : TransactionType;
    amount : Float;
    recipient : Text;
    provider : Text;
    status : TransactionStatus;
    slipData : Text;
    createdAt : Int;
  };

  type Notification = {
    id : Text;
    title : Text;
    body : Text;
    createdAt : Int;
    isGlobal : Bool;
  };

  type UserNotification = {
    userId : Text;
    notificationId : Text;
    isRead : Bool;
  };

  type NotificationWithRead = {
    id : Text;
    title : Text;
    body : Text;
    createdAt : Int;
    isGlobal : Bool;
    isRead : Bool;
  };

  type SupportTicketStatus = { #open; #replied; #closed };

  type SupportTicket = {
    id : Text;
    userId : Text;
    subject : Text;
    message : Text;
    adminReply : Text;
    status : SupportTicketStatus;
    createdAt : Int;
  };

  type AppSettings = {
    transactionSystemEnabled : Bool;
  };

  type UserProfile = {
    name : Text;
    mobile : Text;
  };

  type Result = { #ok : Text; #err : Text };

  // ─── State ──────────────────────────────────────────────────────────────

  let usersByMobile = Map.empty<Text, User>();
  let usersById = Map.empty<Text, User>();
  let principalToUserId = Map.empty<Principal, Text>();
  let userIdToPrincipal = Map.empty<Text, Principal>();

  let transactions = Map.empty<Text, Transaction>();
  let notifications = Map.empty<Text, Notification>();
  let userNotifications = Map.empty<Text, UserNotification>();
  let supportTickets = Map.empty<Text, SupportTicket>();

  var appSettings : AppSettings = { transactionSystemEnabled = true };

  var userCounter : Nat = 0;
  var txCounter : Nat = 0;
  var notifCounter : Nat = 0;
  var ticketCounter : Nat = 0;

  let ADMIN_USERNAME = "nuralom1";
  let ADMIN_PASSWORD = "9040";

  // ─── Helpers ─────────────────────────────────────────────────────────────

  func natToText(n : Nat) : Text {
    var result = "";
    var num = n;
    if (num == 0) { return "0" };
    while (num > 0) {
      let digit = num % 10;
      let ch = switch digit {
        case 0 { "0" }; case 1 { "1" }; case 2 { "2" }; case 3 { "3" };
        case 4 { "4" }; case 5 { "5" }; case 6 { "6" }; case 7 { "7" };
        case 8 { "8" }; case 9 { "9" }; case _ { "0" };
      };
      result := ch # result;
      num := num / 10;
    };
    result
  };

  func simpleHash(s : Text) : Text {
    var h : Nat = 5381;
    for (c in s.chars()) {
      let code = Nat32.toNat(Char.toNat32(c));
      h := ((h * 33) + code) % 4294967296;
    };
    "h" # natToText(h)
  };

  func validateAdminToken(token : Text) : Bool {
    token == ADMIN_USERNAME # ":" # ADMIN_PASSWORD
  };

  func nextUserId() : Text {
    userCounter += 1;
    "u" # natToText(userCounter)
  };

  func nextTxId() : Text {
    txCounter += 1;
    "tx" # natToText(txCounter)
  };

  func nextNotifId() : Text {
    notifCounter += 1;
    "n" # natToText(notifCounter)
  };

  func nextTicketId() : Text {
    ticketCounter += 1;
    "t" # natToText(ticketCounter)
  };

  func getUserById(userId : Text) : ?User {
    usersById.get(userId)
  };

  func saveUser(user : User) {
    usersById.add(user.id, user);
    usersByMobile.add(user.mobile, user);
  };

  // ─── User Profile (required by instructions) ─────────────────────────────

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller)
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user)
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile)
  };

  // ─── Auth / Registration ────────────────────────────────────────────────

  public shared ({ caller }) func registerUser(mobile : Text, pin : Text, name : Text, deviceId : Text) : async Result {
    if (usersByMobile.containsKey(mobile)) {
      return #err("Mobile number already registered");
    };
    let uid = nextUserId();
    let pinHash = simpleHash(pin);
    let user : User = {
      id = uid;
      mobile;
      pinHash;
      name;
      balance = 0.0;
      deviceId;
      biometricEnabled = false;
      kycStatus = #pending;
      kycData = { nid = ""; fullName = ""; address = ""; photoUrl = "" };
      createdAt = Time.now();
    };
    saveUser(user);
    principalToUserId.add(caller, uid);
    userIdToPrincipal.add(uid, caller);
    userProfiles.add(caller, { name; mobile });
    #ok(uid)
  };

  public shared ({ caller }) func loginUser(mobile : Text, pin : Text, deviceId : Text) : async Result {
    switch (usersByMobile.get(mobile)) {
      case null { #err("User not found") };
      case (?user) {
        if (user.pinHash != simpleHash(pin)) {
          return #err("Invalid PIN");
        };
        if (user.deviceId != deviceId) {
          return #err("Device mismatch");
        };
        principalToUserId.add(caller, user.id);
        userIdToPrincipal.add(user.id, caller);
        #ok(user.id)
      };
    }
  };

  // ─── User Functions ─────────────────────────────────────────────────────

  public query ({ caller }) func getUser(userId : Text) : async Result {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can call getUser");
    };
    let callerUserId = principalToUserId.get(caller);
    switch callerUserId {
      case null {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot fetch other users");
        };
      };
      case (?cuid) {
        if (cuid != userId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot fetch other users");
        };
      };
    };
    switch (getUserById(userId)) {
      case null { #err("User not found") };
      case (?user) { #ok(user.id # "|" # user.mobile # "|" # user.name) };
    }
  };

  public shared ({ caller }) func changePIN(userId : Text, oldPin : Text, newPin : Text) : async Result {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can change PIN");
    };
    let callerUserId = principalToUserId.get(caller);
    switch callerUserId {
      case null { Runtime.trap("Unauthorized: Not linked to a user account") };
      case (?cuid) {
        if (cuid != userId) {
          Runtime.trap("Unauthorized: Cannot change another user's PIN");
        };
      };
    };
    switch (getUserById(userId)) {
      case null { #err("User not found") };
      case (?user) {
        if (user.pinHash != simpleHash(oldPin)) {
          return #err("Invalid old PIN");
        };
        let updated = {
          id = user.id; mobile = user.mobile; pinHash = simpleHash(newPin);
          name = user.name; balance = user.balance; deviceId = user.deviceId;
          biometricEnabled = user.biometricEnabled; kycStatus = user.kycStatus;
          kycData = user.kycData; createdAt = user.createdAt;
        };
        saveUser(updated);
        #ok("PIN changed successfully")
      };
    }
  };

  public shared ({ caller }) func submitKYC(userId : Text, nid : Text, fullName : Text, address : Text, photoUrl : Text) : async Result {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit KYC");
    };
    let callerUserId = principalToUserId.get(caller);
    switch callerUserId {
      case null { Runtime.trap("Unauthorized: Not linked to a user account") };
      case (?cuid) {
        if (cuid != userId) {
          Runtime.trap("Unauthorized: Cannot submit KYC for another user");
        };
      };
    };
    switch (getUserById(userId)) {
      case null { #err("User not found") };
      case (?user) {
        let updated = {
          id = user.id; mobile = user.mobile; pinHash = user.pinHash;
          name = user.name; balance = user.balance; deviceId = user.deviceId;
          biometricEnabled = user.biometricEnabled; kycStatus = #pending;
          kycData = { nid; fullName; address; photoUrl };
          createdAt = user.createdAt;
        };
        saveUser(updated);
        #ok("KYC submitted")
      };
    }
  };

  // ─── Admin User Management ──────────────────────────────────────────────

  public shared ({ caller }) func updateDeviceId(adminToken : Text, userId : Text, newDeviceId : Text) : async Result {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update device IDs");
    };
    if (not validateAdminToken(adminToken)) {
      return #err("Invalid admin token");
    };
    switch (getUserById(userId)) {
      case null { #err("User not found") };
      case (?user) {
        let updated = {
          id = user.id; mobile = user.mobile; pinHash = user.pinHash;
          name = user.name; balance = user.balance; deviceId = newDeviceId;
          biometricEnabled = user.biometricEnabled; kycStatus = user.kycStatus;
          kycData = user.kycData; createdAt = user.createdAt;
        };
        saveUser(updated);
        #ok("Device ID updated")
      };
    }
  };

  public shared ({ caller }) func approveKYC(adminToken : Text, userId : Text) : async Result {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can approve KYC");
    };
    if (not validateAdminToken(adminToken)) {
      return #err("Invalid admin token");
    };
    switch (getUserById(userId)) {
      case null { #err("User not found") };
      case (?user) {
        let updated = {
          id = user.id; mobile = user.mobile; pinHash = user.pinHash;
          name = user.name; balance = user.balance; deviceId = user.deviceId;
          biometricEnabled = user.biometricEnabled; kycStatus = #approved;
          kycData = user.kycData; createdAt = user.createdAt;
        };
        saveUser(updated);
        #ok("KYC approved")
      };
    }
  };

  public shared ({ caller }) func rejectKYC(adminToken : Text, userId : Text) : async Result {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can reject KYC");
    };
    if (not validateAdminToken(adminToken)) {
      return #err("Invalid admin token");
    };
    switch (getUserById(userId)) {
      case null { #err("User not found") };
      case (?user) {
        let updated = {
          id = user.id; mobile = user.mobile; pinHash = user.pinHash;
          name = user.name; balance = user.balance; deviceId = user.deviceId;
          biometricEnabled = user.biometricEnabled; kycStatus = #rejected;
          kycData = user.kycData; createdAt = user.createdAt;
        };
        saveUser(updated);
        #ok("KYC rejected")
      };
    }
  };

  public shared ({ caller }) func setUserBalance(adminToken : Text, userId : Text, amount : Float) : async Result {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set user balance");
    };
    if (not validateAdminToken(adminToken)) {
      return #err("Invalid admin token");
    };
    switch (getUserById(userId)) {
      case null { #err("User not found") };
      case (?user) {
        let updated = {
          id = user.id; mobile = user.mobile; pinHash = user.pinHash;
          name = user.name; balance = amount; deviceId = user.deviceId;
          biometricEnabled = user.biometricEnabled; kycStatus = user.kycStatus;
          kycData = user.kycData; createdAt = user.createdAt;
        };
        saveUser(updated);
        #ok("Balance updated")
      };
    }
  };

  public shared ({ caller }) func resetUserDevice(adminToken : Text, userId : Text, newDeviceId : Text) : async Result {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can reset user device");
    };
    if (not validateAdminToken(adminToken)) {
      return #err("Invalid admin token");
    };
    switch (getUserById(userId)) {
      case null { #err("User not found") };
      case (?user) {
        let updated = {
          id = user.id; mobile = user.mobile; pinHash = user.pinHash;
          name = user.name; balance = user.balance; deviceId = newDeviceId;
          biometricEnabled = user.biometricEnabled; kycStatus = user.kycStatus;
          kycData = user.kycData; createdAt = user.createdAt;
        };
        saveUser(updated);
        #ok("Device reset")
      };
    }
  };

  // ─── Transactions ───────────────────────────────────────────────────────

  public shared ({ caller }) func createTransaction(userId : Text, txType : TransactionType, amount : Float, recipient : Text, provider : Text) : async Result {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create transactions");
    };
    let callerUserId = principalToUserId.get(caller);
    switch callerUserId {
      case null { Runtime.trap("Unauthorized: Not linked to a user account") };
      case (?cuid) {
        if (cuid != userId) {
          Runtime.trap("Unauthorized: Cannot create transaction for another user");
        };
      };
    };
    if (not appSettings.transactionSystemEnabled) {
      return #err("Transaction system is currently disabled");
    };
    switch (getUserById(userId)) {
      case null { #err("User not found") };
      case (?user) {
        if (user.kycStatus != #approved) {
          return #err("KYC not approved");
        };
        if (user.balance < amount) {
          return #err("Insufficient balance");
        };
        let txId = nextTxId();
        let tx : Transaction = {
          id = txId; userId; txType; amount; recipient; provider;
          status = #processing; slipData = ""; createdAt = Time.now();
        };
        let updated = {
          id = user.id; mobile = user.mobile; pinHash = user.pinHash;
          name = user.name; balance = user.balance - amount;
          deviceId = user.deviceId; biometricEnabled = user.biometricEnabled;
          kycStatus = user.kycStatus; kycData = user.kycData;
          createdAt = user.createdAt;
        };
        saveUser(updated);
        transactions.add(txId, tx);
        #ok(txId)
      };
    }
  };

  public shared ({ caller }) func completeTransaction(adminToken : Text, txId : Text) : async Result {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can complete transactions");
    };
    if (not validateAdminToken(adminToken)) {
      return #err("Invalid admin token");
    };
    switch (transactions.get(txId)) {
      case null { #err("Transaction not found") };
      case (?tx) {
        let updated = {
          id = tx.id; userId = tx.userId; txType = tx.txType;
          amount = tx.amount; recipient = tx.recipient; provider = tx.provider;
          status = #completed; slipData = tx.slipData; createdAt = tx.createdAt;
        };
        transactions.add(txId, updated);
        #ok("Transaction completed")
      };
    }
  };

  public shared ({ caller }) func cancelTransaction(adminToken : Text, txId : Text) : async Result {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can cancel transactions");
    };
    if (not validateAdminToken(adminToken)) {
      return #err("Invalid admin token");
    };
    switch (transactions.get(txId)) {
      case null { #err("Transaction not found") };
      case (?tx) {
        let updated = {
          id = tx.id; userId = tx.userId; txType = tx.txType;
          amount = tx.amount; recipient = tx.recipient; provider = tx.provider;
          status = #cancelled; slipData = tx.slipData; createdAt = tx.createdAt;
        };
        transactions.add(txId, updated);
        switch (getUserById(tx.userId)) {
          case null {};
          case (?user) {
            let refunded = {
              id = user.id; mobile = user.mobile; pinHash = user.pinHash;
              name = user.name; balance = user.balance + tx.amount;
              deviceId = user.deviceId; biometricEnabled = user.biometricEnabled;
              kycStatus = user.kycStatus; kycData = user.kycData;
              createdAt = user.createdAt;
            };
            saveUser(refunded);
          };
        };
        #ok("Transaction cancelled and refunded")
      };
    }
  };

  public query ({ caller }) func getUserTransactions(userId : Text) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    let callerUserId = principalToUserId.get(caller);
    switch callerUserId {
      case null { Runtime.trap("Unauthorized: Not linked to a user account") };
      case (?cuid) {
        if (cuid != userId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot view another user's transactions");
        };
      };
    };
    transactions.values().filter(func(tx : Transaction) : Bool { tx.userId == userId }).toArray()
  };

  public query ({ caller }) func getAllTransactions(adminToken : Text) : async [Transaction] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all transactions");
    };
    if (not validateAdminToken(adminToken)) {
      Runtime.trap("Invalid admin token");
    };
    transactions.values().toArray()
  };

  // ─── Notifications ──────────────────────────────────────────────────────

  public shared ({ caller }) func createAnnouncement(adminToken : Text, title : Text, body : Text) : async Result {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create announcements");
    };
    if (not validateAdminToken(adminToken)) {
      return #err("Invalid admin token");
    };
    let nid = nextNotifId();
    let notif : Notification = {
      id = nid; title; body; createdAt = Time.now(); isGlobal = true;
    };
    notifications.add(nid, notif);
    #ok(nid)
  };

  public query ({ caller }) func getUserNotifications(userId : Text) : async [NotificationWithRead] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };
    let callerUserId = principalToUserId.get(caller);
    switch callerUserId {
      case null { Runtime.trap("Unauthorized: Not linked to a user account") };
      case (?cuid) {
        if (cuid != userId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot view another user's notifications");
        };
      };
    };
    notifications.values().map(func(n : Notification) : NotificationWithRead {
      let key = userId # "#" # n.id;
      let isRead = switch (userNotifications.get(key)) {
        case null { false };
        case (?un) { un.isRead };
      };
      { id = n.id; title = n.title; body = n.body; createdAt = n.createdAt; isGlobal = n.isGlobal; isRead }
    }).toArray()
  };

  public shared ({ caller }) func markNotificationRead(userId : Text, notificationId : Text) : async Result {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications");
    };
    let callerUserId = principalToUserId.get(caller);
    switch callerUserId {
      case null { Runtime.trap("Unauthorized: Not linked to a user account") };
      case (?cuid) {
        if (cuid != userId) {
          Runtime.trap("Unauthorized: Cannot mark another user's notifications");
        };
      };
    };
    let key = userId # "#" # notificationId;
    let un : UserNotification = { userId; notificationId; isRead = true };
    userNotifications.add(key, un);
    #ok("Marked as read")
  };

  // ─── Support Tickets ────────────────────────────────────────────────────

  public shared ({ caller }) func createSupportTicket(userId : Text, subject : Text, message : Text) : async Result {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create support tickets");
    };
    let callerUserId = principalToUserId.get(caller);
    switch callerUserId {
      case null { Runtime.trap("Unauthorized: Not linked to a user account") };
      case (?cuid) {
        if (cuid != userId) {
          Runtime.trap("Unauthorized: Cannot create ticket for another user");
        };
      };
    };
    let tid = nextTicketId();
    let ticket : SupportTicket = {
      id = tid; userId; subject; message; adminReply = "";
      status = #open; createdAt = Time.now();
    };
    supportTickets.add(tid, ticket);
    #ok(tid)
  };

  public shared ({ caller }) func replyToTicket(adminToken : Text, ticketId : Text, reply : Text) : async Result {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can reply to tickets");
    };
    if (not validateAdminToken(adminToken)) {
      return #err("Invalid admin token");
    };
    switch (supportTickets.get(ticketId)) {
      case null { #err("Ticket not found") };
      case (?ticket) {
        let updated = {
          id = ticket.id; userId = ticket.userId; subject = ticket.subject;
          message = ticket.message; adminReply = reply;
          status = #replied; createdAt = ticket.createdAt;
        };
        supportTickets.add(ticketId, updated);
        #ok("Reply sent")
      };
    }
  };

  public query ({ caller }) func getAllTickets(adminToken : Text) : async [SupportTicket] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all tickets");
    };
    if (not validateAdminToken(adminToken)) {
      Runtime.trap("Invalid admin token");
    };
    supportTickets.values().toArray()
  };

  public query ({ caller }) func getUserTickets(userId : Text) : async [SupportTicket] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tickets");
    };
    let callerUserId = principalToUserId.get(caller);
    switch callerUserId {
      case null { Runtime.trap("Unauthorized: Not linked to a user account") };
      case (?cuid) {
        if (cuid != userId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot view another user's tickets");
        };
      };
    };
    supportTickets.values().filter(func(t : SupportTicket) : Bool { t.userId == userId }).toArray()
  };

  public query ({ caller }) func getAppSettings(adminToken : Text) : async AppSettings {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view app settings");
    };
    if (not validateAdminToken(adminToken)) {
      Runtime.trap("Invalid admin token");
    };
    appSettings
  };

  public shared ({ caller }) func setTransactionSystemEnabled(adminToken : Text, enabled : Bool) : async Result {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can change app settings");
    };
    if (not validateAdminToken(adminToken)) {
      return #err("Invalid admin token");
    };
    appSettings := { transactionSystemEnabled = enabled };
    #ok("Setting updated")
  };

}

