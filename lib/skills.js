export const skills = [
  {
    id: "strategie-ia",
    name: "Stratégie & Gouvernance IA",
    level: 90,
    years: 6,
    projects: 15,
    description: "Cadrage IA, qualification opportunités, feuilles de route IA",
    technologies: ["Cadrage IA", "ROI", "Conformité", "Feuilles de route"],
    color: "#3b82f6",
    contextDescription: "J'ai mis en place des cadres de qualification systématiques pour évaluer la valeur métier, la disponibilité des données et le ROI de chaque cas d'usage IA. Cette approche permet de prioriser les initiatives et de construire des feuilles de route cohérentes avec les enjeux business."
  },
  {
    id: "ia-generative",
    name: "IA Générative & LLM",
    level: 88,
    years: 4,
    projects: 12,
    description: "LLM, RAG, Azure OpenAI, agents IA, architectures multi-modèles",
    technologies: ["RAG", "LLM", "Azure OpenAI", "Mistral", "Claude", "Gemini"],
    color: "#8b5cf6",
    contextDescription: "J'ai développé une plateforme technique d'idéation RAG multi-modèles permettant aux chercheurs de trouver de nouvelles solutions industrielles à partir de problèmes techniques. L'architecture RAG avec FAISS et ChromaDB permet une recherche sémantique précise, tandis que le routage intelligent entre Azure OpenAI, Mistral, Claude et Gemini optimise les réponses. J'ai également assuré l'acculturation à l'IA des chercheurs à travers des formations et des ateliers pratiques."
  },
  {
    id: "data-analytics",
    name: "Data & Analytics",
    level: 92,
    years: 6,
    projects: 20,
    description: "Power BI, SQL, Python, Data Quality, ETL",
    technologies: ["Power BI", "SQL", "Python", "DAX", "ETL", "Data Quality"],
    color: "#10b981",
    contextDescription: "J'ai développé des infocentres économiques et des tableaux de bord Power BI pour piloter des centaines d'indicateurs en temps réel. SQL et Python automatisent les traitements complexes, tandis que DAX optimise les calculs. Les processus ETL garantissent la qualité des données pour transformer la data en insights actionnables."
  },
  {
    id: "consulting",
    name: "Consulting & Pilotage",
    level: 90,
    years: 6,
    projects: 25,
    description: "AMOA/AMOE, expertise fonctionnelle, cadrage de besoin, pilotage de projet, conduite du changement",
    technologies: ["AMOA", "AMOE", "Agile", "Scrum", "Ateliers", "Cadrage", "Pilotage"],
    color: "#f59e0b",
    contextDescription: "En tant qu'AMOA/AMOE, j'anime des ateliers métiers pour comprendre les enjeux réels et cadrer les besoins. Mon expertise fonctionnelle fait le lien entre exigences métiers et contraintes techniques. Le pilotage de projets data/IA nécessite une gestion rigoureuse des risques et une conduite du changement efficace."
  },
  {
    id: "architecture",
    name: "Architecture & Design",
    level: 85,
    years: 5,
    projects: 18,
    description: "Architecture technique, design de solutions, plateformes",
    technologies: ["Architecture", "Design", "Plateformes", "Microservices"],
    color: "#ef4444",
    contextDescription: "J'ai conçu des architectures de solutions IA complètes, incluant des systèmes RAG, des assistants métiers et des pipelines de données. L'approche fonctionnel → technique traduit les besoins métiers en architecture cohérente, optimisant performances et sécurité. FastAPI et Docker permettent de déployer ces solutions de manière fiable."
  },
  {
    id: "automation",
    name: "Automatisation",
    level: 87,
    years: 4,
    projects: 14,
    description: "Power Automate, Python automations, workflows",
    technologies: ["Power Automate", "Python", "Workflows", "Scripts"],
    color: "#06b6d4",
    contextDescription: "J'ai automatisé des pipelines IA et BI complexes avec Python pour traiter des volumes importants de données de manière fiable. Power Automate et Power Apps créent des workflows métiers connectant différents systèmes. Ces technologies gagnent du temps et améliorent la qualité des données."
  }
];

// Mapping des compétences vers les projets
export const skillToProjects = {
  "strategie-ia": ["rag-multimodel", "tech-lead-ia"],
  "ia-generative": ["rag-multimodel", "tech-lead-ia"],
  "data-analytics": ["bi-dashboard", "tech-lead-ia"],
  "consulting": ["bi-dashboard", "rag-multimodel", "tech-lead-ia"],
  "architecture": ["rag-multimodel", "tech-lead-ia"],
  "automation": ["bi-dashboard", "tech-lead-ia"]
};

