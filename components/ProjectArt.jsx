export const projectExamples = {
  probability: {
    title: "Un mot après l’autre",
    steps: [["Début de phrase", "« Ce matin, je bois un… »"], ["Suites possibles", "café · thé · chocolat"], ["Le réglage à essayer", "Changer la place du hasard"]],
    note: "Un mot probable n’est pas forcément une information vraie.",
  },
  constellation: {
    title: "D’autres mots, le même sujet",
    steps: [["Votre recherche", "« Une balade en forêt »"], ["Le texte à retrouver", "« Marcher parmi les arbres »"], ["La comparaison", "Mots identiques ou sens proche ?"]],
    note: "Parler du même sujet ne signifie pas dire la même chose.",
  },
  retrieval: {
    title: "Suivre l’information jusqu’à sa source",
    steps: [["La question", "« À quelle heure ouvre le café ? »"], ["La fiche consultée", "Les horaires du café"], ["L’essai à faire", "Retirer cette fiche et comparer"]],
    note: "Sans la bonne source, il peut manquer la réponse.",
  },
  boundary: {
    title: "Apprendre à partir d’exemples",
    steps: [["Les exemples", "Messages utiles et indésirables"], ["L’apprentissage", "Repérer des indices dans les messages"], ["La vérification", "Essayer des messages encore jamais vus"]],
    note: "Bloquer plus de messages peut aussi bloquer des messages utiles.",
  },
};

export default function ProjectArt({ motif, number, example: override }) {
  const example = override || projectExamples[motif];
  if (!example) return null;
  return <div className="u-project-art u-example">
    <p className="u-label">APERÇU DE L’EXPÉRIENCE {number}</p>
    <p className="u-example-title">{example.title}</p>
    <ol>{example.steps.map(([label, text], index) => <li key={label}><span className="u-example-index" aria-hidden="true">{index + 1}</span><div><span className="u-example-label">{label}</span><p>{text}</p></div></li>)}</ol>
    <p className="u-example-note">{example.note}</p>
  </div>;
}
