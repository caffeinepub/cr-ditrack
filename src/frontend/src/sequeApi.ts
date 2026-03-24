import { Actor, HttpAgent } from "@icp-sdk/core/agent";
import { loadConfig } from "./config";
import { idlFactory } from "./declarations/backend.did";
import type {
  AddBoutiqueResult,
  AddClientResult,
  AdminLoginResult,
  AdminNotif,
  Boutique,
  Client,
  Dette,
  GlobalStats,
  LoginResult,
  Paiement,
  Rappel,
  StoreNotif,
  StoreStats,
  TransactionAdmin,
  _SERVICE,
} from "./declarations/backend.did.d.ts";

export type {
  Boutique,
  Client,
  Dette,
  Paiement,
  Rappel,
  StoreNotif,
  AdminNotif,
  LoginResult,
  AddClientResult,
  AddBoutiqueResult,
  AdminLoginResult,
  GlobalStats,
  StoreStats,
  TransactionAdmin,
};

let _actor: _SERVICE | null = null;

export async function getSequeActor(): Promise<_SERVICE> {
  if (_actor) return _actor;
  const config = await loadConfig();
  const agent = new HttpAgent({ host: config.backend_host });
  if (config.backend_host?.includes("localhost")) {
    await agent.fetchRootKey().catch(console.error);
  }
  _actor = Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId: config.backend_canister_id,
  });
  return _actor;
}

export const sequeApi = {
  // Boutiques
  async loginBoutique(codeAcces: string): Promise<LoginResult> {
    const actor = await getSequeActor();
    return actor.loginBoutique(codeAcces);
  },
  async getBoutiques(): Promise<Boutique[]> {
    const actor = await getSequeActor();
    return actor.getBoutiques();
  },
  async addBoutique(boutique: Boutique): Promise<AddBoutiqueResult> {
    const actor = await getSequeActor();
    return actor.addBoutique(boutique);
  },
  async updateBoutiqueStatus(id: string, active: boolean): Promise<void> {
    const actor = await getSequeActor();
    return actor.updateBoutiqueStatus(id, active);
  },
  async updateBoutiquePremium(id: string, premium: boolean): Promise<void> {
    const actor = await getSequeActor();
    return actor.updateBoutiquePremium(id, premium);
  },
  async deleteBoutique(id: string): Promise<void> {
    const actor = await getSequeActor();
    return actor.deleteBoutique(id);
  },

  // Clients
  async getClients(storeId: string): Promise<Client[]> {
    const actor = await getSequeActor();
    return actor.getClients(storeId);
  },
  async addClient(client: Client): Promise<AddClientResult> {
    const actor = await getSequeActor();
    return actor.addClient(client);
  },
  async updateClient(client: Client): Promise<void> {
    const actor = await getSequeActor();
    return actor.updateClient(client);
  },
  async deleteClient(id: string): Promise<void> {
    const actor = await getSequeActor();
    return actor.deleteClient(id);
  },

  // Dettes
  async getDettes(clientId: string): Promise<Dette[]> {
    const actor = await getSequeActor();
    return actor.getDettes(clientId);
  },
  async getDettesParStore(storeId: string): Promise<Dette[]> {
    const actor = await getSequeActor();
    return actor.getDettesParStore(storeId);
  },
  async addDette(dette: Dette): Promise<void> {
    const actor = await getSequeActor();
    return actor.addDette(dette);
  },
  async deleteDette(id: string): Promise<void> {
    const actor = await getSequeActor();
    return actor.deleteDette(id);
  },

  // Paiements
  async getPaiements(clientId: string): Promise<Paiement[]> {
    const actor = await getSequeActor();
    return actor.getPaiements(clientId);
  },
  async getPaiementsParStore(storeId: string): Promise<Paiement[]> {
    const actor = await getSequeActor();
    return actor.getPaiementsParStore(storeId);
  },
  async addPaiement(paiement: Paiement): Promise<void> {
    const actor = await getSequeActor();
    return actor.addPaiement(paiement);
  },
  async deletePaiement(id: string): Promise<void> {
    const actor = await getSequeActor();
    return actor.deletePaiement(id);
  },

  // Rappels
  async getRappels(storeId: string): Promise<Rappel[]> {
    const actor = await getSequeActor();
    return actor.getRappels(storeId);
  },
  async addRappel(rappel: Rappel): Promise<void> {
    const actor = await getSequeActor();
    return actor.addRappel(rappel);
  },
  async deleteRappel(id: string): Promise<void> {
    const actor = await getSequeActor();
    return actor.deleteRappel(id);
  },

  // Store Notifications
  async addStoreNotif(notif: StoreNotif): Promise<void> {
    const actor = await getSequeActor();
    return actor.addStoreNotif(notif);
  },
  async getStoreNotifs(storeId: string): Promise<StoreNotif[]> {
    const actor = await getSequeActor();
    return actor.getStoreNotifs(storeId);
  },
  async markStoreNotifsRead(storeId: string): Promise<void> {
    const actor = await getSequeActor();
    return actor.markStoreNotifsRead(storeId);
  },

  // Admin Notifications
  async addAdminNotif(notif: AdminNotif): Promise<void> {
    const actor = await getSequeActor();
    return actor.addAdminNotif(notif);
  },
  async getAdminNotifs(): Promise<AdminNotif[]> {
    const actor = await getSequeActor();
    return actor.getAdminNotifs();
  },
  async markAdminNotifsRead(): Promise<void> {
    const actor = await getSequeActor();
    return actor.markAdminNotifsRead();
  },

  // Admin
  async loginAdmin(email: string, password: string): Promise<AdminLoginResult> {
    const actor = await getSequeActor();
    return actor.loginAdmin(email, password);
  },
  async updateAdminCredentials(email: string, password: string): Promise<void> {
    const actor = await getSequeActor();
    return actor.updateAdminCredentials(email, password);
  },
  async getAdminEmail(): Promise<string> {
    const actor = await getSequeActor();
    return actor.getAdminEmail();
  },
  async getGlobalStats(): Promise<GlobalStats> {
    const actor = await getSequeActor();
    return actor.getGlobalStats();
  },
  async getStoreStats(storeId: string): Promise<StoreStats> {
    const actor = await getSequeActor();
    return actor.getStoreStats(storeId);
  },
  async getAllTransactionsAdmin(): Promise<TransactionAdmin[]> {
    const actor = await getSequeActor();
    return actor.getAllTransactionsAdmin();
  },
};
