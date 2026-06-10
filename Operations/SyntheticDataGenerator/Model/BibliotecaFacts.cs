using APPCORE;

namespace Operations.DataGenerator.Entities.Facts.Biblioteca
{
    // ========================================================================
    // HECHO: RECURSO EDUCATIVO
    // ========================================================================
    public class Fact_RecursoEducativo : EntityClass
    {
        [PrimaryKey(Identity = true)]
        public long? Id_Recurso { get; set; }
        public string? Titulo_Recurso { get; set; }
        public int? Id_NivelEducativo { get; set; }
        public int? Id_Categoria { get; set; }
        public int? Id_PublicoObjetivo { get; set; }
        public int? Id_Asignatura { get; set; }
        public int? Id_Tiempo { get; set; }
        public int? Anio_Publicacion { get; set; }
        public int? Espacios_Lectura { get; set; }
        public string? Tipo_Recurso { get; set; } // Libro, Manual, Guía, Cartilla
        public string? Formato { get; set; } // PDF, HTML, EPUB
        public int? Numero_Paginas { get; set; }
        public bool? Activo { get; set; }
        public DateTime? Fecha_Carga { get; set; }
    }
}
