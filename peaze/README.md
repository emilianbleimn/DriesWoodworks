# PEAZE — Website

Statische Website für **PEAZE**, die 90s-inspirierte Padel-Kollektion
(Trainingsanzug, Shorts, Tanktop, Padelbälle) in acht Farben.

Gestaltet im Stil von [noneofus.de](https://www.noneofus.de): cremefarbener
Grund, fast schwarze Typo, durchgehend Versalien, Laufband oben,
Full-Bleed-Hero mit transparentem Header, randlose Kategorie-Kacheln,
zentrierter Markentext, Newsletter, Support-Leiste, Footer-Links.

## Starten

Keine Build-Schritte, keine Abhängigkeiten. `index.html` im Browser öffnen
oder den Ordner über GitHub Pages / beliebigen Webspace ausliefern.

```
peaze/
├── index.html              Inhalt + SVG-Sprite (Logo & Icons)
├── styles.css              Gestaltung (Farben als Variablen in :root)
├── app.js                  Farbwähler, Warenkorb, Drawers, Reveal
└── assets/
    ├── collection.jpg      Übersichtsblatt der Kollektion
    └── products/           40 freigestellte Produktbilder (5 Teile x 8 Farben)
```

## Was drin ist

- **Farbwähler** — eine Farbe wählen und die *gesamte* Kollektion wechselt
  mit (Hero, Kacheln, Produktbilder, Warenkorb-Thumbnails). Die Auswahl wird
  im Browser gemerkt.
- **Warenkorb** — Grösse und Farbe pro Position, Mengen ändern, Zwischensumme,
  bleibt über Seitenaufrufe erhalten (`localStorage`).
- **Menü- und Warenkorb-Drawer** — auf dem Handy per Wischgeste schliessbar,
  dazu Escape, Klick daneben und Schliessen-Button.
- **Produktbilder** — aus dem Übersichtsblatt freigestellt, ein PNG-Freisteller
  je Teil und Farbe. Alle Farben eines Teils liegen auf derselben Leinwandgrösse,
  damit beim Farbwechsel nichts springt.

## Farben ändern

Eine Farbwelt besteht aus drei Dingen:

1. Ein Akzent oben in `styles.css`:
   `[data-colorway="tuerkis"]{--accent:#027180}`
2. Ein Eintrag in `WAYS` in `app.js`: `tuerkis: 'Türkis'`
3. Ein Knopf in `index.html`: `<button class="sw" data-way="tuerkis">`

Dazu je ein Bild pro Teil unter `assets/products/<teil>-<farbe>.webp`
(`jacket`, `pants`, `shorts`, `tank`, `balls`). Fehlt ein Bild, bleibt an der
Stelle eine Lücke — es gibt keinen Platzhalter.

## Produkte und Preise ändern

Alles in einem Array oben in `app.js` (`PRODUCTS`), Preise in Cent:

```js
{ id:'shorts', art:['shorts'],
  name:'PEAZE Sport Shorts', sub:'Mit Seitentaschen · leicht',
  price:4900, sizes:CLOTHING }
```

`art` listet die Bilder, die die Karte zeigt — das Complete Set nutzt
`['jacket','pants','balls']`.

## Noch nicht angebunden

Die Seite ist durchgehend auf Deutsch und ein Schaufenster ohne Backend. Folgendes zeigt nur eine
Rückmeldung an und sendet nichts:

- **Checkout** — braucht einen Shop (Shopify, Stripe Checkout o. ä.)
- **Newsletter** — braucht einen Anbieter (Klaviyo, Mailchimp o. ä.)
- **Social-Links und Footer-Links** zeigen noch auf Platzhalter (`#`)
- **Suche** springt derzeit nur zur Produktübersicht

## Hinweise

- Schriften: Michroma (Display) und Jost (Fliesstext) über Google Fonts.
- Michroma hat kein brauchbares Euro-Zeichen; das `€` wird deshalb in
  `<i class="eur">` gesetzt und in der Fliesstext-Schrift gerendert.
- Die Produktbilder sind aus `assets/collection.jpg` freigestellt. Das Skript
  dafür liegt nicht im Repo; die fertigen Bilder schon. Für neue Farben am
  einfachsten dasselbe Rastermass verwenden.
- Beim Farbwechsel tauscht `app.js` nur das `src` der Bilder. Die übrigen
  Farben werden nach dem Laden im Hintergrund vorgeladen, damit der Wechsel
  ohne Lücke passiert.
