# SÉQUÉ-APP

## Current State
L'application utilise l'ICP backend pour stocker clients, dettes, paiements, boutiques et rappels. Cependant, le statut premium/abonnement de chaque boutique était stocké localement dans localStorage via `useSubscription`, ce qui empêchait la synchronisation entre appareils.

## Requested Changes (Diff)

### Add
- `PREMIUM_KEY` dans `useAuth.ts` pour persister le statut premium issu du serveur
- `getStoredIsPremium()` export dans `useAuth.ts`
- `isPremium` exposé dans le hook `useAuth`

### Modify
- `useAuth.login()` accepte maintenant un 4e paramètre `premium?: boolean`
- `LoginPage.tsx` : sauvegarde `premium` depuis `result.ok` du server lors du login et le passe à `onLogin()`
- `App.tsx` : utilise `auth.isPremium` (serveur) au lieu de `useSubscription` (local)

### Remove
- Import et usage de `useSubscription` dans `App.tsx` (remplacé par `auth.isPremium`)

## Implementation Plan
1. Mettre à jour `useAuth.ts` pour lire/écrire le statut premium depuis localStorage après login serveur
2. Mettre à jour `LoginPage.tsx` pour passer `premium` de la réponse ICP à `onLogin`
3. Mettre à jour `App.tsx` pour utiliser `auth.isPremium` à la place de `useSubscription`
