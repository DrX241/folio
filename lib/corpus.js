// Corpus embarqué pour RAG Studio

export const corpusData = [
  {
    id: "d1",
    title: "Introduction au RAG",
    domain: "Fondamentaux",
    text: "L'architecture RAG (Retrieval-Augmented Generation) permet d'enrichir les réponses des LLM avec des connaissances externes. Elle combine recherche vectorielle et génération pour produire des réponses contextualisées et fiables. Les bénéfices principaux sont la fraîcheur des informations (mise à jour du corpus sans réentraîner le modèle), la traçabilité (chaque réponse peut citer ses sources), et la réduction des hallucinations (le modèle s'appuie sur des documents vérifiés). Les paramètres clés incluent le chunk size (taille des morceaux de texte), l'overlap (recouvrement entre chunks), le top-k (nombre de passages retenus), et la température (créativité de la génération)."
  },
  {
    id: "d2",
    title: "Paramètres & bonnes pratiques",
    domain: "Configuration",
    text: "Le chunk size optimal dépend du type de contenu : pour des documents techniques, 300-500 tokens fonctionnent bien, tandis que des textes narratifs peuvent supporter 600-800 tokens. L'overlap de 50-100 tokens préserve le contexte entre chunks et améliore la qualité de la recherche. Le top-k doit être ajusté selon la précision souhaitée : 3-5 passages donnent généralement un bon équilibre entre pertinence et bruit. La similarité cosinus est la métrique standard pour comparer les vecteurs d'embeddings. La qualité des sources est cruciale : un corpus bruité ou incomplet dégrade les résultats. Les métadonnées (auteur, date, domaine) enrichissent le contexte et permettent un filtrage fin."
  },
  {
    id: "d3",
    title: "RAG en R&D",
    domain: "Applications",
    text: "En environnement R&D, le RAG sert à la veille technologique (surveillance de brevets, publications scientifiques), à l'idéation (génération d'idées basées sur l'état de l'art), et à la protection de la propriété intellectuelle (analyse de similarités, détection de risques). Les architectures multi-modèles permettent de sélectionner dynamiquement GPT-4 pour la créativité, Mistral pour la rapidité, ou Claude pour l'analyse détaillée. La gouvernance inclut la sécurité (chiffrement, habilitations), la conformité (RGPD, audit), et le monitoring des usages. L'adoption utilisateur nécessite des interfaces intuitives, une formation adaptée, et un feedback continu pour améliorer la qualité des réponses."
  },
  {
    id: "d4",
    title: "Erreurs fréquentes & mitigations",
    domain: "Troubleshooting",
    text: "Les chunks trop grands (1000+ tokens) diluent l'information et réduisent la précision de la recherche. Les chunks trop petits (50-100 tokens) perdent le contexte et génèrent des réponses fragmentées. Les top-k extrêmes (1 seul passage ou 20+) produisent soit des réponses incomplètes soit du bruit. Un corpus bruité (documents non pertinents, doublons) pollue les résultats. Les réponses sans citations sont non traçables et peu fiables. Pour corriger : ajuster le chunk size selon le contenu, tester plusieurs valeurs de top-k, nettoyer le corpus régulièrement, forcer la citation des sources dans le prompt, et évaluer la qualité avec des métriques comme RAGAS (relevance, faithfulness, completeness)."
  }
];

