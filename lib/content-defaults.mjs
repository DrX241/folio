export const pageFields = {
  home: {
    label: 'Accueil',
    fields: {
      title: ['Titre principal (une ligne par partie)', 'Penser juste.\nConstruire\nutile.'],
      intro: ['Présentation', 'J’explore le lien entre les idées, les systèmes et les personnes qui leur donnent du sens.'],
      convictionTitle: ['Titre de la conviction (une ligne par partie)', 'La bonne question\nchange tout.'],
      conviction: ['Votre conviction', 'Avant de choisir un modèle, une architecture ou une technologie, je cherche à comprendre ce qui mérite d’être résolu.'],
      about: ['Présentation courte en bas de page', 'Je suis Eddy Missoni. Mon terrain de jeu se situe à la rencontre de la Data, de l’IA et des usages. J’aime comprendre, cadrer et simplifier, pour construire des solutions que les équipes peuvent s’approprier.'],
    },
  },
  about: {
    label: 'À propos',
    fields: {
      title: ['Titre', 'Eddy Missoni'],
      subtitle: ['Sous-titre', 'Tech Lead Data & IA.'],
      intro: ['Introduction', 'Je suis Eddy Missoni, Tech Lead Data & IA. J’accompagne la conception et le déploiement de solutions à la croisée de la stratégie, de l’architecture et des usages.'],
      heading: ['Titre de la présentation', 'Mon rôle dans un projet'],
      body: ['Présentation (séparer les paragraphes par une ligne vide)', 'Mon travail relie les enjeux métiers aux décisions techniques : clarifier ce que l’on veut accomplir, structurer la démarche et accompagner les équipes jusqu’à la mise en œuvre.\n\nCe site est mon espace personnel. J’y rassemble mes explorations, mes projets et les réflexions que je souhaite partager autour de la Data et de l’IA.'],
    },
  },
  vision: {
    label: 'Vision',
    fields: {
      title: ['Titre', 'Cadrer un projet'],
      subtitle: ['Sous-titre', 'Data ou IA.'],
      intro: ['Introduction', 'Pour chaque étape : les questions à résoudre, le livrable attendu et un exemple que vous pouvez examiner sur ce site.'],
      step1Title: ['Étape 1 — titre', 'Définir le besoin'],
      step1Text: ['Étape 1 — explication', 'Qui utilisera le résultat ? Quelle décision doit-il aider à prendre ? Que fait-on aujourd’hui sans IA ?'],
      step1Result: ['Étape 1 — résultat attendu', 'Livrable : une situation d’usage, ses utilisateurs et un critère de réussite observable.'],
      step2Title: ['Étape 2 — titre', 'Décrire les contraintes'],
      step2Text: ['Étape 2 — explication', 'Quelles données sont disponibles ? Peut-on les utiliser ? Quels délais, coûts et erreurs sont acceptables ?'],
      step2Result: ['Étape 2 — résultat attendu', 'Livrable : un périmètre de test, les données retenues et les limites de l’essai.'],
      step3Title: ['Étape 3 — titre', 'Vérifier le résultat'],
      step3Text: ['Étape 3 — explication', 'Sur quels exemples distincts du jeu d’apprentissage teste-t-on ? Quels types d’erreurs observe-t-on ? Dans quels cas faut-il s’abstenir ?'],
      step3Result: ['Étape 3 — résultat attendu', 'Livrable : des résultats de test, les erreurs examinées et les conditions d’utilisation.'],
      heading: ['Titre de conclusion', 'Ce que ces démonstrateurs permettent de vérifier'],
      body: ['Conclusion', 'Ils isolent un mécanisme sur des données pédagogiques. Vous pouvez changer un paramètre et comparer le résultat. Ils ne permettent pas de conclure aux performances d’un système sur des données professionnelles.'],
    },
  },
};
export function defaultPages() {
  return Object.fromEntries(Object.entries(pageFields).map(([key, page]) => [key, Object.fromEntries(Object.entries(page.fields).map(([field, [, value]]) => [field, value]))]));
}
