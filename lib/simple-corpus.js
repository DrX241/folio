// Corpus simple et pédagogique pour RAG

export const simpleCorpus = [
  {
    id: "doc1",
    title: "Qu'est-ce que le RAG ?",
    text: "Le RAG (Retrieval-Augmented Generation) est une technique qui permet à une IA de répondre à des questions en s'appuyant sur des documents plutôt qu'en inventant. Le principe est simple : on cherche d'abord les passages pertinents dans un corpus de documents, puis on génère une réponse en utilisant ces passages comme contexte. Cela réduit les hallucinations et permet de citer les sources."
  },
  {
    id: "doc2",
    title: "Comment fonctionne la recherche ?",
    text: "La recherche dans un RAG se fait en deux étapes. D'abord, on découpe les documents en petits morceaux appelés chunks. Ensuite, pour chaque question, on compare la question avec chaque chunk pour trouver les plus pertinents. On peut utiliser des mots-clés, des similarités de texte, ou des embeddings. Les meilleurs chunks sont ensuite utilisés pour générer la réponse."
  },
  {
    id: "doc3",
    title: "Pourquoi citer les sources ?",
    text: "Citer les sources est essentiel dans un RAG. Cela permet de vérifier l'information, de comprendre d'où vient la réponse, et de donner confiance à l'utilisateur. Chaque passage utilisé doit être référencé avec son document d'origine et sa position. C'est ce qui différencie un RAG d'un simple chatbot qui invente des réponses."
  },
  {
    id: "doc4",
    title: "Les avantages du RAG",
    text: "Le RAG a plusieurs avantages. Il permet de mettre à jour les connaissances sans réentraîner le modèle. Il réduit les hallucinations en s'appuyant sur des documents vérifiés. Il offre de la traçabilité grâce aux citations. Il peut s'adapter à différents domaines en changeant simplement le corpus de documents."
  },
  {
    id: "doc5",
    title: "Les limites du RAG",
    text: "Le RAG a aussi des limites. Si le corpus ne contient pas l'information, le système ne peut pas répondre correctement. La qualité dépend de la pertinence des passages trouvés. Il faut bien choisir la taille des chunks et le nombre de passages à utiliser. Enfin, le RAG nécessite un corpus de qualité et bien organisé."
  }
];

