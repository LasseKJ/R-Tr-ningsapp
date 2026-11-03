export const teachingSources = [
  {
    "path": "02-11-2026 Tavle undervisning.R",
    "description": "Tavleundervisning med JSON-data, tekstbehandling, filtrering, omdøbning, statistik og opsætning af ggplot.",
    "functions": [
      "library",
      "str_c",
      "fromJSON",
      "as.data.frame",
      "length",
      "str_extract",
      "rename",
      "filter",
      "str_detect",
      "c",
      "summary",
      "sd",
      "ggplot",
      "aes"
    ]
  },
  {
    "path": "DALE26W35/Fredag.R",
    "description": "Grundlæggende arbejde med vektorer og indlæsning af pakker.",
    "functions": [
      "library",
      "c"
    ]
  },
  {
    "path": "DALE26W35/Torsdag.R",
    "description": "Introduktion til at definere egne funktioner i R.",
    "functions": [
      "function"
    ]
  },
  {
    "path": "DALE26W38/Tirsdag.R",
    "description": "Arbejde med vektorer, lister og pakker.",
    "functions": [
      "library",
      "c",
      "list"
    ]
  },
  {
    "path": "DALEW36/Benchmark.R",
    "description": "Beregning af gennemsnit og brug af pakker i benchmarkmaterialet.",
    "functions": [
      "library",
      "mean"
    ]
  },
  {
    "path": "DALEW36/EstoniaFil.R",
    "description": "Vektorer, lister, egne funktioner, frekvenstabeller, summer og sapply().",
    "functions": [
      "c",
      "function",
      "list",
      "table",
      "sum",
      "sapply"
    ]
  },
  {
    "path": "DALEW36/Liste.R",
    "description": "Introduktion til at oprette og arbejde med lister.",
    "functions": [
      "list"
    ]
  },
  {
    "path": "DALEW36/Mandag - Playing Cards.R",
    "description": "Data frames, vektorer og visning af de første rækker i materialet om spillekort.",
    "functions": [
      "c",
      "data.frame",
      "head"
    ]
  },
  {
    "path": "DALEW36/myRounder.R",
    "description": "Egen funktion i filen myRounder.R; bruges som kilde til arbejdet med funktioner.",
    "functions": [
      "function"
    ]
  },
  {
    "path": "DALEW36/Onsdag.R",
    "description": "Datastruktur, manglende værdier, beskrivende statistik og boksplot med ggplot2.",
    "functions": [
      "library",
      "summary",
      "ggplot",
      "aes",
      "sum",
      "str",
      "is.na",
      "geom_boxplot"
    ]
  },
  {
    "path": "DALEW36/Pair Programming - Mandag.R",
    "description": "Pair programming med vektorer, lister, matricer, data frames, kolonnenavne og antal rækker.",
    "functions": [
      "length",
      "c",
      "list",
      "data.frame",
      "names",
      "matrix",
      "nrow"
    ]
  },
  {
    "path": "Eksamensøvning/Eksamenstræningsopgaver - Forsøg 1.R",
    "description": "Eksamenstræning: undersøgelse af datasæt, gennemsnit, minimum, maksimum og datastruktur.",
    "functions": [
      "library",
      "c",
      "summary",
      "mean",
      "head",
      "str",
      "nrow",
      "max",
      "min"
    ]
  },
  {
    "path": "Eksamensøvning/Eksamenstræningsopgaver - Svar.R",
    "description": "Eksamensopgaver med svar: udvælgelse, filtrering, sortering, nye kolonner og deskriptiv statistik i base R og dplyr.",
    "functions": [
      "library",
      "length",
      "filter",
      "c",
      "summary",
      "sd",
      "mean",
      "head",
      "str",
      "nrow",
      "max",
      "min",
      "dim",
      "select",
      "order",
      "arrange",
      "desc",
      "mutate",
      "median"
    ]
  },
  {
    "path": "EuroStat/EuroStat.R",
    "description": "Filtrering og mønstergenkendelse i tekst med str_detect().",
    "functions": [
      "library",
      "filter",
      "str_detect"
    ]
  },
  {
    "path": "fredag2/fredag2.R",
    "description": "Omregning med ceiling() og beregninger pr. gruppe med aggregate().",
    "functions": [
      "library",
      "ceiling",
      "aggregate"
    ]
  },
  {
    "path": "Mikroindikator/Mikroindikator.R",
    "description": "Makrodata: sekvenser, tid og kvartaler, datarensning, brede tabeller, sammenkobling, regression og linjeplot.",
    "functions": [
      "library",
      "as.data.frame",
      "length",
      "c",
      "summary",
      "ggplot",
      "aes",
      "function",
      "list",
      "mean",
      "sum",
      "data.frame",
      "is.na",
      "names",
      "nrow",
      "order",
      "for",
      "pivot_wider",
      "merge",
      "lm",
      "geom_line",
      "ifelse",
      "seq"
    ]
  },
  {
    "path": "OpenSky/FlyIBox.R",
    "description": "Læsning af JSON og omdannelse til data frames.",
    "functions": [
      "fromJSON",
      "as.data.frame"
    ]
  },
  {
    "path": "OpenSky/gethilsen.R",
    "description": "En hilsen bygget med en egen funktion og stringr::str_c().",
    "functions": [
      "library",
      "str_c",
      "function"
    ]
  },
  {
    "path": "OpenSky/GetPlanes.R",
    "description": "Flydata: JSON, tekstudtræk, omdøbning, filtrering, sortering, gruppering og statistik.",
    "functions": [
      "library",
      "str_c",
      "fromJSON",
      "as.data.frame",
      "length",
      "str_extract",
      "rename",
      "filter",
      "str_detect",
      "c",
      "summary",
      "sd",
      "ggplot",
      "aes",
      "arrange",
      "group_by"
    ]
  },
  {
    "path": "OpenSky/Main.R",
    "description": "Indgår i OpenSky-materialet. Filoversigten registrerer ingen selvstændige funktionskald i denne fil.",
    "functions": []
  },
  {
    "path": "OpenSky/util.R",
    "description": "Hjælpefunktioner, lister og pakker i OpenSky-materialet.",
    "functions": [
      "library",
      "function",
      "list"
    ]
  },
  {
    "path": "Terning/dice.R",
    "description": "Terningesimulationer med sample(), replicate(), summer og egne funktioner.",
    "functions": [
      "function",
      "sum",
      "sample",
      "replicate"
    ]
  },
  {
    "path": "Uge 40/Mandag.R",
    "description": "Filtrering, nye kolonner, gruppering, standardafvigelse og linjeplot opdelt efter område.",
    "functions": [
      "library",
      "filter",
      "c",
      "sd",
      "ggplot",
      "aes",
      "list",
      "mutate",
      "geom_line",
      "group_by",
      "summarise"
    ]
  },
  {
    "path": "Uge37/PairProgrammering10/PairProgramming1009.R",
    "description": "Pair programming med gennemsnit, filtrering, lister, kolonnenavne, for-løkker og sammenkobling af data.",
    "functions": [
      "filter",
      "c",
      "list",
      "mean",
      "names",
      "nrow",
      "for",
      "merge"
    ]
  },
  {
    "path": "Uge37/Test/hej.R",
    "description": "Indgår i testmaterialet fra uge 37. Filoversigten registrerer ingen selvstændige funktionskald i denne fil.",
    "functions": []
  },
  {
    "path": "Uge37/Test/Terning.R",
    "description": "Testmateriale til terningesimulationer med sample(), replicate() og summer.",
    "functions": [
      "function",
      "sum",
      "sample",
      "replicate"
    ]
  },
  {
    "path": "util.r",
    "description": "Generelle hjælpefunktioner og lister.",
    "functions": [
      "function",
      "list"
    ]
  },
  {
    "path": "Uge37/Forbrugerforventninger.csv",
    "description": "Månedlige værdier for forbrugertillidsindikatoren fra 2006 og frem. Kildedata til opgaven om ændringer fra måned til måned.",
    "functions": []
  }
,...[
  {
    "path": "OLA2GRP4-main/OPG1.1",
    "description": "BY3-folketal: hent bydata og fjern rækker efter tekst og indbyggertal.",
    "functions": []
  },
  {
    "path": "OLA2GRP4-main/OPG1.2",
    "description": "Bykategorier med mutate() og case_when().",
    "functions": []
  },
  {
    "path": "OLA2GRP4-main/OPG1.3",
    "description": "Rens boligdata, standardisér bynavne, aggregér og flet datasæt.",
    "functions": []
  },
  {
    "path": "OLA2GRP4-main/OPG1.4",
    "description": "Gruppér boligpriser og tegn søjlediagram med ggplot2.",
    "functions": []
  },
  {
    "path": "OLA2GRP4-main/OPG2.1 REVIDERET",
    "description": "Kvartalsdata, årlig vækst, modeller og figurer.",
    "functions": []
  },
  {
    "path": "OLA2GRP4-main/OPG2.2 REVIDERET",
    "description": "Modelprognoser for forbrugertillid og visualisering.",
    "functions": []
  },
  {
    "path": "OLA2GRP4-main/OPG3.1",
    "description": "Saml og udvælg DI- og DST-modelprognoser.",
    "functions": []
  },
  {
    "path": "OLA2GRP4-main/OPG3.2",
    "description": "Beregn residualer og vis forskelle mellem modeller.",
    "functions": []
  },
  {
    "path": "OLA2GRP4-main/OPG3.3",
    "description": "Beregn RSS og TSS for regressionsmodeller.",
    "functions": []
  },
  {
    "path": "OLA2GRP4-main/OPG4.3",
    "description": "Vend lange kvartalstabeller til brede data frames.",
    "functions": []
  },
  {
    "path": "OLA2GRP4-main/OPG4.4",
    "description": "Loop over indikatorer, modeller og grafdata.",
    "functions": []
  },
  {
    "path": "OLA2GRP4-main/OPG5.1",
    "description": "Bearbejd Eurostat-data, lav kolonner og brug lag() til vækst.",
    "functions": []
  },
  {
    "path": "OLA2GRP4-main/OPG5.4",
    "description": "Gruppér, beregn gennemsnit og tegn søjlediagram.",
    "functions": []
  },
  {
    "path": "OLA3-GRP4-main/Opgave 1.2.r",
    "description": "Vælg forklarende variable og opbyg en regressionsformel.",
    "functions": []
  },
  {
    "path": "OLA3-GRP4-main/Opgave 1.3.r",
    "description": "Del indikatorstrenge og tæl forekomsten af spørgsmål.",
    "functions": []
  },
  {
    "path": "OLA3-GRP4-main/Opgave 1.4.r",
    "description": "Saml månedsdata i kvartaler og forbered prognoser.",
    "functions": []
  },
  {
    "path": "OLA3-GRP4-main/Opgave 2.1.r",
    "description": "Multipel regression og komponentregression med pls.",
    "functions": []
  },
  {
    "path": "OLA3-GRP4-main/Opgave 2.3.r",
    "description": "Lav en prognose fra en komponentmodel.",
    "functions": []
  },
  {
    "path": "OLA3-GRP4-main/Opgave 3.1 og 3.2.r",
    "description": "Forbered privatforbrugsdata, beregn vækst og sammenlign prognoser.",
    "functions": []
  },
  {
    "path": "OLA3-GRP4-main/Opgave 4.1.r",
    "description": "Beregn modelstabilitet med indlejrede for-løkker.",
    "functions": []
  },
  {
    "path": "OLA3-GRP4-main/opg4 rul",
    "description": "Beregn R² i rullende tidsvinduer med løkker.",
    "functions": []
  },
  {
    "path": "OLA3-GRP4-main/Opgave 5.2.r",
    "description": "Hent DMI-observationer, læs JSON og bearbejd vejrdata.",
    "functions": []
  }
]];
export const documentationSources = [
  {
    "name": "R · base R",
    "url": "https://stat.ethz.ch/R-manual/R-devel/library/base/html/00Index.html",
    "description": "Officiel reference til R-funktioner, datatyper og operatorer."
  },
  {
    "name": "ggplot2",
    "url": "https://ggplot2.tidyverse.org/reference/",
    "description": "Dokumentation af ggplot(), aes(), linjeplot og boksplot. Supplerer undervisningsfilerne og bruges til kontrol af plotopgaverne."
  },
  {
    "name": "dplyr",
    "url": "https://dplyr.tidyverse.org/reference/",
    "description": "Reference til blandt andet filter(), select(), mutate(), arrange() og joins."
  },
  {
    "name": "tidyr",
    "url": "https://tidyr.tidyverse.org/reference/",
    "description": "Reference til at ændre datastruktur med blandt andet pivot_wider() og håndtere manglende værdier."
  },
  {
    "name": "stringr",
    "url": "https://stringr.tidyverse.org/reference/",
    "description": "Reference til sammensætning, søgning og udtræk i tekst."
  },
  {
    "name": "jsonlite",
    "url": "https://cran.r-project.org/package=jsonlite",
    "description": "Pakkens dokumentation til indlæsning af JSON og konvertering til R-objekter."
  },
  {
    "name": "WebR",
    "url": "https://docs.r-wasm.org/webr/latest/",
    "description": "Dokumentation af R-motoren, der kører øvelsernes kode og figurer i browseren."
  }
];

