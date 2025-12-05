import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Tâches prédéfinies
const challenges = [
  {
    id: "summarize_1",
    taskType: "summarize",
    inputText: `L'intelligence artificielle générative représente une révolution technologique majeure qui transforme la manière dont nous interagissons avec les systèmes informatiques. Ces modèles, entraînés sur d'immenses volumes de données, sont capables de générer du contenu textuel, visuel ou audio de manière autonome. Les applications sont nombreuses : assistants conversationnels, génération de code, création de contenu marketing, traduction automatique, et bien d'autres. Cependant, cette technologie soulève également des questions importantes concernant l'éthique, la propriété intellectuelle, et l'impact sur l'emploi. Il est essentiel de développer ces outils de manière responsable, en tenant compte des biais potentiels et en garantissant la transparence des processus de décision.`,
    expectedOutput: "Résumé concis en 2-3 phrases",
    criteria: ["Longueur appropriée (2-3 phrases)", "Idées principales présentes", "Cohérence"]
  },
  {
    id: "summarize_2",
    taskType: "summarize",
    inputText: `Le machine learning opérationnel (MLOps) est une discipline qui combine le machine learning et les pratiques DevOps pour déployer et maintenir des modèles ML en production de manière fiable et scalable. Les principaux défis incluent la gestion des versions de modèles, le monitoring des performances en temps réel, la détection de dérive des données, et l'automatisation des pipelines de retraining. Les outils MLOps permettent de réduire le temps entre le développement d'un modèle et son déploiement, tout en garantissant sa qualité et sa performance continue.`,
    expectedOutput: "Résumé en une phrase",
    criteria: ["Une seule phrase", "Définition claire de MLOps", "Mention des bénéfices"]
  },
  {
    id: "transform_1",
    taskType: "transform",
    inputText: `Nom;Age;Ville
Jean Dupont;30;Paris
Marie Martin;25;Lyon
Pierre Durand;35;Marseille`,
    expectedOutput: "Format JSON avec clés en camelCase",
    criteria: ["Format JSON valide", "Clés en camelCase", "Toutes les données présentes"]
  },
  {
    id: "transform_2",
    taskType: "transform",
    inputText: `Produit;Prix;Stock
Laptop;999;15
Souris;25;100
Clavier;75;50`,
    expectedOutput: "Liste HTML avec balises <ul> et <li>",
    criteria: ["Format HTML valide", "Structure <ul><li>", "Tous les produits listés"]
  },
  {
    id: "extract_1",
    taskType: "extract",
    inputText: `Bonjour, je m'appelle Sophie Bernard et je travaille chez TechCorp depuis 2020. Mon email est sophie.bernard@techcorp.com et mon téléphone est le 06 12 34 56 78. J'habite au 15 rue de la République, 75001 Paris.`,
    expectedOutput: "Extraction des entités : nom, email, téléphone, adresse",
    criteria: ["Nom extrait", "Email extrait", "Téléphone extrait", "Adresse extraite"]
  },
  {
    id: "extract_2",
    taskType: "extract",
    inputText: `Réunion prévue le 15 mars 2024 à 14h30 avec l'équipe Data Science. Participants : Alice Martin (alice@company.com), Bob Dupont (bob@company.com), et Claire Leroy (claire@company.com). Ordre du jour : revue des modèles ML, planification Q2, budget analytics.`,
    expectedOutput: "Extraction : date, heure, participants (noms et emails), sujets",
    criteria: ["Date extraite", "Heure extraite", "Tous les participants", "Sujets identifiés"]
  }
];

export async function GET() {
  try {
    // Sélectionner un challenge aléatoire
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    
    // Générer un prompt initial basique selon le type
    let initialPrompt = "";
    if (randomChallenge.taskType === "summarize") {
      initialPrompt = "Résume ce texte.";
    } else if (randomChallenge.taskType === "transform") {
      initialPrompt = "Transforme ces données.";
    } else if (randomChallenge.taskType === "extract") {
      initialPrompt = "Extrais les informations importantes.";
    }

    return NextResponse.json({
      ...randomChallenge,
      initialPrompt
    });
  } catch (error) {
    console.error("Challenge generation error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la génération du challenge.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  // Même logique que GET
  return GET();
}

