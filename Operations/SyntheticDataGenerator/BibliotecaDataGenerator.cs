using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Operations.DataGenerator.Entities.Dimensions.Biblioteca;
using Operations.DataGenerator.Entities.Facts.Biblioteca;
using APPCORE;
using Operations.SyntheticDataGenerator.Model;

namespace Operations.SyntheticDataGenerator
{
    // ========================================================================
    // CONFIGURACIÓN DE GENERACIÓN PARA BIBLIOTECA
    // ========================================================================
    public class BibliotecaGeneratorConfig
    {
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public int TotalRecursos { get; set; } = 2000;
        public int Seed { get; set; } = 42;
    }

    // ========================================================================
    // GENERADOR PRINCIPAL DE DATOS SINTÉTICOS - BIBLIOTECA MINED
    // ========================================================================
    public class BibliotecaDataGeneratorOperation
    {
        private readonly BibliotecaGeneratorConfig _config;
        private readonly Random _random;

        private List<Dim_NivelEducativo>? _niveles;
        private List<Dim_Categoria>? _categorias;
        private List<Dim_PublicoObjetivo>? _publicos;
        private List<Dim_Asignatura>? _asignaturas;

        public BibliotecaDataGeneratorOperation(BibliotecaGeneratorConfig config)
        {
            _config = config;
            _random = new Random(config.Seed);
        }

        // ====================================================================
        // MÉTODO ESTÁTICO DE ENTRADA - con validación Etl_Config
        // ====================================================================
        public static async Task Start()
        {
            var startDate = new DateTime(2015, 1, 1);
            var endDate = new DateTime(2026, 12, 31);
            var config = new BibliotecaGeneratorConfig
            {
                FechaInicio = startDate,
                FechaFin = endDate,
                TotalRecursos = 2000,
                Seed = 42
            };

            // RESTRICCIÓN CRÍTICA: Validación de control anti-duplicación
            var registroExistente = new Etl_Config().Find<Etl_Config>(
                FilterData.Equal("BeginDate", startDate),
                FilterData.Equal("EndDate", endDate)
            );

            if (registroExistente == null)
            {
                var generator = new BibliotecaDataGeneratorOperation(config);
                await generator.EjecutarGeneracionAsync();
                new Etl_Config
                {
                    Update_At = DateTime.Now,
                    BeginDate = startDate,
                    EndDate = endDate
                }.Save();
            }
            else
            {
                Console.WriteLine($"⚠️ Rango [{startDate:yyyy-MM-dd} a {endDate:yyyy-MM-dd}] YA PROCESADO - Biblioteca MINED");
            }
        }

        // ====================================================================
        // EJECUCIÓN PRINCIPAL
        // ====================================================================
        public async Task EjecutarGeneracionAsync()
        {
            Log("=== INICIANDO GENERACIÓN BIBLIOTECA DIGITAL MINED ===");

            await CargarDimensionesAsync();
            Log($"✓ Dimensiones: {_niveles?.Count ?? 0} niveles, {_categorias?.Count ?? 0} categorías, {_publicos?.Count ?? 0} públicos, {_asignaturas?.Count ?? 0} asignaturas");

            await GenerarRecursosEducativosAsync();
            await CrearVistaDesnormalizadaAsync();
            await ValidarConsistenciaAsync();

            Log("=== GENERACIÓN BIBLIOTECA COMPLETADA ===");
        }

        // ====================================================================
        // CARGA DE DIMENSIONES
        // ====================================================================
        private async Task CargarDimensionesAsync()
        {
            // Verificar si ya existen dimensiones, si no, crearlas
            _niveles = new Dim_NivelEducativo().SimpleGet<Dim_NivelEducativo>();
            if (_niveles == null || _niveles.Count == 0)
            {
                await SembrarNivelesEducativos();
                _niveles = new Dim_NivelEducativo().SimpleGet<Dim_NivelEducativo>();
            }

            _categorias = new Dim_Categoria().SimpleGet<Dim_Categoria>();
            if (_categorias == null || _categorias.Count == 0)
            {
                await SembrarCategorias();
                _categorias = new Dim_Categoria().SimpleGet<Dim_Categoria>();
            }

            _publicos = new Dim_PublicoObjetivo().SimpleGet<Dim_PublicoObjetivo>();
            if (_publicos == null || _publicos.Count == 0)
            {
                await SembrarPublicosObjetivo();
                _publicos = new Dim_PublicoObjetivo().SimpleGet<Dim_PublicoObjetivo>();
            }

            _asignaturas = new Dim_Asignatura().SimpleGet<Dim_Asignatura>();
            if (_asignaturas == null || _asignaturas.Count == 0)
            {
                await SembrarAsignaturas();
                _asignaturas = new Dim_Asignatura().SimpleGet<Dim_Asignatura>();
            }
        }

