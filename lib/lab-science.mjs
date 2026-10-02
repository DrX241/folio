export function tokenDistribution(tokens, temperature = 1, topP = 1) {
  const maximum = Math.max(...tokens.map(item => item.logit));
  const weights = tokens.map(item => Math.exp((item.logit - maximum) / temperature));
  const total = weights.reduce((sum, value) => sum + value, 0);
  const ranked = tokens.map((item, i) => ({ ...item, base: weights[i] / total })).sort((a, b) => b.base - a.base);
  let sum = 0;
  const kept = ranked.map((item, i) => {
    const included = i === 0 || sum < topP;
    sum += item.base;
    return { ...item, included };
  });
  const mass = kept.filter(item => item.included).reduce((sum, item) => sum + item.base, 0);
  return kept.map(item => ({ ...item, probability: item.included ? item.base / mass : 0 }));
}
export function drawToken(distribution, random = Math.random()) {
  let sum = 0;
  for (const item of distribution) {
    sum += item.probability;
    if (random < sum) return item.word;
  }
  return distribution.findLast(item => item.probability > 0)?.word;
}
export function cosine(a, b) {
  const denominator = Math.hypot(...a) * Math.hypot(...b);
  return denominator ? a.reduce((sum, value, i) => sum + value * b[i], 0) / denominator : 0;
}
const stopwords = new Set(["les","des","une","dans","pour","avec","est","que","qui","quel","quelle","quels","quelles","comment","peut","plus","sur","aux","par","pas","ses","son","cette","tout","aussi","cafe"]);
export function words(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(/[a-z0-9]+/g)?.filter(word => word.length > 2 && !stopwords.has(word)) || [];
}
export function retrieve(query, documents) {
  const queryWords = words(query);
  const texts = documents.map(doc => words(doc.title + " " + doc.text));
  const vocabulary = [...new Set([...queryWords, ...texts.flat()])];
  const idf = vocabulary.map(term => Math.log((documents.length + 1) / (texts.filter(text => text.includes(term)).length + 1)) + 1);
  const vector = terms => vocabulary.map((term, i) => terms.filter(word => word === term).length * idf[i]);
  const q = vector(queryWords);
  return documents.map((doc, i) => ({
    ...doc, score: cosine(q, vector(texts[i])),
    matched: [...new Set(queryWords.filter(word => texts[i].includes(word)))]
  })).sort((a, b) => b.score - a.score);
}
export const trainingMail = [
  { text: "Gagnez un cadeau gratuit ! Cliquez sur https://cadeau.test", label: 1 },
  { text: "Offre gratuite ! Gagnez un cadeau sur https://offre.test", label: 1 },
  { text: "Urgent : gagnez maintenant sur https://urgent.test", label: 1 },
  { text: "Cadeau gratuit, offre exceptionnelle pour vous", label: 1 },
  { text: "Gagnez un cadeau grâce à cette offre", label: 1 },
  { text: "Urgent ! Offre sur https://bonus.test", label: 1 },
  { text: "Bonjour, la réunion commence à dix heures.", label: 0 },
  { text: "Voici le compte rendu de notre rendez-vous.", label: 0 },
  { text: "Le repas de samedi est confirmé.", label: 0 },
  { text: "Votre facture est disponible sur https://client.test", label: 0 },
  { text: "Urgent : peux-tu relire le dossier avant midi ?", label: 0 },
  { text: "Le cadeau pour Léa est acheté.", label: 0 }
];
export const testMail = [
  { text: "Gagnez un cadeau gratuit sur https://gain.test", label: 1 },
  { text: "Offre cadeau : gagnez sur https://lot.test", label: 1 },
  { text: "Urgent, cliquez sur https://compte.test", label: 1 },
  { text: "Une offre à saisir", label: 1 },
  { text: "Votre colis vous attend sur https://colis.test", label: 1 },
  { text: "La réunion de lundi est confirmée.", label: 0 },
  { text: "Voici les photos de vacances.", label: 0 },
  { text: "Urgent : rendez-vous sur https://equipe.test", label: 0 },
  { text: "Un cadeau gratuit est offert à l’équipe.", label: 0 },
  { text: "Votre reçu est sur https://boutique.test", label: 0 }
];
export function mailFeatures(text) {
  const terms = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(/[a-z]+/g) || [];
  const signals = terms.filter(word => ["urgent","gagnez","gratuit","gratuite","offre","cadeau"].includes(word)).length;
  return [Math.min(signals, 4) / 4, /https?:\/\//.test(text) ? 1 : 0];
}
const sigmoid = value => 1 / (1 + Math.exp(-value));
export function trainMail(rows = trainingMail) {
  let bias = 0; const weights = [0, 0];
  for (let epoch = 0; epoch < 700; epoch++) {
    let db = 0; const dw = [0, 0];
    for (const row of rows) {
      const x = mailFeatures(row.text);
      const error = sigmoid(bias + weights[0] * x[0] + weights[1] * x[1]) - row.label;
      db += error; dw[0] += error * x[0]; dw[1] += error * x[1];
    }
    bias -= .35 * db / rows.length;
    weights[0] -= .35 * dw[0] / rows.length;
    weights[1] -= .35 * dw[1] / rows.length;
  }
  return { bias, weights };
}
export function predictMail(model, text) {
  const x = mailFeatures(text);
  return sigmoid(model.bias + model.weights[0] * x[0] + model.weights[1] * x[1]);
}
export function confusion(rows, threshold) {
  const result = { tp: 0, fp: 0, tn: 0, fn: 0 };
  rows.forEach(row => { result[row.score >= threshold ? (row.label ? "tp" : "fp") : (row.label ? "fn" : "tn")]++; });
  result.precision = result.tp + result.fp ? result.tp / (result.tp + result.fp) : null;
  result.recall = result.tp + result.fn ? result.tp / (result.tp + result.fn) : null;
  return result;
}

