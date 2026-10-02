"use client";
import { useState } from "react";
import { retrieve, words } from "@/lib/lab-science.mjs";
import { LessonStep, Observation, TechnicalNote, Notebook, SourceLinks } from "./LearningKit";

const baseDocuments = [
  { id: "D1", title: "Horaires du dimanche", text: "Le dimanche, le café ouvre à 9 h et ferme à 13 h.", date: "Fiche du 2 octobre 2026" },
  { id: "D2", title: "Prix des boissons", text: "Le cappuccino coûte 4 euros. Le thé coûte 3 euros.", date: "Tarif du 2 octobre 2026" },
  { id: "D3", title: "Horaires du samedi", text: "Le samedi, le café est ouvert de 10 h à 18 h.", date: "Fiche du 2 octobre 2026" },
  { id: "D4", title: "Adresse et accès", text: "Le café se trouve au 10 rue des Lilas. Une entrée accessible est située dans la cour.", date: "Fiche du 2 octobre 2026" },
  { id: "D5", title: "Animaux et terrasse", text: "Les chiens sont acceptés sur la terrasse, tenus en laisse.", date: "Règlement du 2 octobre 2026" }
];
const prompts = ["À quelle heure ouvre le café dimanche ?", "Quel est le prix du cappuccino ?", "Les chiens sont-ils acceptés ?", "Y a-t-il un parking gratuit ?"];
const relevant = ranked => ranked.filter(item => item.score >= .18 && item.matched.length > 0).slice(0, 2);
export default function RagObservatory() {
  const [sourcePrice, setSourcePrice] = useState(4);
  const [citationDocument, setCitationDocument] = useState("D3");
  const [closingHour, setClosingHour] = useState(18);
  const documents = baseDocuments.map(doc => doc.id === "D2" ? { ...doc, text: "Le cappuccino coûte " + sourcePrice.toLocaleString("fr-FR") + " euros. Le thé coûte 3 euros." } : doc);
  const citationSource = documents.find(doc => doc.id === citationDocument);
  const [input, setInput] = useState(prompts[0]);
  const [query, setQuery] = useState(prompts[0]);
  const [searched, setSearched] = useState(false);
  const [hasSource, setHasSource] = useState(true);
  const ranking = retrieve(query, documents);
  const passages = relevant(ranking);
  const missing = relevant(retrieve(prompts[0], hasSource ? documents : documents.filter(item => item.id !== "D1")));
  function search(event) { event?.preventDefault(); setQuery(input.trim()); setSearched(true); }
  return <div className="ll-lesson">
    <div className="ll-route"><span>Votre parcours</span><a href="#etape-1">1. Les documents</a><a href="#etape-2">2. La recherche</a><a href="#etape-3">3. L’information manquante</a><a href="#etape-4">4. La source</a></div>
    <LessonStep number={1} title="Que faut-il savoir pour répondre ?" hint="Ouvrez les fiches de ce café fictif. Changez le prix dans D2 avant de lancer une recherche." experiment={<>
      <div className="ll-documents">{documents.map(doc => <details key={doc.id} id={"document-" + doc.id}><summary><span>{doc.id}</span>{doc.title}</summary><p>{doc.text}</p><small>{doc.date} · exemple fictif</small></details>)}</div>
      <label className="ll-slider">Prix du cappuccino dans D2<output>{sourcePrice.toLocaleString("fr-FR")} €</output><input aria-label="Prix du cappuccino dans D2" type="range" min="3" max="8" step="0.5" value={sourcePrice} onChange={e => setSourcePrice(+e.target.value)} /></label>
      <Observation>Le tarif est maintenant de {sourcePrice.toLocaleString("fr-FR")} euros. La recherche de l’étape suivante utilise cette version des fiches.</Observation>
    </>}>
      <p>Vous préparez une sortie dans un café. Vous voulez connaître ses horaires ou ses prix. Une IA n’a pas forcément ces informations récentes dans les textes sur lesquels elle a été entraînée.</p>
      <p>On peut lui fournir des documents à consulter. C’est le principe du <strong>RAG</strong> : retrouver des informations utiles, puis les donner au modèle pour préparer sa réponse.</p>
      <p>Le sigle anglais veut dire « génération enrichie par la recherche de documents ». Commençons par faire le travail à la main : quelle fiche contient la réponse ?</p>
    </LessonStep>
    <LessonStep number={2} title="Chercher, sélectionner, puis répondre" hint="Posez une question ou choisissez un exemple. Suivez les trois étapes affichées." experiment={<>
      <form className="ll-query" onSubmit={search}><label htmlFor="rag-question">Votre question<input id="rag-question" value={input} maxLength={180} onChange={e => setInput(e.target.value)} /></label><button className="ll-button" type="submit">Chercher dans les fiches</button></form>
      <div className="ll-presets">{prompts.map(prompt => <button key={prompt} onClick={() => { setInput(prompt); setQuery(prompt); setSearched(true); }}>{prompt}</button>)}</div>
      {searched ? <div className="ll-search-trace">
        <div><span>1</span><strong>On repère les mots utiles</strong><p>{words(query).length ? words(query).join(" · ") : "Écrivez une question plus précise."}</p></div>
        <div><span>2</span><strong>On retrouve les passages</strong>{passages.length ? passages.map(doc => <blockquote key={doc.id}>{doc.text}<cite>{doc.id} · {doc.title}</cite></blockquote>) : <p>Aucun passage assez proche n’est retenu.</p>}</div>
        <div><span>3</span><strong>On s’appuie sur ce qu’on a trouvé</strong><p>{passages.length ? <>Dans les fiches disponibles : {passages.map(doc => <span key={doc.id}>« {doc.text} » <a href={"#document-" + doc.id} onClick={() => { const element = document.getElementById("document-" + doc.id); if (element) element.open = true; }}>[{doc.id}]</a> </span>)}</> : "Je ne trouve pas cette information dans les fiches. Je ne peux pas répondre à partir de ces documents."}</p></div>
      </div> : <div className="ll-waiting">Les documents sont prêts. Lancez une recherche pour voir chaque étape.</div>}
      {searched && <Observation>{passages.length ? <>La réponse reprend {passages.length} passage{passages.length > 1 ? "s" : ""} que vous pouvez relire. Le système doit toujours vérifier que ces passages répondent bien à la question.</> : <>Pas de source adaptée : le système s’arrête. Essayez « parking gratuit » : cette information n’existe pas dans nos fiches.</>}</Observation>}
      <TechnicalNote title="Comment la recherche est-elle calculée ?"><p>Le moteur local utilise <strong>TF-IDF</strong> : il compte les mots et donne davantage de poids à ceux qui sont rares dans les fiches. Il compare ensuite les listes de nombres par similarité cosinus.</p><p>Les mots courants sont ignorés. Seuls les passages avec au moins un mot utile en commun et un score d’au moins 0,18 sont retenus. Ce seuil est un choix pour cette maquette, pas une mesure universelle de pertinence.</p><table className="ll-table"><caption>Scores calculés pour votre recherche</caption><thead><tr><th>Fiche</th><th>Proximité</th><th>Mots communs</th></tr></thead><tbody>{ranking.map(doc => <tr key={doc.id}><th>{doc.id}</th><td>{doc.score.toFixed(3)}</td><td>{doc.matched.join(", ") || "aucun"}</td></tr>)}</tbody></table><p>Un système plus complet peut chercher par le sens, comme dans le parcours précédent, puis faire rédiger une réponse par un modèle. Ici, nous reprenons les passages tels quels pour que leur origine reste visible.</p></TechnicalNote>
    </>}>
      <p>Une fois la question reçue, le système cherche d’abord des passages qui pourraient aider. Il donne ensuite les passages retenus au modèle, avec la question.</p>
      <p>Le modèle peut alors rédiger une réponse à partir de ces éléments et indiquer d’où ils viennent. Les passages fournis constituent une partie de son <strong>contexte</strong>, c’est-à-dire le texte dont il dispose au moment de répondre.</p>
      <p>Notre essai vous laisse voir la recherche et les citations. Pour suivre précisément les informations, la réponse reproduit les extraits : aucun modèle externe ne les reformule.</p>
    </LessonStep>
    <LessonStep number={3} title="Que se passe-t-il si le bon document manque ?" hint="Retirez la fiche du dimanche. La question et le reste des fiches restent les mêmes." experiment={<>
      <p className="ll-question">« À quelle heure ouvre le café dimanche ? »</p>
      <label className="ll-toggle"><input type="checkbox" checked={hasSource} onChange={e => { setHasSource(e.target.checked); }} /><span>La fiche D1 est disponible</span></label>
      <div className={"ll-evidence " + (missing.length ? "" : "is-missing")}><strong>{missing.length ? "Information retrouvée" : "Information absente"}</strong><p>{missing.length ? missing[0].text : "Les fiches restantes ne donnent pas les horaires du dimanche. Je ne peux pas les confirmer."}</p></div>
      <Observation>{hasSource ? "La fiche du dimanche soutient une réponse sur le dimanche." : "Sans D1, il reste les horaires du samedi. Les utiliser pour dimanche reviendrait à extrapoler une information que nous n’avons pas."}</Observation>
    </>}>
      <p>Si le bon document est absent, une recherche ne peut pas l’inventer. Une réponse utile peut donc être : « Je n’ai pas cette information. »</p>
      <p>Récupérer un document n’est pas suffisant non plus : il doit concerner le bon sujet, la bonne période et, parfois, la bonne personne ou le bon produit.</p>
      <p>Changeons une seule chose pour isoler son effet : la disponibilité de la fiche qui contient les horaires du dimanche.</p>
    </LessonStep>
    <LessonStep number={4} title="Une citation doit vraiment justifier l’affirmation" hint="Changez le document cité ou l’heure affirmée. Comparez la phrase avec le texte exact de la source." experiment={<>
      <label className="ll-select">Document relié à la citation<select aria-label="Document relié à la citation" value={citationDocument} onChange={e => setCitationDocument(e.target.value)}><option value="D3">D3 · Horaires du samedi</option><option value="D1">D1 · Horaires du dimanche</option></select></label>
      <label className="ll-slider">Heure affirmée dans la réponse<output>{closingHour} h</output><input aria-label="Heure affirmée dans la réponse" type="range" min="11" max="19" step="1" value={closingHour} onChange={e => setClosingHour(+e.target.value)} /></label>
      <blockquote className="ll-quote">« Le dimanche, le café ferme à {closingHour} h. [{citationDocument}] »<cite>Phrase composée à partir de vos réglages</cite></blockquote>
      <div className="ll-evidence"><strong>{citationDocument} · TEXTE ORIGINAL</strong><p>{citationSource.text}</p></div>
      <Observation>{citationDocument === "D3" ? "La source décrit le samedi. Elle ne permet pas de conclure sur le dimanche, même si une référence est bien affichée." : closingHour === 13 ? "Le jour et l’heure de la phrase correspondent à la fiche D1. Vous pouvez suivre l’affirmation jusqu’à son origine." : "Le document concerne le dimanche, mais il annonce une fermeture à 13 h. L’heure de la phrase diffère de celle de la source."}</Observation>
    </>}>
      <p>Une référence peut donner une impression de sérieux sans justifier la réponse. Il faut pouvoir ouvrir la source et vérifier la phrase qu’elle est censée soutenir.</p>
      <p>Cette vérification de la fidélité aux documents s’appelle parfois <strong>grounding</strong>. Elle se distingue de la recherche : on peut trouver une bonne source, puis mal l’utiliser.</p>
    </LessonStep>
    <Notebook observations={[
      searched ? "Votre dernière question : « " + query + " ». " + passages.length + " passage(s) retenu(s)." : "Vous pouvez interroger les fiches sur les horaires, les prix et les animaux.",
      hasSource ? "La fiche du dimanche est disponible pour la recherche." : "Sans la fiche D1, les horaires du dimanche ne peuvent pas être confirmés.",
      "Votre phrase affirme une fermeture le dimanche à " + closingHour + " h et cite " + citationDocument + ".",
      "Le tarif du cappuccino dans votre version des documents est de " + sourcePrice.toLocaleString("fr-FR") + " euros."
    ]} takeaway="Pour répondre à partir de documents, il faut retrouver une information utile, la transmettre, puis vérifier que la réponse lui reste fidèle. En l’absence d’information, on peut s’abstenir." />
    <SourceLinks items={[{ href: "https://arxiv.org/abs/2005.11401", label: "Lewis et al. — Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", note: "L’article de recherche qui présente le RAG, en anglais." }, { href: "https://nlp.stanford.edu/IR-book/html/htmledition/tf-idf-weighting-1.html", label: "Stanford — Introduction to Information Retrieval", note: "Explication de la pondération TF-IDF utilisée dans cette maquette." }]} />
  </div>;
}

