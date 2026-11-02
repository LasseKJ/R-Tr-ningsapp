# R Lab — din personlige R-træning

En komplet dansksproget træningsapp til base R, bygget ud fra emnerne i 34 R-filer i det udleverede kursusmateriale.

## Brug appen

Den hostede udgave: https://r-traeningslab-lasse.alert-mole-5156.chatgpt.site

- 49 opgaver i seks emner: vektorer/typer, data frames, filtrering/sortering, funktioner/løkker, statistik/NA og simulation/modeller.
- Skriv rigtig R-kode, forudsig output, vælg svar eller ret fejl. Alternative løsninger godkendes ud fra resultatet, ikke en strengsammenligning af kildekoden.
- Konsol og plotvisning, hints, løsningsforslag og et opslagsværk.
- Reproducerbare varianter med nye tal inden for fire opgavefamilier.
- Eksamenstræning: 10 opgaver på tværs af alle emner, 20 minutter, låste afleveringer og samlet gennemgang bagefter. En aktiv prøve kan genoptages; tiden løber videre.
- Historik, korrekthed, første forsøg uden hjælp, tid, dagligt mål, streak og emnestatistik. Eksamensforsøg holdes adskilt fra træning. Vist facit giver ikke en selvstændig gennemførelse. Varianter indgår i aktiviteten, men øger ikke tælleren for de 49 faste opgaver.
- Lokale kladder, eksport/import af JSON-backup og bekræftet nulstilling.
- Responsivt layout, tastaturbetjening og skærmlæseretiketter.

## Kør lokalt

Kræver Node.js 22 eller nyere. Ingen installation eller byggeproces er nødvendig for selve siden.

```sh
node scripts/serve.mjs
```

Åbn http://127.0.0.1:4173. Enhver statisk webhost kan servere `dist/` over HTTP/HTTPS. Åbn ikke HTML-filen direkte via `file://`, da ES-moduler kræver en webserver.

## Test

```sh
node --test tests/*.test.mjs
node --check dist/app.js
```

Alle kodefacit og negative testcases kan desuden kontrolleres i rigtig R med den samme bedømmelseskode som appen:

```sh
npm install --no-save --ignore-scripts webr@0.6.0
node scripts/verify-r.mjs
```

`WEBR_MODULE` kan pege på en lokal `webr.mjs`. WebR 0.6.0 har en Windows-specifik sti-fejl i sin Node-worker; brug Linux til den automatiske R-verifikation. Browserudgaven er ikke berørt. GitHub Actions kører begge tests på Linux.

## Opbygning

- `dist/course.js`: opgaver, kildehenvisninger, facit, testkontrakter og variantgenerator.
- `dist/engine.js`: WebR, friske R-miljøer pr. kørsel, output, figurer og 15-sekunders timeout.
- `dist/progress.js`: backupvalidering, statistik, dansk datoafgrænsning og prøveudvælgelse.
- `dist/app.js` og `dist/style.css`: navigation, editor, prøver og responsiv brugerflade.
- `.openai/hosting.json`: konfiguration til den private Sites-udgave.

For at tilføje en opgave: brug `add()` i `course.js`. Standardopgaver sammenligner det sidste R-resultat med facit med numerisk tolerance. `check` bruges til funktioner, oprettede objekter og specifikke metodekrav. Bedømmelsen kontrollerer ikke en simulations statistiske uniformitet; den kontrollerer metode, størrelse og gyldige udfald.

## Data og afgrænsning

Fremskridt ligger kun i browserens localStorage under `r-lab-progress-v1`. Der er ingen serverdatabase, brugerkonto eller synkronisering mellem enheder. Browserrydning kan slette resultater; brug backupfunktionen. Indlæsning af motoren kræver internet og henter WebR 0.6.0 fra r-wasm.org. Fonts hentes fra Google Fonts med lokale fallbackskrifter. Besvarelser sendes ikke til en bedømmelsesserver. Kode kører lokalt, men brugeren kan selv skrive netværkskald i R.

Dette er en læringsapp, ikke en eksamensplatform med snydesikring. Facit og testkontrakter er synlige i kildekoden. Visualiseringer vises, men bedømmes ikke på deres visuelle kvalitet. Tiden tæller, når en opgave er synlig og ikke kører; tiden gemmes ved en bedømt aflevering. Syntaksfejl og motorfejl tæller ikke som bedømte forsøg. Variantsøgning er skabelonbaseret, ikke AI-generering.

De originale kursusfiler er ikke lagt i repository. API-oplysninger, personlige stier, RStudio-sessioner og historik fra zipfilen er udeladt. API-, scraping- og pakkeafhængige analyser er omsat til selvstændige base R-opgaver med indbyggede eller syntetiske data. Fejl i de tidligere besvarelser er ikke genbrugt som facit.
