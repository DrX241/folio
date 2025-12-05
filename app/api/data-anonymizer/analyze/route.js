import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Fonction pour parser CSV
function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  if (lines.length === 0) return { headers: [], rows: [] };
  
  const headers = lines[0].split(";").map(h => h.trim());
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(";").map(v => v.trim());
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || "";
      });
      rows.push(row);
    }
  }
  
  return { headers, rows };
}

// Fonction pour parser JSON
function parseJSON(jsonText) {
  try {
    const data = JSON.parse(jsonText);
    if (Array.isArray(data)) {
      if (data.length === 0) return { headers: [], rows: [] };
      const headers = Object.keys(data[0]);
      return { headers, rows: data };
    } else if (typeof data === "object") {
      const headers = Object.keys(data);
      return { headers, rows: [data] };
    }
    return { headers: [], rows: [] };
  } catch (e) {
    throw new Error("JSON invalide");
  }
}

// Détecter le type de données sensibles
function detectSensitiveType(columnName, sampleValues) {
  const nameLower = columnName.toLowerCase();
  const values = sampleValues.filter(v => v && String(v).trim().length > 0);
  
  if (values.length === 0) {
    return { type: "unknown", riskLevel: "low", suggestedMethod: "mask" };
  }

  // Détection par nom de colonne
  if (nameLower.includes("email") || nameLower.includes("mail") || nameLower.includes("courriel")) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = values.some(v => emailRegex.test(String(v)));
    if (isEmail) {
      return { type: "email", riskLevel: "high", suggestedMethod: "generate" };
    }
  }

  if (nameLower.includes("telephone") || nameLower.includes("phone") || nameLower.includes("tel") || nameLower.includes("mobile")) {
    const phoneRegex = /(\+33|0)[1-9](\d{2}){4}/;
    const isPhone = values.some(v => phoneRegex.test(String(v).replace(/\s/g, "")));
    if (isPhone) {
      return { type: "telephone", riskLevel: "high", suggestedMethod: "generate" };
    }
  }

  if (nameLower.includes("nom") && !nameLower.includes("utilisateur") && !nameLower.includes("user")) {
    return { type: "nom", riskLevel: "high", suggestedMethod: "generate" };
  }

  if (nameLower.includes("prenom") || nameLower.includes("prénom")) {
    return { type: "prenom", riskLevel: "high", suggestedMethod: "generate" };
  }

  if (nameLower.includes("adresse") || nameLower.includes("address")) {
    return { type: "adresse", riskLevel: "high", suggestedMethod: "generalize" };
  }

  if (nameLower.includes("date") && (nameLower.includes("naissance") || nameLower.includes("birth"))) {
    return { type: "date_naissance", riskLevel: "high", suggestedMethod: "generalize" };
  }

  if (nameLower.includes("ssn") || nameLower.includes("nir") || nameLower.includes("securite") || nameLower.includes("sécurité")) {
    return { type: "identifiant_securite", riskLevel: "high", suggestedMethod: "hash" };
  }

  if (nameLower.includes("carte") || nameLower.includes("card") || nameLower.includes("iban") || nameLower.includes("rib")) {
    return { type: "donnee_bancaire", riskLevel: "high", suggestedMethod: "remove" };
  }

  if (nameLower.includes("ip") || nameLower.includes("adresse_ip")) {
    return { type: "ip", riskLevel: "medium", suggestedMethod: "mask" };
  }

  // Détection par contenu
  const firstValue = String(values[0] || "");
  
  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(firstValue)) {
    return { type: "email", riskLevel: "high", suggestedMethod: "generate" };
  }

  // Téléphone français
  const phoneRegex = /(\+33|0)[1-9](\d{2}){4}/;
  if (phoneRegex.test(firstValue.replace(/\s/g, ""))) {
    return { type: "telephone", riskLevel: "high", suggestedMethod: "generate" };
  }

  // Date
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$|^\d{4}-\d{2}-\d{2}$/;
  if (dateRegex.test(firstValue)) {
    return { type: "date", riskLevel: "medium", suggestedMethod: "generalize" };
  }

  // IP
  const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  if (ipRegex.test(firstValue)) {
    return { type: "ip", riskLevel: "medium", suggestedMethod: "mask" };
  }

  // Nom propre (commence par majuscule, 2-3 mots)
  if (firstValue.match(/^[A-Z][a-z]+(\s+[A-Z][a-z]+){0,2}$/)) {
    return { type: "nom_propre", riskLevel: "medium", suggestedMethod: "generate" };
  }

  return { type: "texte", riskLevel: "low", suggestedMethod: "mask" };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { dataInput, dataFormat = "csv" } = body || {};

    if (!dataInput || !dataInput.trim()) {
      return NextResponse.json(
        { error: "Les données à analyser sont obligatoires." },
        { status: 400 }
      );
    }

    // Parser les données
    let headers, rows;
    try {
      if (dataFormat === "csv") {
        const parsed = parseCSV(dataInput);
        headers = parsed.headers;
        rows = parsed.rows;
      } else {
        const parsed = parseJSON(dataInput);
        headers = parsed.headers;
        rows = parsed.rows;
      }
    } catch (e) {
      return NextResponse.json(
        { error: `Erreur lors du parsing des données: ${e.message}` },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Aucune donnée à analyser après parsing." },
        { status: 400 }
      );
    }

    // Analyser chaque colonne
    const columns = headers.map(header => {
      const sampleValues = rows.slice(0, Math.min(10, rows.length)).map(row => row[header]);
      const detection = detectSensitiveType(header, sampleValues);
      
      return {
        name: header,
        detectedType: detection.type,
        riskLevel: detection.riskLevel,
        suggestedMethod: detection.suggestedMethod
      };
    });

    return NextResponse.json({
      success: true,
      columns,
      rowCount: rows.length,
      previewData: rows.slice(0, Math.min(20, rows.length)) // Envoyer un échantillon pour prévisualisation
    });
  } catch (error) {
    console.error("Data anonymizer analysis error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de l'analyse des données.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

