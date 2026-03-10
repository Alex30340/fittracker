"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getProducts, getCategories, toggleFavorite, getProduct, getProductComments, addProductComment } from "@/lib/api";

export default function CataloguePage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("score_final");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts({ search, sort_by: sortBy, category: category || undefined });
      setProducts(data);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { getCategories().then(setCategories).catch(() => {}); }, []);
  useEffect(() => { fetchProducts(); }, [search, sortBy, category]);

  const openProduct = async (id: number) => {
    try {
      const [prod, cmts] = await Promise.all([getProduct(id), getProductComments(id)]);
      setSelected(prod);
      setComments(cmts);
    } catch (e) {}
  };

  const submitComment = async () => {
    if (!token || !selected || !newComment.trim()) return;
    try {
      const cmt = await addProductComment(selected.id, newComment, token);
      setComments([cmt, ...comments]);
      setNewComment("");
    } catch (e) {}
  };

  const handleFav = async (id: number) => {
    if (!token) return;
    await toggleFavorite(id, token);
  };

  if (selected) {
    return (
      <div>
        <button onClick={() => setSelected(null)} className="text-emerald-500 text-sm mb-4 hover:underline">← Retour au catalogue</button>
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-extrabold mb-1">{selected.name}</h2>
            <div className="text-emerald-500 font-semibold text-sm mb-4">{selected.brand}</div>
            <div className="flex gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-500">{selected.type_whey}</span>
              <span className="px-3 py-1 rounded-full text-xs bg-blue-500/10 text-blue-500">{selected.origin_label}</span>
            </div>

            {/* Scores */}
            <div className="space-y-3 mb-4">
              {[
                { label: "Score final", value: selected.score_final, color: "bg-emerald-500" },
                { label: "Protéines", value: selected.score_proteique, color: "bg-blue-500" },
                { label: "Santé", value: selected.score_sante, color: "bg-purple-500" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">{s.label}</span><span className="font-bold">{s.value || "—"}/10</span></div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${((s.value || 0) / 10) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Nutrition */}
            <h3 className="text-sm font-bold mb-2 mt-5">Nutrition (100g)</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { l: "Protéines", v: selected.proteines_100g, u: "g" },
                { l: "Calories", v: selected.kcal_per_100g, u: "kcal" },
                { l: "Glucides", v: selected.carbs_per_100g, u: "g" },
                { l: "Lipides", v: selected.fat_per_100g, u: "g" },
              ].map((n) => (
                <div key={n.l} className="flex justify-between py-1 border-b border-gray-800">
                  <span className="text-gray-500">{n.l}</span>
                  <span className="font-medium">{n.v != null ? `${n.v}${n.u}` : "—"}</span>
                </div>
              ))}
            </div>

            {/* Offers */}
            {selected.offers?.length > 0 && (
              <>
                <h3 className="text-sm font-bold mb-2 mt-5">Offres</h3>
                {selected.offers.map((o: any) => (
                  <div key={o.id} className="flex justify-between items-center py-2 border-b border-gray-800 text-sm">
                    <div>
                      <div className="font-medium">{o.merchant || "Marchand"}</div>
                      <div className="text-xs text-gray-500">{o.poids_kg ? `${o.poids_kg}kg` : ""} {o.disponibilite === "InStock" ? "✅ En stock" : "❌ Rupture"}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400">{o.prix}€</div>
                      {o.prix_par_kg && <div className="text-xs text-gray-500">{o.prix_par_kg.toFixed(2)}€/kg</div>}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Comments */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-bold mb-3">💬 Commentaires ({comments.length})</h3>
            {comments.map((c: any) => (
              <div key={c.id} className="py-3 border-b border-gray-800">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-[9px] text-white font-bold">{c.user_display_name[0]}</div>
                  <span className="text-xs font-semibold">{c.user_display_name}</span>
                  <span className="text-xs text-gray-600">{new Date(c.created_at).toLocaleDateString("fr-FR")}</span>
                </div>
                <p className="text-sm text-gray-400">{c.content}</p>
              </div>
            ))}
            {token && (
              <div className="mt-3">
                <textarea
                  value={newComment} onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ton commentaire..."
                  className="w-full p-3 rounded-lg bg-gray-950 border border-gray-800 text-sm outline-none focus:border-emerald-500 resize-none h-20"
                />
                <button onClick={submitComment} className="mt-2 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition">
                  Publier
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-2xl font-extrabold">Catalogue</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} produits</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Rechercher..."
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-800 text-sm outline-none focus:border-emerald-500"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-800 text-sm outline-none">
          <option value="">Toutes catégories</option>
          {categories.map((c: any) => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-800 text-sm outline-none">
          <option value="score_final">Meilleur score</option>
          <option value="protein">Protéines ↓</option>
          <option value="name">Nom A-Z</option>
          <option value="newest">Plus récents</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20"><div className="w-8 h-8 border-2 border-gray-700 border-t-emerald-500 rounded-full animate-spin mx-auto" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Aucun produit trouvé</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p: any) => (
            <div
              key={p.id}
              onClick={() => openProduct(p.id)}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:-translate-y-0.5 hover:border-emerald-500/30 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="text-sm text-gray-500">{p.category_name || p.type_whey}</div>
                <div className={`px-2 py-0.5 rounded-full text-sm font-extrabold ${
                  (p.score_final || 0) >= 8.5 ? "bg-emerald-500/15 text-emerald-400" :
                  (p.score_final || 0) >= 7 ? "bg-blue-500/15 text-blue-400" :
                  "bg-orange-500/15 text-orange-400"
                }`}>
                  {p.score_final || "—"}
                </div>
              </div>
              <h3 className="font-bold text-sm mb-0.5">{p.name}</h3>
              <div className="text-emerald-500 text-xs font-medium mb-3">{p.brand}</div>
              <div className="flex gap-1.5 mb-3">
                {p.proteines_100g && <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400">{p.proteines_100g}g prot</span>}
                {p.reviews_avg && <span className="px-2 py-0.5 rounded text-[10px] bg-orange-500/10 text-orange-400">★ {p.reviews_avg}</span>}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-extrabold">{p.best_price ? `${p.best_price}€` : "—"}</span>
                <span className={`text-xs ${p.is_available ? "text-emerald-400" : "text-red-400"}`}>
                  {p.is_available ? "● Stock" : "● Rupture"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
