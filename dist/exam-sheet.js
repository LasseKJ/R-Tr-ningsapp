// Each numbered question in the supplied answer sheet has an explicit mapping.
export const examSheetSource='Eksamensøvning/Eksamenstræningsopgaver - Svar.R';
export const examSheet=[
 {title:'1 · Undersøg datasættet',items:[
  ['1.1','Vis de første 6 rækker',['d-head']],
  ['1.2','Undersøg struktur og datatyper',['d-structure','d-class','d-type','d-cyl-type']],
  ['1.3','Find antal rækker og kolonner',['d-dim']],
  ['1.4','Beregn gennemsnittet af mpg',['s-mean']],
  ['1.5','Find laveste og højeste hp',['s-hp-min','s-hp-max']]]},
 {title:'2 · Udvælg bestemte biler',items:[
  ['2.1','Udvælg mpg',['d-column']],['2.2','Udvælg mpg og hp',['d-select']],
  ['2.3','Vis de første fem biler',['d-first-five']],['2.4','Find biler med mere end 150 hp',['f-hp']],
  ['2.5','Find biler med mindst 6 cylindre',['f-cyl']]]},
 {title:'3 · Filtrering',items:[
  ['3.1','Find biler med mere end 20 mpg',['f-mpg']],['3.2','Find biler med 8 cylindre',['f-eight']],
  ['3.3','Find biler med mindst 150 hp',['f-hp-atleast']],
  ['3.4','Find biler med 5 cylindre OG mere end 20 mpg',['f-five-and']],
  ['3.5','Find biler med enten 4 eller 8 cylindre',['f-or']]]},
 {title:'4 · Udvælg kolonner og sortér',items:[
  ['4.1','Udvælg mpg, hp, wt og cyl',['d-four-columns']],['4.2','Sortér mpg stigende',['f-sort']],
  ['4.3','Sortér hp faldende',['f-hp-desc']],['4.4','Find de fem biler med højest mpg',['f-top']],
  ['4.5','Fravælg disp og carb',['d-drop']]]},
 {title:'5 · Opret nye variabler',items:[
  ['5.1','Opret hp_kw',['d-kw']],['5.2','Opret weight_kg',['d-weight']],
  ['5.3','Opret high_mpg',['d-high-mpg']],['5.4','Vis de første ti biler med de nye variabler',['d-new-ten']]]},
 {title:'6 · Deskriptiv statistik for mpg',items:[
  ['6 · Gennemsnit','Gennemsnit',['s-mean']],['6 · Median','Median',['s-mpg-median']],
  ['6 · Standardafvigelse','Standardafvigelse',['s-mpg-sd']],['6 · Minimum','Minimum',['s-mpg-min']],
  ['6 · Maksimum','Maksimum',['s-mpg-max']],['6 · Antal','Antal observationer',['s-mpg-count']],
  ['6 · Ekstra','Første og tredje kvartil',['s-mpg-summary']]]}
];

