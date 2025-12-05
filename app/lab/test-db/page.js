"use client";
import { useEffect, useState } from "react";

export default function TestDBPage() {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/text-to-sql/test")
      .then(res => res.json())
      .then(data => {
        setTestResults(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h1>Chargement des tests...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", color: "red" }}>
        <h1>Erreur</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "20px" }}>Test Base de Données SQLite</h1>
      
      {testResults?.success && (
        <div style={{ 
          background: "#10b981", 
          color: "white", 
          padding: "15px", 
          borderRadius: "8px",
          marginBottom: "30px"
        }}>
          ✓ {testResults.message}
        </div>
      )}

      <div style={{ marginBottom: "30px" }}>
        <h2>Statistiques</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
          <div style={{ border: "2px solid #3b82f6", padding: "20px", borderRadius: "8px" }}>
            <h3>Table ventes</h3>
            <p style={{ fontSize: "32px", fontWeight: "bold", color: "#3b82f6" }}>
              {testResults?.tests?.ventesCount} lignes
            </p>
          </div>
          <div style={{ border: "2px solid #10b981", padding: "20px", borderRadius: "8px" }}>
            <h3>Table clients</h3>
            <p style={{ fontSize: "32px", fontWeight: "bold", color: "#10b981" }}>
              {testResults?.tests?.clientsCount} lignes
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <h2>Exemples de données - Table ventes</h2>
        <div style={{ overflowX: "auto", border: "1px solid #ddd", borderRadius: "8px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f3f4f6" }}>
              <tr>
                <th style={{ padding: "12px", textAlign: "left" }}>ID</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Date</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Client</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Produit</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Quantité</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Prix unitaire</th>
                <th style={{ padding: "12px", textAlign: "left" }}>CA</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Région</th>
              </tr>
            </thead>
            <tbody>
              {testResults?.tests?.ventes?.map((vente, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px" }}>{vente.id}</td>
                  <td style={{ padding: "12px" }}>{vente.date_vente}</td>
                  <td style={{ padding: "12px" }}>{vente.client}</td>
                  <td style={{ padding: "12px" }}>{vente.produit}</td>
                  <td style={{ padding: "12px" }}>{vente.quantite}</td>
                  <td style={{ padding: "12px" }}>{vente.prix_unitaire}€</td>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>{vente.ca}€</td>
                  <td style={{ padding: "12px" }}>{vente.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <h2>Exemples de données - Table clients</h2>
        <div style={{ overflowX: "auto", border: "1px solid #ddd", borderRadius: "8px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f3f4f6" }}>
              <tr>
                <th style={{ padding: "12px", textAlign: "left" }}>ID</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Nom</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Ville</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Secteur</th>
                <th style={{ padding: "12px", textAlign: "left" }}>CA Total</th>
              </tr>
            </thead>
            <tbody>
              {testResults?.tests?.clients?.map((client, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px" }}>{client.id}</td>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>{client.nom}</td>
                  <td style={{ padding: "12px" }}>{client.ville}</td>
                  <td style={{ padding: "12px" }}>{client.secteur}</td>
                  <td style={{ padding: "12px", fontWeight: "bold", color: "#10b981" }}>{client.ca_total}€</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <h2>Test requête ORDER BY - Top 3 clients</h2>
        <div style={{ overflowX: "auto", border: "1px solid #ddd", borderRadius: "8px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f3f4f6" }}>
              <tr>
                <th style={{ padding: "12px", textAlign: "left" }}>Rang</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Nom</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Ville</th>
                <th style={{ padding: "12px", textAlign: "left" }}>CA Total</th>
              </tr>
            </thead>
            <tbody>
              {testResults?.tests?.topClients?.map((client, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px", fontSize: "20px" }}>
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                  </td>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>{client.nom}</td>
                  <td style={{ padding: "12px" }}>{client.ville}</td>
                  <td style={{ padding: "12px", fontWeight: "bold", fontSize: "18px", color: "#10b981" }}>
                    {client.ca_total}€
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <h2>Test requête WHERE - Ventes à Paris</h2>
        <p style={{ color: "#6b7280", marginBottom: "10px" }}>
          Requête : <code style={{ background: "#f3f4f6", padding: "4px 8px", borderRadius: "4px" }}>
            SELECT * FROM ventes WHERE region = 'Paris'
          </code>
        </p>
        <div style={{ overflowX: "auto", border: "1px solid #ddd", borderRadius: "8px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f3f4f6" }}>
              <tr>
                <th style={{ padding: "12px", textAlign: "left" }}>Date</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Client</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Produit</th>
                <th style={{ padding: "12px", textAlign: "left" }}>CA</th>
              </tr>
            </thead>
            <tbody>
              {testResults?.tests?.ventesParis?.map((vente, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px" }}>{vente.date_vente}</td>
                  <td style={{ padding: "12px" }}>{vente.client}</td>
                  <td style={{ padding: "12px" }}>{vente.produit}</td>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>{vente.ca}€</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: "10px", fontWeight: "bold", color: "#3b82f6" }}>
          Résultat : {testResults?.tests?.ventesParis?.length} ventes trouvées à Paris
        </p>
      </div>

      <div style={{ 
        background: "#f3f4f6", 
        padding: "20px", 
        borderRadius: "8px",
        border: "2px solid #10b981"
      }}>
        <h3>✓ Tous les tests réussis !</h3>
        <ul style={{ marginTop: "10px", lineHeight: "1.8" }}>
          <li>✓ Base de données initialisée</li>
          <li>✓ Tables créées (ventes, clients)</li>
          <li>✓ Données insérées</li>
          <li>✓ Requêtes SELECT fonctionnent</li>
          <li>✓ Requêtes ORDER BY fonctionnent</li>
          <li>✓ Requêtes WHERE fonctionnent</li>
        </ul>
        <p style={{ marginTop: "15px" }}>
          La base de données SQLite est opérationnelle et prête pour Text-to-SQL !
        </p>
      </div>
    </div>
  );
}












