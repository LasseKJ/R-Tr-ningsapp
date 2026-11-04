library(benchmarkme)
library(benchmarkmeData)

# Hent hardware information
resram <- benchmarkme::get_ram()

# CPU information via PowerShell
cpu_info <- system(
  'powershell.exe -Command "Get-CimInstance Win32_Processor | Select-Object Name,NumberOfCores,NumberOfLogicalProcessors,MaxClockSpeed | Format-List"',
  intern = TRUE
)

# CPU navn
cpu_name <- system(
  'powershell.exe -Command "(Get-CimInstance Win32_Processor).Name"',
  intern = TRUE
)

# Antal cores
cpu_cores <- system(
  'powershell.exe -Command "(Get-CimInstance Win32_Processor).NumberOfCores"',
  intern = TRUE
)

# Antal threads
cpu_threads <- system(
  'powershell.exe -Command "(Get-CimInstance Win32_Processor).NumberOfLogicalProcessors"',
  intern = TRUE
)

# CPU hastighed
cpu_speed <- system(
  'powershell.exe -Command "(Get-CimInstance Win32_Processor).MaxClockSpeed"',
  intern = TRUE
)

cpu_speed_ghz <- as.numeric(cpu_speed) / 1000

# Matrix benchmark
res <- bm_matrix_cal()

# Gennemsnitlig benchmark tid
mean_time <- mean(res$te)

# Samlet resultat
cat("\n")
cat("========================================\n")
cat("           COMPUTER INFORMATION\n")
cat("========================================\n")

cat("CPU:", cpu_name, "\n")
cat("Cores:", cpu_cores, "\n")
cat("Threads:", cpu_threads, "\n")
cat("CPU hastighed:", cpu_speed_ghz, "GHz\n")

cat("\n")
cat("RAM information:\n")
print(resram)

cat("\n")
cat("========================================\n")
cat("           BENCHMARK RESULT\n")
cat("========================================\n")

cat("Gennemsnitlig matrix tid:", mean_time, "sekunder\n")

cat("\n")
cat("benchmarkme CPU information:\n")
print(rescpu)

cat("\n")
cat("========================================\n")