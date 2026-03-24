# SÉQUÉ-APP — Version 23 : Stabilisation mobile & performances

## Current State
L'application fonctionne sur ICP avec React Query. Les principaux problèmes détectés :
- Dashboard.tsx : animations staggerées (delay: i * 0.05) sur chaque carte client → crée N timers setTimeout en mémoire
- useBackendStore.ts : mutations sans onError → crash silencieux si ICP indisponible
- Chargement de tous les clients d'un coup → mémoire saturée
- localStorage potentiellement en conflit avec ICP (useStore.ts existe mais non utilisé dans le flux principal)
- Certaines APIs Web modernes non vérifiées pour compatibilité WebView Android

## Requested Changes (Diff)

### Add
- Lazy loading dans Dashboard : afficher 20 clients max, bouton "Charger plus" ou IntersectionObserver
- onError handlers sur toutes les mutations avec message toast "Erreur de connexion, réessayez"
- Vérifications de compatibilité (navigator.setAppBadge, Notification API) avec fallbacks

### Modify
- Dashboard.tsx : supprimer les animations staggerées par item (delay: i * 0.05), remplacer par transition CSS légère, implémenter lazy loading
- useBackendStore.ts : ajouter try-catch et onError sur toutes les mutations (addClient, addTransaction, deleteClient, deleteTransaction, addRappel)
- useAppBadge.ts : stabiliser les dépendances useMemo/useCallback pour éviter recalculs
- useReminderScheduler.ts : vérifier compatibilité Notification API avant usage

### Remove
- Animations motion staggerées par item dans la liste clients (garder seulement la carte total)
- Toute lecture localStorage qui pourrait entrer en conflit avec ICP (désactiver initStore si storeId présent)

## Implementation Plan
1. Modifier Dashboard.tsx : supprimer delay animations, ajouter visibleCount (20), bouton charger plus
2. Modifier useBackendStore.ts : ajouter onError avec toast sur chaque mutation
3. Modifier useAppBadge.ts : stabiliser useMemo, ajouter guard pour navigator API
4. Modifier useReminderScheduler.ts : guards compatibilité
5. Modifier useStore.ts : désactiver initStore si storeId ICP présent