documentationSources.push({name:'R · statistik',url:'https://stat.ethz.ch/R-manual/R-devel/library/stats/html/00Index.html',description:'Officiel reference til statistik, herunder sd(), lm() og aggregate().'}, {name:'R · datasættet mtcars',url:'https://stat.ethz.ch/R-manual/R-devel/library/datasets/html/mtcars.html',description:'Dokumentation af det indbyggede bildatasæt mtcars. I mange af opgaverne er biler en lokal kopi af dette datasæt.'});
const folderDescriptions={
 'DALE26W35':'Introduktion til R med vektorer, pakker og egne funktioner.',
 'DALEW36':'Grundlæggende datastrukturer: lister, matricer og data frames. Indeholder også pair programming, datastruktur, manglende værdier, statistik og boksplot.',
 'Uge37':'Pair programming med filtrering, gennemsnit og løkker. Mappen indeholder også månedlige forbrugertillidsdata og testmateriale til terningesimulationer.',
 'DALE26W38':'Arbejde med vektorer, lister og indlæsning af pakker.',
 'Uge 40':'Bearbejdning af data med dplyr: filtrering, nye kolonner, gruppering og opsummering. Linjeplot bruges til at sammenligne udvikling mellem områder.',
 'Eksamensøvning':'Samlede eksamenstræningsopgaver med både løsningsforsøg og svar. Dækker undersøgelse af datasæt, udvælgelse, filtrering, sortering, nye variabler og beskrivende statistik.',
 'Mikroindikator':'Arbejde med makrodata og tidsperioder: sekvenser, datarensning, brede tabeller, sammenkobling af datasæt, regression og linjeplot.',
 'OpenSky':'Et forløb om flydata med indlæsning af JSON, tekstbehandling, omdøbning, filtrering, sortering, gruppering og hjælpefunktioner.',
 'EuroStat':'Filtrering af data og søgning efter mønstre i tekst med stringr.',
 'Terning':'Simulation af terningekast med tilfældige træk, gentagelser og beregning af summer.',
 'fredag2':'Omregning og afrunding med ceiling() samt beregninger pr. gruppe med aggregate().',
  'OLA2GRP4-main':'OLA 2-gruppemateriale: by- og boligdata, tidsserier, prognoser, regression, løkker og ggplot2. Træningsopgaverne bruger lokale eksempeldatasæt.',
  'OLA3-GRP4-main':'OLA 3-gruppemateriale: indikatorer, regression, stabilitet, løkker og DMI-JSON. Træningsopgaverne bruger lokale eksempeldatasæt.',
 '':'Fælles materiale uden en overordnet mappe: tavleundervisning om JSON, tekst, filtrering og statistik samt generelle hjælpefunktioner.'
};
export const sourceFolders=Object.entries(folderDescriptions).map(([path,description])=>({
 path,name:path||'Fælles materiale',description,
 files:teachingSources.filter(source=>(source.path.includes('/')?source.path.split('/')[0]:'')===path)
}));
