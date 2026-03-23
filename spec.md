# SÉQUÉ-APP — SÉQUÉ-CONTROL & Système d'abonnement

## Current State

L'application est un PWA entièrement basé sur localStorage (offline-first). Elle supporte deux rôles : Marchand et Gérant. L'interface est en français, couleurs Congo. Le backend Motoko existe avec authorization mais n'est pas utilisé par le frontend. Toutes les données (clients, transactions, rappels) sont stockées localement sur l'appareil.

## Requested Changes (Diff)

### Add
- **Rôle Admin** : Un 3ème bouton de connexion "Admin" sur la page de login, protégé par un PIN admin séparé ("9999" par défaut). Ce rôle accède exclusivement à l'interface SÉQUÉ-CONTROL.
- **Interface SÉQUÉ-CONTROL** : Tableau de bord admin complet :
  - Liste toutes les boutiques enregistrées (nom, quartier, nb transactions, statut abonnement, statut activation)
  - Montant total géré par SÉQUÉ-APP (somme de toutes les boutiques)
  - Bouton Activer/Désactiver par boutique (toggle)
  - Bouton Ajouter une boutique manuellement
  - Graphique de croissance du nombre de boutiques par semaine
- **Backend boutiques** : Motoko stocke les boutiques (nom, quartier, tier, activated, joinDate, transactionCount, totalAmount)
- **Système Paywall** :
  - Version Gratuite : max 10 clients, sauvegarde locale uniquement
  - Version Premium (Séqué-Cloud) : clients illimités, badge cloud
  - Quand free + 10 clients atteints : message paywall "Protégez vos données ! Activez le Cloud pour 2 500 FCFA/mois via Mobile Money."
  - État premium lu depuis localStorage (activé par admin via backend)
- **Enregistrement boutique** : Quand un Marchand se connecte et qu'une boutique est configurée, l'app tente d'enregistrer la boutique dans le backend (si en ligne)

### Modify
- LoginPage : Ajouter un 3ème bouton "Admin" avec PIN séparé
- useAuth : Ajouter rôle "admin" et PIN admin
- Dashboard : Vérifier la limite de 10 clients (mode free) et afficher le bandeau paywall si applicable
- AddClientModal : Bloquer l'ajout si free + ≥ 10 clients
- App.tsx : Ajouter route vers SÉQUÉ-CONTROL quand rôle = admin

### Remove
- Rien à supprimer

## Implementation Plan

1. **Backend** : Ajouter types Boutique et fonctions CRUD admin dans main.mo (registerBoutique, getBoutiques, toggleBoutiqueActivation, updateBoutiqueStats, getGlobalStats)
2. **useSubscription hook** : Gère l'état premium/free depuis localStorage (`seque_subscription`), expose `isPremium`, `clientLimit`, `showPaywall`
3. **useBoutiqueRegistry hook** : Tente l'enregistrement de la boutique locale dans le backend au login du Marchand
4. **LoginPage** : Ajouter bouton Admin (icône Shield), ouvre un PIN modal avec PIN admin
5. **useAuth** : Ajouter role "admin" et gestion PIN admin (localStorage `seque_admin_pin`, défaut "9999")
6. **SequeControlPage** : Interface admin complète avec liste boutiques, stats globales, graphique recharts
7. **PaywallBanner** : Composant bandeau qui s'affiche sur le dashboard en mode free quand ≥ 10 clients
8. **App.tsx** : Route admin vers SequeControlPage
9. **Dashboard** : Intégrer PaywallBanner et passer isPremium
10. **AddClientModal** : Bloquer ajout si free + count ≥ 10, afficher message
