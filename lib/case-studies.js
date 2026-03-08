export const caseStudies = [
  {
    id: "rag-multimodel",
    title: "Plateforme IA générative & RAG pour la R&D",
    client: "TotalEnergies",
    period: "05/2024 — 08/2025",
    role: "Tech Lead IA Générative — Programmes R&D & Innovation",
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
        period: "Octobre 2024 - Août 2025",
        title: "Déploiement & Acculturation",
        description: "Déploiement progressif de la plateforme, formation et acculturation des chercheurs à l'IA, optimisation continue et extension à de nouveaux cas d'usage. Qualification des solutions : valeur métier, sécurité, conformité."
      }
    ]
  },
  {
    id: "bi-dashboard",
    title: "Infocentre Économique & Tableaux de Bord BI",
    client: "RATP",
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
    title: "Tech Lead Data & IA — Transformation et Industrialisation",
    client: "mc2i",
    period: "01/2024 — En cours",
    role: "Tech Lead Data & IA",
    problem: "Structurer et piloter les programmes Data/IA pour grands comptes, prioriser les initiatives stratégiques, industrialiser les prototypes IA et accompagner les directions métiers.",
    solution: "Structuration de feuilles de route IA et priorisation des initiatives. Conception de solutions IA : assistants métiers, moteurs RAG, outils décisionnels. Cadrage d'architectures Data/IA et choix des briques technologiques. Industrialisation de prototypes IA vers la production. Valorisation des résultats via supports exécutifs et média IA'ctualités.",
    result: "Pilotage cohérent des programmes Data/IA pour grands comptes. Équipes techniques encadrées et directions métiers accompagnées. Solutions IA industrialisées en production.",
    metrics: [
      { key: "projects", value: 10, suffix: "+", label: "Projets pilotés" },
      { key: "community", value: 50, suffix: "+", label: "Membres communauté" },
      { key: "articles", value: 20, suffix: "+", label: "Articles publiés" }
    ],
    stack: [
      "Tech Lead",
      "IA Générative",
      "RAG",
      "Industrialisation IA",
      "Stratégie IA",
      "Consulting"
    ],
    phases: [
      {
        period: "Janvier - Juin 2024",
        title: "Structuration",
        description: "Analyse de l'existant, structuration des programmes Data/IA, définition des feuilles de route et des processus de pilotage."
      },
      {
        period: "Juillet 2024 - 2025",
        title: "Développement & Industrialisation",
        description: "Conception d'assistants métiers et moteurs RAG, industrialisation des prototypes, coordination des équipes, lancement du média IA'ctualités."
      },
      {
        period: "En cours",
        title: "Extension & Valorisation",
        description: "Extension des programmes, valorisation des résultats via supports exécutifs et dispositifs d'acculturation."
      }
    ]
  }
];


