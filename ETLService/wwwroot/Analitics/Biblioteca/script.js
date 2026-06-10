//@ts-check
import { WBarChart } from "../../WDevCore/WComponents/ChartsComponents/WBarChar.js";
import { WAjaxTools } from "../../WDevCore/WModules/WAjaxTools.js"


// ========================================================================
// CONFIGURACIÓN DE KPIs
// ========================================================================
const KPI_CONFIG = [
    {
        endpoint: "/api/ApiBiblioteca/ActualizacionNivel",
        chartContainer: "chart-kpi1",
        hipotesisContainer: "hipotesis-kpi1",
        title: "Año de Publicación por Nivel Educativo",
        GroupParams: ["Nivel_Educativo", "Anio_Publicacion"],
        EvalParams: ["Cantidad_Recursos"],
        Colors: ["#38bdf8", "#818cf8", "#34d399", "#fb923c", "#f472b6", "#a78bfa", "#fbbf24"]
    },
    {
        endpoint: "/api/ApiBiblioteca/EspaciosLectura",
        chartContainer: "chart-kpi2",
        hipotesisContainer: "hipotesis-kpi2",
        title: "Espacios de Lectura por Nivel Educativo",
        GroupParams: ["Nivel_Educativo", "Espacios_Lectura"],
        EvalParams: ["Cantidad_Recursos"],
        Colors: ["#34d399", "#38bdf8", "#818cf8", "#fb923c", "#f472b6", "#a78bfa", "#fbbf24"]
    },
    {
        endpoint: "/api/ApiBiblioteca/CoberturaTematica",
        chartContainer: "chart-kpi3",
        hipotesisContainer: "hipotesis-kpi3",
        title: "Cobertura por Categoría Temática",
        GroupParams: ["Categoria", "Grupo_Tematico"],
        EvalParams: ["Cantidad_Recursos"],
        Colors: ["#818cf8", "#38bdf8", "#34d399", "#fb923c", "#f472b6", "#fbbf24", "#a78bfa", "#22d3ee", "#f87171", "#4ade80", "#e879f9", "#facc15"]
    },
    {
        endpoint: "/api/ApiBiblioteca/PublicoObjetivo",
        chartContainer: "chart-kpi4",
        hipotesisContainer: "hipotesis-kpi4",
        title: "Recursos por Público Objetivo",
        GroupParams: ["Publico_Objetivo"],
        EvalParams: ["Cantidad_Recursos"],
        Colors: ["#38bdf8", "#f472b6", "#fbbf24"]
    },
    {
        endpoint: "/api/ApiBiblioteca/CoberturaAsignatura",
        chartContainer: "chart-kpi5",
        hipotesisContainer: "hipotesis-kpi5",
        title: "Cobertura por Asignatura",
        GroupParams: ["Tipo_Asignatura", "Asignatura"],
        EvalParams: ["Cantidad_Recursos"],
        Colors: ["#34d399", "#fb923c", "#818cf8", "#38bdf8", "#f472b6", "#fbbf24", "#a78bfa", "#22d3ee", "#f87171", "#4ade80", "#e879f9", "#facc15", "#6ee7b7", "#c084fc", "#fda4af", "#bef264", "#67e8f9", "#d946ef"]
    }
];

// ========================================================================
// CARGA INICIAL
// ========================================================================
window.onload = async () => {
    await cargarTodosLosKPIs();

    // Botón de filtros interactivos (WFilterControls)
    document.getElementById("btnAplicar")?.addEventListener("click", async () => {
        await cargarTodosLosKPIs();
    });
}

// ========================================================================
// FUNCIÓN PRINCIPAL DE CARGA
// ========================================================================
async function cargarTodosLosKPIs() {
    const desde = /** @type {HTMLInputElement} */ (document.getElementById("filterDesde"))?.value || "2015-01-01";
    const hasta = /** @type {HTMLInputElement} */ (document.getElementById("filterHasta"))?.value || "2027-12-31";

    for (const kpi of KPI_CONFIG) {
        await cargarKPI(kpi, desde, hasta);
    }
}

/**
 * Carga un KPI individual
 * @param {typeof KPI_CONFIG[0]} kpi
 * @param {string} desde
 * @param {string} hasta
 */
