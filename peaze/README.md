# PEAZE — Website

Statische Website für **PEAZE**, die 90s-inspirierte Padel-Kollektion
(Tracksuit, Shorts, Tanktop, Padelbälle) in sechs Farben.

Gestaltet im Stil von [noneofus.de](https://www.noneofus.de): cremefarbener
Grund, fast schwarze Typo, durchgehend Versalien, Laufband oben,
Full-Bleed-Hero mit transparentem Header, randlose Kategorie-Kacheln,
zentrierter Markentext, Newsletter, Support-Leiste, Footer-Links.

## Starten

Keine Build-Schritte, keine Abhängigkeiten. `index.html` im Browser öffnen
oder den Ordner über GitHub Pages / beliebigen Webspace ausliefern.

```
peaze/
├── index.html            Inhalt + SVG-Sprite (Logo & Produkt-Zeichnungen)
├── styles.css            Gestaltung (Farben als Variablen in :root)
├── app.js                Farbwähler, Warenkorb, Drawers, Reveal
└── assets/spec-sheet.jpg Technisches Datenblatt PZ-001
```

## Was drin ist

- **Farbwähler** — eine Farbe wählen und die *gesamte* Kollektion wechselt
  mit (Hero, Kacheln, Produktbilder, Warenkorb-Thumbnails). Die Auswahl wird
  im Browser gemerkt.
- **Warenkorb** — Grösse und Farbe pro Position, Mengen ändern, Zwischensumme,
  bleibt über Seitenaufrufe erhalten (`localStorage`).
- **Menü- und Warenkorb-Drawer** — auf dem Handy per Wischgeste schliessbar,
  dazu Escape, Klick daneben und Schliessen-Button.
- **Produktzeichnungen** — als SVG gezeichnet, nicht fotografiert: beliebig
  skalierbar und über CSS-Variablen einfärbbar.

## Farben ändern

Alle Farbwelten stehen oben in `styles.css`:

```css
[data-colorway="tuerkis"]{--g:#01788e;--gd:#015c6b;--gp:#ececed;--gm:#c6c6ce;--gl:#fff;--accent:#01788e}
```

| Variable | Bedeutung |
|---|---|
| `--g`  | Hauptfarbe des Kleidungsstücks |
| `--gd` | Bündchen, Kragen, Bund (dunkler) |
| `--gp` | Kontrastpanel (weiss) |
| `--gm` | zweites Panel (grau) |
| `--gl` | Logo auf dem Kleidungsstück |

Eine neue Farbe braucht denselben Block in `styles.css`, einen Eintrag in
`WAYS` in `app.js` und einen `.sw`-Button in `index.html`.

## Produkte und Preise ändern

Alles in einem Array oben in `app.js` (`PRODUCTS`), Preise in Cent:

```js
{ id:'shorts', art:'g-shorts', vb:'0 0 300 250',
  name:'PEAZE Sport Shorts', sub:'Mit Seitentaschen · leicht',
  price:4900, sizes:CLOTHING }
```

## Noch nicht angebunden

Die Seite ist ein Schaufenster ohne Backend. Folgendes zeigt nur eine
Rückmeldung an und sendet nichts:

- **Checkout** — braucht einen Shop (Shopify, Stripe Checkout o. ä.)
- **Newsletter** — braucht einen Anbieter (Klaviyo, Mailchimp o. ä.)
- **Social-Links und Footer-Links** zeigen noch auf Platzhalter (`#`)
- **Suche** springt derzeit nur zur Produktübersicht

## Hinweise

- Schriften: Michroma (Display) und Jost (Fliesstext) über Google Fonts.
- Michroma hat kein brauchbares Euro-Zeichen; das `€` wird deshalb in
  `<i class="eur">` gesetzt und in der Fliesstext-Schrift gerendert.
- Die Produkt-SVGs liegen als `<symbol>` im Sprite und werden per `<use>`
  eingebunden. Innerhalb eines `<symbol>` braucht jedes `<use>` ein
  explizites `width`/`height`, sonst erbt es die Grösse des äusseren SVG.
  Eingefärbt wird über `fill="var(--g)"` direkt am Pfad — CSS-Klassen
  greifen nicht in den Shadow Tree von `<use>`.
