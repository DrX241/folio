"use client";
import { useState } from "react";

// Base de données d'exemple (simulée en mémoire)
const sampleDatabase = {
  tables: [
    {
      name: "ventes",
      columns: [
        { name: "id", type: "INTEGER", description: "Identifiant unique de la vente" },
        { name: "date_vente", type: "DATE", description: "Date de la vente" },
        { name: "client", type: "VARCHAR(100)", description: "Nom du client" },
        { name: "produit", type: "VARCHAR(100)", description: "Nom du produit" },
        { name: "quantite", type: "INTEGER", description: "Quantité vendue" },
        { name: "prix_unitaire", type: "DECIMAL(10,2)", description: "Prix unitaire" },
        { name: "ca", type: "DECIMAL(10,2)", description: "Chiffre d'affaires (quantite * prix_unitaire)" },
        { name: "region", type: "VARCHAR(50)", description: "Région de vente" }
      ],
      sampleData: [
        { id: 1, date_vente: "2024-01-15", client: "Entreprise A", produit: "Produit X", quantite: 10, prix_unitaire: 100, ca: 1000, region: "Paris" },
        { id: 2, date_vente: "2024-01-20", client: "Entreprise B", produit: "Produit Y", quantite: 5, prix_unitaire: 200, ca: 1000, region: "Lyon" },
        { id: 3, date_vente: "2024-02-10", client: "Entreprise A", produit: "Produit Z", quantite: 8, prix_unitaire: 150, ca: 1200, region: "Paris" },
        { id: 4, date_vente: "2024-02-15", client: "Entreprise C", produit: "Produit X", quantite: 15, prix_unitaire: 100, ca: 1500, region: "Marseille" },
        { id: 5, date_vente: "2024-03-01", client: "Entreprise B", produit: "Produit Y", quantite: 12, prix_unitaire: 200, ca: 2400, region: "Lyon" }
      ]
    },
    {
      name: "clients",
      columns: [
        { name: "id", type: "INTEGER", description: "Identifiant unique du client" },
        { name: "nom", type: "VARCHAR(100)", description: "Nom du client" },
        { name: "ville", type: "VARCHAR(50)", description: "Ville du client" },
        { name: "secteur", type: "VARCHAR(50)", description: "Secteur d'activité" },
        { name: "ca_total", type: "DECIMAL(10,2)", description: "Chiffre d'affaires total avec ce client" }
      ],
      sampleData: [
        { id: 1, nom: "Entreprise A", ville: "Paris", secteur: "Technologie", ca_total: 2200 },
        { id: 2, nom: "Entreprise B", ville: "Lyon", secteur: "Commerce", ca_total: 3400 },
        { id: 3, nom: "Entreprise C", ville: "Marseille", secteur: "Industrie", ca_total: 1500 }
      ]
    }
  ]
};