async function cargarKPI(kpi, desde, hasta) {
    const chartEl = document.getElementById(kpi.chartContainer);
    const hipEl = document.getElementById(kpi.hipotesisContainer);

    if (!chartEl) return;

    // Limpiar contenido anterior
    chartEl.innerHTML = '<div class="loading"></div>';
    if (hipEl) hipEl.innerHTML = '';

    try {
        const request = {
            "Desde": new Date(desde).toISOString(),
            "Hasta": new Date(hasta).toISOString(),
            "GroupParams": kpi.GroupParams,
            "EvalParams": kpi.EvalParams
        };

        const response = await WAjaxTools.PostRequest(kpi.endpoint, request);

        // Limpiar loading
        chartEl.innerHTML = '';

        // Renderizar gráfico de barras (NO pastel)
        chartEl.append(new WBarChart({
            // @ts-ignore
            data: response,
            GroupParams: kpi.GroupParams,
            EvalParams: kpi.EvalParams,
            title: kpi.title,
            Colors: kpi.Colors
        }));

        // Renderizar tarjetas de hipótesis
        if (hipEl && response.hipotesisTestResults) {
            hipEl.append(generarTarjetasHipotesis(response.hipotesisTestResults));
        }

    } catch (error) {
        chartEl.innerHTML = `<p style="color:#f87171; padding:1rem;">⚠️ Error al cargar: ${error}</p>`;
        console.error(`Error KPI ${kpi.title}:`, error);
    }
}

// ========================================================================
// GENERADOR DE TARJETAS DE HIPÓTESIS
// (Adaptado del ejemplo del profesor)
// ========================================================================
/**
 * Genera tarjetas HTML autocontenidas a partir de resultados de pruebas de hipótesis
 * @param {any[]} resultados
 */
