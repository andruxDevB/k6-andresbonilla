const fs = require('fs');
const path = require('path');

// Ruta del .JSON reporte prueba K6
const summaryFile = path.join(__dirname, '../reports/summary.json');
const htmlFile = path.join(__dirname, '../reports/login-load-report.html');

// Verifica que exista el .JSON
if (!fs.existsSync(summaryFile)) {
  console.error('Error: no se encontró summary.json. Ejecuta primero la prueba con k6.');
  process.exit(1);
}

// Leer .JSON
const summary = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));

const f = (n) => (n !== undefined ? n.toFixed(2) : 'N/A');

// Crear HTML
let html = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Reporte k6 - Auth</title>
<style>
body { font-family: Arial, sans-serif; margin: 20px; background-color: #f9f9f9; }
h1, h2 { color: #2c3e50; }
table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
th { background-color: #3498db; color: white; }
tr:nth-child(even){background-color: #f2f2f2;}
</style>
</head>
<body>
<h1>Reporte de Prueba de Carga - Servicio Auth</h1>
<h2>Métricas principales</h2>
<table>
<tr><th>Métrica</th><th>Promedio</th><th>Mínimo</th><th>Mediana</th><th>Máximo</th><th>P90</th><th>P95</th></tr>
`;

// Iterar métricas
for (const key in summary.metrics) {
    const metric = summary.metrics[key];
    if(metric.avg !== undefined) {
        html += `<tr>
        <td>${key}</td>
        <td>${f(metric.avg)}</td>
        <td>${f(metric.min)}</td>
        <td>${f(metric.med)}</td>
        <td>${f(metric.max)}</td>
        <td>${f(metric["p(90)"])}</td>
        <td>${f(metric["p(95)"])}</td>
        </tr>`;
    }
}

html += `</table>
<h2>Checks</h2>
<table>
<tr><th>Check</th><th>Éxito (%)</th><th>Iteraciones correctas</th><th>Iteraciones fallidas</th></tr>
`;

const checks = summary.root_group.checks;
for (const key in checks) {
    const c = checks[key];
    const total = c.passes + c.fails;
    const successRate = total > 0 ? (c.passes / total * 100).toFixed(2) : 'N/A';
    html += `<tr>
    <td>${c.name}</td>
    <td>${successRate}</td>
    <td>${c.passes}</td>
    <td>${c.fails}</td>
    </tr>`;
}

html += `
</table>
<h2>Resumen de iteraciones y TPS</h2>
<p><strong>Iteraciones completadas:</strong> ${summary.metrics.iterations.count}</p>
<p><strong>TPS promedio:</strong> ${summary.metrics.iterations.rate.toFixed(2)}</p>
<p><strong>Duración promedio de iteración:</strong> ${summary.metrics.iteration_duration.avg.toFixed(2)} ms</p>
<p><strong>Duración máxima de iteración:</strong> ${summary.metrics.iteration_duration.max.toFixed(2)} ms</p>

<h2>Usuarios Virtuales (VUs)</h2>
<p><strong>VUs mínimos:</strong> ${summary.metrics.vus.value}</p>
<p><strong>VUs máximos:</strong> ${summary.metrics.vus_max.value}</p>

<h2>Datos transferidos</h2>
<p><strong>Data recibida:</strong> ${(summary.metrics.data_received.count/1024).toFixed(2)} KB</p>
<p><strong>Data enviada:</strong> ${(summary.metrics.data_sent.count/1024).toFixed(2)} KB</p>

</body>
</html>
`;

// Guarda HTML
fs.writeFileSync(htmlFile, html);
console.log('Reporte HTML generado en:', htmlFile);
