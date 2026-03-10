-- FitTracker - Seed Data
-- Exécuté automatiquement au premier lancement de PostgreSQL

-- Catégories de produits
INSERT INTO product_categories (slug, name, description, scoring_weights, icon, sort_order) VALUES
    ('whey', 'Whey Protéine', 'Protéines de lactosérum', '{"protein": 0.50, "health": 0.35, "price": 0.15}', '🥛', 1),
    ('creatine', 'Créatine', 'Monohydrate, HCL, Buffered', '{"purity": 0.40, "dosage": 0.30, "price": 0.20, "transparency": 0.10}', '💎', 2),
    ('bcaa', 'BCAA / EAA', 'Acides aminés', '{"ratio": 0.35, "dosage": 0.30, "health": 0.20, "price": 0.15}', '⚡', 3),
    ('pre_workout', 'Pré-Workout', 'Boosters', '{"efficacy": 0.40, "health": 0.30, "dosage": 0.15, "price": 0.15}', '🔥', 4),
    ('bars', 'Barres Protéinées', 'Snacks protéinés', '{"protein_ratio": 0.35, "health": 0.30, "taste": 0.15, "price": 0.20}', '🍫', 5)
ON CONFLICT (slug) DO NOTHING;

-- Exercices de base
INSERT INTO exercises (name, name_en, muscle_primary, muscle_secondary, equipment, movement_type, difficulty, met_value) VALUES
    ('Développé couché', 'Bench Press', 'chest', '["triceps","shoulders"]', 'barbell', 'compound', 2, 6.0),
    ('Développé incliné', 'Incline Press', 'chest', '["triceps","shoulders"]', 'barbell', 'compound', 2, 5.5),
    ('Écarté haltères', 'Dumbbell Fly', 'chest', '[]', 'dumbbell', 'isolation', 2, 3.5),
    ('Pompes', 'Push-ups', 'chest', '["triceps","shoulders"]', 'bodyweight', 'compound', 1, 4.0),
    ('Dips', 'Dips', 'chest', '["triceps"]', 'bodyweight', 'compound', 3, 5.0),
    ('Soulevé de terre', 'Deadlift', 'back', '["hamstrings","glutes"]', 'barbell', 'compound', 3, 8.5),
    ('Tractions', 'Pull-ups', 'back', '["biceps"]', 'bodyweight', 'compound', 3, 5.5),
    ('Rowing barre', 'Barbell Row', 'back', '["biceps"]', 'barbell', 'compound', 2, 6.5),
    ('Rowing haltère', 'Dumbbell Row', 'back', '["biceps"]', 'dumbbell', 'compound', 2, 5.0),
    ('Tirage vertical', 'Lat Pulldown', 'back', '["biceps"]', 'cable', 'compound', 1, 4.5),
    ('Développé militaire', 'Overhead Press', 'shoulders', '["triceps"]', 'barbell', 'compound', 2, 5.0),
    ('Élévations latérales', 'Lateral Raises', 'shoulders', '[]', 'dumbbell', 'isolation', 1, 3.0),
    ('Face pull', 'Face Pull', 'shoulders', '["back"]', 'cable', 'isolation', 1, 3.0),
    ('Curl biceps barre', 'Barbell Curl', 'biceps', '["forearms"]', 'barbell', 'isolation', 1, 4.0),
    ('Curl haltères', 'Dumbbell Curl', 'biceps', '[]', 'dumbbell', 'isolation', 1, 3.5),
    ('Curl marteau', 'Hammer Curl', 'biceps', '["forearms"]', 'dumbbell', 'isolation', 1, 3.5),
    ('Extensions triceps poulie', 'Tricep Pushdown', 'triceps', '[]', 'cable', 'isolation', 1, 3.5),
    ('Squat barre', 'Barbell Squat', 'quads', '["glutes","hamstrings"]', 'barbell', 'compound', 3, 8.0),
    ('Presse à cuisses', 'Leg Press', 'quads', '["glutes"]', 'machine', 'compound', 1, 6.0),
    ('Fentes marchées', 'Walking Lunges', 'quads', '["glutes"]', 'dumbbell', 'compound', 2, 7.0),
    ('Leg curl', 'Leg Curl', 'hamstrings', '[]', 'machine', 'isolation', 1, 3.5),
    ('Leg extension', 'Leg Extension', 'quads', '[]', 'machine', 'isolation', 1, 3.5),
    ('Hip thrust', 'Hip Thrust', 'glutes', '["hamstrings"]', 'barbell', 'compound', 2, 5.5),
    ('Mollets debout', 'Standing Calf Raise', 'calves', '[]', 'machine', 'isolation', 1, 3.0),
    ('Crunch', 'Crunch', 'abs', '[]', 'bodyweight', 'isolation', 1, 3.0),
    ('Planche', 'Plank', 'abs', '["shoulders"]', 'bodyweight', 'isolation', 1, 3.5),
    ('Relevé de jambes', 'Leg Raise', 'abs', '[]', 'bodyweight', 'isolation', 2, 4.0)
ON CONFLICT DO NOTHING;