        // ====================================================================
        // SEMBRADO DE DIMENSIONES
        // ====================================================================
        private async Task SembrarNivelesEducativos()
        {
            var niveles = new[]
            {
                ("PRE", "Preescolar", "Educación inicial para niños de 3-5 años", 1),
                ("PRI", "Primaria", "Educación primaria regular de 1ro a 6to grado", 2),
                ("SEC", "Secundaria", "Educación secundaria de 7mo a 11vo grado", 3),
                ("TEC", "Técnico", "Formación técnica y profesional", 4),
                ("SUP", "Superior", "Educación universitaria y formación docente", 5),
                ("EDA", "Educación de Adultos", "Programas de alfabetización y educación continua", 6),
                ("ESP", "Educación Especial", "Programas de educación inclusiva", 7)
            };

            foreach (var (codigo, nombre, descripcion, orden) in niveles)
            {
                new Dim_NivelEducativo
                {
                    Codigo_Nivel = codigo,
                    Nombre_Nivel = nombre,
                    Descripcion = descripcion,
                    Orden_Academico = orden,
                    Activo = true,
                    Fecha_Carga = DateTime.Now
                }.Save();
            }
            Log("  ✓ Niveles educativos sembrados");
        }

        private async Task SembrarCategorias()
        {
            var categorias = new[]
            {
                ("MAT", "Matemáticas", "Recursos de aritmética, álgebra y geometría", "Ciencias Exactas"),
                ("LEN", "Lengua y Literatura", "Recursos de lectura, escritura y gramática", "Humanidades"),
                ("CCN", "Ciencias Naturales", "Recursos de biología, química y física", "Ciencias Exactas"),
                ("CSS", "Ciencias Sociales", "Recursos de historia, geografía y cívica", "Humanidades"),
                ("ING", "Inglés", "Recursos de lengua extranjera inglés", "Idiomas"),
                ("ART", "Educación Artística", "Recursos de música, dibujo y teatro", "Artes"),
                ("EFI", "Educación Física", "Recursos de deportes y salud", "Deportes"),
                ("TIC", "Tecnología e Informática", "Recursos de computación y TIC", "Tecnología"),
                ("MOR", "Moral y Cívica", "Valores, ética y convivencia", "Humanidades"),
                ("OPV", "Orientación para la Vida", "Desarrollo personal y vocacional", "Transversales"),
                ("AGR", "Agropecuaria", "Recursos de agricultura y ganadería", "Técnico"),
                ("PED", "Pedagogía", "Metodologías y guías para docentes", "Formación Docente")
            };

            foreach (var (codigo, nombre, descripcion, grupo) in categorias)
            {
                new Dim_Categoria
                {
                    Codigo_Categoria = codigo,
                    Nombre_Categoria = nombre,
                    Descripcion = descripcion,
                    Grupo_Tematico = grupo,
                    Activo = true,
                    Fecha_Carga = DateTime.Now
                }.Save();
            }
            Log("  ✓ Categorías temáticas sembradas");
        }

        private async Task SembrarPublicosObjetivo()
        {
            var publicos = new[]
            {
                ("EST", "Estudiantes", "Material dirigido a estudiantes"),
                ("DOC", "Docentes", "Material dirigido a docentes y facilitadores"),
                ("FAM", "Familias", "Material de apoyo para padres y tutores")
            };

            foreach (var (codigo, nombre, descripcion) in publicos)
            {
                new Dim_PublicoObjetivo
                {
                    Codigo_Publico = codigo,
                    Nombre_Publico = nombre,
                    Descripcion = descripcion,
                    Activo = true,
                    Fecha_Carga = DateTime.Now
                }.Save();
            }
            Log("  ✓ Públicos objetivo sembrados");
        }

