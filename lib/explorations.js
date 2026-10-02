export const explorations = [
  {
    slug: "next-token", number: "01", category: "ÉCRIRE AVEC L’IA", motif: "probability",
    name: "Comment une IA écrit-elle une phrase ?", title: "Comment une IA écrit-elle une phrase ?",
    description: "Complétez une phrase, changez la place du hasard et construisez sa suite un morceau à la fois.",
    intent: "Comprendre le rôle du texte reçu et du tirage dans la génération d’une réponse.",
    approach: "Le parcours explique un mécanisme, propose un essai, puis commente ce qui change. Les probabilités sont recalculées, les tirages sont réels et le carnet reprend vos observations.",
    limits: "Les scores sont préparés à la main pour rendre l’exemple lisible. La maquette ne contient pas un modèle de langage complet ; celui-ci recalcule ses scores à partir du contexte à chaque étape.",
    stack: ["Contexte", "Tokens", "Température", "Top-p"], level: "Sans prérequis", duration: "8 min", steps: 4,
    takeaway: "Comprendre pourquoi une même demande peut donner des réponses différentes."
  },
  {
    slug: "semantic-space", number: "02", category: "CHERCHER PAR LE SENS", motif: "constellation",
    name: "Comment retrouver un texte avec d’autres mots ?", title: "Comment retrouver un texte avec d’autres mots ?",
    description: "Cherchez un article sur une promenade sans écrire « promenade ». Découvrez comment des nombres rapprochent des textes.",
    intent: "Distinguer mots identiques, sujets proches et informations vérifiées.",
    approach: "L’expérience commence par une recherche familière. Elle montre ensuite des représentations simplifiées de phrases, calcule leurs similarités et compare deux sens du mot « souris ».",
    limits: "Les vecteurs sont préparés à la main sur quatre thèmes lisibles. Un vrai modèle apprend des dimensions généralement moins faciles à interpréter.",
    stack: ["NLP", "Embeddings", "Similarité cosinus"], level: "Sans prérequis", duration: "8 min", steps: 4,
    takeaway: "Comprendre comment on peut retrouver une information sans répéter ses mots."
  },
  {
    slug: "rag-observatory", number: "03", category: "RÉPONDRE AVEC DES DOCUMENTS", motif: "retrieval",
    name: "Comment une IA répond-elle à partir de documents ?", title: "Comment une IA répond-elle à partir de documents ?",
    description: "Trouvez les horaires d’un café, suivez la source jusqu’à la réponse, puis retirez le document qui contient l’information.",
    intent: "Comprendre la recherche d’informations, le contexte fourni et la vérification d’une citation.",
    approach: "Un café fictif fournit cinq fiches. La recherche locale classe leurs passages par TF-IDF et similarité cosinus. Les extraits sont repris tels quels pour pouvoir suivre précisément leur origine.",
    limits: "La maquette isole la recherche et la fidélité aux documents. Elle ne fait pas rédiger la réponse par un LLM et sa recherche par mots est plus simple qu’une recherche sémantique.",
    stack: ["RAG", "Recherche documentaire", "TF-IDF", "Citations"], level: "Sans prérequis", duration: "10 min", steps: 4,
    takeaway: "Savoir pourquoi une citation peut être présente sans justifier une réponse."
  },
  {
    slug: "classifier-clinic", number: "04", category: "APPRENDRE AVEC DES EXEMPLES", motif: "boundary",
    name: "Comment une IA apprend-elle à trier des messages ?", title: "Comment une IA apprend-elle à trier des messages ?",
    description: "Entraînez un petit filtre de courriels, essayez un message nouveau et comparez ses erreurs quand vous changez le seuil.",
    intent: "Suivre un apprentissage supervisé depuis les exemples jusqu’aux erreurs sur de nouveaux messages.",
    approach: "Une régression logistique apprend ses poids à partir de 12 messages fictifs. Le visiteur peut essayer d’autres messages, puis évaluer les décisions sur dix exemples distincts.",
    limits: "Deux caractéristiques et un très petit jeu de messages rendent l’apprentissage lisible. Les résultats ne mesurent pas les performances d’un filtre réel.",
    stack: ["Machine learning", "Régression logistique", "Précision", "Rappel"], level: "Sans prérequis", duration: "12 min", steps: 5,
    takeaway: "Distinguer ce que le modèle apprend, le score qu’il produit et la décision prise ensuite."
  }
];
export function findExploration(slug) { return explorations.find(item => item.slug === slug); }
