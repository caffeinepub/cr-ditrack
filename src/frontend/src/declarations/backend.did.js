// @ts-nocheck
export const idlFactory = ({ IDL }) => {
  const Boutique = IDL.Record({
    id: IDL.Text,
    nom: IDL.Text,
    codeAcces: IDL.Text,
    proprietaire: IDL.Text,
    ville: IDL.Text,
    active: IDL.Bool,
    premium: IDL.Bool,
    createdAt: IDL.Int,
  });
  const Client = IDL.Record({
    id: IDL.Text,
    storeId: IDL.Text,
    nom: IDL.Text,
    telephone: IDL.Text,
    quartier: IDL.Text,
    createdAt: IDL.Int,
  });
  const Dette = IDL.Record({
    id: IDL.Text,
    clientId: IDL.Text,
    storeId: IDL.Text,
    montant: IDL.Float64,
    description: IDL.Text,
    date: IDL.Text,
    photoUrl: IDL.Text,
    createdAt: IDL.Int,
  });
  const Paiement = IDL.Record({
    id: IDL.Text,
    clientId: IDL.Text,
    storeId: IDL.Text,
    montant: IDL.Float64,
    date: IDL.Text,
    createdAt: IDL.Int,
  });
  const Rappel = IDL.Record({
    id: IDL.Text,
    storeId: IDL.Text,
    message: IDL.Text,
    dateHeure: IDL.Text,
    clientId: IDL.Text,
    active: IDL.Bool,
    createdAt: IDL.Int,
  });
  const LoginResult = IDL.Variant({
    ok: IDL.Record({ storeId: IDL.Text, nom: IDL.Text, premium: IDL.Bool }),
    notFound: IDL.Null,
    disabled: IDL.Null,
  });
  const AdminLoginResult = IDL.Variant({ ok: IDL.Null, wrongPassword: IDL.Null });
  const AddClientResult = IDL.Variant({ ok: IDL.Null, limitReached: IDL.Null });
  const AddBoutiqueResult = IDL.Variant({ ok: IDL.Null, duplicateCode: IDL.Null });
  const GlobalStats = IDL.Record({
    totalBoutiques: IDL.Int,
    totalBoutiquesActives: IDL.Int,
    totalClients: IDL.Int,
    totalArgentGere: IDL.Float64,
  });
  const StoreStats = IDL.Record({
    totalClients: IDL.Int,
    totalDettes: IDL.Float64,
    totalPaiements: IDL.Float64,
  });
  const TransactionAdmin = IDL.Record({
    dette: Dette,
    clientNom: IDL.Text,
    boutiqueNom: IDL.Text,
  });
  return IDL.Service({
    loginBoutique: IDL.Func([IDL.Text], [LoginResult], ['query']),
    getBoutiques: IDL.Func([], [IDL.Vec(Boutique)], ['query']),
    getBoutique: IDL.Func([IDL.Text], [IDL.Opt(Boutique)], ['query']),
    addBoutique: IDL.Func([Boutique], [AddBoutiqueResult], []),
    updateBoutiqueStatus: IDL.Func([IDL.Text, IDL.Bool], [], []),
    updateBoutiquePremium: IDL.Func([IDL.Text, IDL.Bool], [], []),
    deleteBoutique: IDL.Func([IDL.Text], [], []),
    getClients: IDL.Func([IDL.Text], [IDL.Vec(Client)], ['query']),
    getClient: IDL.Func([IDL.Text], [IDL.Opt(Client)], ['query']),
    addClient: IDL.Func([Client], [AddClientResult], []),
    updateClient: IDL.Func([Client], [], []),
    deleteClient: IDL.Func([IDL.Text], [], []),
    getDettes: IDL.Func([IDL.Text], [IDL.Vec(Dette)], ['query']),
    getDettesParStore: IDL.Func([IDL.Text], [IDL.Vec(Dette)], ['query']),
    addDette: IDL.Func([Dette], [], []),
    deleteDette: IDL.Func([IDL.Text], [], []),
    getPaiements: IDL.Func([IDL.Text], [IDL.Vec(Paiement)], ['query']),
    addPaiement: IDL.Func([Paiement], [], []),
    deletePaiement: IDL.Func([IDL.Text], [], []),
    getRappels: IDL.Func([IDL.Text], [IDL.Vec(Rappel)], ['query']),
    addRappel: IDL.Func([Rappel], [], []),
    deleteRappel: IDL.Func([IDL.Text], [], []),
    loginAdmin: IDL.Func([IDL.Text, IDL.Text], [AdminLoginResult], ['query']),
    updateAdminCredentials: IDL.Func([IDL.Text, IDL.Text], [], []),
    getAdminEmail: IDL.Func([], [IDL.Text], ['query']),
    getGlobalStats: IDL.Func([], [GlobalStats], ['query']),
    getStoreStats: IDL.Func([IDL.Text], [StoreStats], ['query']),
    getAllTransactionsAdmin: IDL.Func([], [IDL.Vec(TransactionAdmin)], ['query']),
  });
};
export const init = ({ IDL }) => [];
