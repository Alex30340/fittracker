
// Score color utility
export const scoreColor = (s: number | null): string => {
  if (s == null) return "#64748b";
  if (s >= 9) return "#22c55e"; if (s >= 7) return "#3b82f6"; if (s >= 5) return "#f59e0b"; return "#ef4444";
};

export const typeStyles: Record<string,{bg:string;color:string;label:string}> = {
  native:{bg:"rgba(52,211,153,0.12)",color:"#34d399",label:"Native"},
  isolate:{bg:"rgba(96,165,250,0.12)",color:"#60a5fa",label:"Isolate"},
  hydrolysate:{bg:"rgba(167,139,250,0.12)",color:"#a78bfa",label:"Hydrolysate"},
  concentrate:{bg:"rgba(148,163,184,0.12)",color:"#94a3b8",label:"Concentrate"},
  monohydrate:{bg:"rgba(250,204,21,0.12)",color:"#facc15",label:"Monohydrate"},
  hcl:{bg:"rgba(251,146,60,0.12)",color:"#fb923c",label:"HCL"},
};

export const levelLabels = ["","Débutant","Intermédiaire","Avancé","Expert","Elite"];
export const levelColors = ["","#22c55e","#3b82f6","#f59e0b","#ef4444","#a855f7"];

export const SUPPLEMENT_CATEGORIES = [
  { id:"whey", label:"Whey Protéine", icon:"🥛", desc:"Comparateur indépendant" },
  { id:"creatine", label:"Créatine", icon:"⚡", desc:"Monohydrate, HCL..." },
  { id:"preworkout", label:"Pré-Workout", icon:"🔥", desc:"Boosteurs" },
];

// ── PROGRAMS ──
export interface Exercise { name:string; sets:number; reps:string; muscle:string; rest:string; notes?:string; }
export interface WorkoutDay { day:number; name:string; focus:string; exercises:Exercise[]; }
export interface Program { id:number; name:string; level:number; days:number; type:string; duration:string; desc:string; equipment:string; goal:string; schedule:WorkoutDay[]; }