export default function TextToSQL() {
  const [question, setQuestion] = useState("");
  const [sqlQuery, setSqlQuery] = useState("");
  const [results, setResults] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const generateSQL = async () => {
    if (!question.trim()) {
      setError("Veuillez saisir une question");
      return;
    }

    setIsLoading(true);
    setError("");
    setResults(null);
    setExplanation("");

    try {
      // Construire le contexte pour le LLM avec le schéma de la base de données
      const schemaContext = sampleDatabase.tables.map(table => {
        const columns = table.columns.map(col => `${col.name} (${col.type}) - ${col.description}`).join(", ");
        return `Table: ${table.name}\nColonnes: ${columns}`;
      }).join("\n\n");

      const systemPrompt = `Tu es un expert SQL qui convertit des questions en français en requêtes SQL.

Schéma de la base de données :
${schemaContext}

RÈGLES STRICTES :
1. Génère UNIQUEMENT la requête SQL, rien d'autre
2. Pas d'explication, pas de texte avant ou après
3. Utilise les noms de tables et colonnes EXACTS du schéma
4. Sois précis et optimisé
5. Réponds UNIQUEMENT avec la requête SQL, sans markdown, sans balises, sans commentaires`;

      const userMessage = `Question en français : "${question}"

Génère UNIQUEMENT la requête SQL correspondante, sans aucun texte supplémentaire.`;

      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `${systemPrompt}\n\n${userMessage}`,
          conversationHistory: []
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setIsLoading(false);
        return;
      }

      // Extraire la requête SQL de la réponse
      let generatedSQL = data.message.trim();
      
      // Nettoyer complètement la réponse pour extraire uniquement le SQL
      // 1. Enlever tout le texte avant SELECT/WITH/INSERT/UPDATE/DELETE
      const sqlStartMatch = generatedSQL.match(/(SELECT|WITH|INSERT|UPDATE|DELETE)[\s\S]*/i);
      if (sqlStartMatch) {
        generatedSQL = sqlStartMatch[0];
      }
      
      // 2. Enlever le texte après la fin de la requête (chercher le point-virgule ou la fin logique)
      // Pour SELECT, chercher jusqu'au dernier FROM/JOIN/WHERE/GROUP BY/ORDER BY/LIMIT
      if (generatedSQL.toUpperCase().startsWith("SELECT")) {
        // Extraire jusqu'à la fin logique de la requête
        const sqlEndMatch = generatedSQL.match(/(SELECT[\s\S]*?)(?:FROM|JOIN|WHERE|GROUP BY|ORDER BY|LIMIT|HAVING)[\s\S]*?(?:LIMIT|ORDER BY|GROUP BY|HAVING|$)/i);
        if (sqlEndMatch) {
          generatedSQL = sqlEndMatch[0];
        }
        // Enlever tout ce qui suit après un point-virgule ou une ligne vide
        const semicolonIndex = generatedSQL.indexOf(';');
        if (semicolonIndex !== -1) {
          generatedSQL = generatedSQL.substring(0, semicolonIndex);
        }
        // Enlever les lignes vides et le texte après
        const lines = generatedSQL.split('\n');
        const sqlLines = [];
        let foundSQL = false;
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.toUpperCase().startsWith("SELECT") || foundSQL) {
            foundSQL = true;
            if (trimmedLine && !trimmedLine.match(/^(explication|note|réponse|voici|la requête)/i)) {
              sqlLines.push(line);
            } else if (trimmedLine.match(/^[A-Z\s,()*'"]+$/i) || trimmedLine.includes("FROM") || trimmedLine.includes("WHERE") || trimmedLine.includes("ORDER") || trimmedLine.includes("GROUP") || trimmedLine.includes("LIMIT")) {
              sqlLines.push(line);
            } else if (trimmedLine === "" && sqlLines.length > 0) {
              break; // Arrêter à la première ligne vide après le SQL
            }
          }
        }
        generatedSQL = sqlLines.join('\n').trim();
      }

      // 3. Enlever les balises markdown de code si présentes
      generatedSQL = generatedSQL
        .replace(/```sql/gi, "")
        .replace(/```/g, "")
        .replace(/`/g, "")
        .trim();
      
      // 4. Enlever les préfixes de texte français courants
      generatedSQL = generatedSQL
        .replace(/^(voici|la requête|requête sql|sql|résultat|génération)[\s:]*/i, "")
        .replace(/^(explication|note|réponse)[\s:]*/i, "")
        .trim();
      
      // 5. S'assurer qu'on a bien une requête SQL valide
      if (!generatedSQL.toUpperCase().match(/^(SELECT|WITH|INSERT|UPDATE|DELETE)/)) {
        // Essayer de trouver le SQL ailleurs dans la réponse
        const fallbackMatch = data.message.match(/(SELECT[\s\S]*?FROM[\s\S]*?)(?:LIMIT|ORDER BY|GROUP BY|WHERE|;|$)/i);
        if (fallbackMatch) {
          generatedSQL = fallbackMatch[1].trim();
        } else {
          // Dernière tentative : chercher n'importe où dans la réponse
          const anySQLMatch = data.message.match(/(SELECT\s+[\s\S]*?FROM\s+\w+[\s\S]*?)(?:[.!?]|$)/i);
          if (anySQLMatch) {
            generatedSQL = anySQLMatch[1].trim();
          }
        }
      }
      
      // 6. Nettoyer les espaces multiples et sauts de ligne excessifs
      generatedSQL = generatedSQL
        .replace(/\s{2,}/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
      
      // 7. Si toujours pas de SQL valide, retourner une erreur
      if (!generatedSQL || !generatedSQL.toUpperCase().match(/^(SELECT|WITH|INSERT|UPDATE|DELETE)/)) {
        setError("Impossible de générer une requête SQL valide. Veuillez reformuler votre question ou être plus spécifique.");
        setIsLoading(false);
        return;
      }

      setSqlQuery(generatedSQL);

      // Générer l'explication
      const explanationResponse = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Explique cette requête SQL en français de manière simple : ${generatedSQL}`,
          conversationHistory: []
        }),
      });

      const explanationData = await explanationResponse.json();
      if (explanationData.message) {
        setExplanation(explanationData.message);
      }

      // Exécuter la requête SQL (simulation)
      executeSQL(generatedSQL);

    } catch (error) {
      console.error("Error:", error);
      setError("Une erreur est survenue lors de la génération de la requête SQL");
    } finally {
      setIsLoading(false);
    }
  };

  const executeSQL = (sql) => {
    try {
      // Parser et exécuter la requête SQL (simulation simple)
      const upperSQL = sql.toUpperCase();
      
      if (upperSQL.includes("SELECT")) {
        // Simulation d'exécution SQL
        let data = [];
        
        if (upperSQL.includes("FROM ventes")) {
          data = sampleDatabase.tables[0].sampleData;
          
          // Appliquer WHERE si présent
          if (upperSQL.includes("WHERE")) {
            // Simplification : on filtre sur quelques cas courants
            if (upperSQL.includes("region = 'Paris'") || upperSQL.includes("region='Paris'")) {
              data = data.filter(row => row.region === "Paris");
            }
            if (upperSQL.includes("client = 'Entreprise A'") || upperSQL.includes("client='Entreprise A'")) {
              data = data.filter(row => row.client === "Entreprise A");
            }
          }
          
          // Appliquer ORDER BY si présent
          if (upperSQL.includes("ORDER BY")) {
            if (upperSQL.includes("ORDER BY ca DESC") || upperSQL.includes("ORDER BY ca")) {
              data.sort((a, b) => b.ca - a.ca);
            }
            if (upperSQL.includes("ORDER BY date_vente")) {
              data.sort((a, b) => new Date(a.date_vente) - new Date(b.date_vente));
            }
          }
          
          // Appliquer LIMIT si présent
          const limitMatch = upperSQL.match(/LIMIT\s+(\d+)/i);
          if (limitMatch) {
            data = data.slice(0, parseInt(limitMatch[1]));
          }
          
          // Appliquer GROUP BY si présent
          if (upperSQL.includes("GROUP BY")) {
            if (upperSQL.includes("GROUP BY client")) {
              const grouped = {};
              data.forEach(row => {
                if (!grouped[row.client]) {
                  grouped[row.client] = { client: row.client, total_ca: 0, count: 0 };
                }
                grouped[row.client].total_ca += row.ca;
                grouped[row.client].count += 1;
              });
              data = Object.values(grouped);
            }
            if (upperSQL.includes("GROUP BY region")) {
              const grouped = {};
              data.forEach(row => {
                if (!grouped[row.region]) {
                  grouped[row.region] = { region: row.region, total_ca: 0, count: 0 };
                }
                grouped[row.region].total_ca += row.ca;
                grouped[row.region].count += 1;
              });
              data = Object.values(grouped);
            }
          }
        } else if (upperSQL.includes("FROM clients")) {
          data = sampleDatabase.tables[1].sampleData;
        }
        
        setResults(data);
      } else {
        setError("Seules les requêtes SELECT sont supportées pour la démonstration");
      }
    } catch (error) {
      console.error("SQL Execution Error:", error);
      setError("Erreur lors de l'exécution de la requête SQL");
    }
  };

  return (
    <div style={{
      background: "var(--bg-secondary)",
      border: "2px solid var(--line-blueprint)",
      borderRadius: "12px",
      padding: "32px",
      marginBottom: "48px"
    }}>
      <h2 style={{
        fontSize: "28px",
        fontWeight: 700,
        marginBottom: "8px",
        color: "var(--fg)"
      }}>
        Text-to-SQL
      </h2>
      <p style={{
        fontSize: "14px",
        color: "var(--fg-muted)",
        marginBottom: "32px",
        lineHeight: 1.6
      }}>
        Posez une question en français et obtenez automatiquement la requête SQL correspondante, puis visualisez les résultats.
      </p>

      {/* Schéma de la base de données */}
      <div style={{
        background: "var(--bg)",
        border: "1px solid var(--line-blueprint)",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "24px"
      }}>
        <div style={{
          fontSize: "12px",
          fontWeight: 600,
          color: "var(--fg-muted)",
          textTransform: "uppercase",
          letterSpacing: "1px",
          marginBottom: "12px"
        }}>
          Schéma de la base de données
        </div>
        {sampleDatabase.tables.map((table, idx) => (
          <div key={idx} style={{ marginBottom: idx < sampleDatabase.tables.length - 1 ? "16px" : "0" }}>
            <div style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--accent)",
              marginBottom: "8px",
              fontFamily: "monospace"
            }}>
              {table.name}
            </div>
            <div style={{
              fontSize: "12px",
              color: "var(--fg-muted)",
              fontFamily: "monospace",
              lineHeight: 1.8
            }}>
              {table.columns.map(col => col.name).join(", ")}
            </div>
          </div>
        ))}
      </div>

      {/* Zone de saisie */}
      <div style={{ marginBottom: "24px" }}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Exemple : Quels sont les 5 meilleurs clients par chiffre d'affaires ?"
          style={{
            width: "100%",
            minHeight: "100px",
            padding: "16px",
            border: "2px solid var(--line-blueprint)",
            borderRadius: "8px",
            background: "var(--bg)",
            color: "var(--fg)",
            fontSize: "14px",
            fontFamily: "inherit",
            resize: "vertical",
            outline: "none"
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              generateSQL();
            }
          }}
        />
        <div style={{
          fontSize: "12px",
          color: "var(--fg-muted)",
          marginTop: "8px",
          fontFamily: "monospace"
        }}>
          Appuyez sur Ctrl+Entrée pour générer la requête
        </div>
      </div>

      {/* Bouton */}
      <button
        onClick={generateSQL}
        disabled={isLoading || !question.trim()}
        style={{
          padding: "12px 24px",
          background: isLoading || !question.trim() ? "var(--line-blueprint)" : "var(--accent)",
          border: "none",
          borderRadius: "8px",
          color: "var(--bg)",
          fontSize: "14px",
          fontWeight: 600,
          cursor: isLoading || !question.trim() ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
          fontFamily: "monospace"
        }}
      >
        {isLoading ? "Génération en cours..." : "[ Générer la requête SQL ]"}
      </button>

      {/* Erreur */}
      {error && (
        <div style={{
          marginTop: "16px",
          padding: "12px",
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "8px",
          color: "#ef4444",
          fontSize: "14px"
        }}>
          {error}
        </div>
      )}

      {/* Requête SQL générée */}
      {sqlQuery && (
        <div style={{ marginTop: "32px" }}>
          <div style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--fg-muted)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: "12px"
          }}>
            Requête SQL générée
          </div>
          <div style={{
            background: "var(--bg)",
            border: "1px solid var(--line-blueprint)",
            borderRadius: "8px",
            padding: "16px",
            fontFamily: "monospace",
            fontSize: "13px",
            color: "var(--fg)",
            overflowX: "auto",
            overflowY: "auto",
            maxHeight: "400px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word"
          }}>
            {sqlQuery}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(sqlQuery);
              alert("Requête SQL copiée dans le presse-papiers !");
            }}
            style={{
              marginTop: "12px",
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid var(--accent)",
              borderRadius: "6px",
              color: "var(--accent)",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: "monospace"
            }}
          >
            [ Copier la requête ]
          </button>
        </div>
      )}

      {/* Explication */}
      {explanation && (
        <div style={{ marginTop: "24px" }}>
          <div style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--fg-muted)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: "12px"
          }}>
            Explication
          </div>
          <div style={{
            background: "var(--bg)",
            border: "1px solid var(--line-blueprint)",
            borderRadius: "8px",
            padding: "16px",
            fontSize: "14px",
            color: "var(--fg)",
            lineHeight: 1.7,
            maxHeight: "300px",
            overflowY: "auto",
            whiteSpace: "pre-wrap"
          }}>
            {explanation}
          </div>
        </div>
      )}

      {/* Résultats */}
      {results && results.length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <div style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--fg-muted)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: "12px"
          }}>
            Résultats ({results.length} ligne{results.length > 1 ? "s" : ""})
          </div>
          <div style={{
            background: "var(--bg)",
            border: "1px solid var(--line-blueprint)",
            borderRadius: "8px",
            overflowX: "auto"
          }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px"
            }}>
              <thead>
                <tr style={{
                  background: "var(--bg-secondary)",
                  borderBottom: "2px solid var(--line-blueprint)"
                }}>
                  {Object.keys(results[0]).map((key, idx) => (
                    <th key={idx} style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "var(--fg)",
                      fontFamily: "monospace",
                      fontSize: "12px",
                      textTransform: "uppercase"
                    }}>
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((row, rowIdx) => (
                  <tr key={rowIdx} style={{
                    borderBottom: "1px solid var(--line-blueprint)"
                  }}>
                    {Object.values(row).map((value, colIdx) => (
                      <td key={colIdx} style={{
                        padding: "12px",
                        color: "var(--fg)",
                        fontFamily: "monospace"
                      }}>
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {results && results.length === 0 && (
        <div style={{
          marginTop: "24px",
          padding: "16px",
          background: "var(--bg)",
          border: "1px solid var(--line-blueprint)",
          borderRadius: "8px",
          color: "var(--fg-muted)",
          fontSize: "14px",
          textAlign: "center"
        }}>
          Aucun résultat trouvé
        </div>
      )}
    </div>
  );
}

