1. Prerequisitos.

    - IntelliJ IDEA 2025.1.3
    - k6 versión 0.48+
    - Node versión 20.x (genera los reportes)
    - npm versión 10.x

2. Clonar el proyecto
   - git clone https://github.com/andruxDevB/k6-andresbonilla.git   (ejecutar desde consola para clonar el proyecto) 

3. Ejecución.
    - k6 run scripts/login_load_test.js \
      --summary-export=reports/summary.json > reports/login-report.txt   (desde consola para ejecutar la prueba y generar los reportes)
    
   Se obtiene como resultado
    - reports/summary.json → métricas completas de k6
    - reports/login-report.txt → resumen legible de consola

3. Generar reporte en HTML
   - node scripts/generate_html.js (ejecutar desde consola para generar reporte html)

    Se obtiene como resultado
   - reports/login-load-report.html (reporte html)

    El archivo HTML contiene:
    - Métricas de rendimiento
    - TPS
    - Iteraciones
    - Checks y porcentaje de éxito
    - Datos transferidos