import { NextResponse } from "next/server";
import { executeSelectQuery } from "@/lib/sqlite-db";

export async function POST(request) {
  try {
    const { sql } = await request.json();

    if (!sql || typeof sql !== 'string') {
      return NextResponse.json(
        { error: "Requête SQL manquante ou invalide" },
        { status: 400 }
      );
    }

    console.log("SQL reçu pour exécution:", sql.substring(0, 200));

    // Exécuter la requête SQL de manière sécurisée
    const results = executeSelectQuery(sql);
    
    console.log("Résultats:", results.length, "lignes");

    return NextResponse.json({
      success: true,
      results: results,
      count: results.length
    });

  } catch (error) {
    console.error("SQL Execution Error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Erreur lors de l'exécution de la requête SQL",
        details: error.message
      },
      { status: 400 }
    );
  }
}