        private async Task SembrarAsignaturas()
        {
            var asignaturas = new[]
            {
                ("MAT-PRI", "Matemáticas Primaria", "Principal", 2),
                ("LEN-PRI", "Lengua y Literatura Primaria", "Principal", 2),
                ("CCN-PRI", "Ciencias Naturales Primaria", "Principal", 2),
                ("CSS-PRI", "Ciencias Sociales Primaria", "Principal", 2),
                ("ING-PRI", "Inglés Primaria", "Complementaria", 2),
                ("ART-PRI", "Educación Artística Primaria", "Complementaria", 2),
                ("MAT-SEC", "Matemáticas Secundaria", "Principal", 3),
                ("LEN-SEC", "Lengua y Literatura Secundaria", "Principal", 3),
                ("CCN-SEC", "Ciencias Naturales Secundaria", "Principal", 3),
                ("CSS-SEC", "Ciencias Sociales Secundaria", "Principal", 3),
                ("ING-SEC", "Inglés Secundaria", "Complementaria", 3),
                ("TIC-SEC", "Tecnología Secundaria", "Complementaria", 3),
                ("FIS-SEC", "Física Secundaria", "Principal", 3),
                ("QUI-SEC", "Química Secundaria", "Principal", 3),
                ("PED-DOC", "Pedagogía Docente", "Principal", 5),
                ("OPV-SEC", "Orientación para la Vida", "Complementaria", 3),
                ("AGR-TEC", "Agropecuaria Técnico", "Principal", 4),
                ("TIC-TEC", "Tecnología Técnico", "Principal", 4)
            };

            // Cargar IDs de niveles para referencia
            var nivelesMap = _niveles?.ToDictionary(n => n.Orden_Academico ?? 0, n => n.Id_NivelEducativo ?? 0) 
                ?? new Dictionary<int, int>();

            foreach (var (codigo, nombre, tipo, nivelOrden) in asignaturas)
            {
                var idNivel = nivelesMap.GetValueOrDefault(nivelOrden, 1);
                new Dim_Asignatura
                {
                    Codigo_Asignatura = codigo,
                    Nombre_Asignatura = nombre,
                    Tipo_Asignatura = tipo,
                    Id_NivelEducativo = idNivel,
                    Activo = true,
                    Fecha_Carga = DateTime.Now
                }.Save();
            }
            Log("  ✓ Asignaturas sembradas");
        }

        // ====================================================================
        // OBTENER/CREAR FECHA (patrón del profesor)
        // ====================================================================
        private async Task<int> ObtenerOCrearFechaAsync(DateTime fecha)
        {
            var fechaExistente = new Dim_Tiempo_Biblioteca().Find<Dim_Tiempo_Biblioteca>(
                FilterData.Equal("Fecha", fecha.Date)
            );

            if (fechaExistente?.Id_Tiempo.HasValue == true)
            {
                return fechaExistente.Id_Tiempo.Value;
            }

            var nuevaFecha = new Dim_Tiempo_Biblioteca
            {
                Fecha = fecha.Date,
                Dia_Mes = fecha.Day,
                Dia_Semana = (int)fecha.DayOfWeek,
                Nombre_Dia = fecha.ToString("dddd", new System.Globalization.CultureInfo("es-ES")),
                Mes = fecha.Month,
                Nombre_Mes = fecha.ToString("MMMM", new System.Globalization.CultureInfo("es-ES")),
                Trimestre = (fecha.Month - 1) / 3 + 1,
                Semestre = fecha.Month <= 6 ? 1 : 2,
                Anio = fecha.Year,
                Semana_Anio = System.Globalization.CultureInfo.CurrentCulture.Calendar.GetWeekOfYear(
                    fecha, System.Globalization.CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday),
                Es_Fin_Semana = fecha.DayOfWeek == DayOfWeek.Saturday || fecha.DayOfWeek == DayOfWeek.Sunday,
                Es_Festivo = false,
                Es_Inicio_Mes = fecha.Day == 1,
                Es_Fin_Mes = fecha.Day == DateTime.DaysInMonth(fecha.Year, fecha.Month),
                Fecha_Carga = DateTime.Now
            };

            nuevaFecha.Save();

            var fechaGuardada = new Dim_Tiempo_Biblioteca().Find<Dim_Tiempo_Biblioteca>(
                FilterData.Equal("Fecha", fecha.Date)
            );

            return fechaGuardada?.Id_Tiempo ?? -1;
        }

