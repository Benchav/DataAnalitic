using System;
using System.ComponentModel.DataAnnotations;
using APPCORE;

namespace Operations.DataGenerator.Entities.Dimensions.Biblioteca
{
    // ========================================================================
    // DIMENSIÓN: NIVEL EDUCATIVO
    // ========================================================================
    public class Dim_NivelEducativo : EntityClass
    {
        [PrimaryKey(Identity = true)]
        public int? Id_NivelEducativo { get; set; }
        public string? Codigo_Nivel { get; set; }
        public string? Nombre_Nivel { get; set; }
        public string? Descripcion { get; set; }
        public int? Orden_Academico { get; set; }
        public bool? Activo { get; set; }
        public DateTime? Fecha_Carga { get; set; }
    }

    // ========================================================================
    // DIMENSIÓN: CATEGORÍA TEMÁTICA
    // ========================================================================
    public class Dim_Categoria : EntityClass
    {
        [PrimaryKey(Identity = true)]
        public int? Id_Categoria { get; set; }
        public string? Codigo_Categoria { get; set; }
        public string? Nombre_Categoria { get; set; }
        public string? Descripcion { get; set; }
        public string? Grupo_Tematico { get; set; }
        public bool? Activo { get; set; }
        public DateTime? Fecha_Carga { get; set; }
    }

    // ========================================================================
    // DIMENSIÓN: PÚBLICO OBJETIVO
    // ========================================================================
    public class Dim_PublicoObjetivo : EntityClass
    {
        [PrimaryKey(Identity = true)]
        public int? Id_PublicoObjetivo { get; set; }
        public string? Codigo_Publico { get; set; }
        public string? Nombre_Publico { get; set; }
        public string? Descripcion { get; set; }
        public bool? Activo { get; set; }
        public DateTime? Fecha_Carga { get; set; }
    }

    // ========================================================================
    // DIMENSIÓN: ASIGNATURA
    // ========================================================================
    public class Dim_Asignatura : EntityClass
    {
        [PrimaryKey(Identity = true)]
        public int? Id_Asignatura { get; set; }
        public string? Codigo_Asignatura { get; set; }
        public string? Nombre_Asignatura { get; set; }
        public string? Tipo_Asignatura { get; set; } // "Principal" o "Complementaria"
        public int? Id_NivelEducativo { get; set; }
        public bool? Activo { get; set; }
        public DateTime? Fecha_Carga { get; set; }
    }

    // ========================================================================
    // DIMENSIÓN: TIEMPO (reutilizamos la misma estructura del profesor)
    // ========================================================================
    public class Dim_Tiempo_Biblioteca : EntityClass
    {
        [PrimaryKey(Identity = true)]
        public int? Id_Tiempo { get; set; }
        public DateTime? Fecha { get; set; }
        public int? Dia_Mes { get; set; }
        public int? Dia_Semana { get; set; }
        public string? Nombre_Dia { get; set; }
        public int? Mes { get; set; }
        public string? Nombre_Mes { get; set; }
        public int? Trimestre { get; set; }
        public int? Semestre { get; set; }
        public int? Anio { get; set; }
        public int? Semana_Anio { get; set; }
        public bool? Es_Fin_Semana { get; set; }
        public bool? Es_Festivo { get; set; }
        public bool? Es_Inicio_Mes { get; set; }
        public bool? Es_Fin_Mes { get; set; }
        public DateTime? Fecha_Carga { get; set; }
    }
}
