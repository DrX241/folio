# Administration locale et CMS visuel

Le lien Administration du pied de page ouvre `/admin`. Le compte existant est conservé. La connexion utilise un cookie HttpOnly et SameSite Strict de huit heures ; la déconnexion révoque la session. Le mot de passe est dérivé avec scrypt et un sel aléatoire. La création du premier compte demande la clé privée préparée localement ; aucun compte par défaut n’est ajouté.

## Journal

### Atelier éditorial

L’écriture se fait directement dans une page composée, avec Tiptap : texte sélectionnable, gras, italique, soulignement, surlignage, titres, listes, liens, code en ligne et alignements gauche/centre/droite/justifié. La conversion des anciens paragraphes se fait à l’ouverture dans l’éditeur ; elle ne touche le stockage qu’à l’enregistrement. Le rendu public est reconstruit en React à partir d’un document JSON validé, sans injection HTML libre.

Le panneau Page règle la largeur (lecture/large/pleine largeur), l’alignement par défaut, le sommaire et la couverture. Le panneau Bloc règle sa largeur et son espacement. La largeur d’un bloc peut suivre l’article ou être indépendante. Deux modes uniquement : No-code (modèle visuel prêt à modifier) et HTML libre (document source de référence). Le choix est enregistré avec l’article et les contenus des deux modes sont conservés indépendamment.

Concentration masque les panneaux ; Vue mobile vérifie le canevas à 390 px. La commande `/` au début d’un paragraphe vide ouvre l’insertion de blocs. Les images peuvent être déposées dans la page, puis décrites dans le panneau Bloc. Exporter télécharge l’article seul en JSON. Annuler/Rétablir préservent la révision serveur après sauvegarde.

La sauvegarde automatique intervient après 2,5 secondes sans modification, uniquement pour les brouillons avec titre et adresse. Elle est désactivable et ne publie jamais. Pour un article déjà publié, les modifications restent dans l’éditeur jusqu’à l’enregistrement explicite ; ne pas quitter sans enregistrer. Un lien réservé au propriétaire connecté permet d’ouvrir l’article public dans son atelier. Les brouillons restent dans Supabase et ne demandent pas de redémarrer le serveur. Le nouvel atelier doit cependant être déployé avant que la production puisse lire ses nouveaux contenus.