        // ====================================================================
        // GENERACIÓN DE RECURSOS EDUCATIVOS
        // ====================================================================
        private async Task GenerarRecursosEducativosAsync()
        {
            var tiposRecurso = new[] { "Libro", "Manual", "Guía", "Cartilla", "Cuaderno de Trabajo", "Antología" };
            var formatos = new[] { "PDF", "PDF", "PDF", "HTML", "EPUB" }; // PDF más frecuente

            if (_niveles == null || _categorias == null || _publicos == null || _asignaturas == null)
            {
                Log("⚠️ ERROR: Dimensiones no cargadas correctamente");
                return;
            }

            for (int i = 0; i < _config.TotalRecursos; i++)
            {
                var nivel = _niveles[_random.Next(_niveles.Count)];
                var categoria = _categorias[_random.Next(_categorias.Count)];
                var asignatura = _asignaturas[_random.Next(_asignaturas.Count)];
                var tipo = tiposRecurso[_random.Next(tiposRecurso.Length)];
                var formato = formatos[_random.Next(formatos.Length)];

                // H1: Los recursos de educación técnica/secundaria tienen años de publicación más antiguos
                int anioPublicacion;
                var nivelNombre = nivel.Nombre_Nivel ?? "";
                if (nivelNombre == "Técnico" || nivelNombre == "Secundaria")
                {
                    // Sesgo: más recursos desactualizados (2010-2020)
                    anioPublicacion = _random.Next(2010, 2022);
                }
                else if (nivelNombre == "Primaria")
                {
                    // Sesgo: más recursos recientes (2018-2026)
                    anioPublicacion = _random.Next(2018, 2027);
                }
                else
                {
                    anioPublicacion = _random.Next(2012, 2027);
                }

                // H3: Espacios de lectura varían por nivel educativo
                int espaciosLectura;
                if (nivelNombre == "Primaria")
                {
                    espaciosLectura = _random.Next(50, 300);
                }
                else if (nivelNombre == "Secundaria")
                {
                    espaciosLectura = _random.Next(10, 120);
                }
                else if (nivelNombre == "Técnico")
                {
                    espaciosLectura = _random.Next(5, 80);
                }
                else
                {
                    espaciosLectura = _random.Next(15, 200);
                }

                // H6: Sesgo de público objetivo - más recursos para estudiantes que docentes
                Dim_PublicoObjetivo publico;
                var rndPublico = _random.NextDouble();
                if (rndPublico < 0.65)
                {
                    publico = _publicos.FirstOrDefault(p => p.Codigo_Publico == "EST") ?? _publicos[0];
                }
                else if (rndPublico < 0.88)
                {
                    publico = _publicos.FirstOrDefault(p => p.Codigo_Publico == "DOC") ?? _publicos[0];
                }
                else
                {
                    publico = _publicos.FirstOrDefault(p => p.Codigo_Publico == "FAM") ?? _publicos[0];
                }

                var fechaRecurso = new DateTime(anioPublicacion, _random.Next(1, 13), 1);
                var idTiempo = await ObtenerOCrearFechaAsync(fechaRecurso);

                var recurso = new Fact_RecursoEducativo
                {
                    Titulo_Recurso = $"{tipo} de {categoria.Nombre_Categoria} - {nivel.Nombre_Nivel} ({anioPublicacion})",
                    Id_NivelEducativo = nivel.Id_NivelEducativo,
                    Id_Categoria = categoria.Id_Categoria,
                    Id_PublicoObjetivo = publico.Id_PublicoObjetivo,
                    Id_Asignatura = asignatura.Id_Asignatura,
                    Id_Tiempo = idTiempo,
                    Anio_Publicacion = anioPublicacion,
                    Espacios_Lectura = espaciosLectura,
                    Tipo_Recurso = tipo,
                    Formato = formato,
                    Numero_Paginas = _random.Next(20, 500),
                    Activo = true,
                    Fecha_Carga = DateTime.Now
                };

                recurso.Save();

                if ((i + 1) % 500 == 0)
                {
                    Log($"  Generados {i + 1}/{_config.TotalRecursos} recursos...");
                }
            }

            Log($"✓ Total recursos generados: {_config.TotalRecursos}");
        }

