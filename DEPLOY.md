# Guide de Déploiement - Portfolio Eddy MISSONI

## 🚀 Option 1 : Vercel (Recommandé - Gratuit)

Vercel est la plateforme créée par les fondateurs de Next.js. C'est la solution la plus simple et optimale.

### Étapes :

1. **Préparer votre code**
   ```bash
   # Assurez-vous que votre code est prêt
   cd portfolio-emi
   npm run build  # Vérifier que le build fonctionne
   ```

2. **Créer un compte Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Connectez-vous avec GitHub, GitLab ou Bitbucket

3. **Déployer depuis GitHub**
   - Poussez votre code sur GitHub (si ce n'est pas déjà fait)
   - Dans Vercel, cliquez sur "New Project"
   - Importez votre repository
   - Vercel détectera automatiquement Next.js

4. **Configurer les variables d'environnement**
   - Dans les paramètres du projet Vercel
   - Allez dans "Environment Variables"
   - Ajoutez : `GOOGLE_GEMINI_API_KEY` = votre clé API Google Gemini (chatbot page d'accueil)
   - Ajoutez : `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` = votre domaine (si utilisé)

5. **Déployer**
   - Cliquez sur "Deploy"
   - Vercel déploiera automatiquement votre site
   - Vous obtiendrez une URL : `votre-projet.vercel.app`

6. **Configurer un domaine personnalisé (GRATUIT)**
   - Dans les paramètres du projet → "Domains"
   - Ajoutez votre domaine (ex: `eddy-missoni.com` ou `www.eddy-missoni.com`)
   - Vercel vous donnera des instructions pour configurer les DNS
   - **SSL/HTTPS est automatique et gratuit** ✅
   - Vercel gère automatiquement le certificat SSL

### Avantages Vercel :
- ✅ Gratuit pour les projets personnels
- ✅ **Domaine personnalisé GRATUIT** avec SSL automatique
- ✅ Déploiement automatique à chaque push
- ✅ SSL/HTTPS automatique (Let's Encrypt)
- ✅ CDN global
- ✅ Optimisé pour Next.js
- ✅ Prévisualisation des pull requests

---

## 🌐 Option 2 : Netlify

Alternative populaire, également gratuite avec support des domaines personnalisés.

### Étapes :

1. **Créer un compte Netlify**
   - Allez sur [netlify.com](https://netlify.com)
   - Connectez-vous avec GitHub

2. **Déployer**
   - "Add new site" → "Import an existing project"
   - Connectez votre repository GitHub
   - Build command : `npm run build`
   - Publish directory : `.next`

3. **Variables d'environnement**
   - Site settings → Environment variables
   - Ajoutez vos variables

4. **Domaine personnalisé**
   - Site settings → Domain management
   - Ajoutez votre domaine personnalisé
   - SSL automatique avec Let's Encrypt

---

## ☁️ Option 3 : VPS / Serveur dédié

Pour plus de contrôle (DigitalOcean, AWS, OVH, etc.)

### Étapes :

1. **Préparer le serveur**
   ```bash
   # Installer Node.js 18+
   # Installer PM2 pour gérer le processus
   npm install -g pm2
   ```

2. **Cloner et build**
   ```bash
   git clone votre-repo
   cd portfolio-emi
   npm install
   npm run build
   ```

3. **Lancer avec PM2**
   ```bash
   pm2 start npm --name "portfolio" -- start
   pm2 save
   pm2 startup
   ```

4. **Configurer Nginx** (reverse proxy)
   ```nginx
   server {
       listen 80;
       server_name votre-domaine.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **SSL avec Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d votre-domaine.com
   ```

---

## 📋 Checklist avant déploiement

### Variables d'environnement à configurer :
- [ ] `GOOGLE_GEMINI_API_KEY` - Clé API Google Gemini pour le chatbot (page d'accueil)
- [ ] `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` - Domaine pour les analytics (optionnel)

### Fichiers à vérifier :
- [ ] `.env.local` est dans `.gitignore` (ne pas commiter les secrets)
- [ ] `package.json` contient les bonnes dépendances
- [ ] Le build fonctionne localement (`npm run build`)

### Optimisations :
- [ ] Images optimisées
- [ ] Fichiers statiques (CV, logos) dans `/public`
- [ ] Configuration Next.js optimale

---

## 🔒 Sécurité

### Variables d'environnement sensibles :
- ❌ **NE JAMAIS** commiter `.env.local` ou `.env`
- ✅ Utiliser les variables d'environnement de la plateforme
- ✅ Vérifier que `.gitignore` contient `.env*`

### Headers de sécurité :
Votre `next.config.mjs` contient déjà des headers de sécurité (HSTS, X-Frame-Options, etc.)

---

## 🎯 Recommandation

**Pour votre portfolio, je recommande Vercel** car :
1. Gratuit et simple
2. **Domaine personnalisé gratuit avec SSL automatique**
3. Optimisé pour Next.js
4. Déploiement en quelques minutes
5. SSL automatique (Let's Encrypt)
6. CDN global pour de meilleures performances

### 💡 Pourquoi Vercel pour un domaine personnalisé ?

- ✅ **SSL/HTTPS gratuit** : Vercel gère automatiquement les certificats SSL
- ✅ **Configuration DNS simple** : Juste quelques enregistrements à ajouter
- ✅ **Pas de frais supplémentaires** : Le domaine personnalisé est gratuit
- ✅ **Renouvellement automatique** : Les certificats SSL sont renouvelés automatiquement
- ✅ **Support de plusieurs domaines** : Vous pouvez ajouter `eddy-missoni.com` et `www.eddy-missoni.com`

---

## 📞 Support

Si vous rencontrez des problèmes :
- Documentation Vercel : https://vercel.com/docs
- Documentation Next.js : https://nextjs.org/docs/deployment

