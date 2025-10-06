import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Info, Moon, Sun, ChevronRight, CheckCircle2, XCircle, Calculator, Search, BookOpen, ClipboardCheck, Scale, Users, FileText, Briefcase, CalendarClock, FileSignature, GraduationCap, RefreshCcw, ListChecks } from "lucide-react";

/*
  BWRW Lernseite – v2
  Verbesserungen:
  - Konsistentes, modernes Look & Feel mit Tailwind
  - Dark-Mode Toggle
  - Bessere Typographie, Abstand, Kontrast, Iconographie
  - Kontextleiste mit kompakten Erklärungen & Lernzielen je Modul
  - Kleinigkeiten gefixt (Sozialauswahl-Daten, Formulierungen)
  - Komponenten vereinheitlicht (Card, Button, Badge, Input, Select)
*/

// ---------- UI primitives ----------
const cx = (...c) => c.filter(Boolean).join(" ");
const Card = ({ className = "", children }) => (
  <div className={cx("rounded-2xl border shadow-sm bg-white dark:bg-neutral-900 dark:border-neutral-800 p-5", className)}>{children}</div>
);
const Button = ({ className = "", variant = "ghost", children, ...props }) => {
  const base = "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm transition active:scale-[.99]";
  const styles = {
    ghost: "border bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-800",
    primary: "bg-black text-white hover:bg-neutral-800 border border-black dark:bg-white dark:text-black dark:hover:bg-neutral-100",
    subtle: "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200",
  };
  return <button className={cx(base, styles[variant], className)} {...props}>{children}</button>;
};
const Badge = ({ children }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 dark:border-neutral-800 px-3 py-1 text-xs bg-white dark:bg-neutral-900">{children}</span>
);
const Input = (props) => (
  <input {...props} className={cx("w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-sm", props.className)} />
);
const Select = ({ value, onChange, options, className = "" }) => (
  <select value={value} onChange={(e)=>onChange(e.target.value)} className={cx("w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-sm", className)}>
    {options.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

// ---------- Content helpers ----------
const qa = (q, a) => ({ q, a });

const kuendigungsarten = [
  qa("Wohnortwechsel – welche Kündigungsart?", "ordentlich"),
  qa("Beharrliche Arbeitsverweigerung – welche Kündigungsart passt?", "außerordentlich"),
  qa("Eigenmächtiger Urlaubsantritt – ordentl. oder außerordentl.?", "außerordentlich"),
  qa("Lohn seit 3 Monaten nicht gezahlt – was möglich?", "außerordentlich"),
  qa("Berufliche Veränderung gewünscht – welche Kündigungsart?", "ordentlich"),
];

const sozialauswahlFaktoren = [
  { key: "dauer", label: "Dauer der Betriebszugehörigkeit" },
  { key: "alter", label: "Lebensalter" },
  { key: "unterhalt", label: "Unterhaltspflichten" },
  { key: "behinderung", label: "Schwerbehinderung" },
];

const zeugnisNoten = [
  { note: "sehr gut (1)", formel: "stets zu unserer vollsten Zufriedenheit" },
  { note: "gut (2)", formel: "stets zu unserer vollen Zufriedenheit" },
  { note: "befriedigend (3)", formel: "zu unserer Zufriedenheit" },
  { note: "ausreichend (4)", formel: "im Großen und Ganzen zu unserer Zufriedenheit" },
  { note: "mangelhaft (5)", formel: "hat sich bemüht" },
];

const fuehrungsstile = [
  { name: "Autoritär", merkmale: ["FK entscheidet allein", "klare Anweisungen", "schnelle Entscheidungen", "starke Kontrolle"] },
  { name: "Kooperativ", merkmale: ["MA beteiligt", "Entscheidung nach Beratung", "Vertrauen", "Eigenverantwortung"] },
  { name: "Laissez-faire", merkmale: ["große Freiheit", "kaum Eingriffe", "intrinsische Motivation notwendig"] },
];

// ---------- Hooks ----------
function useQuiz(items){
  const [idx, setIdx] = useState(0);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const current = items[idx];
  const answer = (ans) => {
    const ok = ans.trim().toLowerCase() === current.a.toLowerCase();
    setResult(ok);
    setScore(s=> s + (ok?1:0));
  };
  const next = () => { setResult(null); if(idx+1 < items.length) setIdx(idx+1); else setDone(true); };
  const reset = () => { setIdx(0); setResult(null); setScore(0); setDone(false); };
  return { current, idx, result, score, done, total: items.length, answer, next, reset };
}

// ---------- Modules ----------
function FristenRechner(){
  const [rolle, setRolle] = useState("arbeitnehmer");
  const [betriebsjahre, setBetriebsjahre] = useState(0);
  const [stichtag, setStichtag] = useState("");

  const frist = useMemo(()=>{
    if(rolle === "arbeitnehmer") return "4 Wochen zum 15. oder Monatsende"; // § 622 Abs. 1 BGB
    const staffel = [
      {jahre:2, text:"1 Monat zum Monatsende"},
      {jahre:5, text:"2 Monate zum Monatsende"},
      {jahre:8, text:"3 Monate zum Monatsende"},
      {jahre:10, text:"4 Monate zum Monatsende"},
      {jahre:12, text:"5 Monate zum Monatsende"},
      {jahre:15, text:"6 Monate zum Monatsende"},
      {jahre:20, text:"7 Monate zum Monatsende"},
    ];
    const entry = staffel.find(s=> betriebsjahre < s.jahre) || staffel[staffel.length-1];
    return entry.text;
  }, [rolle, betriebsjahre]);

  const [berechnet, setBerechnet] = useState("");
  const berechneDatum = () => {
    if(!stichtag) return setBerechnet("");
    const d = new Date(stichtag+"T00:00:00");
    if(rolle === "arbeitnehmer"){
      const end = new Date(d.getTime() + 28*24*60*60*1000);
      setBerechnet(end.toLocaleDateString());
    } else {
      const map = {"1 Monat zum Monatsende":1, "2 Monate zum Monatsende":2, "3 Monate zum Monatsende":3, "4 Monate zum Monatsende":4, "5 Monate zum Monatsende":5, "6 Monate zum Monatsende":6, "7 Monate zum Monatsende":7};
      const addM = map[frist]||1;
      const base = new Date(d.getFullYear(), d.getMonth()+addM+1, 0); // letzter Tag Zielmonat
      setBerechnet(base.toLocaleDateString());
    }
  }

  return (
    <Card className="mt-4">
      <div className="flex flex-col gap-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-neutral-500">Rolle</label>
            <Select value={rolle} onChange={setRolle} options={[{value:"arbeitnehmer", label:"Arbeitnehmer"},{value:"arbeitgeber", label:"Arbeitgeber"}]} />
          </div>
          <div>
            <label className="text-xs text-neutral-500">Betriebszugehörigkeit (Jahre, nur AG)</label>
            <Input type="number" min={0} step={1} value={betriebsjahre} onChange={e=>setBetriebsjahre(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-neutral-500">Zugang der Kündigung</label>
            <Input type="date" value={stichtag} onChange={e=>setStichtag(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="primary" onClick={berechneDatum}><Calculator className="w-4 h-4"/>Frist berechnen</Button>
          <Badge><Info className="w-4 h-4"/> {frist}</Badge>
          {berechnet && <Badge><CalendarClock className="w-4 h-4"/> Ende: {berechnet}</Badge>}
        </div>
      </div>
    </Card>
  );
}

function SozialauswahlTool(){
  const [profile] = useState([
    {name:"Anna K.", dauer:10, alter:35, unterhalt:1, behinderung:false},
    {name:"Manfred M.", dauer:13, alter:49, unterhalt:2, behinderung:false},
    {name:"Klaus A.", dauer:22, alter:62, unterhalt:0, behinderung:false},
    {name:"Leonie S.", dauer:3, alter:21, unterhalt:0, behinderung:false},
  ]);
  const score = (p)=> p.dauer*3 + p.alter*2 + (p.unterhalt||0)*2 + (p.behinderung? 50:0);
  const ranked = [...profile].map(p=>({...p, s: score(p)})).sort((a,b)=> b.s-a.s);

  return (
    <Card className="mt-4">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {sozialauswahlFaktoren.map(f=> <Badge key={f.key}>{f.label}</Badge>)}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-neutral-200 dark:border-neutral-800">
                <th className="py-2">Mitarbeiter</th>
                <th>Dauer (J)</th>
                <th>Alter</th>
                <th>Unterhaltspflichten</th>
                <th>Schwerbehinderung</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map(p=> (
                <tr key={p.name} className="border-b border-neutral-100 dark:border-neutral-800">
                  <td className="py-2 font-medium">{p.name}</td>
                  <td>{p.dauer}</td>
                  <td>{p.alter}</td>
                  <td>{p.unterhalt||0}</td>
                  <td>{p.behinderung?"Ja":"Nein"}</td>
                  <td className="font-semibold">{p.s}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-xs text-neutral-500">Hinweis: Soziale Auswahl ist ein Abwägungsprozess. Ranking dient dem Training und ersetzt keine Rechtsprüfung.</div>
      </div>
    </Card>
  );
}

function ZeugnisDecoder(){
  const [text, setText] = useState("");
  const hits = useMemo(()=> zeugnisNoten.filter(z => text.toLowerCase().includes(z.formel.toLowerCase())), [text]);
  return (
    <Card className="mt-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-neutral-500">Formulierung aus einem Arbeitszeugnis eingeben</label>
          <Input placeholder="z. B. stets zu unserer vollen Zufriedenheit" value={text} onChange={e=>setText(e.target.value)} />
          <div className="mt-3 text-xs text-neutral-500">Der Decoder ordnet typische Wendungen einer Schulnote zu.</div>
        </div>
        <div>
          <div className="font-medium mb-2">Ergebnis</div>
          {hits.length===0 ? (
            <div className="text-neutral-500">Keine Standardformel erkannt.</div>
          ) : (
            <ul className="space-y-2">
              {hits.map(h=> <li key={h.note} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> {h.note} – „{h.formel}“</li>)}
            </ul>
          )}
          <div className="mt-4">
            <details>
              <summary className="cursor-pointer text-sm">Übliche Codes anzeigen</summary>
              <ul className="mt-2 text-sm space-y-1">
                {zeugnisNoten.map(z=> <li key={z.note} className="flex items-center gap-2"><ListChecks className="w-4 h-4"/> {z.note}: „{z.formel}“</li>)}
              </ul>
            </details>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ArbeitsvertragBuilder(){
  const [name, setName] = useState("");
  const [beginn, setBeginn] = useState("");
  const [probe, setProbe] = useState(3);
  const [gehalt, setGehalt] = useState(2700);
  const [wochenzeit, setWochenzeit] = useState(39);
  const [urlaub, setUrlaub] = useState(30);
  const [vwl, setVwl] = useState(10);

  const vorschau = useMemo(()=> `Arbeitsvertrag\n\nZwischen der Bürodesign GmbH und ${name}.\n\n§1 Beginn & Arbeitsort: Beginn ${beginn||"—"}. Arbeitsort: Köln.\n§2 Probezeit: ${probe} Monate. Kündigung in Probezeit: 2 Wochen.\n§3 Tätigkeit: Verkaufssachbearbeiter/in; zumutbare andere Arbeiten möglich.\n§4 Arbeitszeit: ${wochenzeit}-Stunden-Woche. Überstunden gem. Betriebsvereinbarung.\n§5 Vergütung: ${gehalt.toFixed(2)} € brutto/Monat + ${vwl.toFixed(2)} € VWL. Zahlbar am Monatsende.\n§6 Urlaub: ${urlaub} Arbeitstage/Jahr.\n§7 Entgeltfortzahlung: nach Tarif.\n§8 Nebentätigkeit: zustimmungspflichtig.\n§9 Kündigung: gesetzliche Fristen nach Probezeit.\n§10 Verschwiegenheitspflicht.\n`, [name, beginn, probe, gehalt, wochenzeit, urlaub, vwl]);

  return (
    <Card className="mt-4">
      <div className="grid md:grid-cols-3 gap-3">
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input placeholder="Name Arbeitnehmer/in" value={name} onChange={e=>setName(e.target.value)} />
          <Input type="date" value={beginn} onChange={e=>setBeginn(e.target.value)} />
          <Input type="number" min={0} value={probe} onChange={e=>setProbe(Number(e.target.value))} />
          <Input type="number" min={0} value={gehalt} onChange={e=>setGehalt(Number(e.target.value))} />
          <Input type="number" min={0} value={wochenzeit} onChange={e=>setWochenzeit(Number(e.target.value))} />
          <Input type="number" min={0} value={urlaub} onChange={e=>setUrlaub(Number(e.target.value))} />
          <Input type="number" min={0} value={vwl} onChange={e=>setVwl(Number(e.target.value))} />
        </div>
        <div className="md:col-span-1">
          <div className="text-xs text-neutral-500 mb-1">Vorschau (Lernzwecke, kein Rechtsdokument)</div>
          <textarea value={vorschau} readOnly className="w-full h-56 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2 font-mono text-xs" />
        </div>
      </div>
    </Card>
  );
}

function AnschaffungskostenTool(){
  const [menge,setMenge]=useState(10);
  const [ep,setEp]=useState(990);
  const [verp,setVerp]=useState(200);
  const [ust,setUst]=useState(19);
  const netto = useMemo(()=> menge*ep + verp, [menge,ep,verp]);
  const vorsteuer = useMemo(()=> netto*ust/100, [netto,ust]);
  const anschaffungskosten = useMemo(()=> netto /* ohne USt */ , [netto]);
  return (
    <Card className="mt-4">
      <div className="grid md:grid-cols-5 gap-3 items-end">
        <div><label className="text-xs text-neutral-500">Menge</label><Input type="number" value={menge} onChange={e=>setMenge(Number(e.target.value))}/></div>
        <div><label className="text-xs text-neutral-500">Einzelpreis €</label><Input type="number" value={ep} onChange={e=>setEp(Number(e.target.value))}/></div>
        <div><label className="text-xs text-neutral-500">Verpackung €</label><Input type="number" value={verp} onChange={e=>setVerp(Number(e.target.value))}/></div>
        <div><label className="text-xs text-neutral-500">USt %</label><Input type="number" value={ust} onChange={e=>setUst(Number(e.target.value))}/></div>
        <div className="flex gap-2 flex-wrap"><Badge>Warenwert netto: { (menge*ep).toFixed(2) } €</Badge><Badge>AK §255 HGB: { anschaffungskosten.toFixed(2) } €</Badge><Badge>Vorsteuer: {vorsteuer.toFixed(2)} €</Badge></div>
      </div>
      <div className="mt-2 text-xs text-neutral-500">Vorsteuer ist nicht Bestandteil der Anschaffungskosten. Sie ist abzugsfähig.</div>
    </Card>
  );
}

function BilanzTrainer(){
  const [konten] = useState([
    {k:"Grundstücke", s:432000, seite:"Aktiva"},
    {k:"Gebäude", s:890000, seite:"Aktiva"},
    {k:"Technische Anlagen und Maschinen", s:675000, seite:"Aktiva"},
    {k:"Werkstatteinrichtung", s:152500, seite:"Aktiva"},
    {k:"Lager", s:181000, seite:"Aktiva"},
    {k:"Fuhrpark", s:253000, seite:"Aktiva"},
    {k:"Büromaschinen", s:86500, seite:"Aktiva"},
    {k:"Roh-, Hilfs-, Betriebsstoffe", s:143500, seite:"Aktiva"},
    {k:"Forderungen a. L.u.L.", s:87500, seite:"Aktiva"},
    {k:"Bankguthaben", s:229550, seite:"Aktiva"},
    {k:"Kasse", s:3250, seite:"Aktiva"},
    {k:"Eigenkapital", s:1880000, seite:"Passiva"},
    {k:"Jahresüberschuss", s:165000, seite:"Passiva"},
    {k:"Hypothek", s:800000, seite:"Passiva"},
    {k:"Verbindlichkeiten Kreditinstitut", s:107000, seite:"Passiva"},
    {k:"Verbindlichkeiten a. L.u.L.", s:160200, seite:"Passiva"},
    {k:"Umsatzsteuer", s:31600, seite:"Passiva"},
  ]);
  const sumA = useMemo(()=> konten.filter(k=>k.seite==="Aktiva").reduce((a,b)=>a+b.s,0),[konten]);
  const sumP = useMemo(()=> konten.filter(k=>k.seite==="Passiva").reduce((a,b)=>a+b.s,0),[konten]);
  return (
    <Card className="mt-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="font-medium mb-2">Aktiva</div>
          <ul className="space-y-1 text-sm">
            {konten.filter(k=>k.seite==="Aktiva").map(k=> <li key={k.k} className="flex justify-between"><span>{k.k}</span><span>{k.s.toLocaleString()} €</span></li>)}
          </ul>
          <div className="mt-2 font-semibold">Summe: {sumA.toLocaleString()} €</div>
        </div>
        <div>
          <div className="font-medium mb-2">Passiva</div>
          <ul className="space-y-1 text-sm">
            {konten.filter(k=>k.seite==="Passiva").map(k=> <li key={k.k} className="flex justify-between"><span>{k.k}</span><span>{k.s.toLocaleString()} €</span></li>)}
          </ul>
          <div className="mt-2 font-semibold">Summe: {sumP.toLocaleString()} €</div>
        </div>
      </div>
      <div className={cx("mt-3 text-sm", sumA===sumP?"text-green-700":"text-red-700")}>{sumA===sumP?"Bilanz ausgeglichen":"Nicht ausgeglichen"}</div>
    </Card>
  );
}

function MbX(){
  const [technik, setTechnik] = useState("MbO");
  const infos = {
    MbO: ["Zielvereinbarungen zwischen FK & MA", "Eigenverantwortung für Zielerreichung", "Motivierend, aber Risiko unrealistischer Ziele"],
    MbE: ["Führen nach Ausnahmeprinzip", "MA entscheidet, FK greift bei Abweichung ein", "Effizient, Grenzziehung wichtig"],
    MbD: ["Delegation von Aufgaben/Kompetenzen/Verantwortung", "Rahmen vorgeben, Infos teilen", "Entlastet Führung, braucht klare Abgrenzung"],
  };
  return (
    <Card className="mt-4">
      <div className="grid md:grid-cols-2 gap-4 items-start">
        <div>
          <Select value={technik} onChange={setTechnik} options={[{value:"MbO",label:"Management by Objectives"},{value:"MbE",label:"Management by Exception"},{value:"MbD",label:"Management by Delegation"}]} />
          <ul className="mt-3 list-disc pl-5 text-sm space-y-1">
            {infos[technik].map((t,i)=> <li key={i}>{t}</li>)}
          </ul>
        </div>
        <div className="text-xs text-neutral-500">Beurteile Führungspersonen anhand der Merkmalslisten. Kombiniere Stil (autoritä/kooperativ) mit Technik (MbX), um Situationen zu analysieren.</div>
      </div>
    </Card>
  );
}

function SelfCheck(){
  const [states, setStates] = useState({});
  const ziele = [
    "Arbeitsrecht: Individual vs. Kollektiv erklären",
    "Betriebs-/Mantel-/Tarifvertrag unterscheiden",
    "Kündigungsarten und -fristen anwenden",
    "Sozialauswahl begründen",
    "Führungsstile vergleichen",
    "Führungstechniken (MbO/MbE/MbD) erklären",
    "Arbeitszeugnis-Codes deuten",
    "Arbeitsvertrag aufsetzen",
    "Anschaffungskosten nach §255 HGB berechnen",
    "Bilanz (HF7) lesen"
  ];
  const done = Object.values(states).filter(Boolean).length;
  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="font-medium">Kann-Liste Self-Check</div>
          <Badge>{done}/{ziele.length} erreicht</Badge>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {ziele.map(z=> (
            <label key={z} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!states[z]} onChange={e=> setStates(s=>({...s, [z]: e.target.checked}))}/>
              <span>{z}</span>
            </label>
          ))}
        </div>
      </div>
    </Card>
  );
}

function QuizKuendigung(){
  const quiz = useQuiz(kuendigungsarten);
  return (
    <Card className="mt-4">
      {quiz.done ? (
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5"/> Ergebnis: {quiz.score}/{quiz.total}
          <Button variant="subtle" onClick={quiz.reset}><RefreshCcw className="w-4 h-4"/> Wiederholen</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="font-medium">Frage {quiz.idx+1}/{quiz.total}</div>
          <div className="text-sm">{quiz.current.q}</div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="primary" onClick={()=>quiz.answer("ordentlich")}>ordentlich</Button>
            <Button variant="primary" onClick={()=>quiz.answer("außerordentlich")}>außerordentlich</Button>
          </div>
          {quiz.result!==null && (
            <div className="flex items-center gap-2 text-sm">{quiz.result? <CheckCircle2 className="w-5 h-5 text-green-600"/> : <XCircle className="w-5 h-5 text-red-600"/>}
              <Button variant="ghost" onClick={quiz.next}><ChevronRight className="w-4 h-4"/> Weiter</Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ---------- Context Sidebar ----------
const CONTEXT = {
  dashboard: {
    title: "Übersicht",
    bullets: [
      "Trainiere HF 5 Personal und HF 7 Wertströme.",
      "Starte mit Lernzielen, wähle dann ein Modul.",
    ],
  },
  kuendigung: {
    title: "Kündigung",
    bullets: [
      "Ordentlich: mit Frist (§ 622 BGB)",
      "Außerordentlich: fristlos bei wichtigem Grund (§ 626 BGB)",
      "Betriebsrat ggf. anhören; Schriftform beachten.",
    ],
  },
  fristen: {
    title: "Fristen-Rechner",
    bullets: [
      "AN: 4 Wochen zum 15. oder Monatsende.",
      "AG: Staffel nach Betriebszugehörigkeit.",
      "Zugang ist entscheidend für Fristbeginn.",
    ],
  },
  sozialauswahl: {
    title: "Sozialauswahl",
    bullets: [
      "Dauer, Alter, Unterhalt, Schwerbehinderung.",
      "Nur bei betriebsbedingter Kündigung.",
      "Abwägung dokumentieren.",
    ],
  },
  fuehrung: {
    title: "Führungsstile & MbX",
    bullets: [
      "Stil = Grundhaltung; MbX = Technik.",
      "Kombination analysiert Situationen sauber.",
    ],
  },
  zeugnis: {
    title: "Arbeitszeugnisse",
    bullets: [
      "Wohlwollend, aber wahr.",
      "Formel-Sprache → Note.",
      "Gesamteindruck zählt, nicht nur eine Phrase.",
    ],
  },
  vertrag: {
    title: "Arbeitsvertrag",
    bullets: [
      "Mindestinhalte nach NachweisG.",
      "Probezeit, Arbeitszeit, Vergütung klar regeln.",
      "Muster hier nur zu Lernzwecken.",
    ],
  },
  ak: {
    title: "Anschaffungskosten",
    bullets: [
      "AK = Netto + notwendige Neben-/Bezugskosten.",
      "Vorsteuer ist abzugsfähig, nicht Teil der AK.",
    ],
  },
  bilanz: {
    title: "Bilanztrainer",
    bullets: [
      "Summe Aktiva = Summe Passiva.",
      "Gliederung nach HGB.",
    ],
  },
  kann: {
    title: "Kann-Liste",
    bullets: [
      "Markiere erledigte Lernziele.",
      "Identifiziere Lücken und wiederhole gezielt.",
    ],
  },
};

function ContextPanel({tab}){
  const c = CONTEXT[tab] || CONTEXT.dashboard;
  return (
    <Card className="sticky top-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm text-neutral-500">Kontext</div>
          <div className="text-lg font-semibold mt-1">{c.title}</div>
        </div>
        <Info className="w-5 h-5 text-neutral-400"/>
      </div>
      <ul className="mt-3 text-sm list-disc pl-5 space-y-1">
        {c.bullets.map((b,i)=>(<li key={i}>{b}</li>))}
      </ul>
    </Card>
  );
}

// ---------- App ----------
export default function App(){
  const [tab, setTab] = useState("dashboard");
  const [dark, setDark] = useState(false);
  useEffect(()=>{ document.documentElement.classList.toggle("dark", dark); }, [dark]);

  const tabs = [
    {key:"dashboard", label:"Übersicht", icon:<Search className="w-4 h-4"/>},
    {key:"kuendigung", label:"Kündigung", icon:<ClipboardCheck className="w-4 h-4"/>},
    {key:"fristen", label:"Fristen-Rechner", icon:<CalendarClock className="w-4 h-4"/>},
    {key:"sozialauswahl", label:"Sozialauswahl", icon:<Scale className="w-4 h-4"/>},
    {key:"fuehrung", label:"Führungsstile & MbX", icon:<Users className="w-4 h-4"/>},
    {key:"zeugnis", label:"Arbeitszeugnisse", icon:<FileText className="w-4 h-4"/>},
    {key:"vertrag", label:"Arbeitsvertrag", icon:<FileSignature className="w-4 h-4"/>},
    {key:"ak", label:"Anschaffungskosten", icon:<Briefcase className="w-4 h-4"/>},
    {key:"bilanz", label:"Bilanztrainer", icon:<BookOpen className="w-4 h-4"/>},
    {key:"kann", label:"Kann-Liste", icon:<GraduationCap className="w-4 h-4"/>},
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-black dark:to-neutral-950 text-neutral-900 dark:text-neutral-100">
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.h1 layout className="text-xl md:text-2xl font-semibold">BWRW Lernseite</motion.h1>
          <div className="flex items-center gap-2 flex-wrap">
            {tabs.map(t=> (
              <Button key={t.key} onClick={()=>setTab(t.key)} variant={tab===t.key?"primary":"ghost"}>
                <span className="mr-1 hidden sm:inline">{t.icon}</span>{t.label}
              </Button>
            ))}
            <Button variant="subtle" aria-label="Theme" onClick={()=>setDark(v=>!v)}>
              {dark? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {tab==="dashboard" && (
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <div className="text-sm text-neutral-500">Start</div>
                <div className="mt-2">Wähle oben ein Modul. Trainiere HF 5 Personal und HF 7 Wertströme mit Rechnern, Quiz und Buildern.</div>
              </Card>
              <Card>
                <div className="font-medium">Schnellzugriff</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tabs.filter(t=>t.key!=="dashboard").slice(0,6).map(t=> (
                    <Button key={t.key} onClick={()=>setTab(t.key)} variant="subtle">{t.label}</Button>
                  ))}
                </div>
              </Card>
              <Card>
                <div className="font-medium">Lernziele</div>
                <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
                  <li>Kündigungsarten und Fristen sicher anwenden</li>
                  <li>Tarif- und Betriebsvereinbarungen einordnen</li>
                  <li>Führungsstile und MbX unterscheiden</li>
                  <li>Arbeitszeugnisse lesen</li>
                  <li>Arbeitsvertrag-Muster erstellen</li>
                  <li>AK nach §255 HGB berechnen</li>
                  <li>Bilanzsummen prüfen</li>
                </ul>
              </Card>
            </div>
          )}
          {tab==="kuendigung" && (<>
            <Card>
              <div className="font-medium">Ordentliche vs. außerordentliche Kündigung</div>
              <div className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">Ordentlich = mit Frist. Außerordentlich = fristlos aus wichtigem Grund. Schriftform und Zugang sind prüfungsrelevant.</div>
            </Card>
            <QuizKuendigung />
          </>)}
          {tab==="fristen" && <FristenRechner />}
          {tab==="sozialauswahl" && <SozialauswahlTool />}
          {tab==="fuehrung" && (
            <div className="space-y-4">
              <Card>
                <div className="grid md:grid-cols-3 gap-4">
                  {fuehrungsstile.map(s=> (
                    <div key={s.name}>
                      <div className="font-medium">{s.name}</div>
                      <ul className="mt-2 list-disc pl-5 text-sm space-y-1">{s.merkmale.map(m=> <li key={m}>{m}</li>)}</ul>
                    </div>
                  ))}
                </div>
              </Card>
              <MbX/>
            </div>
          )}
          {tab==="zeugnis" && <ZeugnisDecoder />}
          {tab==="vertrag" && <ArbeitsvertragBuilder />}
          {tab==="ak" && <AnschaffungskostenTool />}
          {tab==="bilanz" && <BilanzTrainer />}
          {tab==="kann" && <SelfCheck />}
        </div>

        <aside className="lg:col-span-1">
          <ContextPanel tab={tab}/>
        </aside>
      </main>

      <footer className="max-w-7xl mx-auto px-6 pb-8 text-xs text-neutral-500 flex items-center justify-between">
        <div>Nur zu Lernzwecken. Keine Rechtsberatung.</div>
        <div>v2 • CSS verbessert • Kontextleiste • Dark Mode</div>
      </footer>
    </div>
  );
}
