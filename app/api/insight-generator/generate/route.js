import { NextResponse } from "next/server";

/**
 * API Route pour générer des insights automatiques à partir de statistiques
 * Utilise un LLM pour générer des insights en langage naturel
 */
export async function POST(request) {
  try {
    const { stats, view, data } = await request.json();

    if (!stats || !view) {
      return NextResponse.json(
        { error: "Statistiques et vue requises" },
        { status: 400 }
      );
    }

    // Générer des insights localement (sans appel externe, pour éviter les erreurs de quota)
    const formattedInsights = generateLocalInsights(stats, view, data || []);

    return NextResponse.json({
      insights: formattedInsights,
      rawInsights: formattedInsights.join("\n")
    });

  } catch (error) {
    console.error("Erreur lors de la génération d'insights:", error);
    return NextResponse.json(
      {
        error: error.message || "Erreur lors de la génération d'insights",
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

/**
 * Génère localement des insights à partir des stats + données brutes
 */
function generateLocalInsights(stats, view, data = []) {
  if (!stats) return [];

  const insights = [];
  const totalCA = stats.totalCA || 0;
  const nbVentes = stats.nombreVentes || 0;
  const moyenneCA = stats.moyenneCA || 0;

  const nbProduits = new Set(data.map((d) => d.produit)).size || 0;
  const nbRegions = new Set(data.map((d) => d.region)).size || 0;
  const nbClients = new Set(data.map((d) => d.client)).size || 0;

  // Insight 1 : récap global enrichi
  let recap = `Sur la période analysée, le chiffre d'affaires total atteint ${totalCA.toLocaleString(
    "fr-FR"
  )} € pour ${nbVentes} ventes, soit un panier moyen d'environ ${moyenneCA.toFixed(
    2
  )} €.`;

  if (nbProduits && nbRegions && nbClients) {
    recap += ` Le portefeuille couvre ${nbProduits} produits, ${nbRegions} régions et ${nbClients} clients actifs.`;
  }
  insights.push(recap);

  // Insight 2 : meilleur élément selon la vue (et son poids dans le CA)
  if (stats.topItems && stats.topItems.length > 0 && totalCA > 0) {
    const best = stats.topItems[0];
    const label =
      view === "produit"
        ? "produit"
        : view === "region"
        ? "région"
        : "période";

    const partBest = (best.ca / totalCA) * 100;

    insights.push(
      `Le ${label} le plus contributeur est ${best.nom} avec ${best.ca.toLocaleString(
        "fr-FR"
      )} € de CA (${best.quantite} unités), soit environ ${partBest.toFixed(
        1
      )}% du total.`
    );
  }

  // Insight 3 : concentration du CA sur le top 3
  if (stats.topItems && stats.topItems.length > 1 && totalCA > 0) {
    const totalTopCA = stats.topItems
      .slice(0, 3)
      .reduce((sum, item) => sum + item.ca, 0);
    const partTop = (totalTopCA / totalCA) * 100;

    const qualification =
      partTop >= 75
        ? "une très forte dépendance aux meilleurs contributeurs"
        : partTop >= 55
        ? "une concentration marquée sur le haut du portefeuille"
        : "une répartition relativement équilibrée entre les segments";

    insights.push(
      `Les 3 premiers contributeurs représentent environ ${partTop.toFixed(
        1
      )}% du chiffre d'affaires, ce qui traduit ${qualification}.`
    );
  }

  // Insight 4 : meilleur vs moins bon segment (produit / région)
  if (
    (view === "produit" || view === "region") &&
    stats.topItems &&
    stats.topItems.length >= 2
  ) {
    const sorted = [...stats.topItems].sort((a, b) => b.ca - a.ca);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];

    if (best && worst && best.ca > 0) {
      const ecart = best.ca - worst.ca;
      const ratio = best.ca / (worst.ca || best.ca);
      const label =
        view === "produit"
          ? "produits"
          : "régions";

      insights.push(
        `Au sein des ${label} majeurs, ${best.nom} surperforme nettement ${worst.nom} avec un écart de ${ecart.toLocaleString(
          "fr-FR"
        )} € de CA (environ x${ratio.toFixed(
          1
        )}), ce qui suggère un potentiel de rattrapage sur les segments en retard.`
      );
    }
  }

  // Insight 5 : dynamique temporelle (vue mois)
  if (view === "mois" && stats.topItems && stats.topItems.length >= 2) {
    const first = stats.topItems[0];
    const last = stats.topItems[stats.topItems.length - 1];
    const diffPct =
      first.ca === 0 ? 0 : ((last.ca - first.ca) / first.ca) * 100;

    let tendance;
    if (diffPct > 15) {
      tendance = "une accélération forte de l'activité";
    } else if (diffPct > 5) {
      tendance = "une tendance haussière régulière";
    } else if (diffPct < -15) {
      tendance = "un net ralentissement des ventes";
    } else if (diffPct < -5) {
      tendance = "une érosion progressive du chiffre d'affaires";
    } else {
      tendance = "une relative stabilité du niveau de ventes";
    }

    insights.push(
      `Entre ${first.nom} et ${last.nom}, le CA a évolué de ${diffPct.toFixed(
        1
      )}%, ce qui traduit ${tendance} sur la période observée.`
    );
  }

  // Insight 6 : focus clients (si les données sont disponibles)
  if (Array.isArray(data) && data.length > 0) {
    const byClient = {};
    data.forEach((item) => {
      if (!byClient[item.client]) {
        byClient[item.client] = { ca: 0, count: 0 };
      }
      byClient[item.client].ca += item.ca;
      byClient[item.client].count += 1;
    });

    const clientsAgg = Object.entries(byClient).map(([nom, val]) => ({
      nom,
      ...val
    }));

    if (clientsAgg.length > 0 && totalCA > 0) {
      clientsAgg.sort((a, b) => b.ca - a.ca);
      const bestClient = clientsAgg[0];
      const partClient = (bestClient.ca / totalCA) * 100;

      insights.push(
        `Le meilleur client, ${bestClient.nom}, génère à lui seul ${bestClient.ca.toLocaleString(
          "fr-FR"
        )} € de CA (${partClient.toFixed(
          1
        )}% du total) sur ${bestClient.count} commandes, ce qui en fait un compte clé à fidéliser.`
      );
    }
  }

  return insights;
}

