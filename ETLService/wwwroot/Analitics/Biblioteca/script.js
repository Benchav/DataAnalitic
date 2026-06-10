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
        font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
        margin: 1.5rem auto;
        max-width: 960px;
        overflow: hidden;
    }
    .hc-header {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        padding: 1.25rem;
        border-bottom: 1px solid #334155;
    }
    .hc-header h2 { margin: 0 0 0.5rem; font-size: 1.25rem; color: #e2e8f0; }
    .hc-header p { margin: 0; color: #94a3b8; font-size: 0.9rem; }
    .hc-meta { display: flex; gap: 0.75rem; margin-top: 0.75rem; flex-wrap: wrap; }
    .hc-tag { background: #334155; padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.75rem; color: #94a3b8; }
    
    .hc-metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 1rem;
        padding: 1.25rem;
        background: #0f172a;
    }
    .hc-metric { text-align: center; padding: 0.75rem; background: #1e293b; border: 1px solid #334155; border-radius: 8px; }
    .hc-metric .lbl { font-size: 0.7rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .hc-metric .val { font-size: 1.1rem; font-weight: 600; color: #e2e8f0; margin-top: 0.25rem; }
    
    .hc-decision {
        margin: 0 1.25rem;
        padding: 1rem;
        border-left: 4px solid #38bdf8;
        background: #0f172a;
        border-radius: 6px;
    }
    .hc-decision.hc-ok { border-left-color: #34d399; background: #022c22; }
    .hc-decision.hc-warn { border-left-color: #fbbf24; background: #1c1917; }
    .hc-decision h3 { margin: 0 0 0.5rem; font-size: 1rem; color: #e2e8f0; }
    .hc-decision p { margin: 0; line-height: 1.5; color: #cbd5e1; }

    .hc-section { padding: 1.25rem; }
    .hc-section h3 { margin: 0 0 1rem; font-size: 1.1rem; color: #e2e8f0; border-bottom: 2px solid #334155; padding-bottom: 0.5rem; }
    
    .hc-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-bottom: 1rem; }
    .hc-table th, .hc-table td { padding: 0.6rem 0.8rem; border: 1px solid #334155; text-align: left; }
    .hc-table th { background: #0f172a; font-weight: 600; color: #94a3b8; }
    .hc-table td { color: #cbd5e1; }
    
    .hc-recs ul { padding-left: 1.25rem; margin: 0; }
    .hc-recs li { margin: 0.5rem 0; line-height: 1.5; color: #cbd5e1; }
    
    .hc-footer {
        background: #0f172a;
        padding: 1rem 1.25rem;
        font-size: 0.8rem;
        color: #64748b;
        border-top: 1px solid #334155;
        word-break: break-word;
    }
    .hc-footer strong { color: #e2e8f0; }
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
        const recsList = (res.Recomendaciones || []).map(r => `<li>${r}</li>`).join('') || '<li>Sin recomendaciones generadas.</li>';

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