function generarTarjetasHipotesis(resultados) {
    if (!Array.isArray(resultados) || resultados.length === 0) {
        return document.createElement("div");
    }

    const styles = `
    <style>
    .hypothesis-card {
        font-family: 'Inter', -apple-system, sans-serif;
        background: #0a0a0a;
        border: 1px solid #222222;
        border-radius: 8px;
        margin-top: 1.5rem;
        width: 100%;
        overflow: hidden;
        animation: fadeUp 0.5s ease forwards;
    }
    .hc-header {
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #222222;
        background: #111111;
    }
    .hc-header h2 { margin: 0 0 0.5rem; font-size: 1.1rem; font-weight: 500; color: #ededed; }
    .hc-header p { margin: 0; color: #a1a1aa; font-size: 0.85rem; font-weight: 400; line-height: 1.5; }
    .hc-meta { display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap; }
    .hc-tag { background: #222222; border: 1px solid #333333; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.75rem; color: #ededed; font-weight: 500; }
    
    .hc-metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        border-bottom: 1px solid #222222;
    }
    .hc-metric { padding: 1.25rem 1.5rem; border-right: 1px solid #222222; }
    .hc-metric:last-child { border-right: none; }
    .hc-metric .lbl { font-size: 0.7rem; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; margin-bottom: 0.5rem; }
    .hc-metric .val { font-size: 1.25rem; font-weight: 500; color: #ededed; letter-spacing: -0.02em; }
    
    .hc-decision {
        margin: 1.5rem;
        padding: 1rem 1.25rem;
        border-left: 3px solid #3b82f6;
        background: #111111;
        border-radius: 0 6px 6px 0;
    }
    .hc-decision.hc-ok { border-left-color: #10b981; }
    .hc-decision.hc-warn { border-left-color: #f59e0b; }
    .hc-decision h3 { margin: 0 0 0.25rem; font-size: 0.95rem; font-weight: 500; color: #ededed; }
    .hc-decision p { margin: 0; line-height: 1.5; color: #a1a1aa; font-size: 0.85rem; }

    .hc-section { padding: 0 1.5rem 1.5rem; }
    .hc-section h3 { margin: 0 0 1rem; font-size: 0.95rem; font-weight: 500; color: #ededed; padding-bottom: 0.5rem; }
    
    .hc-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-bottom: 1.5rem; }
    .hc-table th, .hc-table td { padding: 0.75rem 0; text-align: left; border-bottom: 1px solid #222222; }
    .hc-table th { font-weight: 500; color: #a1a1aa; }
    .hc-table td { color: #ededed; }
    
    .hc-recs ul { padding-left: 1.25rem; margin: 0; }
    .hc-recs li { margin: 0.5rem 0; line-height: 1.5; color: #a1a1aa; font-size: 0.85rem; }
    .hc-recs li::marker { color: #333333; }
    
    .hc-footer {
        background: #111111;
        padding: 1rem 1.5rem;
        font-size: 0.8rem;
        color: #71717a;
        border-top: 1px solid #222222;
    }
    .hc-footer strong { color: #a1a1aa; font-weight: 500; }
    </style>`;

    let html = styles;

    resultados.forEach((res, i) => {
        const fecha = res.FechaEjecucion
            ? new Date(res.FechaEjecucion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            : 'N/A';
        const rho = res.Estadistico_Principal != null ? Number(res.Estadistico_Principal).toFixed(3) : 'N/A';
        const pval = res.P_Value != null ? Number(res.P_Value).toExponential(3) : 'N/A';
        const ic = (res.IC_Inferior_95 != null && res.IC_Superior_95 != null)
            ? `[${Number(res.IC_Inferior_95).toFixed(3)}, ${Number(res.IC_Superior_95).toFixed(3)}]`
            : 'N/A';
        const decisionClass = res.Rechazar_Hipotesis_Nula ? 'hc-ok' : 'hc-warn';
        const icon = res.Rechazar_Hipotesis_Nula ? '✅' : '📌';

        // Tablas descriptivas
        let contHtml = '<table class="hc-table"><thead><tr><th>Variable</th><th>Media</th><th>Mediana</th><th>DE</th><th>Min</th><th>Max</th><th>N</th></tr></thead><tbody>';
        let catHtml = '<table class="hc-table"><thead><tr><th>Variable</th><th>Distribución (Valor: Cantidad)</th></tr></thead><tbody>';

        Object.entries(res.Estadisticos_Descriptivos || {}).forEach(([key, stats]) => {
            if (stats?.Media != null) {
                contHtml += `<tr>
                    <td>${key}</td><td>${stats.Media}</td><td>${stats.Mediana}</td>
                    <td>${stats.Desviacion_Estandar}</td><td>${stats.Minimo}</td><td>${stats.Maximo}</td><td>${stats.Count_Validos}</td>
                </tr>`;
            } else if (stats?.Distribucion_Categorica) {
                const dist = Object.entries(stats.Distribucion_Categorica).map(([k, v]) => `${k}: ${v}`).join(' • ');
                catHtml += `<tr><td>${key}</td><td>${dist}</td></tr>`;
            }
        });
        contHtml += '</tbody></table>';
        catHtml += '</tbody></table>';

        // Recomendaciones
        let recsList = '<li>Sin recomendaciones generadas.</li>';
        if (Array.isArray(res.Recomendaciones) && res.Recomendaciones.length > 0) {
            recsList = '';
            for (let j = 0; j < res.Recomendaciones.length; j++) {
                recsList += '<li>' + res.Recomendaciones[j] + '</li>';
            }
        }

        // Configuración usada
        const cfg = res.Config_Usada || {};
        const cfgText = `
            <strong>VI:</strong> ${cfg.Variable_Independiente || '-'} | 
            <strong>VD:</strong> ${cfg.Variable_Dependiente || '-'} | 
            <strong>Prueba:</strong> ${cfg.Tipo_Prueba || '-'} | 
            <strong>α:</strong> ${cfg.Alpha ?? '0.05'} |
            <strong>Agrupación:</strong> ${(cfg.Campos_Agrupacion || []).join(', ') || '-'} |
            <strong>Controles:</strong> ${(cfg.Variables_Control || []).join(', ') || '-'}
        `;

        html += `
        <article class="hypothesis-card" id="hc-${i}">
            <header class="hc-header">
                <h2>${res.NombreHipotesis || 'Prueba Estadística'}</h2>
                <p>${res.DescripcionHipotesis || ''}</p>
                <div class="hc-meta">
                    <span class="hc-tag">📅 ${fecha}</span>
                    <span class="hc-tag">📊 ${res.TotalRegistrosAnalizados || 0} registros</span>
                    <span class="hc-tag">👥 ${res.TotalUnicosAgrupacion || 0} unidades</span>
                </div>
            </header>

            <section class="hc-metrics">
                <div class="hc-metric"><div class="lbl">Estadístico</div><div class="val">${rho}</div></div>
                <div class="hc-metric"><div class="lbl">Valor-p</div><div class="val">${pval}</div></div>
                <div class="hc-metric"><div class="lbl">IC 95%</div><div class="val">${ic}</div></div>
                <div class="hc-metric"><div class="lbl">Tamaño Efecto</div><div class="val">${res.Tamanio_Efecto || '-'}</div></div>
            </section>

            <section class="hc-decision ${decisionClass}">
                <h3>${icon} Decisión Estadística</h3>
                <p>${res.Conclusion_Estadistica || 'Sin conclusión disponible.'}</p>
            </section>

            <section class="hc-section">
                <h3>📈 Estadísticos Descriptivos</h3>
                ${contHtml}
                ${catHtml}
            </section>

            <section class="hc-section hc-recs">
                <h3>💡 Recomendaciones</h3>
                <ul>${recsList}</ul>
            </section>

            <footer class="hc-footer">
                <strong>⚙️ Configuración de la Prueba:</strong><br>${cfgText}
            </footer>
        </article>`;
    });

    const div = document.createElement("div");
    div.innerHTML = html;
    return div;
}
