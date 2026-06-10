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
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        background: rgba(15, 23, 42, 0.4);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        margin: 2rem auto;
        max-width: 960px;
        overflow: hidden;
        animation: fadeUp 0.6s ease-out forwards;
    }
    .hc-header {
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
        padding: 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .hc-header h2 { margin: 0 0 0.5rem; font-size: 1.35rem; font-weight: 600; color: #f8fafc; display: flex; align-items: center; gap: 0.5rem; }
    .hc-header p { margin: 0; color: #94a3b8; font-size: 0.95rem; font-weight: 300; }
    .hc-meta { display: flex; gap: 0.75rem; margin-top: 1rem; flex-wrap: wrap; }
    .hc-tag { background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.2); padding: 0.35rem 0.8rem; border-radius: 20px; font-size: 0.75rem; color: #7dd3fc; font-weight: 500; letter-spacing: 0.5px; }
    
    .hc-metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 1.25rem;
        padding: 1.5rem;
        background: rgba(5, 11, 20, 0.5);
    }
    .hc-metric { text-align: center; padding: 1rem; background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; transition: transform 0.3s; }
    .hc-metric:hover { transform: translateY(-3px); border-color: rgba(56, 189, 248, 0.3); }
    .hc-metric .lbl { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    .hc-metric .val { font-size: 1.3rem; font-weight: 700; color: #f8fafc; margin-top: 0.4rem; text-shadow: 0 0 15px rgba(255,255,255,0.1); }
    
    .hc-decision {
        margin: 0.5rem 1.5rem 1.5rem;
        padding: 1.25rem;
        border-left: 4px solid #38bdf8;
        background: linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, transparent 100%);
        border-radius: 0 8px 8px 0;
    }
    .hc-decision.hc-ok { border-left-color: #34d399; background: linear-gradient(90deg, rgba(52, 211, 153, 0.1) 0%, transparent 100%); }
    .hc-decision.hc-warn { border-left-color: #fbbf24; background: linear-gradient(90deg, rgba(251, 191, 36, 0.1) 0%, transparent 100%); }
    .hc-decision h3 { margin: 0 0 0.5rem; font-size: 1.1rem; font-weight: 600; color: #f8fafc; }
    .hc-decision p { margin: 0; line-height: 1.6; color: #cbd5e1; font-size: 0.95rem; }

    .hc-section { padding: 0 1.5rem 1.5rem; }
    .hc-section h3 { margin: 0 0 1rem; font-size: 1.1rem; font-weight: 600; color: #f8fafc; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; }
    
    .hc-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.9rem; margin-bottom: 1rem; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
    .hc-table th, .hc-table td { padding: 0.8rem 1rem; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .hc-table th { background: rgba(15, 23, 42, 0.8); font-weight: 600; color: #94a3b8; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px; }
    .hc-table td { color: #e2e8f0; background: rgba(30, 41, 59, 0.2); }
    .hc-table tr:last-child td { border-bottom: none; }
    .hc-table tr:hover td { background: rgba(56, 189, 248, 0.05); }
    
    .hc-recs ul { padding-left: 1.5rem; margin: 0; }
    .hc-recs li { margin: 0.6rem 0; line-height: 1.6; color: #cbd5e1; position: relative; }
    .hc-recs li::marker { color: #38bdf8; }
    
    .hc-footer {
        background: rgba(15, 23, 42, 0.9);
        padding: 1.25rem 1.5rem;
        font-size: 0.85rem;
        color: #64748b;
        border-top: 1px solid rgba(255,255,255,0.05);
        word-break: break-word;
    }
    .hc-footer strong { color: #94a3b8; }
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
