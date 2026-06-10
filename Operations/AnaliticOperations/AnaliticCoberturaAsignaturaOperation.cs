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
    /// KPI 5 - Cobertura documental por asignaturas principales vs complementarias.
    /// Variables: asignatura vs cantidad_recursos
    /// </summary>
    public class AnaliticCoberturaAsignaturaOperation
    {
        static readonly Dictionary<string, ModelProperty> ModelObject = new Dictionary<string, ModelProperty>
        {
            ["Cantidad_Recursos"] = new ModelProperty { Type = "NUMBER" },
            ["Espacios_Lectura"] = new ModelProperty { Type = "NUMBER" }
        };

        public static async Task<object?> GetByPeriodo(DataAnaliticRequest request)
        {
            var bdData = new V_Analisis_Biblioteca().Where<V_Analisis_Biblioteca>(
                FilterData.GreaterEqual("Fecha", request.Desde),
                FilterData.LessEqual("Fecha", request.Hasta)
            );

            var config = new HipotesisTestConfig<V_Analisis_Biblioteca>()
                .ConVariableIndependiente("Tipo_Asignatura")
                .ConVariableDependiente("Cantidad_Recursos")
                .AgruparPor("Asignatura", "Tipo_Asignatura")
                .ConSignificancia(0.05)
                .ConMinEfectoRelevante(0.10)
                .UsarPrueba("Spearman");

            var resultado = await HipotesisTestService.EjecutarPruebaAsync(bdData, config);

            var result = DataGroupingHelper.GroupData(
                data: bdData.Cast<object>(),
                groupParams: request.GroupParams ?? new List<string>(),
                evalParams: request.EvalParams,
                modelObject: ModelObject,
                title: "Cobertura por Asignaturas",
                isFinalGroupedData: true
            );

            result.hipotesisTestResults = new List<HipotesisTestResult> { resultado };
            return result;
        }
    }
}