export const PROGRAMS: Program[] = [
  { id:1, name:"Full Body Débutant", level:1, days:3, type:"full_body", duration:"45 min", desc:"Programme complet pour débuter. 3 séances/semaine ciblant tous les groupes musculaires.", equipment:"full gym", goal:"Prise de masse",
    schedule:[
      { day:1, name:"Séance A", focus:"Full Body - Poussée", exercises:[
        { name:"Squat goblet", sets:3, reps:"12", muscle:"Quadriceps", rest:"90s", notes:"Dos droit, descendre parallèle" },
        { name:"Développé couché haltères", sets:3, reps:"10", muscle:"Pectoraux", rest:"90s" },
        { name:"Rowing haltère 1 bras", sets:3, reps:"10/côté", muscle:"Dos", rest:"60s" },
        { name:"Presse militaire haltères", sets:3, reps:"10", muscle:"Épaules", rest:"60s" },
        { name:"Curl biceps", sets:2, reps:"12", muscle:"Biceps", rest:"60s" },
        { name:"Crunch", sets:3, reps:"15", muscle:"Abdominaux", rest:"45s" },
      ]},
      { day:2, name:"Séance B", focus:"Full Body - Tirage", exercises:[
        { name:"Soulevé de terre roumain", sets:3, reps:"10", muscle:"Ischio-jambiers", rest:"90s" },
        { name:"Tirage poitrine poulie", sets:3, reps:"10", muscle:"Dos", rest:"90s" },
        { name:"Développé incliné haltères", sets:3, reps:"10", muscle:"Pectoraux haut", rest:"90s" },
        { name:"Élévations latérales", sets:3, reps:"15", muscle:"Deltoïdes", rest:"60s" },
        { name:"Extensions triceps poulie", sets:2, reps:"12", muscle:"Triceps", rest:"60s" },
        { name:"Planche", sets:3, reps:"30s", muscle:"Core", rest:"45s" },
      ]},
      { day:3, name:"Séance C", focus:"Full Body - Composé", exercises:[
        { name:"Presse à cuisses", sets:3, reps:"12", muscle:"Quadriceps", rest:"90s" },
        { name:"Pompes", sets:3, reps:"Max", muscle:"Pectoraux", rest:"90s" },
        { name:"Rowing barre", sets:3, reps:"10", muscle:"Dos", rest:"90s" },
        { name:"Fentes marchées", sets:3, reps:"10/jambe", muscle:"Quadriceps/Fessiers", rest:"60s" },
        { name:"Curl marteau", sets:2, reps:"12", muscle:"Biceps", rest:"60s" },
        { name:"Relevés de jambes", sets:3, reps:"12", muscle:"Abdominaux", rest:"45s" },
      ]},
    ]
  },
  { id:2, name:"Push Pull Legs", level:3, days:4, type:"ppl", duration:"60 min", desc:"Split PPL pour intermédiaires-avancés. Progression linéaire sur les composés.", equipment:"full gym", goal:"Hypertrophie",
    schedule:[
      { day:1, name:"Push", focus:"Pecs/Épaules/Triceps", exercises:[
        { name:"Développé couché barre", sets:4, reps:"6-8", muscle:"Pectoraux", rest:"120s", notes:"+2.5kg/semaine" },
        { name:"Développé incliné haltères", sets:3, reps:"8-10", muscle:"Pectoraux haut", rest:"90s" },
        { name:"Dips lestés", sets:3, reps:"8-12", muscle:"Triceps/Pecs", rest:"90s" },
        { name:"Élévations latérales", sets:4, reps:"12-15", muscle:"Deltoïdes", rest:"60s" },
        { name:"Extensions triceps overhead", sets:3, reps:"10-12", muscle:"Triceps", rest:"60s" },
        { name:"Face pull", sets:3, reps:"15", muscle:"Deltoïdes post.", rest:"60s" },
      ]},
      { day:2, name:"Pull", focus:"Dos/Biceps", exercises:[
        { name:"Tractions lestées", sets:4, reps:"6-8", muscle:"Grand dorsal", rest:"120s" },
        { name:"Rowing barre", sets:4, reps:"8-10", muscle:"Dos épaisseur", rest:"90s" },
        { name:"Tirage prise serrée", sets:3, reps:"10-12", muscle:"Dos largeur", rest:"90s" },
        { name:"Curl barre EZ", sets:3, reps:"10", muscle:"Biceps", rest:"60s" },
        { name:"Curl marteau", sets:3, reps:"12", muscle:"Brachial", rest:"60s" },
        { name:"Shrugs haltères", sets:3, reps:"12", muscle:"Trapèzes", rest:"60s" },
      ]},
      { day:3, name:"Legs", focus:"Quadriceps/Ischio/Mollets", exercises:[
        { name:"Squat barre", sets:4, reps:"6-8", muscle:"Quadriceps", rest:"180s" },
        { name:"Presse à cuisses", sets:4, reps:"10-12", muscle:"Quadriceps", rest:"90s" },
        { name:"Leg curl allongé", sets:4, reps:"10-12", muscle:"Ischio-jambiers", rest:"60s" },
        { name:"Fentes bulgares", sets:3, reps:"10/jambe", muscle:"Quadriceps/Fessiers", rest:"90s" },
        { name:"Mollets debout", sets:4, reps:"15", muscle:"Mollets", rest:"45s" },
        { name:"Leg extension", sets:3, reps:"12-15", muscle:"Quadriceps", rest:"60s" },
      ]},
      { day:4, name:"Upper", focus:"Haut du corps - Volume", exercises:[
        { name:"Développé militaire", sets:4, reps:"8", muscle:"Épaules", rest:"120s" },
        { name:"Rowing haltère", sets:3, reps:"10/côté", muscle:"Dos", rest:"90s" },
        { name:"Écartés poulie", sets:3, reps:"12", muscle:"Pectoraux", rest:"60s" },
        { name:"Tirage corde face", sets:3, reps:"15", muscle:"Deltoïdes post.", rest:"60s" },
        { name:"Superset curl/extensions", sets:3, reps:"12", muscle:"Bras", rest:"60s" },
      ]},
    ]
  },
  { id:3, name:"Upper Lower 4j", level:2, days:4, type:"upper_lower", duration:"55 min", desc:"Split haut/bas. Idéal intermédiaires, bon équilibre volume/récupération.", equipment:"full gym", goal:"Prise de masse",
    schedule:[
      { day:1, name:"Upper Force", focus:"Haut - Charges lourdes", exercises:[
        { name:"Développé couché barre", sets:4, reps:"5", muscle:"Pectoraux", rest:"180s", notes:"RPE 8-9" },
        { name:"Tractions prise large", sets:4, reps:"6-8", muscle:"Dos", rest:"120s" },
        { name:"Développé militaire", sets:3, reps:"6-8", muscle:"Épaules", rest:"120s" },
        { name:"Rowing barre", sets:3, reps:"8", muscle:"Dos", rest:"90s" },
        { name:"Curl + Extensions", sets:3, reps:"10", muscle:"Bras", rest:"60s" },
      ]},
      { day:2, name:"Lower Force", focus:"Jambes - Charges lourdes", exercises:[
        { name:"Squat barre", sets:4, reps:"5", muscle:"Quadriceps", rest:"180s" },
        { name:"Soulevé de terre roumain", sets:3, reps:"8", muscle:"Ischio-jambiers", rest:"120s" },
        { name:"Presse à cuisses", sets:3, reps:"10", muscle:"Quadriceps", rest:"90s" },
        { name:"Leg curl", sets:3, reps:"10", muscle:"Ischio-jambiers", rest:"60s" },
        { name:"Mollets assis", sets:4, reps:"12", muscle:"Mollets", rest:"45s" },
      ]},
      { day:3, name:"Upper Volume", focus:"Haut - Volume", exercises:[
        { name:"Développé incliné haltères", sets:4, reps:"10", muscle:"Pectoraux haut", rest:"90s" },
        { name:"Tirage poitrine", sets:4, reps:"10", muscle:"Dos", rest:"90s" },
        { name:"Élévations latérales", sets:4, reps:"15", muscle:"Deltoïdes", rest:"60s" },
        { name:"Écartés poulie", sets:3, reps:"12", muscle:"Pectoraux", rest:"60s" },
        { name:"Curl incliné + Kickback", sets:3, reps:"12", muscle:"Bras", rest:"60s" },
      ]},
      { day:4, name:"Lower Volume", focus:"Jambes - Volume", exercises:[
        { name:"Squat bulgare", sets:4, reps:"10/jambe", muscle:"Quadriceps/Fessiers", rest:"90s" },
        { name:"Leg press pieds hauts", sets:4, reps:"12", muscle:"Fessiers/Ischios", rest:"90s" },
        { name:"Leg extension", sets:3, reps:"15", muscle:"Quadriceps", rest:"60s" },
        { name:"Hip thrust", sets:3, reps:"12", muscle:"Fessiers", rest:"90s" },
        { name:"Mollets debout", sets:4, reps:"15", muscle:"Mollets", rest:"45s" },
      ]},
    ]
  },
  { id:4, name:"Home Gym Minimaliste", level:2, days:3, type:"home", duration:"40 min", desc:"Programme complet haltères + barre de traction. Parfait pour le home gym.", equipment:"home gym", goal:"Recomposition",
    schedule:[
      { day:1, name:"Full Upper", focus:"Haut du corps", exercises:[
        { name:"Pompes variantes", sets:4, reps:"12-15", muscle:"Pectoraux", rest:"60s", notes:"Incliné, décliné, diamant" },
        { name:"Tractions", sets:4, reps:"Max", muscle:"Dos", rest:"90s" },
        { name:"Développé haltères assis", sets:3, reps:"10", muscle:"Épaules", rest:"60s" },
        { name:"Rowing haltère 1 bras", sets:3, reps:"10/côté", muscle:"Dos", rest:"60s" },
        { name:"Curl + Extensions haltères", sets:3, reps:"12", muscle:"Bras", rest:"60s" },
      ]},
      { day:2, name:"Full Lower", focus:"Jambes complètes", exercises:[
        { name:"Squat goblet", sets:4, reps:"12", muscle:"Quadriceps", rest:"90s" },
        { name:"Soulevé de terre haltères", sets:4, reps:"10", muscle:"Ischio-jambiers", rest:"90s" },
        { name:"Fentes haltères", sets:3, reps:"10/jambe", muscle:"Quadriceps/Fessiers", rest:"60s" },
        { name:"Hip thrust 1 jambe", sets:3, reps:"12/jambe", muscle:"Fessiers", rest:"60s" },
        { name:"Mollets debout haltère", sets:4, reps:"15", muscle:"Mollets", rest:"45s" },
      ]},
      { day:3, name:"Full Body", focus:"Corps complet", exercises:[
        { name:"Thruster haltères", sets:4, reps:"10", muscle:"Full body", rest:"90s" },
        { name:"Tractions supination", sets:3, reps:"Max", muscle:"Dos/Biceps", rest:"90s" },
        { name:"Squat sumo haltère", sets:3, reps:"12", muscle:"Quadriceps", rest:"60s" },
        { name:"Floor press haltères", sets:3, reps:"10", muscle:"Pectoraux", rest:"60s" },
        { name:"Planche + Mountain climbers", sets:3, reps:"30s + 15", muscle:"Core", rest:"45s" },
      ]},
    ]
  },
];

