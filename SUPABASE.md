# Raccorder le CMS à Supabase

## 1. Créer le schéma

Dans le projet Supabase dédié, ouvrir **SQL Editor → New query**, copier intégralement `supabase/migrations/20261002_cms.sql`, puis **Run**. Ce script crée :

- `cms_store` : état du CMS (articles, pages, brouillons, publications, historiques, compte admin et sessions).
- `cms_backups` : les 30 états précédents lors d’une modification des contenus, sans conserver de sessions actives dans ces copies.
- `cms_compare_and_swap` : écriture atomique avec numéro de révision, pour ne pas écraser les changements d’une autre instance.
- `cms-media` : bucket privé, images PNG/JPEG/WebP/GIF de 8 Mo maximum.

Les tables ont RLS activé et n’accordent aucun accès aux rôles `anon` et `authenticated`. Seul le serveur muni de la clé secrète peut les lire. **Aucune politique publique de lecture/écriture ne doit être ajoutée** : ces données incluent les brouillons et le hash du mot de passe admin. L’authentification existante reste celle du CMS Next.js ; aucun compte Supabase Auth n’est nécessaire.

Le script peut être relancé. Il ne supprime aucun contenu. La clé secrète du projet ne permet pas de créer des tables par l’API de données ; utiliser SQL Editor ou un accès de gestion Supabase autorisé.

## 2. Vérifier puis importer les données locales

Les variables `SUPABASE_URL` et `SUPABASE_SECRET_KEY` doivent être enregistrées dans `.env.local`. Garder `CMS_STORAGE=local` pendant la préparation. Lancer :

```powershell
npm.cmd run cms:check
```

Créer d’abord son compte admin local si ce n’est pas déjà fait. Cesser d’éditer pendant l’import. Confirmer la destination en ajoutant dans `.env.local` :

```dotenv
CMS_MIGRATION_PROJECT_URL=https://bpawanrpttidnpyrjxsd.supabase.co
```

Puis lancer :

```powershell
npm.cmd run cms:migrate
```

L’import refuse d’écraser un CMS distant déjà initialisé. Il crée une copie locale sous `.content/backups`, conserve les originaux, vérifie les images transférées et l’état JSON distant. Le compte existant, les articles et leurs historiques sont conservés. Les anciennes sessions sont révoquées : se reconnecter après la bascule. Ne pas publier `.content` dans Git.

## 3. Activer le stockage distant

Après la vérification de l’import : `CMS_STORAGE=supabase`, puis redémarrer le serveur local. Tester connexion admin, édition, brouillon, publication et image.

Si un serveur de développement utilise déjà `.next`, isoler la compilation du serveur local sur le port 3200 pour éviter que l’un réécrive les fichiers de l’autre :

```powershell
$env:NEXT_BUILD_DIR='.next-local'
npm.cmd run build
npm.cmd run start -- -p 3200 -H localhost
```

Ce dossier contient une compilation de la même version du code, pas une autre version du design. La compilation en mode Supabase nécessite un accès réseau au projet.

Sur Vercel, renseigner `SUPABASE_URL`, `SUPABASE_SECRET_KEY` et `CMS_STORAGE=supabase` **dans les paramètres d’environnement du projet**, puis redéployer. Aucune variable secrète n’utilise `NEXT_PUBLIC_`. Un `.env.local` local n’est pas transmis au déploiement Git.

Ne pas connecter une prévisualisation non fiable à la base de production : utiliser un projet distinct pour les tests qui écrivent. Toute prévisualisation partageant ce projet peut publier les mêmes données que la production.

Une panne Supabase renvoie une erreur ; le site ne bascule jamais silencieusement vers un disque local. Vercel interdit explicitement le mode local. Les lectures passent par le serveur, sans cache des brouillons ou sessions. Les images passent par les URL existantes `/api/media/<uuid>` ; elles deviennent accessibles à qui connaît cette URL, comme avant.

## Sauvegarde et retour arrière

Les 30 copies de `cms_backups` sont un historique de contenus, pas une sauvegarde externe du projet Supabase. Exporter régulièrement les données et sauvegarder séparément les médias. Une restauration doit conserver les sessions vides, utiliser une nouvelle révision et être faite site en maintenance.

Le retour à un ancien déploiement restaure le **code**, pas les données. Revenir au mode local est possible localement, mais les fichiers conservés avant migration ne contiennent pas les éditions faites ensuite sur Supabase. Ne pas remplacer la base avec ces anciens fichiers sans export et validation.
