library(dplyr)
biler <- mtcars

#### OPGAVE 1: UNDERSØG DATASÆT ####

#1.1 - vis de første 6 rækker i datasættet
head(biler,10)
#1.2 - undersøg datasættets struktur
structure(biler) #hele datasættets struktur
class(biler) #hvilken type af datasæt = data.frame
typeof(biler) #hvilken form for data = liste
typeof(biler$cyl) #pinpoint hvilken kolonne du vil kigge på
str(biler) #fortæller om kolonnerne er CHAR eller NUMERIC


#1.3 - Find antallet af rækker og kolonner
dim(biler) #antal af først rækker og kolonner
nrow(biler) #antal af rækker
ncol(biler) #antal af kolonner

#1.4 - Beregn gennemsnittet af mpg
mean(biler$mpg) #altid brug mean, find den kolonne du vil lave gennemsnit af

#1.5 - find højeste og laveste værdi af hp (horsepower)
min(biler$hp) #minimum af den kolonne
max(biler$hp) #maksimum af den kolonne



#### OPGAVE 2: UDVÆLG BESTEMTE BILER ####

#2.1 - Udvælg kolonnen mpg
(biler$mpg) 
#2.2 - Udvælg kolonnerne mpg og hp
biler[,c("mpg","hp")] #c=combine de to kolonner
select(biler,,mpg|hp) #select og lige streg (|) betyder OG.

#2.3 - vis de første fem biler
head(biler) #viser de første
tail(biler) #viser de sidste 
biler[1:5,] #her er det vigtigt med "komma", for at bruge alle fem kolonner

#2.4 - find de biler med mere end 150 hestekræfter
biler[biler$hp>=150,] #her viser den 150 og derover, det er lighedstegnet som gør at 150 kommer med

#2.5 - find de biler med mindst 6 cylindre
biler[biler$cyl>=6,]

#### OPGAVE 3: filtrering ####

#3.1 - find alle biler med mere end 20 mgp
biler[biler$mpg>20,]
#3.2 -  find alle biler med otte cylindre
biler[biler$cyl==8,]
#3.3 - find alle biler med mindst 150 hestekræfter
biler[biler$hp>=150,]
#3.4 - find alle biler med 5 cylindre og mere end 20 mpg
biler[biler$cyl==5|biler$mpg>20,]
#3.5 - find biler med enten 4 eller 8 cylindre
biler[biler$cyl==4|biler$cyl==8,] #Ligestreg - fungerer her som enten eller tegn
filter(biler, cyl%in%c(4,8)) #filter er dplyr - definer datasæt, hvilken variabel, hvilket indhold




#### OPGAVE 4: UDVÆLG KOLONNER OG SORTÉR ####

#4.1 - udvælg kun mpg,hp,wt og cyl
biler[,c("mpg","hp","wt","cyl")]
select(biler,,mpg|hp|wt|cyl)
select(biler,mpg,hp,wt,cyl)

#4.2 - sortér bilerne efter mpg fra lavest til højest
biler[order(biler$mpg),]
arrange(biler,mpg)
biler$mpq <- sort(biler$mpg,decreasing=T)
print(biler)

#4.3 - sortér bilerne efter hp fra højest til lavest
arrange(biler,desc(hp))

#4.4 - find de 5 biler med højeste brændstoføkonomi
biler[order(biler$mpg,decreasing=T),][1:5,]

arrange(biler,mpg)%>%
  head (n=5)

#4.5 - udvælg alle variabler undtagen disp og carb
disp <- which(colnames(biler)=="disp")
carb <- which(colnames(biler)=="carb") #første metode - baseR

biler[,-c(carb,disp)]

select(biler,!disp&!carb) #dplyr

select(biler-disp,-carb) #nem at huske, med minus


#### OPGAVE 5: OPRET NYE VARIABLER ####

#5.1 - opret "hp_kw", der omregner hestekræfter til kilowatt- brug omregningen:
biler$hp_kw <- biler$hp*0.7457 #favoritversionen

biler_ny <- biler |> #ikkefavoritversionen
  mutate(kw_hp=hp*0.7457) #det er smart at lave et nyt datasæt, så du altid har overblik over dine eventuelle fejl
print(biler)



#5.2 - opret "weight_kg", der omregner bilens vægt til kilogram.Variablen wt er angivet i 1.000 pund
kg = wt * 1000 * 0,453592

biler$weight_kg <- biler$wt*1000*0.453592

biler_w_kg <- biler_ny |> #ikkefavoritversionen
  mutate(weight_kg=wt*1000*0.453592 #det er smart at lave et nyt datasæt, så du altid har overblik over dine eventuelle fejl
         View(biler)
         
         #5.3 Opret"high_mgp", som er TRUE, hvis bilen har mere end 20 mpg, og ellers FALSE
         biler <- biler |> 
           mutate(
             high_mpg=mpg>20)
         print(biler)
         
         
         
         
         #5.4 - vis de første 10 biler med de nye variabler
         head(biler,10)
         
         
         
         #### OPGAVE 6 - DESKRIPTIV STATISTIK ####
         
         #Beregn følgende for mpg:
         
         #Gennemsnit
         mean(biler$mpg) #divideret antallet i dataframe til et simpelt gennemsnit
         
         #Median
         median(biler$mpg) #tager et tal fra hver side, indtil man rammer midten
         
         #Standardafvigelse
         sd(biler$mpg) #Jo større spredning der er, jo mere usikkert
         
         #Minimum
         min(biler$mpg)
         #Maximum
         max(biler$mpg)
         
         #Antal observationer
         length(biler$mpg)
         str(biler$mpg)
         
         #Ekstra udfordring: Beregn første og tredje kvartal
         summary(biler$mpg) #når det ikke er i tid, er det opdelt i procent. 1.kvartal =25% 3.kvartal=75%