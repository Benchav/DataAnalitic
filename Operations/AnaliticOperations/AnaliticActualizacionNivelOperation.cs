using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using APPCORE;
using Operations.AnaliticOperations.Model;
using Operations.EstadisticModule;
using Operations.Utility;
using static Operations.EstadisticModule.EstadisticConfig;

namespace Operations.AnaliticOperations
{
    /// <summary>
    /// KPI 1 - H1: Los recursos de educación técnica/secundaria presentan menor
    /// tasa de actualización comparados con primaria.
    /// Variables: nivel_educativo vs anio_publicacion
    /// </summary>
    public class AnaliticActualizacionNivelOperation
    {
        // Candado técnico #1: Diccionario estático de tipado ModelObject
        static readonly Dictionary<string, ModelProperty> ModelObject = new Dictionary<string, ModelProperty>
        {
            ["Anio_Publicacion"] = new ModelProperty { Type = "NUMBER" },
            ["Espacios_Lectura"] = new ModelProperty { Type = "NUMBER" },
            ["Cantidad_Recursos"] = new ModelProperty { Type = "NUMBER" }
        };

        public static async Task<object?> GetByPeriodo(DataAnaliticRequest request)
        {
            // Candado técnico #2: Consulta materializada con .Where<T>()
            var bdData = new V_Analisis_Biblioteca().Where<V_Analisis_Biblioteca>(
                FilterData.GreaterEqual("Fecha", request.Desde),
                FilterData.LessEqual("Fecha", request.Hasta)
            );

            // Configurar prueba estadística con Fluent API
            var config = new HipotesisTestConfig<V_Analisis_Biblioteca>()
                .ConVariableIndependiente("Nivel_Educativo")
                .ConVariableDependiente("Anio_Publicacion")
                .AgruparPor("Anio", "Nivel_Educativo")
                .ConSignificancia(0.05)
                .ConMinEfectoRelevante(0.10)
                .UsarPrueba("Spearman");

            var resultado = await HipotesisTestService.EjecutarPruebaAsync(bdData, config);

            // Ejecución del helper genérico de agrupación
            var result = DataGroupingHelper.GroupData(
                data: bdData.Cast<object>(),
                groupParams: request.GroupParams ?? new List<string>(),
                evalParams: request.EvalParams,
                modelObject: ModelObject,
                title: "Actualización por Nivel Educativo",
                isFinalGroupedData: true
            );

            result.hipotesisTestResults = new List<HipotesisTestResult> { resultado };
            return result;
        }
    }
}