// Technologies détaillées avec progression (toutes >= 75%, AUCUNE DUPLICATION)
// Chaque technologie n'apparaît qu'une seule fois dans la catégorie la plus logique
export const technologies = [
  // IA Générative & LLM
  { name: "Azure OpenAI", level: 88, category: "IA Générative & LLM" },
  { name: "Mistral AI", level: 85, category: "IA Générative & LLM" },
  { name: "Claude", level: 85, category: "IA Générative & LLM" },
  { name: "Gemini", level: 80, category: "IA Générative & LLM" },
  { name: "RAG", level: 90, category: "IA Générative & LLM" },
  { name: "FAISS", level: 82, category: "IA Générative & LLM" },
  { name: "ChromaDB", level: 80, category: "IA Générative & LLM" },
  { name: "Prompting", level: 100, category: "IA Générative & LLM" },
  { name: "Copilots", level: 80, category: "IA Générative & LLM" },
  { name: "Automatisation IA", level: 82, category: "IA Générative & LLM" },
  { name: "LLMOps", level: 78, category: "IA Générative & LLM" },
  { name: "Outils vectoriels", level: 80, category: "IA Générative & LLM" },
  { name: "LangChain", level: 75, category: "IA Générative & LLM" },
  { name: "Copilot Studio", level: 75, category: "IA Générative & LLM" },
  { name: "AWS Bedrock", level: 75, category: "IA Générative & LLM" },
  
  // Data & Analytics
  { name: "SQL", level: 90, category: "Data & Analytics" },
  { name: "Python", level: 85, category: "Data & Analytics" },
  { name: "DAX", level: 92, category: "Data & Analytics" },
  { name: "Power BI", level: 95, category: "Data & Analytics" },
  { name: "QlikView", level: 80, category: "Data & Analytics" },
  { name: "Cognos Analytics", level: 75, category: "Data & Analytics" },
  { name: "Data engineering", level: 80, category: "Data & Analytics" },
  { name: "Qualité des données", level: 88, category: "Data & Analytics" },
  { name: "ETL", level: 85, category: "Data & Analytics" },
  { name: "SQL Server", level: 88, category: "Data & Analytics" },
  { name: "Dataiku", level: 85, category: "Data & Analytics" },
  
  // Consulting & Pilotage
  { name: "Cadrage IA", level: 90, category: "Consulting & Pilotage" },
  { name: "Ateliers métiers", level: 88, category: "Consulting & Pilotage" },
  { name: "AMOA/AMOE", level: 90, category: "Consulting & Pilotage" },
  { name: "Gouvernance IA & ROI", level: 88, category: "Consulting & Pilotage" },
  { name: "Gestion d'opportunités IA & R&D", level: 85, category: "Consulting & Pilotage" },
  { name: "Pilotage de projets data/IA", level: 90, category: "Consulting & Pilotage" },
  { name: "Expertise fonctionnelle", level: 88, category: "Consulting & Pilotage" },
  { name: "Conduite du changement", level: 85, category: "Consulting & Pilotage" },
  { name: "Analyse processus", level: 87, category: "Consulting & Pilotage" },
  { name: "Gestion des risques", level: 85, category: "Consulting & Pilotage" },
  { name: "Planification", level: 88, category: "Consulting & Pilotage" },
  { name: "Jira", level: 88, category: "Consulting & Pilotage" },
  { name: "Confluence", level: 85, category: "Consulting & Pilotage" },
  
  // Architecture & Design
  { name: "Conception solution IA", level: 85, category: "Architecture & Design" },
  { name: "RAG (architecture)", level: 88, category: "Architecture & Design" },
  { name: "Assistants IA", level: 85, category: "Architecture & Design" },
  { name: "Pipelines IA", level: 82, category: "Architecture & Design" },
  { name: "Architecture data & décisionnelle", level: 85, category: "Architecture & Design" },
  { name: "Fonctionnel → technique", level: 88, category: "Architecture & Design" },
  { name: "FastAPI", level: 80, category: "Architecture & Design" },
  { name: "Docker", level: 80, category: "Architecture & Design" },
  
  // Automatisation
  { name: "VBA", level: 80, category: "Automatisation" },
  { name: "Power Automate", level: 85, category: "Automatisation" },
  { name: "Power Apps", level: 80, category: "Automatisation" },
  { name: "Automatisation pipelines IA", level: 82, category: "Automatisation" },
  { name: "Automatisation pipelines BI", level: 85, category: "Automatisation" },
  { name: "Workflows", level: 83, category: "Automatisation" },
  
  // Frameworks & Outils
  { name: "Streamlit", level: 82, category: "Frameworks & Outils" },
  { name: "Django", level: 78, category: "Frameworks & Outils" },
  { name: "Git", level: 90, category: "Frameworks & Outils" }
];

// Mapping des compétences vers les technologies (selon nouvelle répartition, sans doublons)
// Chaque technologie peut être référencée par plusieurs compétences mais n'existe qu'une fois dans technologies[]
export const skillToTechnologies = {
  "strategie-ia": [
    "Cadrage IA",
    "Gouvernance IA & ROI",
    "Gestion d'opportunités IA & R&D",
    "Pilotage de projets data/IA",
    "Jira",
    "Confluence"
  ],
  "ia-generative": [
    "Azure OpenAI",
    "Mistral AI",
    "Claude",
    "Gemini",
    "RAG",
    "FAISS",
    "ChromaDB",
    "Prompting",
    "Copilots",
    "Automatisation IA",
    "LLMOps",
    "Outils vectoriels",
    "LangChain",
    "Copilot Studio",
    "AWS Bedrock"
  ],
  "data-analytics": [
    "SQL",
    "Python",
    "DAX",
    "Power BI",
    "QlikView",
    "Cognos Analytics",
    "Data engineering",
    "Qualité des données",
    "ETL",
    "SQL Server",
    "Dataiku"
  ],
  "consulting": [
    "Cadrage IA",
    "Ateliers métiers",
    "AMOA/AMOE",
    "Gouvernance IA & ROI",
    "Gestion d'opportunités IA & R&D",
    "Pilotage de projets data/IA",
    "Expertise fonctionnelle",
    "Conduite du changement",
    "Analyse processus",
    "Gestion des risques",
    "Planification",
    "Jira",
    "Confluence"
  ],
  "architecture": [
    "Conception solution IA",
    "RAG (architecture)",
    "Assistants IA",
    "Pipelines IA",
    "Architecture data & décisionnelle",
    "Fonctionnel → technique",
    "FastAPI",
    "Docker"
  ],
  "automation": [
    "Python",
    "VBA",
    "Power Automate",
    "Power Apps",
    "Automatisation pipelines IA",
    "Automatisation pipelines BI",
    "Workflows"
  ]
};
