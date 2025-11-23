export const caseStudies = [
  {
    id: "rag-multimodel",
    title: "Plateforme RAG Multi-modèles pour la R&D",
    client: "Acteur majeur de l'énergie",
    period: "05/2024 — En cours",
    role: "Chef de Projet & Expert IA — AI4R&T",
    problem: "Les chercheurs de la R&D avaient besoin d'accéder rapidement à une connaissance dispersée dans des milliers de documents techniques, brevets et publications. La recherche manuelle était chronophage et limitait l'innovation. De plus, ils manquaient d'acculturation à l'IA pour identifier de nouvelles solutions industrielles à partir de problèmes techniques.",
    solution: "Conception et déploiement d'une plateforme technique d'idéation basée sur une architecture RAG (Retrieval-Augmented Generation) multi-modèles. Cette plateforme permet aux chercheurs de trouver de nouvelles solutions industrielles à partir de problèmes techniques en croisant connaissances documentaires et capacités de génération IA. Intégration de GPT-4, Mistral, Claude et Gemini avec routage intelligent selon le type de requête. Mise en place d'un système de chunking optimisé et d'embeddings pour la recherche sémantique. Acculturation des chercheurs à l'IA à travers des formations et des ateliers pratiques.",
    result: "Plus de 40 cas d'usage d'IA déployés au sein de la R&D. Réduction de 70% du temps de recherche documentaire. Amélioration de la qualité des réponses grâce au contexte enrichi. Formation et acculturation de 200+ chercheurs aux outils d'IA générative. La plateforme d'idéation permet désormais de générer de nouvelles solutions industrielles innovantes à partir de problèmes techniques complexes.",
    metrics: [
      { key: "use-cases", value: 40, suffix: "+", label: "Cas d'usage" },
      { key: "researchers", value: 200, suffix: "+", label: "Utilisateurs formés" },
      { key: "time-saved", value: 70, suffix: "%", label: "Temps gagné" }
    ],
    stack: [
      "Python",
      "FastAPI",
      "Azure OpenAI",
      "Mistral AI",
      "Claude (Anthropic)",
      "Gemini",
      "FAISS",
      "ChromaDB",
      "RAG",
      "Multi-modèles"
    ],
    phases: [
      {
        period: "Mai - Juin 2024",
        title: "Cadrage & Architecture",
        description: "Analyse des besoins, conception de l'architecture RAG pour la plateforme d'idéation, sélection des modèles et définition de la stratégie de chunking. Définition du programme d'acculturation à l'IA."
      },
      {
        period: "Juillet - Septembre 2024",
        title: "Développement & Intégration",
        description: "Développement de la plateforme technique d'idéation, intégration des modèles LLM, mise en place du système de routage et des embeddings. Démarrage des ateliers d'acculturation à l'IA."
      },
      {
        period: "Octobre 2024 - En cours",
        title: "Déploiement & Acculturation",
        description: "Déploiement progressif de la plateforme, formation et acculturation des chercheurs à l'IA, optimisation continue et extension à de nouveaux cas d'usage. La plateforme permet désormais de générer de nouvelles solutions industrielles à partir de problèmes techniques."
      }
    ]
  },
  {
    id: "bi-dashboard",
    title: "Infocentre Économique & Tableaux de Bord BI",
    client: "Acteur majeur du transport",
    period: "05/2022 — 04/2024",
    role: "Chef de projet AMOA/AMOE Data & BI",
    problem: "Le suivi de centaines d'indicateurs économiques et contractuels avec Île-de-France Mobilités nécessitait une consolidation manuelle complexe. Les instances dirigeantes manquaient de visibilité en temps réel sur les coûts et la performance.",
    solution: "Développement d'un infocentre économique centralisé avec automatisation des traitements de données. Création de tableaux de bord Power BI pour le pilotage des coûts et de la performance. Mise en place de processus ETL robustes et de contrôles qualité.",
    result: "Suivi automatisé de 300+ indicateurs économiques et contractuels. Réduction de 50% du temps de consolidation. Tableaux de bord utilisés quotidiennement par les instances dirigeantes. Amélioration de la qualité des données grâce aux contrôles automatisés.",
    metrics: [
      { key: "indicators", value: 300, suffix: "+", label: "Indicateurs" },
      { key: "time-saved", value: 50, suffix: "%", label: "Temps gagné" },
      { key: "dashboards", value: 15, suffix: "+", label: "Tableaux de bord" }
    ],
    stack: [
      "Power BI",
      "SQL Server",
      "DAX",
      "ETL",
      "Data Quality",
      "Automation"
    ],
    phases: [
      {
        period: "Mai - Août 2022",
        title: "Analyse & Conception",
        description: "Recueil des besoins, analyse des sources de données, conception de l'architecture de l'infocentre et définition des indicateurs clés."
      },
      {
        period: "Septembre 2022 - Mars 2023",
        title: "Développement & Automatisation",
        description: "Développement des processus ETL, création des tableaux de bord Power BI, mise en place des contrôles qualité et automatisation des traitements."
      },
      {
        period: "Avril 2023 - Avril 2024",
        title: "Déploiement & Évolution",
        description: "Déploiement progressif, formation des utilisateurs, maintenance et évolution continue selon les besoins métiers."
      }
    ]
  },
  {
    id: "tech-lead-ia",
    title: "Tech Lead Stream IA & Data Science",
    client: "Cabinet de conseil",
    period: "01/2025 — En cours",
    role: "Tech Lead — Stream IA & Data Science",
    problem: "Le cabinet avait besoin de structurer et piloter l'ensemble de ses projets IA de façon cohérente, de l'idée à l'industrialisation. Manque de coordination entre les projets et besoin de diffuser la culture IA en interne.",
    solution: "Structuration et pilotage de l'ensemble des projets IA du cabinet. Développement de solutions d'IA générative comme le RAG multi-modèles. Coordination de la communauté Data & IA. Création du média IA'ctualités pour diffuser la culture IA en interne et auprès des écoles partenaires.",
    result: "Pilotage cohérent de tous les projets IA du cabinet. Communauté Data & IA active et structurée. Média IA'ctualités créé et diffusé. Formation continue des équipes aux nouvelles technologies d'IA.",
    metrics: [
      { key: "projects", value: 10, suffix: "+", label: "Projets pilotés" },
      { key: "community", value: 50, suffix: "+", label: "Membres communauté" },
      { key: "articles", value: 20, suffix: "+", label: "Articles publiés" }
    ],
    stack: [
      "Tech Lead",
      "IA Générative",
      "RAG",
      "Formation",
      "Community Management",
      "Stratégie IA"
    ],
    phases: [
      {
        period: "Janvier 2025",
        title: "Structuration",
        description: "Analyse de l'existant, structuration du Stream IA & Data Science, définition de la roadmap et des processus de pilotage."
      },
      {
        period: "Février - Mars 2025",
        title: "Développement & Coordination",
        description: "Développement des solutions d'IA générative, coordination de la communauté Data & IA, lancement du média IA'ctualités."
      },
      {
        period: "Avril 2025 - En cours",
        title: "Industrialisation",
        description: "Industrialisation des projets, formation continue, évolution des solutions et extension de la communauté."
      }
    ]
  }
];


