"use client";
import { useState } from "react";
import { trainingMail, testMail, trainMail, mailFeatures, predictMail, confusion } from "@/lib/lab-science.mjs";
import { LessonStep, Observation, TechnicalNote, Notebook, SourceLinks } from "./LearningKit";

const examples = ["Gagnez un cadeau gratuit sur https://gain.test", "La réunion de lundi est confirmée.", "Urgent : rendez-vous sur https://equipe.test"];
const metricText = number => number === null ? "non défini" : Math.round(number * 100) + " %";
export default function ClassifierClinic() {
  const [alteredLabel, setAlteredLabel] = useState(false);
  const [visibleMail, setVisibleMail] = useState(10);
  const [model, setModel] = useState(null);
  const [message, setMessage] = useState(examples[0]);
  const [threshold, setThreshold] = useState(.5);
  const features = mailFeatures(message);
  const alternativeModel = model ? trainMail(trainingMail.map((item, index) => index === 10 && alteredLabel ? { ...item, label: 1 } : item)) : null;
  const alteredScore = alternativeModel ? predictMail(alternativeModel, trainingMail[10].text) : null;
  const score = model ? predictMail(model, message) : null;
  const evaluated = model ? testMail.map(item => ({ ...item, score: predictMail(model, item.text) })) : [];
  const result = confusion(evaluated, threshold);
  function learn() { setModel(trainMail()); }
  function changeThreshold(value) { setThreshold(value); }
  return <div className="ll-lesson">
    <div className="ll-route"><span>Votre parcours</span><a href="#etape-1">1. Les exemples</a><a href="#etape-2">2. L’apprentissage</a><a href="#etape-3">3. Un nouveau message</a><a href="#etape-4">4. Les erreurs</a><a href="#etape-5">5. Les exemples influencent le modèle</a></div>
    <LessonStep number={1} title="Commencer par des exemples dont on connaît la réponse" hint="Inspectez deux messages qui contiennent « urgent ». Comparez leurs étiquettes et les indices que notre modèle peut lire." experiment={<>
      <div className="ll-mails">{[trainingMail[0], trainingMail[6], trainingMail[4], trainingMail[10]].map(item => <div key={item.text}><p>{item.text}</p><span className={item.label ? "is-spam" : ""}>{item.label ? "Indésirable" : "À conserver"}</span></div>)}</div>
      <label className="ll-select">Message à inspecter<select aria-label="Message à inspecter" value={visibleMail} onChange={e => setVisibleMail(+e.target.value)}><option value="10">Une demande de relecture urgente</option><option value="5">Une offre urgente avec un lien</option></select></label>
      <div className="ll-evidence"><strong>{trainingMail[visibleMail].label ? "ÉTIQUETTE : INDÉSIRABLE" : "ÉTIQUETTE : À CONSERVER"}</strong><p>{trainingMail[visibleMail].text}</p></div>
      <div className="ll-features"><span>Mots suspects<strong>{Math.round(mailFeatures(trainingMail[visibleMail].text)[0] * 4)}</strong></span><span>Lien présent<strong>{mailFeatures(trainingMail[visibleMail].text)[1] ? "Oui" : "Non"}</strong></span></div>
      <Observation>« Urgent » apparaît dans les deux catégories. C’est un indice imparfait : l’étiquette vient du contexte du message, pas de ce mot seul.</Observation>
    </>}>
      <p>Votre boîte mail reçoit une invitation, une facture et une fausse promesse de cadeau. Comment un filtre apprend-il à les séparer ?</p>
      <p>On commence par des messages déjà classés. La bonne catégorie est leur <strong>étiquette</strong> : « indésirable » ou « à conserver ».</p>
      <p>C’est de l’<strong>apprentissage supervisé</strong> : on donne des exemples et la réponse attendue. La qualité de ces réponses et la diversité des exemples comptent beaucoup.</p>
      <aside className="ll-small-note">Tous les messages de ce parcours sont fictifs. Nous avons 12 exemples pour apprendre, puis 10 autres pour vérifier les résultats.</aside>
    </LessonStep>
    <LessonStep number={2} title="Apprendre une règle à partir de ces exemples" hint="Lancez l’apprentissage. Les paramètres sont calculés ici à partir des 12 messages." experiment={<>
      <div className="ll-training-flow"><span>12 messages étiquetés</span><span aria-hidden="true">↓</span><span>Comparer les prédictions aux étiquettes</span><span aria-hidden="true">↓</span><span>Ajuster les paramètres</span></div>
      <button className="ll-button" onClick={learn}>{model ? "Recalculer sur les mêmes exemples" : "Apprendre à partir des exemples"}</button>
      <Observation>{model ? "L’apprentissage est terminé. Notre modèle a ajusté le poids des mots suspects et celui de la présence d’un lien. Il peut maintenant calculer un score pour un autre message." : "Le modèle n’est pas encore entraîné. Appuyez sur le bouton pour calculer ses paramètres."}</Observation>
      <TechnicalNote title="Ce qui est réellement entraîné"><p>Nous utilisons une <strong>régression logistique</strong>, un petit modèle de classification. Il reçoit deux caractéristiques : un compte normalisé de mots comme « gagnez », « gratuit », « offre », « cadeau », « urgent », et la présence d’un lien.</p><p>Pendant 700 itérations, une descente de gradient ajuste les deux poids et un terme constant pour réduire une erreur appelée perte logistique. L’essai fonctionne sans serveur.</p>{model && <div className="ll-weights"><p>Poids des mots suspects : <code>{model.weights[0].toFixed(3)}</code></p><p>Poids du lien : <code>{model.weights[1].toFixed(3)}</code></p><p>Terme constant : <code>{model.bias.toFixed(3)}</code></p></div>}<p>Ces deux indices sont volontairement limités. Un filtre réel exploite des signaux bien plus riches et beaucoup plus de données.</p></TechnicalNote>
      <details className="ll-technical"><summary>Voir les 12 exemples d’apprentissage</summary><div className="ll-mails">{trainingMail.map(item => <div key={item.text}><p>{item.text}</p><span>{item.label ? "Indésirable" : "À conserver"}</span></div>)}</div></details>
    </>}>
      <p>Le modèle essaie de prédire la catégorie de chaque message. Lorsqu’il se trompe, il ajuste les nombres qui gouvernent sa règle.</p><p>Notre petit filtre observe seulement deux indices : des mots souvent associés aux indésirables et la présence d’un lien. Il apprend le poids de chacun.</p><p>Ce sont les exemples qui servent à ajuster les poids. Nous n’avons pas écrit une règle du type « tout message urgent est indésirable ».</p>
    </LessonStep>
    <LessonStep number={3} title="Essayer sur un message qu’il n’a pas appris" hint="Choisissez un exemple, puis modifiez son texte. Utilisez uniquement un message inventé." experiment={<>
      <div className="ll-presets">{examples.map((text, i) => <button key={text} onClick={() => { setMessage(text); }}>{["Un cadeau", "Une réunion", "Un message urgent"][i]}</button>)}</div>
      <label className="ll-select">Message à essayer<textarea aria-label="Message à essayer" value={message} maxLength={220} rows={3} onChange={e => { setMessage(e.target.value); }} /></label>
      <div className="ll-features"><span>Mots suspects détectés <strong>{Math.round(features[0] * 4)}{features[0] === 1 ? " ou plus" : ""}</strong></span><span>Lien présent <strong>{features[1] ? "Oui" : "Non"}</strong></span></div>
      {model ? <div className="ll-score"><span>Score calculé par le modèle</span><strong>{Math.round(score * 100)}<small> / 100</small></strong><i aria-hidden="true"><b style={{ width: score * 100 + "%" }} /></i></div> : <p className="ll-waiting">Entraînez d’abord le modèle à l’étape 2 pour obtenir un score. <a href="#etape-2">Revenir à l’apprentissage</a></p>}
      <Observation>{model ? <>Ce score vient des deux indices ci-dessus. Le modèle n’interprète pas toute la situation. Il peut donc donner un score élevé à un message urgent pourtant légitime.</> : <>Les indices sont déjà visibles. Leur poids sera calculé pendant l’apprentissage.</>}</Observation>
    </>}>
      <p>Après l’apprentissage, on peut soumettre un nouveau message. Le modèle applique les poids qu’il a appris et produit un score.</p><p>Un score élevé indique que le message ressemble davantage aux indésirables de notre jeu d’apprentissage. Ce score n’est pas une certitude sur la nature du message.</p><p>Essayez une réunion normale, puis un message urgent avec un lien. Vous verrez aussi ce que le modèle est capable d’observer, et ce qu’il ignore.</p>
    </LessonStep>
    <LessonStep number={4} title="À partir de quel score faut-il bloquer un message ?" hint="Comparez un seuil de 30 puis de 80. Les dix messages de test sont les mêmes." experiment={<>
      {model ? <>
        <label className="ll-slider">Seuil de blocage<output>{Math.round(threshold * 100)} / 100</output><input aria-label="Seuil de blocage" type="range" min="0.1" max="0.9" step="0.01" value={threshold} onChange={e => changeThreshold(+e.target.value)} /></label>
        <div className="ll-options"><button onClick={() => changeThreshold(.3)}>Bloquer dès 30</button><button onClick={() => changeThreshold(.8)}>Bloquer dès 80</button></div>
        <div className="ll-confusion"><div><span>Indésirables bloqués</span><strong>{result.tp}</strong></div><div className="is-error"><span>Messages légitimes bloqués</span><strong>{result.fp}</strong></div><div className="is-error"><span>Indésirables laissés passer</span><strong>{result.fn}</strong></div><div><span>Messages légitimes conservés</span><strong>{result.tn}</strong></div></div>
        <Observation>Sur ces dix messages, le filtre en bloque {result.tp + result.fp}. {result.fp} de ces blocages concernent des messages légitimes. {result.fn} indésirable{result.fn > 1 ? "s passent" : " passe"} encore.</Observation>
        <details className="ll-technical"><summary>Voir les décisions sur les dix messages de test</summary><div className="ll-mails">{evaluated.map(item => <div key={item.text}><p>{item.text}<small>Étiquette attendue : {item.label ? "indésirable" : "à conserver"}</small></p><span className={(item.score >= threshold) !== !!item.label ? "is-error" : ""}>{Math.round(item.score * 100)} / 100 · {item.score >= threshold ? "Bloqué" : "Conservé"}</span></div>)}</div></details>
        <TechnicalNote title="Les noms des erreurs et des métriques"><p><strong>Faux positif</strong> : un message légitime est bloqué. <strong>Faux négatif</strong> : un indésirable passe.</p><p><strong>Précision</strong> : parmi les messages bloqués, part de vrais indésirables. Ici : {metricText(result.precision)}. <strong>Rappel</strong> : parmi tous les indésirables, part bloquée. Ici : {metricText(result.recall)}.</p><p>Avec seulement dix messages, ces résultats décrivent l’essai. Ils ne mesurent pas la performance future du filtre sur une vraie boîte mail.</p></TechnicalNote>
      </> : <p className="ll-waiting">Les dix messages de test sont prêts. <a href="#etape-2">Entraînez le modèle</a> pour comparer ses décisions.</p>}
    </>}>
      <p>Le score ne décide pas à lui seul. Il faut fixer un <strong>seuil</strong>. À un seuil de 50, les scores de 50 et plus sont bloqués.</p><p>Abaisser le seuil bloque davantage de messages. Cela peut arrêter plus d’indésirables, mais aussi bloquer des messages utiles. L’augmenter laisse passer davantage de messages.</p><p>Nous allons vérifier les décisions sur des messages que le modèle n’a pas utilisés pour apprendre. La bonne étiquette de chacun nous permet de compter les erreurs.</p>
    </LessonStep>
    <LessonStep number={5} title="Que change un exemple mal étiqueté ?" hint="Modifiez l’étiquette d’un message légitime. Une variante du modèle est réentraînée avec ce seul changement." experiment={<>
      <p className="ll-question">« {trainingMail[10].text} »</p>
      <label className="ll-toggle"><input type="checkbox" checked={alteredLabel} onChange={e => setAlteredLabel(e.target.checked)} /><span>Étiqueter cette demande de relecture comme indésirable</span></label>
      {model ? <><div className="ll-features"><span>Score avec les étiquettes initiales<strong>{Math.round(predictMail(model, trainingMail[10].text) * 100)} / 100</strong></span><span>Score avec votre variante<strong>{Math.round(alteredScore * 100)} / 100</strong></span></div><Observation>{alteredLabel ? "Un seul exemple différent a modifié les poids appris et le score de ce message. Les étiquettes participent directement à ce que le modèle apprend." : "Les deux modèles reçoivent les mêmes exemples : leur score est identique. Changez l’étiquette pour isoler son effet."}</Observation></> : <p className="ll-waiting">Lancez l’apprentissage à l’étape 2 pour comparer les deux modèles.</p>}
      <p className="ll-small-note">La variante est comparée à votre modèle initial. Elle ne remplace pas les résultats de l’étape précédente.</p>
    </>}>
      <p>Bien reconnaître les exemples étudiés est une première étape. Être utile sur des situations nouvelles est le vrai objectif.</p><p>Le choix des exemples, leurs étiquettes et les indices disponibles peuvent créer des erreurs systématiques. Il faut les examiner, pas seulement afficher un bon pourcentage.</p><p>Le réglage du seuil dépend aussi des conséquences : rater une invitation n’a pas le même coût que laisser passer une publicité.</p>
    </LessonStep>
    <Notebook observations={[
      model ? "Vous avez appris deux poids à partir de 12 messages étiquetés." : "L’apprentissage attend votre lancement à l’étape 2.",
      score !== null ? "Votre message obtient un score de " + Math.round(score * 100) + " / 100 à partir de deux indices." : "Le modèle calculera un score pour votre message après l’apprentissage.",
      model ? "Avec le seuil de " + Math.round(threshold * 100) + ", " + result.fp + " message(s) légitime(s) sont bloqués et " + result.fn + " indésirable(s) passent." : "Comparez les erreurs sur dix nouveaux messages après l’apprentissage.",
      alteredLabel ? "Votre variante traite la demande de relecture urgente comme un exemple indésirable." : "Les étiquettes d’apprentissage sont celles du jeu initial."
    ]} takeaway="Le modèle apprend à partir d’exemples étiquetés. Il produit un score, puis un seuil transforme ce score en décision. On juge ses erreurs sur des exemples différents." />
    <SourceLinks items={[{ href: "https://developers.google.com/machine-learning/crash-course/classification/thresholding", label: "Google — Seuils et matrice de confusion", note: "Cours sur la décision à partir d’un score." }, { href: "https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall", label: "Google — Précision, rappel et autres métriques", note: "Pour prolonger l’analyse des erreurs." }]} />
  </div>;
}