export function addExamSheetExercises(add){
 const car='biler <- mtcars';
 const choice=(id,title,prompt,setup,options,answer,explanation)=>add(id,'frames',title,prompt,options[answer],{source:'exam',kind:'choice',setup,options,answer,hint:explanation,explanation});
 choice('d-structure','Undersøg strukturen','Hvilken funktion viser kolonnenavne, datatyper og eksempler på værdier i biler?',car,['str(biler)','structure(biler)','head(biler)','nrow(biler)'],0,'str() viser objektets struktur. structure() bruges til at tildele attributter; den er ikke strukturvisningen.');
 choice('d-class','Datasættets klasse','Hvad returnerer class(biler)?',car,['"data.frame"','"numeric"','"matrix"','"character"'],0,'mtcars er et data frame. class() fortæller objektets klasse.');
 choice('d-type','Datasættets interne datatype','Hvad returnerer typeof(biler)?',car,['"list"','"data.frame"','"double"','"character"'],0,'Et data frame er internt en liste af kolonner. class() og typeof() besvarer forskellige spørgsmål.');
 choice('d-cyl-type','Datatypen i en kolonne','Hvad returnerer typeof(biler$cyl)?',car,['"double"','"integer"','"list"','"character"'],0,'cyl indeholder hele tal, men kolonnen er gemt som double i mtcars.');
 add('s-hp-min','stats','Færrest hestekræfter','Returnér den laveste hp-værdi.','min(biler$hp)',{setup:car,hint:'min() finder den laveste værdi.'});
 add('s-hp-max','stats','Flest hestekræfter','Returnér den højeste hp-værdi.','max(biler$hp)',{setup:car,hint:'max() finder den højeste værdi.'});
 add('d-first-five','frames','De første fem biler','Returnér præcis de første fem rækker af biler.','biler[1:5, ]',{setup:car,hint:'Brug rækkeindeks 1:5 eller head(biler, 5). head(biler) alene viser seks rækker.'});
 add('f-mpg','filter','Mere end 20 mpg','Returnér alle biler med mere end 20 mpg.','biler[biler$mpg > 20, ]',{setup:car,hint:'Mere end betyder >.'});
 add('f-eight','filter','Præcis otte cylindre','Returnér alle biler med præcis 8 cylindre.','biler[biler$cyl == 8, ]',{setup:car,hint:'Brug == til at sammenligne.'});
 add('f-hp-atleast','filter','Mindst 150 hestekræfter','Returnér alle biler med mindst 150 hp.','biler[biler$hp >= 150, ]',{setup:car,hint:'Mindst betyder >=. Biler med præcis 150 hp skal med.'});
 add('f-five-and','filter','Fem cylindre OG over 20 mpg','Returnér et data frame med biler med 5 cylindre OG mere end 20 mpg. Et tomt resultat kan være korrekt.','biler[biler$cyl == 5 & biler$mpg > 20, ]',{setup:car,hint:'Brug & til OG. Ingen biler i mtcars har fem cylindre.',explanation:'Resultatet har nul rækker. | ville inkludere biler alene på grund af mpg og ville derfor være forkert.'});
 add('d-four-columns','frames','Fire bestemte kolonner','Returnér kun mpg, hp, wt og cyl i denne rækkefølge.','biler[, c("mpg", "hp", "wt", "cyl")]',{setup:car,hint:'Vælg kolonnerne efter kommaet med c().'});
 add('f-hp-desc','filter','Hestekræfter i faldende orden','Returnér hele datasættet sorteret efter hp fra højest til lavest.','biler[order(biler$hp, decreasing = TRUE), ]',{setup:car,level:2,hint:'order(..., decreasing = TRUE) giver rækkernes positioner i faldende orden.'});
 add('d-high-mpg','frames','En logisk kolonne','Opret high_mpg i biler. Værdien skal være TRUE ved mere end 20 mpg og ellers FALSE.','biler$high_mpg <- biler$mpg > 20',{setup:car,hint:'En sammenligning giver allerede TRUE eller FALSE.',check:'identical(biler$high_mpg, mtcars$mpg > 20)'});
 add('d-new-ten','frames','De nye variabler i de første ti rækker','Datasættet har allerede hp_kw, weight_kg og high_mpg. Returnér de første ti rækker med alle kolonner.','head(biler, 10)',{setup:car+'\nbiler$hp_kw <- biler$hp * 0.7457\nbiler$weight_kg <- biler$wt * 1000 * 0.453592\nbiler$high_mpg <- biler$mpg > 20',hint:'head(datasæt, antal) viser det ønskede antal rækker.'});
 for(const [id,title,fn,hint] of [
  ['s-mpg-median','Medianen af mpg','median','Medianen er den midterste værdi.'],
  ['s-mpg-sd','Standardafvigelsen af mpg','sd','sd() beregner stikprøvens standardafvigelse.'],
  ['s-mpg-min','Laveste mpg','min','min() finder den laveste værdi.'],
  ['s-mpg-max','Højeste mpg','max','max() finder den højeste værdi.'],
  ['s-mpg-count','Antal mpg-observationer','length','length() tæller værdierne i en vektor.']
 ])add(id,'stats',title,'Returnér '+({median:'medianen',sd:'standardafvigelsen',min:'minimum',max:'maksimum',length:'antallet af observationer'}[fn])+' for biler$mpg.',`${fn}(biler$mpg)`,{setup:car,hint});
 add('s-mpg-summary','stats','Kvartiler og samlet beskrivelse','Returnér summary() for mpg, så første og tredje kvartil fremgår sammen med de øvrige beskrivende tal.','summary(biler$mpg)',{setup:car,hint:'summary() viser blandt andet 1st Qu. og 3rd Qu.',explanation:'Første kvartil svarer til 25 %, og tredje kvartil til 75 %. Her menes kvartiler, ikke kvartaler i kalenderen.'});
}
