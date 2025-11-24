# Guide de Déploiement Vercel - Portfolio Eddy MISSONI

## 🚀 Déploiement étape par étape

### Étape 1 : Préparer votre code

1. **Vérifier que le build fonctionne localement**
   ```powershell
   cd portfolio-emi
   npm run build
   ```
   Si le build réussit, vous êtes prêt !

2. **Vérifier que votre code est sur GitHub**
   - Votre repository doit être sur GitHub avec le compte `DrX241`
   - Si ce n'est pas encore fait, créez un repository sur GitHub et poussez votre code

### Étape 2 : Créer un compte Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Sign Up"**
3. Choisissez **"Continue with GitHub"**
4. Autorisez Vercel à accéder à votre compte GitHub (`DrX241`)

### Étape 3 : Déployer votre projet

1. Dans Vercel, cliquez sur **"Add New..."** → **"Project"**
2. Vous verrez la liste de vos repositories GitHub
3. Trouvez votre repository `portfolio-emi` (ou le nom que vous avez donné)
4. Cliquez sur **"Import"**

### Étape 4 : Configuration du projet

Vercel détectera automatiquement Next.js. Vérifiez que :
- **Framework Preset** : Next.js
- **Root Directory** : `./` (ou `portfolio-emi` si votre repo est à la racine)
- **Build Command** : `npm run build` (automatique)
- **Output Directory** : `.next` (automatique)

### Étape 5 : Variables d'environnement

**IMPORTANT** : Configurez vos variables d'environnement avant de déployer !

1. Dans la section **"Environment Variables"**, ajoutez :
   
   **Variable 1 :**
   - Name : `HUGGINGFACE_API_KEY`
   - Value : `votre_token_huggingface` (⚠️ Créez un nouveau token sur https://huggingface.co/settings/tokens - NE JAMAIS commiter le token dans le code !)
   - Environments : ✅ Production, ✅ Preview, ✅ Development

   **Variable 2 (optionnel) :**
   - Name : `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
   - Value : (laissez vide si vous n'utilisez pas Plausible)
   - Environments : ✅ Production

2. Cliquez sur **"Add"** pour chaque variable

### Étape 6 : Déployer

1. Cliquez sur **"Deploy"**
2. Vercel va :
   - Installer les dépendances
   - Builder votre projet
   - Déployer votre site
3. Attendez 1-2 minutes
4. Vous obtiendrez une URL : `portfolio-emi-xxx.vercel.app`

### Étape 7 : Vérifier le déploiement

1. Cliquez sur l'URL fournie
2. Votre portfolio devrait être en ligne !
3. Testez le chatbot pour vérifier que `HUGGINGFACE_API_KEY` fonctionne

---

## 🌐 Configurer un domaine personnalisé (Optionnel)

### Si vous avez déjà un domaine :

1. Dans Vercel, allez dans votre projet
2. Cliquez sur **"Settings"** → **"Domains"**
3. Entrez votre domaine (ex: `eddy-missoni.com`)
4. Cliquez sur **"Add"**
5. Vercel vous donnera des instructions pour configurer les DNS :
   - **Type A** : `76.76.21.21`
   - **Type CNAME** : `cname.vercel-dns.com` (pour www)
6. Configurez ces enregistrements chez votre registrar (OVH, Namecheap, etc.)
7. Attendez 24-48h pour la propagation DNS
8. SSL sera activé automatiquement !

### Si vous n'avez pas de domaine :

Vous pouvez utiliser l'URL Vercel gratuite : `portfolio-emi-xxx.vercel.app`

---

## 🔄 Déploiements automatiques

Une fois configuré, chaque push sur GitHub déclenchera automatiquement un nouveau déploiement !

- **Push sur `main`** → Déploiement en production
- **Pull Request** → Déploiement de prévisualisation

---

## 🐛 Résolution de problèmes

### Le build échoue :
- Vérifiez les logs dans Vercel
- Assurez-vous que `npm run build` fonctionne localement
- Vérifiez que toutes les dépendances sont dans `package.json`

### Le chatbot ne fonctionne pas :
- Vérifiez que `HUGGINGFACE_API_KEY` est bien configurée dans Vercel
- Vérifiez que la variable est disponible pour "Production"
- Redéployez après avoir ajouté la variable

### Erreur 404 sur certaines pages :
- Vérifiez que vous utilisez bien Next.js App Router (vous l'utilisez ✅)
- Vérifiez les routes dans `/app`

---

## 📝 Checklist finale

- [ ] Code poussé sur GitHub (compte `DrX241`)
- [ ] Compte Vercel créé et connecté à GitHub
- [ ] Projet importé dans Vercel
- [ ] Variable `HUGGINGFACE_API_KEY` configurée
- [ ] Déploiement réussi
- [ ] Site accessible sur l'URL Vercel
- [ ] Chatbot fonctionnel
- [ ] (Optionnel) Domaine personnalisé configuré

---

## 🎉 C'est prêt !

Votre portfolio est maintenant en ligne ! Partagez l'URL avec vos contacts.

**URL Vercel** : `https://portfolio-emi-xxx.vercel.app`  
**URL personnalisée** (si configurée) : `https://votre-domaine.com`

