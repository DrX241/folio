import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/sqlite-db";

export async function GET() {
  try {
    const db = getDatabase();
    
    // Test 1: Compter les lignes dans ventes
    const ventesCount = db.prepare("SELECT COUNT(*) as count FROM ventes").get();
    
    // Test 2: Compter les lignes dans clients
    const clientsCount = db.prepare("SELECT COUNT(*) as count FROM clients").get();
    
    // Test 3: Récupérer quelques ventes
    const ventes = db.prepare("SELECT * FROM ventes LIMIT 3").all();
    
    // Test 4: Récupérer quelques clients
    const clients = db.prepare("SELECT * FROM clients LIMIT 3").all();
    
    // Test 5: Requête avec ORDER BY
    const topClients = db.prepare("SELECT * FROM clients ORDER BY ca_total DESC LIMIT 3").all();
    
    // Test 6: Requête avec WHERE
    const ventesParis = db.prepare("SELECT * FROM ventes WHERE region = 'Paris'").all();
    
    return NextResponse.json({
      success: true,
      tests: {
        ventesCount: ventesCount.count,
        clientsCount: clientsCount.count,
        ventes: ventes,
        clients: clients,
        topClients: topClients,
        ventesParis: ventesParis
      },
      message: "Base de données opérationnelle ✓"
    });
    
  } catch (error) {
    console.error("Test DB Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

















