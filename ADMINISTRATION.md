# Administration locale et CMS visuel

Le lien Administration du pied de page ouvre `/admin`. Le compte existant est conservé. La connexion utilise un cookie HttpOnly et SameSite Strict de huit heures ; la déconnexion révoque la session. Le mot de passe est dérivé avec scrypt et un sel aléatoire. La création du premier compte demande la clé privée préparée localement ; aucun compte par défaut n’est ajouté.

## Journal

Écrire, prévisualiser, enregistrer des brouillons, publier, retirer du journal et archiver. Dix versions précédentes des articles sont conservées. Les brouillons et archives sont exclus des pages publiques, du RSS, de la recherche et du sitemap. Les publications sont immédiates, sans compilation.

## Éditeur visuel

Les 19 pages actuelles sont reprises dans leur design courant. Sélectionner la page, puis cliquer sur un élément de l’aperçu pour modifier ses textes, ses liens, ses images et ses styles. La liste Structure permet de sélectionner aussi les éléments masqués. Les textes des pages légales, les introductions des expériences et les explications du Lab sont éditables.

Ajouter, déplacer, dupliquer, masquer ou retirer des briques. Créer des pages libres ou des réalisations ; ces dernières apparaissent dans la collection de projets. Modifier les titres et descriptions des pages, leur visibilité, les polices, les couleurs, les marges, la signature, le menu, les coordonnées et le pied de page. Les styles d’un élément peuvent avoir une variante mobile.

L’aperçu s’actualise pendant l’écriture. Les vues ordinateur, tablette et mobile utilisent leurs vraies largeurs. Le mode Tester permet d’utiliser les interactions du Lab. Les calculs, jeux de données et contrôles des expériences restent dans le code ; les textes pédagogiques passent par un contexte d’édition qui préserve les résultats dynamiques.

Enregistrer le brouillon conserve les changements sans les publier. Publier le site applique toutes les pages et tous les réglages du brouillon, sans publier les brouillons d’articles. Annuler/Rétablir fonctionne pendant la session ; dix publications précédentes sont conservées. Charger une publication précédente ou importer un brouillon ne publie rien automatiquement. Une version concurrente dans un autre onglet empêche l’écrasement silencieux.

Exporter ce brouillon produit un fichier de configuration réimportable depuis l’onglet Page. L’export global des contenus inclut aussi les articles et leurs historiques, sans mot de passe ni jeton de session. Les images importées sont conservées à part ; les sauvegarder avec les données.

## Stockage et maintenance

Les données actives sont dans `.content/content.json`, indépendant de `.next` et exclu de Git. Les images sont dans `.content/media`. Ne pas supprimer ce dossier lors d’un redémarrage ou d’une compilation. Les écritures sont atomiques, avec reprise des verrouillages temporaires de Windows.

`lib/cms-documents.json` contient la base des pages courantes. Après une publication, `cms.published` dans le stockage constitue la version publique ; `cms.draft` est le brouillon. Modifier seulement les anciennes pages JSX ou les anciens champs `pages` n’est plus le flux d’édition. Les routes publiques utilisent `ManagedPage` et le rendu structuré `CmsRenderer`. Ne pas réimporter des archives de design.

Le CMS valide les éléments, les liens et les styles. Il n’accepte pas de scripts, de HTML libre ni de CSS exécutable. Les images importées sont limitées à 8 Mo, aux signatures PNG/JPEG/WebP/GIF ; les SVG importés sont refusés. Les requêtes d’écriture vérifient la session et l’origine.

Le stockage local reste disponible pour un serveur Node avec disque persistant. Le mode `CMS_STORAGE=supabase` utilise désormais une base durable, des écritures atomiques avec révision et un bucket privé. Voir [SUPABASE.md](SUPABASE.md) pour créer le schéma, importer les données sans écrasement et configurer Vercel. Ne pas supposer que le disque temporaire des fonctions conservera les contenus.

Travail local uniquement. Aucun commit ni déploiement sans accord explicite.