// ── MEAL PLANS ──
export interface Meal { name:string; cal:number; prot:number; carbs:number; fat:number; items:string; prep:string; }
export interface DayPlan { name:string; meals:Meal[]; }

export const MEAL_PLANS: Record<string, DayPlan[]> = {
  "Prise de masse": [
    { name:"Jour 1", meals:[
      { name:"Porridge protéiné", cal:520, prot:38, carbs:62, fat:12, items:"80g flocons d'avoine, 30g whey vanille, 1 banane, 15g beurre de cacahuète, 250ml lait", prep:"5 min" },
      { name:"Collation matin", cal:280, prot:22, carbs:30, fat:8, items:"200g fromage blanc 0%, 30g granola, 10g miel, myrtilles", prep:"2 min" },
      { name:"Bowl poulet quinoa", cal:680, prot:52, carbs:65, fat:18, items:"180g poulet grillé, 80g quinoa, 100g brocoli, 50g avocat, huile d'olive", prep:"25 min" },
      { name:"Shake post-training", cal:380, prot:35, carbs:42, fat:6, items:"40g whey chocolat, 1 banane, 40g flocons, 300ml lait d'amande, 5g créatine", prep:"3 min" },
      { name:"Saumon riz complet", cal:720, prot:48, carbs:68, fat:22, items:"200g saumon, 90g riz complet, 150g haricots verts, sauce soja", prep:"30 min" },
      { name:"Collation soir", cal:220, prot:25, carbs:8, fat:10, items:"150g skyr, 20g amandes, cannelle", prep:"2 min" },
    ]},
    { name:"Jour 2", meals:[
      { name:"Oeufs brouillés complet", cal:480, prot:32, carbs:38, fat:20, items:"4 oeufs, 2 tranches pain complet, 50g avocat, tomate", prep:"10 min" },
      { name:"Banana bread protéiné", cal:320, prot:24, carbs:38, fat:8, items:"1 tranche banana bread protéiné, 10g beurre cacahuète", prep:"2 min" },
      { name:"Wrap dinde avocat", cal:620, prot:45, carbs:52, fat:22, items:"2 wraps complets, 150g blanc de dinde, avocat, laitue, moutarde", prep:"10 min" },
      { name:"Shake banane PB", cal:420, prot:35, carbs:45, fat:12, items:"40g whey vanille, 1 banane, 20g beurre cacahuète, 300ml lait, créatine", prep:"3 min" },
      { name:"Steak patate douce", cal:680, prot:45, carbs:62, fat:22, items:"200g steak haché 5%, 250g patate douce, courgettes grillées", prep:"25 min" },
      { name:"Fromage blanc fruits", cal:200, prot:22, carbs:18, fat:4, items:"200g fromage blanc 0%, fruits rouges, miel", prep:"2 min" },
    ]},
  ],
  "Sèche": [
    { name:"Jour 1", meals:[
      { name:"Omelette blanche légumes", cal:320, prot:32, carbs:12, fat:16, items:"5 blancs d'oeufs, 1 oeuf entier, épinards, champignons, 1 tranche pain", prep:"10 min" },
      { name:"Salade poulet grillé", cal:480, prot:45, carbs:22, fat:22, items:"200g poulet grillé, mesclun, concombre, tomates, 50g avocat", prep:"15 min" },
      { name:"Shake léger", cal:220, prot:30, carbs:15, fat:4, items:"35g whey isolate, 200ml lait d'amande, cannelle", prep:"2 min" },
      { name:"Cabillaud riz basmati", cal:450, prot:42, carbs:45, fat:8, items:"200g cabillaud, 70g riz basmati, 200g haricots verts, citron", prep:"20 min" },
      { name:"Skyr protéiné", cal:180, prot:25, carbs:10, fat:2, items:"200g skyr 0%, amandes effilées, framboises", prep:"2 min" },
    ]},
  ],
  "Recomposition": [
    { name:"Jour 1", meals:[
      { name:"Smoothie protéiné", cal:420, prot:35, carbs:45, fat:10, items:"35g whey, 1 banane, 80g flocons, 200ml lait, beurre cacahuète", prep:"3 min" },
      { name:"Poulet riz légumes", cal:580, prot:48, carbs:55, fat:14, items:"180g poulet, 80g riz basmati, brocoli, carottes, sauce soja", prep:"25 min" },
      { name:"Collation", cal:250, prot:20, carbs:22, fat:8, items:"200g fromage blanc, 20g granola, fruits", prep:"2 min" },
      { name:"Saumon quinoa", cal:560, prot:42, carbs:48, fat:18, items:"180g saumon, 80g quinoa, épinards, citron", prep:"25 min" },
      { name:"Collation soir", cal:190, prot:20, carbs:10, fat:8, items:"150g skyr, 10g amandes", prep:"2 min" },
    ]},
  ],
};

