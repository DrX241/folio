# Analyse et Amélioration Text-to-SQL pour Production

## Problèmes Identifiés

### 1. Génération de requêtes incomplètes
- Le LLM génère parfois : `SELECT FROM clients ORDER BY`
- Colonnes manquantes après SELECT
- Critère manquant dans ORDER BY
- Valeur manquante dans LIMIT

### 2. Modèle LLM actuel
- **Modèle** : `HuggingFaceTB/SmolLM3-3B`
- **Problème** : Modèle trop petit (3B paramètres) pour des tâches SQL complexes
- **Conséquence** : Génération incohérente et incomplète

### 3. Paramètres sous-optimaux
- `max_tokens: 2000` - Peut être excessif pour du SQL
- `temperature: 0.7` - Trop élevée pour une tâche déterministe comme SQL
- Pas de `top_p` optimisé

### 4. Prompt insuffisant
- Manque d'exemples concrets
- Pas de format de sortie strict
- Pas de contraintes sur la complétude

## Solutions pour Production

### 1. Amélioration du Prompt (Critique)

**Prompt actuel** : Instructions vagues
**Prompt Production** : Format strict avec exemples et contraintes

### 2. Modèle LLM Recommandé

**Options par ordre de préférence** :

1. **CodeLlama-7B-Instruct** (Recommandé)
   - Spécialisé dans le code et SQL
   - 7B paramètres (meilleur que 3B)
   - Gratuit sur Hugging Face
   - Modèle : `codellama/CodeLlama-7b-Instruct-hf`

2. **StarCoder2-7B** (Alternative)
   - Spécialisé dans le code
   - Modèle : `bigcode/starcoder2-7b`

3. **Mixtral-8x7B-Instruct** (Meilleur mais plus lent)
   - Très performant sur SQL
   - Modèle : `mistralai/Mixtral-8x7B-Instruct-v0.1`

### 3. Paramètres Optimaux pour SQL

```javascript
{
  max_tokens: 200,        // SQL rarement > 200 tokens
  temperature: 0.1,       // Très bas pour déterminisme
  top_p: 0.9,            // Filtrage agressif
  top_k: 10,             // Limiter les choix
  repetition_penalty: 1.1 // Éviter répétitions
}
```

### 4. Validation Stricte Post-Génération

**Avant d'afficher la requête à l'utilisateur** :
1. Vérifier présence de colonnes après SELECT
2. Vérifier présence de table après FROM
3. Si ORDER BY : vérifier présence de colonne
4. Si LIMIT : vérifier présence de nombre
5. Si invalide : regénérer avec prompt plus strict

### 5. Format de Sortie Strict

**Utiliser un format JSON structuré** :
```json
{
  "sql": "SELECT * FROM clients ORDER BY ca_total DESC LIMIT 3",
  "columns": ["*"],
  "table": "clients",
  "where": null,
  "orderBy": "ca_total DESC",
  "limit": 3
}
```

Puis reconstruire la requête SQL à partir du JSON pour garantir la validité.

### 6. Fallback Intelligent

Si le LLM échoue 2 fois :
1. Utiliser un template SQL pré-défini
2. Remplir les valeurs avec extraction de mots-clés
3. Afficher un message explicite à l'utilisateur

## Architecture Recommandée pour Production

```
Question en français
       ↓
Prompt amélioré + Exemples
       ↓
LLM (CodeLlama-7B, temp=0.1)
       ↓
Réponse JSON structurée
       ↓
Validation stricte
       ↓
    ✓ Valide ?
   /          \
OUI           NON
  ↓             ↓
SQL prêt    Regénération
            avec prompt strict
                ↓
            2e tentative
                ↓
            ✓ Valide ?
           /          \
        OUI           NON
         ↓             ↓
      SQL prêt    Fallback template
```

## Checklist Production

- [ ] Changer de modèle LLM (CodeLlama-7B minimum)
- [ ] Optimiser paramètres (temp=0.1, max_tokens=200)
- [ ] Améliorer prompt avec exemples concrets
- [ ] Ajouter validation post-génération stricte
- [ ] Implémenter regénération automatique si invalide
- [ ] Ajouter fallback template pour cas critiques
- [ ] Logger les échecs pour analyse
- [ ] Ajouter métriques (taux de succès, latence)
- [ ] Tests unitaires sur cas limites
- [ ] Documentation utilisateur claire

## Priorités Immédiates

1. **Critique** : Améliorer le prompt avec exemples concrets
2. **Critique** : Réduire temperature à 0.1
3. **Important** : Validation post-génération stricte
4. **Important** : Regénération automatique si invalide
5. **Souhaitable** : Changer de modèle LLM

## Risques en Production Actuelle

- **Haut** : Requêtes SQL invalides fréquentes
- **Moyen** : Expérience utilisateur dégradée
- **Faible** : Sécurité (déjà protégé avec validation serveur)

## Métriques à Suivre

1. **Taux de succès** : % requêtes SQL valides du premier coup
2. **Temps de génération** : Latence moyenne
3. **Taux de regénération** : % requêtes nécessitant 2+ tentatives
4. **Erreurs utilisateur** : Types d'erreurs rencontrées

