# Guide de Dépannage - Clé API Google Gemini (chatbot)

## 🔴 Erreur : "Clé API Google Gemini non configurée" ou "Clé API Google Gemini invalide"

Cette erreur signifie que la clé Gemini est absente, invalide ou mal configurée.

## ✅ Solution étape par étape

### Étape 1 : Vérifier le fichier .env.local

Assurez-vous que le fichier `.env.local` existe dans le dossier `portfolio-emi` et contient :

```env
GOOGLE_GEMINI_API_KEY=votre_cle_api_google_ici
```

⚠️ **Important** : Pas d'espaces autour du `=`, pas de guillemets.

### Étape 2 : Obtenir une clé API Google Gemini

1. Allez sur [Google AI Studio](https://aistudio.google.com/apikey) (ou [Google AI for Developers](https://ai.google.dev/gemini-api/docs))
2. Connectez-vous avec votre compte Google
3. Créez une clé API (Create API key)
4. **Copiez la clé** et collez-la dans `.env.local`

### Étape 3 : Mettre à jour .env.local

1. Ouvrez le fichier `.env.local` dans `portfolio-emi/`
2. Ajoutez ou modifiez la ligne :

```env
GOOGLE_GEMINI_API_KEY=votre_cle_api_google_ici
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
2. Ouvrez le chatbot (icône en bas à droite)
3. Envoyez un message ; si l'erreur persiste, vérifiez les logs dans le terminal

## 🔍 Vérifications supplémentaires

### Format de .env.local

La clé doit :
- Être sur une seule ligne
- Ne pas avoir d'espaces avant ou après le `=`
- Ne pas être entre guillemets (sauf si votre éditeur le requiert)

### Exemple correct

```env
GOOGLE_GEMINI_API_KEY=AIzaSy...
```

### Exemples incorrects

```env
# ❌ Espaces
GOOGLE_GEMINI_API_KEY = AIzaSy...

# ❌ Guillemets (éviter)
GOOGLE_GEMINI_API_KEY="AIzaSy..."
```

## 🚀 Pour Vercel (déploiement en production)

1. Allez sur [vercel.com](https://vercel.com) → Votre projet
2. **Settings** → **Environment Variables**
3. Ajoutez :
   - Name : `GOOGLE_GEMINI_API_KEY`
   - Value : Votre clé API Google Gemini
   - Environments : ✅ Production, ✅ Preview, ✅ Development
4. Cliquez sur **"Add"**
5. **Redéployez** votre projet (Deployments → Redeploy)

## 📝 Checklist rapide

- [ ] Clé API créée sur Google AI Studio / Google AI for Developers
- [ ] Clé ajoutée dans `.env.local` (sans espaces, sans guillemets)
- [ ] Serveur redémarré après modification de `.env.local`
- [ ] Test du chatbot effectué
- [ ] (Si déployé) Variable `GOOGLE_GEMINI_API_KEY` configurée dans Vercel et projet redéployé

## 🆘 Si ça ne fonctionne toujours pas

1. **Vérifiez les logs du serveur** : Regardez les erreurs dans le terminal
2. **Vérifiez les quotas** : L’API Gemini peut avoir des limites (gratuit ou payant selon le compte)
3. **Testez la clé** : Utilisez un outil comme curl ou Postman avec l’endpoint Gemini pour vérifier que la clé est valide
