library(dplyr)
biler <- mtcars

#1.1 - vis de første seks rækker i datasættet

head(biler,6)

#1.2 - undersøg datasættets struktur

ncol(biler)
nrow(biler)
summary(biler)
str(biler) #- Skulle bruge hjælp

#1.3 - Find antallet af rækker og kolonner

ncol(biler)
nrow(biler)

#1.4 - Beregn gennemsnittet af mpg

mean(biler$mpg)

#1.5 - find højeste og laveste værdi af hp

max(biler$mpg)
min(biler$mpg)

#2.1 - Udvælg kolonnen mpg

(biler$mpg)

#2.2 - Udvælg kolonnerne mpg og hp

biler[,c("mpg","hp")] #- Skulle bruge hjælp

#2.3 - vis de første fem biler



#2.4 - find de biler med mere end 150 hestekræfter



#2.5 - find de biler med mindst 6 cylindre



#3.1 - find alle bilder med mere end 20 mgp



#3.2 -  find alle bilder med otte cylindre



#3.3 - find alle bilder med mindst 150 hestekræfter



#3.4 - find alle bilder med 5 cylindre opg mere end 20 mpg



#3.5 - find biler med enten 4 eller 8 cylindre

#4.1 - udvælg kun mpg,hp,wt og cyl
#4.2 - sortér bilerne efter mpg fra lavest til højest
#4.3 - sortér bilerne efter hp fra højest til lavest
#4.4 - find de 5 biler med højeste brændstoføkonomi
#4.5 - udvælg alle variabler undtagen disp og carb

#5.1 - opret "hp_kw", der omregner hestekræfter til kilowatt- brug omregningen:
 # kW = hp * 0,7457
#5.2 - opret "weight_kg", der omregner bilens vægt til kilogram.Variablen wt er angivet i 1.000 pund
#kg = wt * 1000 * 0,453592
#5.3 Opret"high_mgp", som er TRUE, hvis bilen har mere end 20 mpg, og ellers FALSE
#5.4 - vis de første 10 biler med de nye variabler

#### OPGAVE 6 - DESKRIPTIV STATISTIK ####

#Beregn følgende for mpg:
#Gennemsnit
#Median
#Standardafvigelse
#Minimum
#Maximum
#Antal observationer

#UNDERSØG, OM BRÆNDSTOFØKONOMIEN CARIERER MED ANTALLET AF CYLINDRE
#Gruppér bilerne efter cyl
#Beregn gennemsnitlig mpg for hver gruppe
#Beregn antallet af biler i hver gruppe
#Sortér grupperne efter gennesmniutlig mpg fra højest til lavest
#ekstra: beregn standardafvigeslsen for mpg i hver gruppe
#### VISUALISERING ####
#Visualiser dine resultater, så jeg som modtager forsår det ved første øjekast