// ── PROGRESSION ──
export const PROGRESS_DATA = [
  { week:"S1", bench:60, squat:80, deadlift:100, ohp:40, row:55, weight:78.5 },
  { week:"S2", bench:62.5, squat:82.5, deadlift:105, ohp:40, row:57.5, weight:78.2 },
  { week:"S3", bench:62.5, squat:85, deadlift:107.5, ohp:42.5, row:57.5, weight:78.0 },
  { week:"S4", bench:65, squat:87.5, deadlift:110, ohp:42.5, row:60, weight:77.8 },
  { week:"S5", bench:67.5, squat:90, deadlift:112.5, ohp:45, row:60, weight:77.5 },
  { week:"S6", bench:67.5, squat:90, deadlift:115, ohp:45, row:62.5, weight:77.3 },
  { week:"S7", bench:70, squat:92.5, deadlift:117.5, ohp:47.5, row:62.5, weight:77.1 },
  { week:"S8", bench:72.5, squat:95, deadlift:120, ohp:47.5, row:65, weight:76.8 },
  { week:"S9", bench:72.5, squat:97.5, deadlift:122.5, ohp:50, row:65, weight:76.6 },
  { week:"S10", bench:75, squat:100, deadlift:125, ohp:50, row:67.5, weight:76.4 },
  { week:"S11", bench:77.5, squat:100, deadlift:127.5, ohp:52.5, row:67.5, weight:76.2 },
  { week:"S12", bench:80, squat:102.5, deadlift:130, ohp:52.5, row:70, weight:76.0 },
];

export const DEFAULT_PROFILE = { age:28, weight:77, height:178, sex:"Homme" as const, level:2, days:4, equipment:"full gym", goal:"Prise de masse", calories:2600, protTarget:180, carbTarget:300, fatTarget:75, bmr:1820, tdee:2600 };
