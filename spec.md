# SÉQUÉ-APP (ex-CrédiTrack)

## Current State
App de gestion de crédit client pour Congo-Brazzaville. Interface 100% frontend (localStorage). Rôles Marchand/Gérant déjà fonctionnels. +242 partiellement implémenté (bug : suppression du zéro initial). Photo preuve déjà présente. Couleurs navy/emerald/orange.

## Requested Changes (Diff)

### Add
- Rien de nouveau structurellement

### Modify
- **Bug +242** : `formatPhone242` supprime le zéro initial (ex: "065123456" → "+24265123456" au lieu de "+242065123456"). Corriger pour ne pas supprimer le zéro de tête.
- **Nom app** : Remplacer "CrédiTrack" / "CT" par "SÉQUÉ-APP" / "SQ" partout (LoginPage, Dashboard header, messages SMS, footer, titre page)
- **Couleurs Congo** : Remplacer la palette emerald/orange par les couleurs du drapeau congolais de façon subtile : vert (#009A44 ≈ oklch 0.57 0.19 145), jaune (oklch 0.88 0.19 90), rouge (oklch 0.52 0.23 22). Garder le fond navy.
- **Vocabulaire local** : Remplacer "Total dû" → "Argent dehors", "Dette réglée" → "Dette Séquée !", le badge SOLDÉ peut rester mais le label de dette payée vaut "Dette Séquée !"
- **Champ localisation** : Fusionner "Quartier" + "Localisation précise" en un seul champ "Quartier & Point de repère" avec placeholder "Ex: Derrière le marché Total, portail bleu". Mettre à jour le modèle de données (stocker dans le champ `localisation`, utiliser ce champ unique dans l'affichage)
- **Message WhatsApp** : Changer en `Bonjour [Nom], votre solde chez [Boutique] est de [Montant] FCFA. Merci de passer régler. Séqué-App vous remercie !`
- **Bouton Relancer** : Renommer le bouton "Rappel WhatsApp" → "Relancer" dans ClientDetailPage
- **Photo preuve** : S'assurer que le bouton photo est bien visible et obligatoire (ou au moins très mis en avant) dans AddTransactionModal pour les dettes

### Remove
- Suppression du champ "Quartier" séparé et "Localisation précise" séparé → remplacé par le champ unique

## Implementation Plan
1. Corriger `formatPhone242` dans `utils/format.ts`
2. Mettre à jour `index.css` : remplacer les variables OKLCH emerald/orange par les couleurs Congo
3. Mettre à jour `LoginPage.tsx` : nom SÉQUÉ-APP, initiales SQ, nouvelles couleurs
4. Mettre à jour `Dashboard.tsx` : nom SÉQUÉ-APP, libellés, nouvelles couleurs
5. Mettre à jour `AddClientModal.tsx` : fusionner les champs quartier/localisation en "Quartier & Point de repère"
6. Mettre à jour `ClientDetailPage.tsx` : message WhatsApp, bouton "Relancer", libellés, afficher le champ combiné
7. Mettre à jour les références aux champs dans `useStore.ts` si nécessaire (le champ `localisation` peut stocker la valeur combinée, `quartier` peut être vide ou conserver)
