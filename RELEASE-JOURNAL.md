# Livraison du journal — 4 octobre 2026

Branche : `refonte-cms`. Aucune fusion dans `main`, aucune refonte de l’accueil.

## Contenu

- Journal enrichi, deux modes persistants : No-code et HTML libre.
- Publication du document HTML, métadonnées reprises si vides, prévisualisation compilée depuis le source courant.
- Images, couverture, tableaux, schémas, formats de texte, historique, corbeille et vidage avec confirmation.
- Sessions serveur, contrôle d’origine, validation du contenu, versions concurrentes protégées et stockage Supabase inchangés.
- HTML dans une iframe isolée sans same-origin. Les scripts importés sont retirés, une CSP autorise uniquement le script interne signé de mesure de hauteur.

## Dépendances et risque résiduel

Next.js 15.5.27 et React/React DOM 19.2.8 sont verrouillés. PostCSS 8.5.28 est également imposé aux dépendances transitives, et sharp est actualisé à 0.35.5. Le lockfile enregistre les autres correctifs compatibles.

L’audit npm ne contient plus d’alerte critique. Il conserve sept alertes élevées liées à un seul avis, GHSA-vfj7-8cjw-p6xm, dans `braces` et ses dépendants (notamment Tailwind 3 et les outils ESLint). `braces` 3.0.3 n’a pas de correctif publié à la date de vérification. Ce risque n’est pas déclaré corrigé : les contrôles ci-dessous sont des restrictions d’exposition, pas un correctif de la bibliothèque.

Le compilateur n’accepte aucun chemin glob, configuration Tailwind, plugin ni safelist utilisateur : il compile du contenu HTML `raw`, avec une configuration fixe. Son API exige une session administrateur et une origine valide. Le document est borné à 200 000 caractères, 15 000 nœuds, 100 niveaux de DOM, 32 niveaux d’accolades, 2 000 classes distinctes et 512 caractères par classe. Le CSS généré est aussi borné. Ces restrictions sont testées.

À suivre : migrer le compilateur vers une version de Tailwind sans cette dépendance, avec tests de compatibilité des documents existants, ou intégrer un correctif amont dès sa disponibilité. L’audit n’est donc pas entièrement vert.

## Retour arrière

Déploiement de production avant livraison : `dpl_J17w5rzZhkRvxMrxRNUHfmjFGCuw`.

URL : `https://folio-l6mo6e6b0-eddymissonipro-gmailcoms-projects.vercel.app`.

Depuis Vercel, projet `folio`, utiliser le retour arrière vers ce déploiement. Le retour arrière ne restaure pas la base Supabase. Les anciens lecteurs ne prennent pas en charge le nouveau format HTML : vérifier les articles publiés avant tout retour à l’ancien code. Aucun schéma SQL ni contenu de production n’est modifié pour cette livraison.

Les clés, fichiers `.env*`, données `.content`, outils de test locaux et compilations ne sont pas inclus dans Git.
