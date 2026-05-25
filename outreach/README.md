# Outreach Dashboard — `/outreach/`

Read-only mirror of the outreach engine running on Romain's machine.

## Pages

| URL | Contenu |
|---|---|
| `outreach/index.html` | Overview cross-program (KPIs totaux + lien vers les 3 sous-pages) |
| `outreach/elms.html` | Pipeline ELMS 2026 (Ferrari GT3 / Kessel Racing) |
| `outreach/spa.html` | Pipeline 24h Spa 2026 (Aston Vantage / Ecurie Ecosse Blackthorn) |
| `outreach/stratos.html` | Stratos Académie B2B — placeholder, pas encore activé |

## Anonymisation

Aucun email, téléphone, URL LinkedIn ou nom de personne n'est exporté vers ce repo. Le dashboard montre uniquement :
- nom de société
- rôle / titre
- statut + tier
- géo
- flags `has_email` / `has_linkedin` / `has_phone` (boolean seulement)
- dates d'envoi / réponse
- KPI agrégés

Les adresses réelles ne quittent jamais la DB SQLite locale (`Desktop\code\outreach-engine\data\outreach.db`).

## Refresh

Depuis la machine locale :

```bash
cd Desktop/code/outreach-engine
python scripts/15_export_github_pages.py
cd ../pipelines
git add outreach/ && git commit -m "refresh outreach dashboard" && git push
```

Les 4 JSONs (`overview.json`, `elms.json`, `spa.json`, `stratos.json`) sont régénérés depuis SQLite à chaque run.

## Verrous séparation ELMS ↔ Spa

Bullet-proof côté engine (pas côté dashboard) :

1. **Programme immuable** — Chaque prospect a `program TEXT NOT NULL` à la création. Trigger SQLite bloque tout `UPDATE` qui change ce champ.
2. **Programme par campagne** — Idem côté `campaigns`. Trigger d'immutabilité.
3. **Program-match guard SMTP** — `prospect.program == campaign.program` re-vérifié au moment du send, refus si mismatch + log événement.
4. **Cross-program email lock** — Avant chaque send, on vérifie que la même adresse n'est pas active dans un autre program. Si oui → send bloqué.
5. **48h spacing same-domain** — Si un autre program a touché le même domaine recipient dans les dernières 48h, le send est différé.
6. **Per-program footer** — Chaque mail signe avec un footer distinct (ELMS / Spa / Stratos). Audit visible.

## Distinction avec `/pipelines/spa.html` et `/pipelines/index.html`

À ne pas confondre :

- **`/pipelines/index.html`** + **`/pipelines/spa.html`** sont les pipelines stratégiques manuels (intel, hooks, decks).
- **`/pipelines/outreach/*`** est le dashboard temps-réel de l'engine d'envoi (sends/replies/calendar).

Les deux ne se croisent pas. Le dashboard outreach montre l'état opérationnel des envois, pas la stratégie cible.
