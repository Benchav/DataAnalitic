using System;
using System.Collections.Generic;
using System.Linq;
using APPCORE;
using BusinessLogic.Connection;

namespace Operations.AnaliticOperations.Model
{
    public class V_Analisis_Biblioteca : EntityClass
    {
        // Identificadores
        [PrimaryKey(Identity = false)]
        public long? Id_Recurso { get; set; }

        // Dimensión: Nivel Educativo
        public int? Id_NivelEducativo { get; set; }
        public string? Nivel_Educativo { get; set; }
        public int? Orden_Academico { get; set; }

        // Dimensión: Categoría Temática
        public int? Id_Categoria { get; set; }
        public string? Categoria { get; set; }
        public string? Grupo_Tematico { get; set; }

        // Dimensión: Público Objetivo
        public int? Id_PublicoObjetivo { get; set; }
        public string? Publico_Objetivo { get; set; }

        // Dimensión: Asignatura
        public int? Id_Asignatura { get; set; }
        public string? Asignatura { get; set; }
        public string? Tipo_Asignatura { get; set; }

        // Métricas de análisis
        public int? Anio_Publicacion { get; set; }
        public int? Espacios_Lectura { get; set; }
        public int? Cantidad_Recursos { get; set; }

        // Atributos del recurso
        public string? Titulo_Recurso { get; set; }
        public string? Tipo_Recurso { get; set; }
        public string? Formato { get; set; }
        public int? Numero_Paginas { get; set; }

        // Dimensión Temporal
        public int? Anio { get; set; }
        public int? Mes { get; set; }
        public int? Trimestre { get; set; }
        public string? Nombre_Mes { get; set; }
        public DateTime? Fecha { get; set; }

        // ====================================================================
        // MÉTODOS DE CONSULTA ESPECÍFICOS
        // ====================================================================

        /// <summary>
        /// Obtiene datos filtrados por nivel educativo
        /// </summary>
        public List<V_Analisis_Biblioteca> PorNivelEducativo(string nivel)
        {
            return this.Where<V_Analisis_Biblioteca>(
                FilterData.Equal("Nivel_Educativo", nivel)
            );
        }

        /// <summary>
        /// Obtiene datos filtrados por categoría
        /// </summary>
        public List<V_Analisis_Biblioteca> PorCategoria(string categoria)
        {
            return this.Where<V_Analisis_Biblioteca>(
                FilterData.Equal("Categoria", categoria)
            );
        }

        /// <summary>
        /// Filtra por período temporal específico
        /// </summary>
        public List<V_Analisis_Biblioteca> PorPeriodo(int anio, int? trimestre = null)
        {
            var filtros = new List<FilterData>
            {
                FilterData.Equal("Anio", anio)
            };

            if (trimestre.HasValue)
            {
                filtros.Add(FilterData.Equal("Trimestre", trimestre.Value));
            }

            return this.Where<V_Analisis_Biblioteca>(filtros.ToArray());
        }
    }
}
