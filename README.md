# R Lab — din personlige R-træning

En komplet dansksproget træningsapp til base R, bygget ud fra 27 R-filer uden OLA-mapper i det udleverede kursusmateriale.

## Brug appen

Den hostede udgave: https://r-tr-ningsapp.vercel.app

- 68 opgaver i seks emner: vektorer/typer, data frames, filtrering/sortering, funktioner/løkker, statistik/NA og simulation/modeller.
- Skriv rigtig R-kode, forudsig output, vælg svar eller ret fejl. Alternative løsninger godkendes ud fra resultatet, ikke en strengsammenligning af kildekoden.
- Konsol og plotvisning, hints, løsningsforslag og et opslagsværk.
- Reproducerbare varianter med nye tal inden for fire opgavefamilier.
- Eksamenstræning: 10 opgaver på tværs af alle emner, 20 minutter, låste afleveringer og samlet gennemgang bagefter. En aktiv prøve kan genoptages; tiden løber videre.
- Historik, korrekthed, første forsøg uden hjælp, tid, dagligt mål, streak og emnestatistik. Eksamensforsøg holdes adskilt fra træning. Vist facit giver ikke en selvstændig gennemførelse. Varianter indgår i aktiviteten, men øger ikke tælleren for de 68 faste opgaver.
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

Gæstefremskridt ligger i localStorage under `r-lab-progress-v1`. Med login via Supabase gemmes fremskridt i Postgres og i en separat lokal kontocache. Lokale gæsteresultater importeres kun efter brugerens eget valg. Revisioner beskytter mod tab ved samtidige ændringer: brugeren kan eksportere den lokale version og derefter hente online-versionen. Browserrydning kan slette resultater; brug backupfunktionen. Indlæsning af motoren kræver internet og henter WebR 0.6.0 fra r-wasm.org. Fonts hentes fra Google Fonts med lokale fallbackskrifter. Besvarelser sendes ikke til en bedømmelsesserver. Kode kører lokalt, men brugeren kan selv skrive netværkskald i R.

Dette er en læringsapp, ikke en eksamensplatform med snydesikring. Facit og testkontrakter er synlige i kildekoden. Visualiseringer vises, men bedømmes ikke på deres visuelle kvalitet. Tiden tæller, når en opgave er synlig og ikke kører; tiden gemmes ved en bedømt aflevering. Syntaksfejl og motorfejl tæller ikke som bedømte forsøg. Variantsøgning er skabelonbaseret, ikke AI-generering.

De originale kursusfiler er ikke lagt i repository. API-oplysninger, personlige stier, RStudio-sessioner og historik fra zipfilen er udeladt. API-, scraping- og pakkeafhængige analyser er omsat til selvstændige base R-opgaver med indbyggede eller syntetiske data. Fejl i de tidligere besvarelser er ikke genbrugt som facit.

## Online profiler

Supabase Free i Frankfurt leverer Auth og Postgres. Vercel serverer `/api/config`, som kun returnerer den offentlige Supabase-URL og anon-nøgle. Service role-nøgler eksponeres aldrig. `supabase/schema.sql` opretter RLS-tabellen og en atomisk RPC, der udleder bruger-id fra den verificerede session.

- `dist/account.js`: loginlink, navn, logout, lokal import og synkroniseringsstatus.
- `dist/sync.js`: separat kontocache, offlineændringer og revisionskontrol.
- `tests/sync.test.mjs`: import, adskillelse af konti, samtidige ændringer og genoptagelse.

Ved ny installation: kør skemaet én gang i Supabase SQL Editor, tilknyt integrationen i Vercel og sæt Auth Site URL til produktionsadressen. Miljøvariabler: `NEXT_PUBLIC_SUPABASE_URL` og `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Ingen hemmeligheder hører hjemme i Git. Den lokale statiske server understøtter gæstetræning; Vercel Functions kræves for `/api/config`.

Login kræver e-mailadgang. Supabases standardmail er begrænset til organisationens godkendte adresser og har lave rategrænser. Offentlig registrering for andre brugere kræver en tilknyttet SMTP-udbyder. Bekræftelseskrav er ikke slået fra.

## Pensum uden OLA

Alle mapper med navne der begynder med OLA (uanset store/små bogstaver og mappeniveau) er udeladt. 27 filer er tilladt, 7 er udeladt. `course-audit.json` dokumenterer funktioner og deres kildefiler for alle faste opgaver og de fire variantfamilier. `dist/course-evidence.js` leverer kildehenvisningerne i appen. Originalfiler og adgangsoplysninger offentliggøres ikke.

Opgaverne med `cor()` og `combn()` er fjernet, da funktionerne kun fandtes i OLA-materialet. `length.out` og det unødvendige `drop = FALSE` er fjernet fra løsningsforslag. R-håndbogen er tilpasset samme pensum. Bedømmelsesmotorens interne hjælpefunktioner er ikke en del af det, eleven skal skrive. `tests/course-scope.test.mjs` kontrollerer funktionerne i startkode, opgavedata og facit, også for 100 genererede varianter.

## Hele eksamensarket

Opgavebiblioteket har en tjekliste med samtlige 31 spørgsmål/delspørgsmål fra `Eksamenstræningsopgaver - Svar.R`: 1.1–5.4, seks beskrivende mål og den ekstra kvartilopgave. `dist/exam-sheet.js` kobler hvert spørgsmål til øvelser og tilføjer 21 nye øvelser. Under 1.2 trænes både struktur, klasse og interne datatyper. Tidligere øvelses-id’er og brugerhistorik bevares. `tests/exam-sheet.test.mjs` kontrollerer fuld dækning.

## Valgfri pakketræning

Menuen øverst til højre tilvælger dplyr, jsonlite, stringr, tidyr og ggplot2 uafhængigt. De 68 base-R-øvelser er altid tilgængelige, og der er 15 ekstra pakkeøvelser. Kombinationer kræver alle relevante tilvalg. Valgene gemmes med fremskridtene, også på profilen. Prøveudvælgelse følger de aktive pakker, og pakkevalg låses under en aktiv prøve.

Pakkeøvelsernes funktioner og argumenter er hentet fra filer uden OLA. JSON og API-relaterede opgaver bruger små lokale, syntetiske data uden netværksadgang eller adgangsoplysninger. WebR henter nødvendige pakker ved første kodekørsel. ggplot2-opgaverne træner læsning og forståelse af plotkode. str() er base R; str_c(), str_detect() og str_extract() er stringr.
