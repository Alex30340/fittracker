"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getDailyNutrition, logFood, getProfile } from "@/lib/api";

const FOOD_DB = [
  { n: "Flocons d'avoine", cal: 367, p: 13.5, g: 58, l: 7 },
  { n: "Poulet grillé", cal: 165, p: 31, g: 0, l: 3.6 },
  { n: "Riz complet cuit", cal: 123, p: 2.7, g: 25.6, l: 1 },
  { n: "Banane", cal: 89, p: 1.1, g: 22.8, l: 0.3 },
  { n: "Oeuf entier", cal: 155, p: 12.6, g: 1.1, l: 11.3 },
  { n: "Saumon", cal: 208, p: 20, g: 0, l: 13.4 },
  { n: "Brocolis", cal: 34, p: 2.8, g: 6.6, l: 0.4 },
  { n: "Patate douce", cal: 86, p: 1.6, g: 20.1, l: 0.1 },
  { n: "Fromage blanc 0%", cal: 49, p: 8, g: 3.5, l: 0.2 },
  { n: "Amandes", cal: 579, p: 21.2, g: 21.7, l: 49.9 },
  { n: "Whey Isolate (30g)", cal: 110, p: 27, g: 1, l: 0.5 },
  { n: "Beurre cacahuète", cal: 588, p: 25, g: 20, l: 50 },
  { n: "Avocat", cal: 160, p: 2, g: 8.5, l: 14.7 },
  { n: "Thon conserve", cal: 116, p: 25.5, g: 0, l: 1 },
  { n: "Pain complet", cal: 247, p: 8.5, g: 46, l: 3.5 },
];

export default function NutritionPage() {
  const { token } = useAuth();
  const [daily, setDaily] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [mealType, setMealType] = useState("breakfast");

  useEffect(() => {
    if (token) getDailyNutrition(token).then(setDaily).catch(() => {});
  }, [token]);

  const searchResults = search.length > 1 ? FOOD_DB.filter((f) => f.n.toLowerCase().includes(search.toLowerCase())) : [];

  const addFood = async (food: typeof FOOD_DB[0]) => {
    if (!token) return;
    const qty = parseInt(quantity) || 100;
    const mult = qty / 100;
    await logFood(token, {
      food_name: food.n,
      meal_type: mealType,
      quantity_g: qty,
      calories: Math.round(food.cal * mult),
      protein_g: Math.round(food.p * mult * 10) / 10,
      carbs_g: Math.round(food.g * mult * 10) / 10,
      fat_g: Math.round(food.l * mult * 10) / 10,
    });
    setSearch("");
    // Refresh
    getDailyNutrition(token).then(setDaily).catch(() => {});
  };

  const totals = daily?.totals || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
  const targets = daily?.targets || { calories: 2400, protein_g: 180, carbs_g: 280, fat_g: 75 };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold">🥗 Nutrition</h1>
        <p className="text-gray-500 text-sm mt-1">Journal alimentaire — {new Date().toLocaleDateString("fr-FR")}</p>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { l: "Calories", c: totals.calories, t: targets.calories, col: "text-orange-400 bg-orange-500", u: "kcal" },
          { l: "Protéines", c: totals.protein_g, t: targets.protein_g, col: "text-blue-400 bg-blue-500", u: "g" },
          { l: "Glucides", c: totals.carbs_g, t: targets.carbs_g, col: "text-emerald-400 bg-emerald-500", u: "g" },
          { l: "Lipides", c: totals.fat_g, t: targets.fat_g, col: "text-purple-400 bg-purple-500", u: "g" },
        ].map((m) => {
          const pct = m.t > 0 ? Math.min(Math.round((m.c / m.t) * 100), 100) : 0;
          const [tc, bc] = m.col.split(" ");
          return (
            <div key={m.l} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className={`text-2xl font-extrabold ${tc}`}>{Math.round(m.c)}<span className="text-xs font-normal text-gray-500">/{m.t}</span></div>
              <div className="h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden"><div className={`h-full rounded-full ${bc}`} style={{ width: `${pct}%` }} /></div>
              <div className="text-xs text-gray-500 mt-1.5">{m.l} — {pct}%</div>
            </div>
          );
        })}
      </div>

      {/* Add food */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-bold mb-3">Ajouter un aliment</h2>
        <div className="flex gap-3 mb-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Rechercher un aliment..." className="flex-1 px-4 py-2.5 rounded-lg bg-gray-950 border border-gray-800 text-sm outline-none focus:border-emerald-500" />
          <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="g" className="w-20 px-3 py-2.5 rounded-lg bg-gray-950 border border-gray-800 text-sm outline-none text-center" />
          <select value={mealType} onChange={(e) => setMealType(e.target.value)} className="px-3 py-2.5 rounded-lg bg-gray-950 border border-gray-800 text-sm outline-none">
            <option value="breakfast">Petit-déj</option>
            <option value="lunch">Déjeuner</option>
            <option value="snack_pm">Collation</option>
            <option value="dinner">Dîner</option>
          </select>
        </div>
        {searchResults.length > 0 && (
          <div className="bg-gray-950 border border-gray-800 rounded-lg max-h-48 overflow-auto">
            {searchResults.map((f, i) => (
              <div key={i} onClick={() => addFood(f)} className="flex justify-between px-4 py-2.5 cursor-pointer hover:bg-gray-900 transition border-b border-gray-800 last:border-0 text-sm">
                <span>{f.n}</span>
                <span className="text-gray-500">{f.cal}kcal · P{f.p}g · G{f.g}g · L{f.l}g /100g</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Meals logged */}
      {daily?.meals && Object.entries(daily.meals).map(([type, items]: [string, any]) => (
        <div key={type} className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-3">
          <h3 className="text-sm font-bold mb-2 capitalize">{type.replace("_", " ")}</h3>
          {items.map((item: any, i: number) => (
            <div key={i} className="flex justify-between text-sm py-1.5 border-b border-gray-800 last:border-0">
              <span>{item.food_name} <span className="text-gray-500">{item.quantity_g}g</span></span>
              <div className="flex gap-3 text-xs">
                <span className="text-orange-400">{item.calories}kcal</span>
                <span className="text-blue-400">P:{item.protein_g}g</span>
                <span className="text-emerald-400">G:{item.carbs_g}g</span>
                <span className="text-purple-400">L:{item.fat_g}g</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
