"use client";
import { useMemo, useState } from "react";
import { tokenDistribution, drawToken } from "@/lib/lab-science.mjs";
import { LessonStep, Observation, TechnicalNote, ProbabilityBars, Notebook, SourceLinks } from "./LearningKit";

const contexts = [
  { sentence: "Ce matin, je bois un", tokens: [{ word: "café", logit: 4 }, { word: "thé", logit: 3.5 }, { word: "chocolat", logit: 2.8 }, { word: "jus", logit: 2.3 }, { word: "vélo", logit: .3 }] },
  { sentence: "Pour aller au travail, je prends le", tokens: [{ word: "métro", logit: 4 }, { word: "bus", logit: 3.5 }, { word: "vélo", logit: 3.2 }, { word: "train", logit: 2.8 }, { word: "café", logit: .3 }] }
];
const sequence = [
  [{ word: "café", logit: 4 }, { word: "thé", logit: 3.6 }, { word: "chocolat", logit: 2.8 }],
  [{ word: "bien", logit: 3 }, { word: "très", logit: 2.8 }],
  [{ word: "chaud", logit: 3.7 }, { word: "sucré", logit: 2.5 }]
];
export default function NextTokenLab() {
  const [tone, setTone] = useState(1);
  const [sourceShown, setSourceShown] = useState(false);
  const [context, setContext] = useState(0);
  const [temperature, setTemperature] = useState(.7);
  const [topP, setTopP] = useState(1);
  const [draws, setDraws] = useState([]);
  const [built, setBuilt] = useState([]);
  const distribution = useMemo(() => tokenDistribution(contexts[0].tokens, temperature, topP), [temperature, topP]);
  const shown = tokenDistribution(contexts[context].tokens, 1);
  const distinct = new Set(draws).size;
  function run() { setDraws(Array.from({ length: 20 }, () => drawToken(distribution))); }
  function next() { const result = drawToken(tokenDistribution(sequence[built.length], .8)); setBuilt(previous => [...previous, result]); }
  return <div className="ll-lesson">
    <div className="ll-route"><span>Votre parcours</span><a href="#etape-1">1. Le contexte</a><a href="#etape-2">2. Le hasard</a><a href="#etape-3">3. La phrase</a><a href="#etape-4">4. Le ton et les faits</a></div>
    <LessonStep number={1} title="Quel mot mettriez-vous à la suite ?" hint="Changez le début de la phrase. Regardez ce qui arrive à « café » et à « vélo »." experiment={<>
      <div className="ll-options" role="group" aria-label="Début de phrase">{contexts.map((item, index) => <button key={item.sentence} aria-pressed={context === index} onClick={() => { setContext(index); }}>{index === 0 ? "Au petit-déjeuner" : "Sur le trajet"}</button>)}</div>
      <p className="ll-sentence">{contexts[context].sentence} <span>…</span></p><ProbabilityBars items={shown} />
      <Observation>Dans ce contexte, « {shown[0].word} » reçoit le plus de chances. « {context === 0 ? "vélo" : "café"} » en reçoit très peu. La même liste de mots ne convient pas à toutes les phrases.</Observation>
    </>}>
      <p>« Ce matin, je bois un… » Vous pensez peut-être à un café. Vous avez utilisé le début de la phrase pour proposer une suite qui tient debout.</p>
      <p>Un modèle de langage fait lui aussi un choix à partir du texte reçu. Son entraînement lui a appris des régularités dans les textes. Il calcule ensuite plusieurs suites possibles, chacune avec un poids.</p>
      <p><strong>40 % à côté d’un mot</strong> veut dire : dans cet exemple et avec ces réglages, ce mot aurait environ 40 chances sur 100 d’être choisi. Ce n’est pas la probabilité que la phrase soit vraie.</p>
      <aside className="ll-small-note">Les poids de ce petit exemple sont écrits à la main pour rendre le mécanisme visible. Dans un LLM, ils sont calculés par un réseau de neurones à partir du contexte.</aside>
    </LessonStep>
    <LessonStep number={2} title="Pourquoi la même question donne-t-elle des réponses différentes ?" hint="Faites 20 essais avec peu de variation, puis recommencez avec davantage de variation." experiment={<>
      <label className="ll-slider">Variation dans les choix <output>{temperature < .65 ? "Faible" : temperature < 1.2 ? "Modérée" : "Forte"} · {temperature.toFixed(2)}</output><input aria-label="Variation dans les choix" type="range" min="0.35" max="1.8" step="0.05" value={temperature} onChange={e => { setTemperature(+e.target.value); setDraws([]); }} /></label>
      <ProbabilityBars items={distribution} /><button className="ll-button" onClick={run}>Faire 20 essais</button>
      {draws.length > 0 && <div className="ll-draws" aria-label="Résultats des vingt essais">{contexts[0].tokens.map(item => <div key={item.word}><span>{item.word}</span><b>{draws.filter(word => word === item.word).length} / 20</b></div>)}</div>}
      <Observation>{draws.length ? <>Ces 20 tirages ont donné {distinct} mot{distinct > 1 ? "s différents" : ""}. Les mots avec une petite barre peuvent tout de même sortir. Refaire l’essai peut modifier les comptes.</> : <>À {temperature.toFixed(2)}, « {distribution[0].word} » a {Math.round(distribution[0].probability * 100)} % de chances. Les barres changent avant même le tirage : vous modifiez la place laissée aux autres choix.</>}</Observation>
      <TechnicalNote title="Le nom de ce réglage : la température"><p>La température divise les scores du modèle avant leur conversion en probabilités. Plus elle est basse, plus les écarts sont accentués.</p><code>pᵢ = exp(scoreᵢ / T) / Σ exp(scoreⱼ / T)</code><p>La fonction qui transforme les scores en probabilités s’appelle <strong>softmax</strong>. Un autre réglage, <strong>top-p</strong>, conserve les candidats les mieux classés jusqu’à atteindre une part cumulée des probabilités.</p><label className="ll-slider">Part des choix conservée (top-p)<output>{Math.round(topP * 100)} %</output><input aria-label="Part des choix conservée" type="range" min="0.5" max="1" step="0.05" value={topP} onChange={e => { setTopP(+e.target.value); setDraws([]); }} /></label></TechnicalNote>
    </>}>
      <p>On pourrait toujours prendre le premier mot de la liste. Mais beaucoup de systèmes font un <strong>tirage au sort pondéré</strong> : les mots les mieux placés ont plus de chances de sortir.</p>
      <p>Imaginez un sac qui contient 50 papiers « café » et 30 papiers « thé ». Tirer un papier favorise le café, sans obliger à le choisir à chaque fois.</p>
      <p>Le réglage de variation change la répartition des papiers. Il ne rend pas le modèle plus savant. Il permet à des suites moins attendues d’être choisies plus souvent.</p>
    </LessonStep>
    <LessonStep number={3} title="Et après le premier mot ?" hint="Appuyez trois fois. Chaque nouveau morceau s’ajoute à la phrase." experiment={<>
      <p className="ll-sentence">Ce matin, je bois un <strong>{built.join(" ")}</strong>{built.length < 3 ? <span> …</span> : "."}</p>
      <div className="ll-generated">{built.map((word, i) => <span key={i}><small>Ajout {i + 1}</small>{word}</span>)}</div>
      {built.length < 3 ? <button className="ll-button" onClick={next}>Choisir le morceau suivant</button> : <button className="ll-button ll-secondary" onClick={() => setBuilt([])}>Construire une autre phrase</button>}
      <Observation>{built.length === 0 ? "La phrase n’a pas encore sa suite. Commençons par choisir la boisson." : built.length < 3 ? <>« {built[built.length - 1]} » fait maintenant partie du texte. L’étape suivante ajoute un morceau supplémentaire.</> : "Trois choix successifs ont construit une phrase entière. Le mécanisme se répète : proposer des suites, choisir, ajouter au texte."}</Observation>
      <TechnicalNote title="Un « token », est-ce toujours un mot ?"><p>Non. Un token est un morceau de texte du vocabulaire d’un modèle : parfois un mot, parfois une partie de mot ou un signe. Pour lire facilement cet exemple, nos morceaux sont des mots entiers.</p><p>Dans cette maquette, les trois listes sont préparées à l’avance. Un vrai modèle recalcule ses scores à chaque ajout, à partir de tout le contexte disponible.</p></TechnicalNote>
    </>}>
      <p>Le morceau choisi est ajouté au texte. Le modèle recommence alors avec cette phrase plus longue, jusqu’à atteindre une fin ou une limite de longueur.</p>
      <p>Dans un assistant, des instructions et parfois des documents font aussi partie de ce contexte. C’est pourquoi la formulation de votre demande et les informations que vous donnez peuvent changer la réponse.</p>
      <p>Essayons cette boucle sur une phrase courte. Vous verrez exactement quel morceau est ajouté à chaque clic.</p>
    </LessonStep>
    <LessonStep number={4} title="Le ton change. L’information change-t-elle ?" hint="Modifiez le ton de cette phrase, puis ouvrez sa référence." experiment={<>
      <p className="ll-small-note">Petit exemple fictif : la date proposée et la référence ci-dessous sont préparées pour observer leur différence.</p>
      <label className="ll-slider">Assurance dans la formulation<output>{["Prudente", "Neutre", "Très assurée"][tone]}</output><input aria-label="Assurance dans la formulation" type="range" min="0" max="2" step="1" value={tone} onChange={e => setTone(+e.target.value)} /></label>
      <blockquote className="ll-quote">{["Il me semble que l’atelier des Lilas a ouvert en 2019.", "L’atelier des Lilas a ouvert en 2019.", "L’atelier des Lilas a incontestablement ouvert en 2019."][tone]}<cite>Une même affirmation, trois formulations</cite></blockquote>
      <button className="ll-button ll-secondary" onClick={() => setSourceShown(value => !value)}>{sourceShown ? "Refermer la référence" : "Ouvrir la référence"}</button>
      {sourceShown && <div className="ll-evidence"><strong>ARCHIVE FICTIVE · INAUGURATION</strong><p>« L’atelier des Lilas a ouvert ses portes le 12 mai 2017. »</p></div>}
      <Observation>{sourceShown ? "La référence indique 2017, tandis que les trois formulations disent 2019. Rendre le ton plus assuré ne corrige pas cette différence." : "Le style change, mais la date reste 2019. Ouvrez la référence pour examiner l’information elle-même."}</Observation>
    </>}>
      <p>On vient d’observer un mécanisme qui propose du texte. Rien, dans le tirage lui-même, ne vérifie un fait, une date ou un nom.</p><p>Les modèles modernes peuvent accomplir des tâches complexes. Leur capacité à produire une réponse convaincante doit tout de même être distinguée des moyens utilisés pour la vérifier.</p><p>Pour une information importante, demandez d’où elle vient et contrôlez la source.</p>
    </LessonStep>
    <Notebook observations={[
      "Contexte affiché : « " + contexts[context].sentence + " ». Le premier candidat est « " + shown[0].word + " ».",
      draws.length ? "Votre dernier essai : " + distinct + " mots différents sur 20 tirages, avec une variation de " + temperature.toFixed(2) + "." : "Faites 20 tirages pour voir que probabilité et fréquence observée ne coïncident pas toujours.",
      built.length ? "Votre phrase : « Ce matin, je bois un " + built.join(" ") + (built.length === 3 ? "." : "…") + " »." : "La phrase se construit un morceau à la fois.",
      sourceShown ? "La référence donne 2017, même lorsque la formulation affirme 2019 avec assurance." : "Vous pouvez ouvrir la référence pour comparer le ton et le fait."
    ]} takeaway="Le texte reçu oriente les choix. Le tirage peut varier. Une réponse bien formulée demande encore une vérification lorsqu’elle affirme un fait." />
    <SourceLinks items={[{ href: "https://arxiv.org/abs/1904.09751", label: "Holtzman et al. — The Curious Case of Neural Text Degeneration", note: "Article de recherche sur l’échantillonnage et le top-p, en anglais." }]} />
  </div>;
}

