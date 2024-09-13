
# frankenjs-demo-scrapers - Browserbasierter Scraper und RAW Request basierter Scraper

Dieses Repository enthält zwei Beispiele für Web Scraper: einen browserbasierten Scraper und einen Scraper, der auf "RAW" HTTP-Requests basiert. Beide Scraper extrahieren zu Demozwecken Daten von der Seite [books.toscrape.com](https://books.toscrape.com/).

## Voraussetzungen

- Node.js LTS Version oder eine aktuelle, moderne Node.js Version

## Projekt einrichten und starten

1. Klone das Repository:
   ```bash
   git clone https://github.com/sinventix/frankenjs-demo-scrapers.git
   ```

2. Installiere die Abhängigkeiten:
   ```bash
   npm install
   ```

3. Starte die Scraper:

### Browserbasierter Scraper

```bash
node demo-scraper-browser-variant.js
```

### RAW Request basierter Scraper

```bash
node demo-scraper-raw-request-variant.js
```

## Unterschiede zwischen den Scraper-Varianten

### Browserbasierter Scraper

- **Funktionsweise**: Öffnet und steuert einen echten Browser.
- **Vorteile**: Besonders effektiv bei dynamischen und interaktiven Webseiten, die stark auf JavaScript setzen.
- **Nachteile**: Hoher Ressourcenverbrauch und langsamer im Vergleich zu reinen Netzwerk-Requests.

### Netzwerk-/Requestbasierter Scraper

- **Funktionsweise**: Führt gezielte „RAW“ HTTP-Requests durch.
- **Vorteile**: Sehr schnell und effizient.
- **Nachteile**: Eingeschränkt bei komplexen Seiten, die Inhalte durch JavaScript generieren.

## Video zum vollständigen Vortrag

[https://www.youtube.com/watch?v=zYpkjgZAMhg](https://www.youtube.com/watch?v=zYpkjgZAMhg)

## Mehr Infos zum Vortrag
[scrapingexperts.de/web-scraping-fur-entwickler-praktische-einblicke-und-best-practices-vom-frankenjs-talk](https://scrapingexperts.de/web-scraping-fur-entwickler-praktische-einblicke-und-best-practices-vom-frankenjs-talk/)
