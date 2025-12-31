# Guide de Dépannage - Token Hugging Face

## 🔴 Erreur : "Erreur d'authentification. Vérifiez le token Hugging Face."

Cette erreur signifie que votre token Hugging Face est invalide, expiré, ou mal configuré.

## ✅ Solution étape par étape

### Étape 1 : Vérifier le fichier .env.local

Assurez-vous que le fichier `.env.local` existe dans le dossier `portfolio-emi` et contient :

```env
HUGGINGFACE_API_KEY=hf_votre_token_ici
```

⚠️ **Important** : Le token doit commencer par `hf_`

### Étape 2 : Créer un nouveau token Hugging Face

1. Allez sur [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Cliquez sur **"New token"**
3. Donnez-lui un nom (ex: "portfolio-local" ou "portfolio-vercel")
4. Sélectionnez le type : **"Read"** (suffisant pour l'API)
5. Cliquez sur **"Generate token"**
6. **Copiez immédiatement le token** (il ne sera plus visible après)

### Étape 3 : Mettre à jour .env.local

1. Ouvrez le fichier `.env.local` dans `portfolio-emi/`
2. Remplacez l'ancien token par le nouveau :

```env
HUGGINGFACE_API_KEY=hf_votre_nouveau_token_ici
```

3. **Sauvegardez le fichier**

### Étape 4 : Redémarrer le serveur de développement

⚠️ **CRUCIAL** : Après avoir modifié `.env.local`, vous DEVEZ redémarrer le serveur !

1. Arrêtez le serveur (Ctrl+C dans le terminal)
2. Relancez-le :

```powershell
cd portfolio-emi
npm run dev
```

### Étape 5 : Vérifier que ça fonctionne

1. Ouvrez votre navigateur sur `http://localhost:3000`
2. Testez le chatbot
3. Si l'erreur persiste, vérifiez les logs dans le terminal

## 🔍 Vérifications supplémentaires

### Vérifier que le token est bien chargé

Dans le terminal où tourne `npm run dev`, vous devriez voir des logs comme :
```
Sending request to Hugging Face Router: { model: '...', hasApiKey: true }
```

Si `hasApiKey: false`, le token n'est pas chargé.

### Vérifier le format du token

Le token doit :
- Commencer par `hf_`
- Faire environ 40-50 caractères
- Être sur une seule ligne dans `.env.local`
- Ne pas avoir d'espaces avant ou après

### Exemple de .env.local correct

```env
HUGGINGFACE_API_KEY=hf_VOTRE_TOKEN_ICI
```

### Exemple de .env.local incorrect

```env
# ❌ MAUVAIS - Espaces
HUGGINGFACE_API_KEY = hf_VOTRE_TOKEN_ICI

# ❌ MAUVAIS - Guillemets
HUGGINGFACE_API_KEY="hf_VOTRE_TOKEN_ICI"

# ❌ MAUVAIS - Sur plusieurs lignes
HUGGINGFACE_API_KEY=hf_VOTRE_TOKEN_ICI
1234567890
```

## 🚀 Pour Vercel (déploiement en production)

Si vous déployez sur Vercel, vous devez aussi configurer le token dans les variables d'environnement de Vercel :

1. Allez sur [vercel.com](https://vercel.com) → Votre projet
2. **Settings** → **Environment Variables**
3. Ajoutez :
   - Name : `HUGGINGFACE_API_KEY`
   - Value : Votre token (celui qui commence par `hf_`)
   - Environments : ✅ Production, ✅ Preview, ✅ Development
4. Cliquez sur **"Add"**
5. **Redéployez** votre projet (Vercel → Deployments → Redeploy)

## 📝 Checklist rapide

- [ ] Token créé sur [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
- [ ] Token copié (commence par `hf_`)
- [ ] Token ajouté dans `.env.local` (sans espaces, sans guillemets)
- [ ] Serveur redémarré après modification de `.env.local`
- [ ] Test du chatbot effectué
- [ ] (Si déployé) Token configuré dans Vercel et projet redéployé

## 🆘 Si ça ne fonctionne toujours pas

1. **Vérifiez les logs du serveur** : Regardez les erreurs dans le terminal
2. **Vérifiez la console du navigateur** : F12 → Console
3. **Testez le token directement** : Utilisez l'API Hugging Face pour tester
4. **Créez un nouveau token** : Parfois les tokens peuvent être révoqués

## 💡 Astuce

Pour éviter que le token expire, créez un token avec une durée de validité longue ou sans expiration dans les paramètres Hugging Face.
















