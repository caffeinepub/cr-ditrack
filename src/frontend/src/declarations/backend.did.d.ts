/* eslint-disable */
// @ts-nocheck
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';

export interface Boutique {
  'id': string;
  'nom': string;
  'codeAcces': string;
  'proprietaire': string;
  'ville': string;
  'active': boolean;
  'premium': boolean;
  'createdAt': bigint;
}

export interface Client {
  'id': string;
  'storeId': string;
  'nom': string;
  'telephone': string;
  'quartier': string;
  'createdAt': bigint;
}

export interface Dette {
  'id': string;
  'clientId': string;
  'storeId': string;
  'montant': number;
  'description': string;
  'date': string;
  'photoUrl': string;
  'createdAt': bigint;
}

export interface Paiement {
  'id': string;
  'clientId': string;
  'storeId': string;
  'montant': number;
  'date': string;
  'createdAt': bigint;
}

export interface Rappel {
  'id': string;
  'storeId': string;
  'message': string;
  'dateHeure': string;
  'clientId': string;
  'active': boolean;
  'createdAt': bigint;
}

export type LoginResult =
  | { 'ok': { 'storeId': string; 'nom': string; 'premium': boolean } }
  | { 'notFound': null }
  | { 'disabled': null };

export type AdminLoginResult = { 'ok': null } | { 'wrongPassword': null };

export type AddClientResult = { 'ok': null } | { 'limitReached': null };

export type AddBoutiqueResult = { 'ok': null } | { 'duplicateCode': null };

export interface GlobalStats {
  'totalBoutiques': bigint;
  'totalBoutiquesActives': bigint;
  'totalClients': bigint;
  'totalArgentGere': number;
}

export interface StoreStats {
  'totalClients': bigint;
  'totalDettes': number;
  'totalPaiements': number;
}

export interface TransactionAdmin {
  'dette': Dette;
  'clientNom': string;
  'boutiqueNom': string;
}

export interface _SERVICE {
  'loginBoutique': ActorMethod<[string], LoginResult>;
  'getBoutiques': ActorMethod<[], Array<Boutique>>;
  'getBoutique': ActorMethod<[string], [] | [Boutique]>;
  'addBoutique': ActorMethod<[Boutique], AddBoutiqueResult>;
  'updateBoutiqueStatus': ActorMethod<[string, boolean], undefined>;
  'updateBoutiquePremium': ActorMethod<[string, boolean], undefined>;
  'deleteBoutique': ActorMethod<[string], undefined>;
  'getClients': ActorMethod<[string], Array<Client>>;
  'getClient': ActorMethod<[string], [] | [Client]>;
  'addClient': ActorMethod<[Client], AddClientResult>;
  'updateClient': ActorMethod<[Client], undefined>;
  'deleteClient': ActorMethod<[string], undefined>;
  'getDettes': ActorMethod<[string], Array<Dette>>;
  'getDettesParStore': ActorMethod<[string], Array<Dette>>;
  'addDette': ActorMethod<[Dette], undefined>;
  'deleteDette': ActorMethod<[string], undefined>;
  'getPaiements': ActorMethod<[string], Array<Paiement>>;
  'addPaiement': ActorMethod<[Paiement], undefined>;
  'deletePaiement': ActorMethod<[string], undefined>;
  'getRappels': ActorMethod<[string], Array<Rappel>>;
  'addRappel': ActorMethod<[Rappel], undefined>;
  'deleteRappel': ActorMethod<[string], undefined>;
  'loginAdmin': ActorMethod<[string, string], AdminLoginResult>;
  'updateAdminCredentials': ActorMethod<[string, string], undefined>;
  'getAdminEmail': ActorMethod<[], string>;
  'getGlobalStats': ActorMethod<[], GlobalStats>;
  'getStoreStats': ActorMethod<[string], StoreStats>;
  'getAllTransactionsAdmin': ActorMethod<[], Array<TransactionAdmin>>;
}

export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
