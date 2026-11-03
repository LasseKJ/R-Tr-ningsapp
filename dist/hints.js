import {requiredPackages} from './engine.js';
import {solutionOptions} from './solutions.js';
const guidance={
 filter:'Brug filter(datasæt, betingelse). Skriv kolonnenavne direkte inde i filter(), og brug & til OG eller | til ELLER. Hele rækker bevares.',
 select:'Brug select(datasæt, kolonner). Skriv kolonnenavne direkte, adskil dem med komma, og sæt minus foran kolonner, du vil fjerne.',
 mutate:'Brug mutate(datasæt, nyt_navn = beregning). Hvis opgaven beder dig ændre et eksisterende datasæt, skal du gemme resultatet tilbage i det objekt.',
 arrange:'Brug arrange(datasæt, kolonne). Til faldende rækkefølge bruges desc(kolonne). Hele rækker flyttes sammen.',
 desc:'desc(kolonne) giver faldende rækkefølge, fx inde i arrange().',
 slice_head:'Brug slice_head(datasæt, n = antal) til de første rækker. n er antal rækker, ikke det sidste rækkenummer.',
 slice_tail:'Brug slice_tail(datasæt, n = antal) til de sidste rækker.',
 pull:'Brug pull(datasæt, kolonne), når resultatet skal være en vektor og ikke et data frame.',
 summarise:'Brug summarise(datasæt, resultat = beregning) til at opsummere. Hvis opgaven beder om ét tal, kan du bagefter hente kolonnen med pull().',
 group_by:'Brug group_by(gruppekolonne) før summarise(), så beregningen udføres separat for hver gruppe.',
 inner_join:'Brug inner_join(venstre, højre, by = "nøglekolonne"). Kun rækker med en fælles nøgle kommer med.',
 rename:'Brug rename(datasæt, nyt_navn = gammelt_navn). Det nye navn står til venstre for lighedstegnet.',
 if_else:'Brug if_else(betingelse, værdi_hvis_sand, værdi_hvis_falsk). Der kommer ét svar for hver værdi i inputtet.',
 case_when:'Brug case_when(betingelse ~ værdi, .default = ellers_værdi) til at vælge værdier ud fra betingelser.',
 str_c:'Brug str_c() til at sætte tekst sammen. sep = " " indsætter et mellemrum mellem tekststykkerne.',
 str_detect:'Brug str_detect(tekst, mønster). Resultatet er TRUE eller FALSE for hver tekst. | i mønstret betyder, at begge alternativer kan matche.',
 str_extract:'Brug str_extract(tekst, mønster) til at hente den del af hver tekst, der matcher mønstret.',
 fromJSON:'Giv JSON-teksten til fromJSON(). flatten = TRUE bruges, når indlejrede felter skal bredes ud til kolonner.',
 drop_na:'Brug drop_na(datasæt, kolonne) til at fjerne rækker med NA i den bestemte kolonne. Uden kolonneargument kontrolleres alle kolonner.',
 pivot_wider:'Brug pivot_wider() med id_cols til række-id, names_from til de nye kolonnenavne og values_from til de værdier, der skal fyldes ind.',
 ggplot:'Start med ggplot(datasæt, aes(...)). aes() knytter variabler til fx x, y og colour; tilføj et geom-lag med +.',
 geom_line:'Brug geom_line() til linjer. Hvis der er flere grupper, skal du knytte gruppevariablen til group og eventuelt colour inde i aes().',
 geom_boxplot:'Brug geom_boxplot(). Sæt den numeriske variabel på y, og en eventuel gruppevariabel på x for at få ét boksplot pr. gruppe.'
};
const packageDefaults={dplyr:'Start med et data frame, og giv det til dplyr-funktionen som første argument, eller brug datasæt |> funktion(...). Kolonner skrives normalt uden $ inde i dplyr-funktioner.',stringr:'stringr arbejder med tekstvektorer. Giv teksten som første argument, og vælg den str_-funktion, der passer til opgaven.',jsonlite:'jsonlite læser JSON-tekst og omdanner den til R-objekter. Brug tekstobjektet fra opgaven som input.',tidyr:'tidyr ændrer datastruktur. Giv datasættet som første argument, og angiv de relevante kolonner.',ggplot2:'Brug ggplot() med datasættet, aes() til variablerne og et geom-lag til diagramtypen.'};
function activeCode(code){return String(code).replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#[^\n]*/g,token=>token.startsWith('#')?' ':token);}
export function hintsFor(ex,code=''){
 if(['choice','output'].includes(ex.kind))return [{label:'Hint',text:ex.hint}];
 const active=activeCode(code),detected=requiredPackages({},active,false),options=solutionOptions(ex);
 const packages=detected.length?detected:[...new Set(options.flatMap(option=>Object.keys(packageDefaults).filter(pkg=>option.label.toLowerCase().includes(pkg))))];
 const result=detected.length||ex.packages?.length?[]:[{label:'Base R',text:ex.hint}];
 for(const pkg of packages){
  const relevant=options.filter(option=>option.label.toLowerCase().includes(pkg));
  const matching=relevant.filter(option=>[...active.matchAll(/([A-Za-z_][\w.]*)\s*\(/g)].some(match=>option.code.includes(match[1]+'(')));
  const example=(matching.length?matching:relevant)[0]?.code||active;
  const calls=[...new Set([...example.matchAll(/\b([A-Za-z_][\w.]*)\s*\(/g)].map(match=>match[1]))];
  const tips=calls.filter(name=>guidance[name]&&requiredPackages({},name+'()',false).includes(pkg)).map(name=>guidance[name]);
  if(pkg==='dplyr'&&/\|>|%>%/.test(active))tips.push('Med pipe skrives datasæt |> funktion(...). Datasættet bliver automatisk funktionens første argument.');
  result.push({label:pkg,text:tips.length?tips.join(' '):packageDefaults[pkg]});
 }
 return result.length?result:[{label:'Hint',text:ex.hint}];
}
