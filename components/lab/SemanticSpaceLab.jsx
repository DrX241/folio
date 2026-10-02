"use client";
import { useState } from "react";
import { cosine, words } from "@/lib/lab-science.mjs";
import { LessonStep, Observation, TechnicalNote, Notebook, SourceLinks } from "./LearningKit";

const dimensions = ["Animaux", "Déplacements", "Cuisine", "Informatique"];
const articles = [
  { title: "Promener un animal de compagnie", text: "Sorties et promenades avec votre animal.", vector: [.95, .1, .02, .02] },
  { title: "Choisir son ordinateur", text: "Mon ordinateur affiche un chien en fond d’écran.", vector: [.12, .02, .01, .96] },
  { title: "Aller au travail sans voiture", text: "Le bus, le métro et le vélo pour vos trajets.", vector: [.02, .97, .01, .08] },
  { title: "Préparer un repas", text: "Une recette simple pour cuisiner le soir.", vector: [.03, .02, .98, .01] }
];
const questions = [
  { text: "Mon chien veut sortir.", vector: [.97, .08, .01, .01] },
  { text: "Comment rejoindre le bureau ?", vector: [.01, .96, .01, .08] },
  { text: "Que faire à manger ce soir ?", vector: [.03, .02, .96, .01] }
];
const mice = [
  { text: "La souris mange une graine.", vector: [.96, .01, .02, .03], result: "Les animaux" },
  { text: "La souris ne répond plus quand je clique.", vector: [.04, .01, .01, .97], result: "L’informatique" }
];
function rankings(query) { return articles.map(item => ({ ...item, score: cosine(query.vector, item.vector) })).sort((a, b) => b.score - a.score); }
export default function SemanticSpaceLab() {
  const [literalQuery, setLiteralQuery] = useState("chien");
  const [negated, setNegated] = useState(false);
  const [queryIndex, setQueryIndex] = useState(0);
  const [mouseIndex, setMouseIndex] = useState(0);
  const query = questions[queryIndex];
  const ranked = rankings(query);
  const literalTerms = words(literalQuery);
  const literalResults = articles.map(article => ({ ...article, matches: literalTerms.filter(term => words(article.title + " " + article.text).includes(term)) })).sort((a, b) => b.matches.length - a.matches.length);
  function chooseMouse(index) { setMouseIndex(index); }
  return <div className="ll-lesson">
    <div className="ll-route"><span>Votre parcours</span><a href="#etape-1">1. Les mots</a><a href="#etape-2">2. Les nombres</a><a href="#etape-3">3. Le contexte</a><a href="#etape-4">4. Le sens du score</a></div>
    <LessonStep number={1} title="Retrouver un article sans employer les mêmes mots" hint="Essayez « chien », puis « animal ». Cette première recherche compare seulement les mots." experiment={<>
      <label className="ll-select">Mot ou expression à chercher<input aria-label="Mot ou expression à chercher" value={literalQuery} maxLength={100} onChange={e => setLiteralQuery(e.target.value)} /></label>
      <div className="ll-literal-results">{literalResults.map(article => <article key={article.title}><strong>{article.title}</strong><p>{article.text}</p><span>{article.matches.length ? "Mots retrouvés : " + article.matches.join(", ") : "Aucun mot identique retrouvé"}</span></article>)}</div>
      <Observation>{literalTerms.length ? <>Avec « {literalQuery} », {literalResults.filter(article => article.matches.length).length} article(s) partagent au moins un mot. L’article sur l’ordinateur contient « chien », mais son sujet n’est pas une promenade.</> : "Écrivez un mot pour voir comment une recherche littérale se comporte."}</Observation>
    </>}>
      <p>Vous cherchez quoi faire avec votre chien qui réclame une sortie. Un article sur les promenades peut être utile, même s’il parle d’« animal de compagnie ».</p>
      <p>Une recherche fondée seulement sur les mots identiques peut manquer cette relation. Elle peut aussi remonter un texte qui contient « chien » mais parle surtout d’un ordinateur.</p>
      <p><strong>Retrouver par le sens</strong>, c’est essayer de rapprocher les contenus qui parlent de choses liées. Voyons comment des nombres peuvent aider à les comparer.</p>
    </LessonStep>
    <LessonStep number={2} title="Comment comparer des textes avec des nombres ?" hint="Choisissez une recherche. La représentation et le classement changent ensemble." experiment={<>
      <label className="ll-select">Votre recherche<select aria-label="Votre recherche" value={queryIndex} onChange={e => { setQueryIndex(+e.target.value); }}>{questions.map((q, i) => <option value={i} key={q.text}>{q.text}</option>)}</select></label>
      <div className="ll-vector">{dimensions.map((dimension, i) => <div key={dimension}><span>{dimension}</span><i aria-hidden="true"><b style={{ width: query.vector[i] * 100 + "%" }} /></i><code>{query.vector[i].toFixed(2)}</code></div>)}</div>
      <p className="ll-result-label">Articles les plus proches de votre recherche</p>
      <ol className="ll-ranked">{ranked.map(item => <li key={item.title}><span>{item.title}</span><strong>{item.score.toFixed(2)}<small> / 1</small></strong></li>)}</ol>
      <Observation>« {ranked[0].title} » arrive en tête. Les nombres de votre recherche pointent surtout vers « {dimensions[query.vector.indexOf(Math.max(...query.vector))].toLowerCase()} ».</Observation>
      <TechnicalNote title="Deux mots techniques, avec leur traduction"><p><strong>Embedding</strong> : la représentation d’un texte par une liste de nombres, aussi appelée vecteur. <strong>Similarité cosinus</strong> : une façon de comparer la direction de deux vecteurs. Des directions très proches donnent un score proche de 1.</p><code>similarité(a, b) = (a · b) / (||a|| × ||b||)</code><p>Ici, toutes les coordonnées sont positives. Le cosinus peut, dans d’autres espaces, aller jusqu’à −1. Nos quatre thèmes sont choisis à la main. Dans un vrai modèle, les dimensions sont apprises et sont rarement aussi faciles à nommer.</p></TechnicalNote>
    </>}>
      <p>Imaginons quatre curseurs pour décrire le sujet d’un texte : animaux, déplacements, cuisine et informatique. Un texte sur le chien place le curseur « animaux » assez haut.</p>
      <p>On peut ranger ces valeurs dans une liste : <code>[0,97 ; 0,08 ; 0,01 ; 0,01]</code>. Deux textes avec des listes orientées de la même manière ont de bonnes chances de traiter de sujets liés.</p>
      <p>L’essai calcule vraiment leur proximité. Les représentations de ces phrases sont préparées à la main pour montrer l’idée ; elles ne viennent pas d’un modèle neuronal.</p>
    </LessonStep>
    <LessonStep number={3} title="Un mot peut changer de sens" hint="Lisez les deux phrases. Le mot ne change pas, son entourage si." experiment={<>
      <div className="ll-options" role="group" aria-label="Contexte du mot souris">{mice.map((item, index) => <button key={item.text} aria-pressed={mouseIndex === index} onClick={() => chooseMouse(index)}>{index === 0 ? "Une souris qui mange" : "Une souris qui clique"}</button>)}</div>
      <p className="ll-sentence">{mice[mouseIndex].text}</p>
      <div className="ll-vector">{dimensions.map((dimension, i) => <div key={dimension}><span>{dimension}</span><i aria-hidden="true"><b style={{ width: mice[mouseIndex].vector[i] * 100 + "%" }} /></i><code>{mice[mouseIndex].vector[i].toFixed(2)}</code></div>)}</div>
      <Observation>{mice[mouseIndex].result} domine{mouseIndex === 0 ? "nt" : ""} dans cette représentation. Une recherche utile doit tenir compte de la phrase, pas seulement du mot « souris ».</Observation>
    </>}>
      <p>« Souris » peut désigner un animal ou un accessoire informatique. Vous faites la différence grâce aux mots autour : « mange », « graine », « clique ».</p>
      <p>Les modèles qui représentent des phrases peuvent aussi utiliser ce contexte. Deux phrases qui contiennent le même mot ne reçoivent donc pas forcément la même représentation.</p>
      <p>Dans cette maquette, nous avons préparé une liste pour chaque phrase. Elle montre le résultat attendu de cette distinction, sans prétendre l’avoir apprise automatiquement.</p>
    </LessonStep>
    <LessonStep number={4} title="Deux phrases proches peuvent se contredire" hint="Ajoutez une négation. Le sujet reste le même ; l’affirmation change." experiment={<>
      <blockquote className="ll-quote">« Le chien peut sortir. »<cite>Phrase de référence</cite></blockquote>
      <label className="ll-toggle"><input type="checkbox" checked={negated} onChange={e => setNegated(e.target.checked)} /><span>Ajouter « ne… pas » à la seconde phrase</span></label>
      <p className="ll-sentence">{negated ? "Le chien ne peut pas sortir." : "Le chien peut sortir."}</p>
      <div className="ll-evidence"><strong>PROXIMITÉ PAR LES THÈMES DE NOTRE EXEMPLE</strong><p>{cosine(questions[0].vector, questions[0].vector).toFixed(2)} / 1 · Le thème « animaux » est identique.</p></div>
      <Observation>{negated ? "Le sujet n’a pas changé, mais les affirmations sont opposées. Notre représentation par thèmes ne capture pas cette négation." : "Les deux phrases disent la même chose. Ajoutez la négation pour observer ce que notre représentation ignore."}</Observation>
      <p className="ll-small-note">Cette représentation simplifiée ignore volontairement la négation. Un modèle réel peut la représenter, mais une proximité élevée ne garantit toujours pas que deux phrases disent la même chose.</p>
    </>}>
      <p>« Le magasin est ouvert » et « Le magasin est fermé » parlent du même magasin. Ils peuvent être proches dans un espace sémantique, tout en se contredisant.</p><p>Ces représentations servent notamment à chercher, regrouper et recommander des contenus. Elles donnent une piste à examiner, pas un verdict sur leur vérité.</p>
    </LessonStep>
    <Notebook observations={[
      "Pour « " + query.text + " », l’article le mieux classé est « " + ranked[0].title + " ».",
      "Le calcul compare des listes de quatre nombres ; leur construction est volontairement simplifiée.",
      "Dans la phrase affichée avec « souris », le thème dominant est : " + mice[mouseIndex].result.toLowerCase() + ".",
      negated ? "La négation oppose les affirmations sans changer leur thème dans notre représentation." : "La seconde phrase affirme la même chose que la première."
    ]} takeaway="On peut chercher des textes avec des mots différents en comparant leurs représentations. Le contexte compte, et un score élevé ne vérifie pas les faits." />
    <SourceLinks items={[{ href: "https://arxiv.org/abs/1301.3781", label: "Mikolov et al. — Efficient Estimation of Word Representations in Vector Space", note: "Une référence de recherche sur les représentations vectorielles des mots, en anglais." }]} />
  </div>;
}