        // ====================================================================
        // CREAR VISTA DESNORMALIZADA
        // ====================================================================
        private async Task CrearVistaDesnormalizadaAsync()
        {
            Log("Creando vista desnormalizada V_Analisis_Biblioteca...");

            var sql = @"
            IF OBJECT_ID('dbo.V_Analisis_Biblioteca', 'V') IS NOT NULL
                DROP VIEW dbo.V_Analisis_Biblioteca;
            ";

            try
            {
                SqlADOConexion.SQLM?.GDatos.TraerDatosSQL(sql);
            }
            catch (Exception ex)
            {
                Log($"  Nota al eliminar vista: {ex.Message}");
            }

            var createViewSql = @"
            CREATE VIEW dbo.V_Analisis_Biblioteca AS
            SELECT 
                f.Id_Recurso,
                f.Titulo_Recurso,
                -- Nivel Educativo
                f.Id_NivelEducativo,
                n.Nombre_Nivel AS Nivel_Educativo,
                n.Orden_Academico,
                -- Categoría
                f.Id_Categoria,
                c.Nombre_Categoria AS Categoria,
                c.Grupo_Tematico,
                -- Público Objetivo
                f.Id_PublicoObjetivo,
                p.Nombre_Publico AS Publico_Objetivo,
                -- Asignatura
                f.Id_Asignatura,
                a.Nombre_Asignatura AS Asignatura,
                a.Tipo_Asignatura,
                -- Métricas
                f.Anio_Publicacion,
                f.Espacios_Lectura,
                1 AS Cantidad_Recursos,
                -- Atributos del recurso
                f.Tipo_Recurso,
                f.Formato,
                f.Numero_Paginas,
                -- Tiempo
                t.Anio,
                t.Mes,
                t.Trimestre,
                t.Nombre_Mes,
                t.Fecha
            FROM Fact_RecursoEducativo f
            INNER JOIN Dim_NivelEducativo n ON f.Id_NivelEducativo = n.Id_NivelEducativo
            INNER JOIN Dim_Categoria c ON f.Id_Categoria = c.Id_Categoria
            INNER JOIN Dim_PublicoObjetivo p ON f.Id_PublicoObjetivo = p.Id_PublicoObjetivo
            INNER JOIN Dim_Asignatura a ON f.Id_Asignatura = a.Id_Asignatura
            INNER JOIN Dim_Tiempo_Biblioteca t ON f.Id_Tiempo = t.Id_Tiempo
            WHERE f.Activo = 1;
            ";

            try
            {
                SqlADOConexion.SQLM?.GDatos.TraerDatosSQL(createViewSql);
                Log("✓ Vista V_Analisis_Biblioteca creada exitosamente");
            }
            catch (Exception ex)
            {
                Log($"⚠️ Error creando vista: {ex.Message}");
            }
        }

        // ====================================================================
        // VALIDACIÓN
        // ====================================================================
        private async Task ValidarConsistenciaAsync()
        {
            Log("Validando consistencia...");

            var totalRecursos = new Fact_RecursoEducativo().Count();
            var totalNiveles = new Dim_NivelEducativo().Count();
            var totalCategorias = new Dim_Categoria().Count();

            Log($"✓ Recursos: {totalRecursos}");
            Log($"✓ Niveles educativos: {totalNiveles}");
            Log($"✓ Categorías: {totalCategorias}");
        }

        private void Log(string message) => Console.WriteLine(message);
    }
}
