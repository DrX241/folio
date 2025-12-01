import Database from 'better-sqlite3';

// Base de données en mémoire (légère et rapide)
let db = null;

/**
 * Initialise la base de données SQLite avec les tables et données d'exemple
 * @returns {Database} Instance de la base de données
 */
export function getDatabase() {
  if (db) {
    return db;
  }

  // Créer une base de données en mémoire (très rapide, pas de fichier)
  db = new Database(':memory:');

  // Créer la table ventes
  db.exec(`
    CREATE TABLE ventes (
      id INTEGER PRIMARY KEY,
      date_vente DATE NOT NULL,
      client VARCHAR(100) NOT NULL,
      produit VARCHAR(100) NOT NULL,
      quantite INTEGER NOT NULL,
      prix_unitaire DECIMAL(10,2) NOT NULL,
      ca DECIMAL(10,2) NOT NULL,
      region VARCHAR(50) NOT NULL
    )
  `);

  // Insérer les données d'exemple pour ventes
  const insertVente = db.prepare(`
    INSERT INTO ventes (id, date_vente, client, produit, quantite, prix_unitaire, ca, region)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const ventesData = [
    [1, '2024-01-15', 'Entreprise A', 'Produit X', 10, 100, 1000, 'Paris'],
    [2, '2024-01-20', 'Entreprise B', 'Produit Y', 5, 200, 1000, 'Lyon'],
    [3, '2024-02-10', 'Entreprise A', 'Produit Z', 8, 150, 1200, 'Paris'],
    [4, '2024-02-15', 'Entreprise C', 'Produit X', 15, 100, 1500, 'Marseille'],
    [5, '2024-03-01', 'Entreprise B', 'Produit Y', 12, 200, 2400, 'Lyon'],
    [6, '2024-03-10', 'Entreprise A', 'Produit X', 20, 100, 2000, 'Paris'],
    [7, '2024-03-15', 'Entreprise D', 'Produit Z', 6, 150, 900, 'Lyon'],
    [8, '2024-04-01', 'Entreprise B', 'Produit X', 8, 100, 800, 'Lyon'],
    [9, '2024-04-05', 'Entreprise C', 'Produit Y', 10, 200, 2000, 'Marseille'],
    [10, '2024-04-20', 'Entreprise A', 'Produit Z', 12, 150, 1800, 'Paris']
  ];

  const insertManyVentes = db.transaction((ventes) => {
    for (const vente of ventes) {
      insertVente.run(...vente);
    }
  });

  insertManyVentes(ventesData);

  // Créer la table clients
  db.exec(`
    CREATE TABLE clients (
      id INTEGER PRIMARY KEY,
      nom VARCHAR(100) NOT NULL,
      ville VARCHAR(50) NOT NULL,
      secteur VARCHAR(50) NOT NULL,
      ca_total DECIMAL(10,2) NOT NULL
    )
  `);

  // Insérer les données d'exemple pour clients
  const insertClient = db.prepare(`
    INSERT INTO clients (id, nom, ville, secteur, ca_total)
    VALUES (?, ?, ?, ?, ?)
  `);

  const clientsData = [
    [1, 'Entreprise A', 'Paris', 'Technologie', 6000],
    [2, 'Entreprise B', 'Lyon', 'Commerce', 6200],
    [3, 'Entreprise C', 'Marseille', 'Industrie', 3500],
    [4, 'Entreprise D', 'Lyon', 'Services', 900]
  ];

  const insertManyClients = db.transaction((clients) => {
    for (const client of clients) {
      insertClient.run(...client);
    }
  });

  insertManyClients(clientsData);

  return db;
}

/**
 * Nettoie et valide une requête SQL
 * @param {string} sql - Requête SQL brute
 * @returns {string} Requête SQL nettoyée
 */
function cleanSQL(sql) {
  if (!sql || typeof sql !== 'string') {
    throw new Error('Requête SQL invalide');
  }

  console.log('SQL brut reçu:', sql.substring(0, 200));

  // 1. Enlever les balises markdown et code blocks
  let cleaned = sql
    .replace(/```sql/gi, '')
    .replace(/```/g, '')
    .replace(/`/g, '')
    .trim();

  // 2. Enlever tout texte avant SELECT
  const selectIndex = cleaned.toUpperCase().indexOf('SELECT');
  if (selectIndex === -1) {
    throw new Error('La requête doit contenir SELECT');
  }
  if (selectIndex > 0) {
    cleaned = cleaned.substring(selectIndex);
  }

  // 3. Enlever le point-virgule final
  cleaned = cleaned.replace(/;+$/, '').trim();

  // 4. Nettoyer les caractères invisibles
  cleaned = cleaned
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width characters
    .replace(/[""]/g, "'") // Guillemets typographiques
    .replace(/['']/g, "'") // Apostrophes typographiques
    .trim();

  // 5. Nettoyer les espaces multiples mais préserver la structure
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // 6. Validation de base
  const upperSQL = cleaned.toUpperCase();
  if (!upperSQL.startsWith('SELECT')) {
    throw new Error('La requête doit commencer par SELECT');
  }

  if (!upperSQL.includes('FROM')) {
    throw new Error('Requête SQL incomplète : manque la clause FROM');
  }

  // 7. Vérifications de base sans modifier la requête
  // Vérifier qu'il y a des colonnes entre SELECT et FROM
  const fromPos = upperSQL.indexOf('FROM');
  if (fromPos > 0) {
    const selectPart = cleaned.substring(0, fromPos).trim();
    if (selectPart.length <= 6) { // 6 = longueur de "SELECT"
      throw new Error('Requête SQL invalide : aucune colonne spécifiée après SELECT');
    }
  }

  console.log('SQL nettoyé:', cleaned.substring(0, 200));

  return cleaned;
}

/**
 * Exécute une requête SQL SELECT de manière sécurisée
 * @param {string} sql - Requête SQL SELECT
 * @returns {Array} Résultats de la requête
 */
export function executeSelectQuery(sql) {
  const db = getDatabase();
  
  // Nettoyer la requête SQL
  const cleanedSQL = cleanSQL(sql);
  
  // Sécurité : ne permettre que les requêtes SELECT
  const trimmedSQL = cleanedSQL.trim().toUpperCase();
  if (!trimmedSQL.startsWith('SELECT')) {
    throw new Error('Seules les requêtes SELECT sont autorisées');
  }

  // Vérifier qu'il n'y a pas de commandes dangereuses
  const dangerousKeywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE', 'TRUNCATE'];
  for (const keyword of dangerousKeywords) {
    if (trimmedSQL.includes(keyword) && !trimmedSQL.startsWith('SELECT')) {
      throw new Error(`Commande non autorisée : ${keyword}`);
    }
  }

  try {
    // Log pour débogage
    console.log('Exécution SQL:', cleanedSQL.substring(0, 200));
    
    const stmt = db.prepare(cleanedSQL);
    const results = stmt.all();
    return results;
  } catch (error) {
    console.error('Erreur SQL complète:', {
      message: error.message,
      sql: cleanedSQL.substring(0, 200)
    });
    throw new Error(`Erreur SQL : ${error.message}`);
  }
}

