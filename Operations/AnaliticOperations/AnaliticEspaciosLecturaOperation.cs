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
    /// KPI 2 - H3: La cantidad de espacios de lectura varía según nivel educativo.
    /// Variables: nivel_educativo vs espacios_lectura
    /// </summary>
    public class AnaliticEspaciosLecturaOperation
    {
        static readonly Dictionary<string, ModelProperty> ModelObject = new Dictionary<string, ModelProperty>
        {
            ["Espacios_Lectura"] = new ModelProperty { Type = "NUMBER" },
            ["Cantidad_Recursos"] = new ModelProperty { Type = "NUMBER" }
        };

        public static async Task<object?> GetByPeriodo(DataAnaliticRequest request)
        {
            var bdData = new V_Analisis_Biblioteca().Where<V_Analisis_Biblioteca>(
                FilterData.GreaterEqual("Fecha", request.Desde),
                FilterData.LessEqual("Fecha", request.Hasta)
            );

            var config = new HipotesisTestConfig<V_Analisis_Biblioteca>()
                .ConVariableIndependiente("Nivel_Educativo")
                .ConVariableDependiente("Espacios_Lectura")
                .AgruparPor("Anio", "Nivel_Educativo")
                .ConSignificancia(0.05)
                .ConMinEfectoRelevante(0.10)
                .UsarPrueba("Spearman");

            var resultado = await HipotesisTestService.EjecutarPruebaAsync(bdData, config);

            var result = DataGroupingHelper.GroupData(
                data: bdData.Cast<object>(),
                groupParams: request.GroupParams ?? new List<string>(),
                evalParams: request.EvalParams,
                modelObject: ModelObject,
                title: "Espacios de Lectura por Nivel Educativo",
                isFinalGroupedData: true
            );

            result.hipotesisTestResults = new List<HipotesisTestResult> { resultado };
            return result;
        }
    }
}
