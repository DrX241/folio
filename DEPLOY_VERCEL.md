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
   - Name : `GOOGLE_GEMINI_API_KEY`
   - Value : votre clé API Google Gemini (⚠️ Créez-la sur https://aistudio.google.com/apikey - NE JAMAIS commiter la clé dans le code !)
   - Environments : ✅ Production, ✅ Preview, ✅ Development

   **Variable 2 :**
   - Name : `NEXT_PUBLIC_SITE_URL`
   - Value : `https://eddy-missoni.fr` (ou `https://www.eddy-missoni.fr` selon votre préférence)
   - Environments : ✅ Production

   **Variable 3 (optionnel) :**
   - Name : `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
   - Value : `eddy-missoni.fr` (si vous utilisez Plausible pour les analytics)
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
3. Testez le chatbot pour vérifier que `GOOGLE_GEMINI_API_KEY` fonctionne

---

## 🌐 Configurer un domaine personnalisé (eddy-missoni.fr)

### Étape 1 : Ajouter le domaine dans Vercel

1. Dans Vercel, allez dans votre projet
2. Cliquez sur **"Settings"** → **"Domains"**
3. Entrez votre domaine : `eddy-missoni.fr`
4. Cliquez sur **"Add"**
5. Vercel va vérifier le domaine et vous donnera les instructions DNS

### Étape 2 : Ajouter aussi www.eddy-missoni.fr

1. Dans la même page "Domains", ajoutez aussi : `www.eddy-missoni.fr`
2. Vercel vous donnera les instructions pour ce sous-domaine

### Étape 3 : Configurer les DNS chez votre registrar

Vercel vous donnera des valeurs spécifiques, mais voici les types d'enregistrements généralement nécessaires :

#### Pour eddy-missoni.fr (domaine racine) :
- **Type** : `A` ou `CNAME`
- **Valeur** : Vercel vous donnera une adresse IP ou un CNAME spécifique
- Exemple : `76.76.21.21` (IP Vercel) ou `cname.vercel-dns.com`

#### Pour www.eddy-missoni.fr :
- **Type** : `CNAME`
- **Valeur** : `cname.vercel-dns.com` (ou la valeur donnée par Vercel)

### Étape 4 : Configuration selon votre registrar

#### Si vous êtes chez OVH :

1. Connectez-vous à votre [espace client OVH](https://www.ovh.com/manager/)
2. Allez dans **"Web Cloud"** → **"Domaines"** → **"eddy-missoni.fr"**
3. Cliquez sur **"Zone DNS"**
4. Ajoutez/modifiez les enregistrements :

   **Pour eddy-missoni.fr :**
   - Cliquez sur **"Ajouter une entrée"**
   - Type : `A`
   - Sous-domaine : `@` (ou laissez vide pour le domaine racine)
   - Cible : L'adresse IP donnée par Vercel (ex: `76.76.21.21`)
   - TTL : `3600` (par défaut)

   **Pour www.eddy-missoni.fr :**
   - Cliquez sur **"Ajouter une entrée"**
   - Type : `CNAME`
   - Sous-domaine : `www`
   - Cible : `cname.vercel-dns.com` (ou la valeur donnée par Vercel)
   - TTL : `3600`

5. Cliquez sur **"Valider"**
6. Attendez quelques minutes pour la propagation

#### Si vous êtes chez Namecheap, Gandi, ou autre :

Le processus est similaire :
1. Accédez à la gestion DNS de votre domaine
2. Ajoutez les enregistrements A et CNAME comme indiqué par Vercel
3. Sauvegardez les modifications

### Étape 5 : Vérification dans Vercel

1. Retournez dans Vercel → **"Settings"** → **"Domains"**
2. Vercel vérifiera automatiquement la configuration DNS
3. Vous verrez un statut :
   - ⏳ **"Pending"** : En attente de propagation DNS
   - ✅ **"Valid"** : Configuration correcte, SSL en cours d'activation
   - ❌ **"Invalid"** : Vérifiez vos enregistrements DNS

### Étape 6 : Attendre la propagation DNS

- **Propagation DNS** : 5 minutes à 48 heures (généralement 15-30 minutes)
- **Activation SSL** : Automatique une fois le DNS validé (5-10 minutes)

### Étape 7 : Vérifier que tout fonctionne

1. Attendez que le statut soit **"Valid"** dans Vercel
2. Testez dans votre navigateur :
   - `https://eddy-missoni.fr` → Devrait afficher votre portfolio
   - `https://www.eddy-missoni.fr` → Devrait aussi fonctionner
3. Vérifiez que le cadenas SSL (🔒) est présent dans la barre d'adresse

### ⚠️ Important

- **Ne supprimez pas** l'URL Vercel (`eddy-missoni.vercel.app`), elle reste active
- Les deux URLs (`eddy-missoni.fr` et `eddy-missoni.vercel.app`) pointeront vers le même site
- Le SSL/HTTPS est **automatique et gratuit** sur Vercel
- Vercel redirige automatiquement `www` vers le domaine racine (ou vice versa selon votre préférence)

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
- Vérifiez que `GOOGLE_GEMINI_API_KEY` est bien configurée dans Vercel
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
- [ ] Variable `GOOGLE_GEMINI_API_KEY` configurée
- [ ] Déploiement réussi
- [ ] Site accessible sur l'URL Vercel
- [ ] Chatbot fonctionnel
- [ ] (Optionnel) Domaine personnalisé configuré

---

## 🎉 C'est prêt !

Votre portfolio est maintenant en ligne ! Partagez l'URL avec vos contacts.

**URL Vercel** : `https://portfolio-emi-xxx.vercel.app`  
**URL personnalisée** (si configurée) : `https://votre-domaine.com`