Moteur d’édition : [documentation Tiptap / Next.js](https://tiptap.dev/docs/editor/getting-started/install/nextjs).

### HTML libre et Tailwind

La corbeille dispose d’une commande « Vider la corbeille » avec confirmation. Elle retire tous les articles supprimés et leur historique de la corbeille, sans toucher aux articles actifs. Une session admin est requise ; un changement concurrent de la corbeille bloque l’opération. La restauration dans l’administration devient impossible après vidage. Les sauvegardes techniques Supabase et les médias ne sont pas purgés par cette commande.

Lors du collage ou de l’import HTML, les champs encore vides sont remplis depuis le document : titre (`title` ou `h1`), résumé (description, chapeau ou premier paragraphe) et adresse dérivée du titre. Les métadonnées déjà saisies ne sont pas remplacées. Une erreur d’enregistrement est également affichée près des commandes de publication ; la confirmation reste ouverte en cas d’échec.

Le mode HTML libre, accepte un document complet (`doctype`, `html`, `head`, `style`, `body`) ou un fragment, avec CSS supplémentaire et import de fichier HTML/TXT. Sélectionner HTML libre active directement ce contenu. Enregistrer, prévisualiser et publier utilisent ce source. Revenir à No-code retrouve le modèle visuel sans effacer le HTML. Le titre et le résumé restent modifiables dans le panneau Publication.

Les classes Tailwind 3 standard, y compris les classes responsive et valeurs arbitraires, sont compilées au serveur lors de l’aperçu et de chaque enregistrement. Aucune requête vers le CDN Tailwind n’est nécessaire. Les scripts, événements JavaScript, frames, objets et redirections importés sont retirés du rendu, mais le source original reste éditable et exportable. Le thème/configuration JavaScript Tailwind, React/TSX et l’exécution TypeScript ne sont pas pris en charge. Aucun secret serveur n’est accessible à cette composition.

Le rendu utilise une iframe sans permission same-origin, avec une CSP qui n’autorise que le script interne signé de mesure de hauteur. Le parent vérifie l’origine du message via la fenêtre source et un identifiant de cadre, et borne la hauteur reçue. Le contenu utilisateur ne reçoit aucune permission d’exécuter ses scripts. Les autres appels réseau, formulaires et ressources externes sont bloqués ; les images du site/data sont autorisées, et les Google Fonts deviennent accessibles uniquement avec l’option explicite (requêtes externes à Google). Les avertissements indiquent les adaptations appliquées.

Le texte extrait sert à la recherche et au temps de lecture. La composition complète est conservée dans l’historique et la corbeille. Aucun changement SQL n’est requis. Ne pas publier ce nouveau format sur la base partagée avant le déploiement du lecteur compatible. Le corps HTML étant isolé dans une iframe, son indexation par les moteurs n’est pas équivalente à un article natif ; renseigner le titre, le résumé et les champs SEO du CMS.

Écrire, prévisualiser, enregistrer des brouillons, publier, retirer du journal et archiver. Dix versions précédentes des articles sont conservées. Les brouillons et archives sont exclus des pages publiques, du RSS, de la recherche et du sitemap. Les publications sont immédiates, sans compilation.

Le journal accepte maintenant une image de couverture, des mots-clés, un titre et une description SEO. Les sections peuvent contenir du texte mis en forme (gras, italique, liens, code en ligne), des images légendées, citations, listes, tableaux, encadrés, schémas de flux et blocs de code. Les blocs et les sections sont réorganisables ; les blocs peuvent être dupliqués. L’aperçu utilise le même rendu que l’article public.

Les images importées dans le journal sont limitées à 4 Mo pour rester compatibles avec les requêtes Vercel. Donner une description à chaque image avant publication. Les schémas peuvent être construits directement avec des étapes et relations ou importés comme images. Les blocs de code conservent leur indentation et proposent une copie ; HTML, CSS, TypeScript, JavaScript, Python, SQL et d’autres langages sont affichables. Ils ne sont pas exécutés.

Une démonstration HTML/CSS est rendue dans une iframe sandboxée, sans scripts ni accès au document parent ; une politique CSP bloque les ressources réseau et les formulaires. Ce n’est pas un environnement d’exécution TypeScript ou JavaScript. Ne pas retirer ces protections pour intégrer du code dans l’administration.

Supprimer un article le retire du journal, du RSS, de la recherche et du sitemap, et le place dans une corbeille privée. Restaurer le conserve en brouillon et ne republie rien automatiquement. La suppression vérifie la version pour ne pas effacer une édition plus récente ; la restauration refuse d’écraser une adresse déjà utilisée. Aucune purge automatique n’est appliquée à la corbeille.

Les anciens articles restent lisibles sans conversion et aucun changement SQL n’est nécessaire : ces champs sont conservés dans le JSONB existant. Tant que le nouveau code n’a pas été déployé, ne pas publier de blocs enrichis depuis une administration locale branchée sur la même base que la production : l’ancienne version du site ne sait pas encore les afficher.

## Éditeur visuel

Les 19 pages actuelles sont reprises dans leur design courant. Sélectionner la page, puis cliquer sur un élément de l’aperçu pour modifier ses textes, ses liens, ses images et ses styles. La liste Structure permet de sélectionner aussi les éléments masqués. Les textes des pages légales, les introductions des expériences et les explications du Lab sont éditables.

Ajouter, déplacer, dupliquer, masquer ou retirer des briques. Créer des pages libres ou des réalisations ; ces dernières apparaissent dans la collection de projets. Modifier les titres et descriptions des pages, leur visibilité, les polices, les couleurs, les marges, la signature, le menu, les coordonnées et le pied de page. Les styles d’un élément peuvent avoir une variante mobile.

L’aperçu s’actualise pendant l’écriture. Les vues ordinateur, tablette et mobile utilisent leurs vraies largeurs. Le mode Tester permet d’utiliser les interactions du Lab. Les calculs, jeux de données et contrôles des expériences restent dans le code ; les textes pédagogiques passent par un contexte d’édition qui préserve les résultats dynamiques.

Enregistrer le brouillon conserve les changements sans les publier. Publier le site applique toutes les pages et tous les réglages du brouillon, sans publier les brouillons d’articles. Annuler/Rétablir fonctionne pendant la session ; dix publications précédentes sont conservées. Charger une publication précédente ou importer un brouillon ne publie rien automatiquement. Une version concurrente dans un autre onglet empêche l’écrasement silencieux.

Exporter ce brouillon produit un fichier de configuration réimportable depuis l’onglet Page. L’export global des contenus inclut aussi les articles et leurs historiques, sans mot de passe ni jeton de session. Les images importées sont conservées à part ; les sauvegarder avec les données.

## Stockage et maintenance

Les données actives sont dans `.content/content.json`, indépendant de `.next` et exclu de Git. Les images sont dans `.content/media`. Ne pas supprimer ce dossier lors d’un redémarrage ou d’une compilation. Les écritures sont atomiques, avec reprise des verrouillages temporaires de Windows.

`lib/cms-documents.json` contient la base des pages courantes. Après une publication, `cms.published` dans le stockage constitue la version publique ; `cms.draft` est le brouillon. Modifier seulement les anciennes pages JSX ou les anciens champs `pages` n’est plus le flux d’édition. Les routes publiques utilisent `ManagedPage` et le rendu structuré `CmsRenderer`. Ne pas réimporter des archives de design.

Le CMS valide les éléments, les liens et les styles. L’éditeur visuel des pages n’accepte pas de scripts ni de HTML libre ; le journal accepte du HTML isolé selon les protections décrites plus haut. Les images importées sont limitées à 4 Mo, aux signatures PNG/JPEG/WebP/GIF ; les SVG importés sont refusés. Les requêtes d’écriture vérifient la session et l’origine.

Le stockage local reste disponible pour un serveur Node avec disque persistant. Le mode `CMS_STORAGE=supabase` utilise désormais une base durable, des écritures atomiques avec révision et un bucket privé. Voir [SUPABASE.md](SUPABASE.md) pour créer le schéma, importer les données sans écrasement et configurer Vercel. Ne pas supposer que le disque temporaire des fonctions conservera les contenus.

Travail local uniquement. Aucun commit ni déploiement sans accord explicite.
