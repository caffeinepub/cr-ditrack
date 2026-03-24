import Text "mo:core/Text";
import Float "mo:core/Float";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";

actor {

  // ========== LEGACY STABLE VARS (kept for upgrade compatibility) ==========

  type OldUserProfile = { name : Text };
  type OldTxStatus = { #pending; #paid; #overdue };
  type OldTransaction = {
    id : Text;
    clientName : Text;
    amount : Float;
    product : Text;
    transactionDate : Text;
    reminderDate : Text;
    status : OldTxStatus;
    createdAt : Int;
  };

  let accessControlState = AccessControl.initState();
  let userProfiles = Map.empty<Principal, OldUserProfile>();
  let transactions = Map.empty<Text, OldTransaction>();

  // ========== NEW TYPES ==========

  public type Boutique = {
    id : Text;
    nom : Text;
    codeAcces : Text;
    proprietaire : Text;
    ville : Text;
    active : Bool;
    premium : Bool;
    createdAt : Int;
  };

  public type Client = {
    id : Text;
    storeId : Text;
    nom : Text;
    telephone : Text;
    quartier : Text;
    createdAt : Int;
  };

  public type Dette = {
    id : Text;
    clientId : Text;
    storeId : Text;
    montant : Float;
    description : Text;
    date : Text;
    photoUrl : Text;
    createdAt : Int;
  };

  public type Paiement = {
    id : Text;
    clientId : Text;
    storeId : Text;
    montant : Float;
    date : Text;
    createdAt : Int;
  };

  public type Rappel = {
    id : Text;
    storeId : Text;
    message : Text;
    dateHeure : Text;
    clientId : Text;
    active : Bool;
    createdAt : Int;
  };

  public type StoreNotif = {
    id : Text;
    storeId : Text;
    notifType : Text;
    message : Text;
    clientNom : Text;
    montant : Float;
    read : Bool;
    createdAt : Int;
  };

  public type AdminNotif = {
    id : Text;
    notifType : Text;
    message : Text;
    boutiqueId : Text;
    boutiqueNom : Text;
    read : Bool;
    createdAt : Int;
  };

  public type LoginResult = {
    #ok : { storeId : Text; nom : Text; premium : Bool };
    #notFound;
    #disabled;
  };

  public type AdminLoginResult = {
    #ok;
    #wrongPassword;
  };

  public type AddClientResult = {
    #ok;
    #limitReached;
  };

  public type AddBoutiqueResult = {
    #ok;
    #duplicateCode;
  };

  public type GlobalStats = {
    totalBoutiques : Int;
    totalBoutiquesActives : Int;
    totalClients : Int;
    totalArgentGere : Float;
  };

  public type StoreStats = {
    totalClients : Int;
    totalDettes : Float;
    totalPaiements : Float;
  };

  public type TransactionAdmin = {
    dette : Dette;
    clientNom : Text;
    boutiqueNom : Text;
  };

  // ========== STORAGE ==========

  let boutiques = Map.empty<Text, Boutique>();
  let clients = Map.empty<Text, Client>();
  let dettes = Map.empty<Text, Dette>();
  let paiements = Map.empty<Text, Paiement>();
  let rappels = Map.empty<Text, Rappel>();
  let storeNotifs = Map.empty<Text, StoreNotif>();
  let adminNotifs = Map.empty<Text, AdminNotif>();

  var adminEmail : Text = "tsoumouantony4@gmail.com";
  var adminPassword : Text = "Admin9999";

  // ========== BOUTIQUES ==========

  public query func loginBoutique(codeAcces : Text) : async LoginResult {
    let all = boutiques.values().toArray();
    for (b in all.values()) {
      if (b.codeAcces == codeAcces) {
        if (not b.active) { return #disabled };
        return #ok({ storeId = b.id; nom = b.nom; premium = b.premium });
      };
    };
    #notFound;
  };

  public query func getBoutiques() : async [Boutique] {
    boutiques.values().toArray();
  };

  public query func getBoutique(id : Text) : async ?Boutique {
    boutiques.get(id);
  };

  public shared func addBoutique(boutique : Boutique) : async AddBoutiqueResult {
    let all = boutiques.values().toArray();
    for (b in all.values()) {
      if (b.codeAcces == boutique.codeAcces) { return #duplicateCode };
    };
    boutiques.add(boutique.id, { boutique with createdAt = Time.now() });
    #ok;
  };

  public shared func updateBoutiqueStatus(id : Text, active : Bool) : async () {
    switch (boutiques.get(id)) {
      case null { Runtime.trap("Boutique non trouvee") };
      case (?b) { boutiques.add(id, { b with active }) };
    };
  };

  public shared func updateBoutiquePremium(id : Text, premium : Bool) : async () {
    switch (boutiques.get(id)) {
      case null { Runtime.trap("Boutique non trouvee") };
      case (?b) { boutiques.add(id, { b with premium }) };
    };
  };

  public shared func deleteBoutique(id : Text) : async () {
    boutiques.remove(id);
  };

  // ========== CLIENTS ==========

  public query func getClients(storeId : Text) : async [Client] {
    clients.values().toArray().filter(func(c : Client) : Bool { c.storeId == storeId });
  };

  public query func getClient(id : Text) : async ?Client {
    clients.get(id);
  };

  public shared func addClient(client : Client) : async AddClientResult {
    switch (boutiques.get(client.storeId)) {
      case null { Runtime.trap("Boutique non trouvee") };
      case (?b) {
        if (not b.premium) {
          let count = clients.values().toArray().filter(
            func(c : Client) : Bool { c.storeId == client.storeId }
          ).size();
          if (count >= 10) { return #limitReached };
        };
      };
    };
    clients.add(client.id, { client with createdAt = Time.now() });
    #ok;
  };

  public shared func updateClient(client : Client) : async () {
    clients.add(client.id, client);
  };

  public shared func deleteClient(id : Text) : async () {
    clients.remove(id);
    let allDettes = dettes.values().toArray();
    for (d in allDettes.values()) {
      if (d.clientId == id) { dettes.remove(d.id) };
    };
    let allPaiements = paiements.values().toArray();
    for (p in allPaiements.values()) {
      if (p.clientId == id) { paiements.remove(p.id) };
    };
  };

  // ========== DETTES ==========

  public query func getDettes(clientId : Text) : async [Dette] {
    dettes.values().toArray().filter(func(d : Dette) : Bool { d.clientId == clientId });
  };

  public query func getDettesParStore(storeId : Text) : async [Dette] {
    dettes.values().toArray().filter(func(d : Dette) : Bool { d.storeId == storeId });
  };

  public shared func addDette(dette : Dette) : async () {
    dettes.add(dette.id, { dette with createdAt = Time.now() });
  };

  public shared func deleteDette(id : Text) : async () {
    dettes.remove(id);
  };

  // ========== PAIEMENTS ==========

  public query func getPaiements(clientId : Text) : async [Paiement] {
    paiements.values().toArray().filter(func(p : Paiement) : Bool { p.clientId == clientId });
  };

  // Fetch all payments for a store in one call (fixes N+1 query problem)
  public query func getPaiementsParStore(storeId : Text) : async [Paiement] {
    paiements.values().toArray().filter(func(p : Paiement) : Bool { p.storeId == storeId });
  };

  public shared func addPaiement(paiement : Paiement) : async () {
    paiements.add(paiement.id, { paiement with createdAt = Time.now() });
  };

  public shared func deletePaiement(id : Text) : async () {
    paiements.remove(id);
  };

  // ========== RAPPELS ==========

  public query func getRappels(storeId : Text) : async [Rappel] {
    rappels.values().toArray().filter(func(r : Rappel) : Bool { r.storeId == storeId });
  };

  public shared func addRappel(rappel : Rappel) : async () {
    rappels.add(rappel.id, { rappel with createdAt = Time.now() });
  };

  public shared func deleteRappel(id : Text) : async () {
    rappels.remove(id);
  };

  // ========== STORE NOTIFICATIONS ==========

  public shared func addStoreNotif(notif : StoreNotif) : async () {
    storeNotifs.add(notif.id, { notif with createdAt = Time.now() });
  };

  public query func getStoreNotifs(storeId : Text) : async [StoreNotif] {
    storeNotifs.values().toArray().filter(func(n : StoreNotif) : Bool { n.storeId == storeId });
  };

  public shared func markStoreNotifsRead(storeId : Text) : async () {
    let toUpdate = storeNotifs.values().toArray().filter(func(n : StoreNotif) : Bool { n.storeId == storeId and not n.read });
    for (n in toUpdate.values()) {
      storeNotifs.add(n.id, { n with read = true });
    };
  };

  // ========== ADMIN NOTIFICATIONS ==========

  public shared func addAdminNotif(notif : AdminNotif) : async () {
    adminNotifs.add(notif.id, { notif with createdAt = Time.now() });
  };

  public query func getAdminNotifs() : async [AdminNotif] {
    adminNotifs.values().toArray();
  };

  public shared func markAdminNotifsRead() : async () {
    let toUpdate = adminNotifs.values().toArray().filter(func(n : AdminNotif) : Bool { not n.read });
    for (n in toUpdate.values()) {
      adminNotifs.add(n.id, { n with read = true });
    };
  };

  // ========== ADMIN ==========

  public query func loginAdmin(email : Text, password : Text) : async AdminLoginResult {
    if (email == adminEmail and password == adminPassword) { #ok }
    else { #wrongPassword };
  };

  public shared func updateAdminCredentials(email : Text, password : Text) : async () {
    adminEmail := email;
    adminPassword := password;
  };

  public query func getAdminEmail() : async Text { adminEmail };

  public query func getGlobalStats() : async GlobalStats {
    let allBoutiques = boutiques.values().toArray();
    let totalBoutiques = allBoutiques.size();
    var totalActives = 0;
    for (b in allBoutiques.values()) {
      if (b.active) { totalActives += 1 };
    };
    let totalClients = clients.size();
    var totalDettes : Float = 0.0;
    for (d in dettes.values()) { totalDettes += d.montant };
    var totalPayes : Float = 0.0;
    for (p in paiements.values()) { totalPayes += p.montant };
    var argent = totalDettes - totalPayes;
    if (argent < 0.0) { argent := 0.0 };
    { totalBoutiques; totalBoutiquesActives = totalActives; totalClients; totalArgentGere = argent };
  };

  public query func getStoreStats(storeId : Text) : async StoreStats {
    let storeClientsCount = clients.values().toArray().filter(
      func(c : Client) : Bool { c.storeId == storeId }
    ).size();
    var totalDettes : Float = 0.0;
    for (d in dettes.values()) {
      if (d.storeId == storeId) { totalDettes += d.montant };
    };
    var totalPaiements : Float = 0.0;
    for (p in paiements.values()) {
      if (p.storeId == storeId) { totalPaiements += p.montant };
    };
    { totalClients = storeClientsCount; totalDettes; totalPaiements };
  };

  public query func getAllTransactionsAdmin() : async [TransactionAdmin] {
    dettes.values().toArray().map(
      func(d : Dette) : TransactionAdmin {
        let clientNom = switch (clients.get(d.clientId)) {
          case null "Inconnu";
          case (?c) c.nom;
        };
        let boutiqueNom = switch (boutiques.get(d.storeId)) {
          case null "Inconnue";
          case (?b) b.nom;
        };
        { dette = d; clientNom; boutiqueNom };
      }
    );
  };
};
