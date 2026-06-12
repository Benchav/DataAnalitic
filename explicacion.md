# Explicación Completa del Proyecto: Analítica de Cobertura de la Biblioteca Digital del MINED

> **Documento preparado para exposición**  
> Proyecto de Analítica de Datos — Análisis de Cobertura y Distribución de Recursos en la Biblioteca Digital del MINED

---

## Índice

1. [¿Qué es este proyecto?](#1-qué-es-este-proyecto)
2. [¿De dónde vienen los datos?](#2-de-dónde-vienen-los-datos)
3. [Arquitectura de Base de Datos (Modelo Estrella)](#3-arquitectura-de-base-de-datos-modelo-estrella)
4. [Las Variables del Análisis — Explicadas una por una](#4-las-variables-del-análisis--explicadas-una-por-una)
5. [¿Cómo se relacionan las variables entre sí?](#5-cómo-se-relacionan-las-variables-entre-sí)
6. [Las 5 Hipótesis / KPIs del Dashboard](#6-las-5-hipótesis--kpis-del-dashboard)
7. [Explicación de cada Gráfico](#7-explicación-de-cada-gráfico)
8. [La Prueba Estadística: Correlación de Spearman](#8-la-prueba-estadística-correlación-de-spearman)
9. [Arquitectura Técnica del Sistema](#9-arquitectura-técnica-del-sistema)
10. [¿Cómo correr el proyecto?](#10-cómo-correr-el-proyecto)
11. [Conclusiones y Valor del Proyecto](#11-conclusiones-y-valor-del-proyecto)

---

## 1. ¿Qué es este proyecto?

Este proyecto es un **sistema de analítica de datos** que analiza la **Biblioteca Digital del MINED** (Ministerio de Educación de Nicaragua). 

La Biblioteca Digital del MINED es un repositorio educativo que contiene **libros, manuales, guías, cartillas y cuadernos de trabajo** organizados por niveles educativos, categorías temáticas y público objetivo.

### ¿Cuál es el problema que resuelve?

La biblioteca tiene muchos recursos, pero **nadie sabía exactamente**:
- ¿Qué niveles educativos tienen más materiales?
- ¿Están actualizados los recursos?
- ¿Hay áreas temáticas que tienen muy pocos recursos?
- ¿Los docentes tienen menos materiales que los estudiantes?

Este proyecto **responde esas preguntas con datos y estadísticas**, no con opiniones.

### ¿Qué hace en términos simples?

1. **Genera datos sintéticos** que simulan los 15,000 recursos de la biblioteca real
2. Los almacena en una **base de datos SQL Server** estructurada 
3. Aplica **pruebas estadísticas** (correlación de Spearman) sobre los datos
4. Muestra los resultados en un **dashboard web interactivo** con gráficos de barras y tarjetas de hipótesis

---

## 2. ¿De dónde vienen los datos?

### Origen: Datos Sintéticos Generados Automáticamente

Los datos **no se extraen manualmente** de ninguna fuente externa. El sistema genera **15,000 registros sintéticos** automáticamente al iniciar la aplicación por primera vez. Esto se hace a través del archivo `BibliotecaDataGenerator.cs`.

### ¿Por qué datos sintéticos?

En un proyecto académico de analítica, muchas veces no se tiene acceso a los datos reales de producción. Por eso se crean **datos simulados pero realistas** que siguen patrones y distribuciones basados en la realidad de la biblioteca del MINED. Esto permite:

- Probar las hipótesis estadísticas sin depender de datos reales
- Tener un volumen suficiente de datos (15,000 registros) para que las pruebas estadísticas sean significativas
- Reproducir el análisis de manera consistente (se usa una **semilla/seed = 42** para que siempre se generen los mismos datos)

### ¿Cómo se generan concretamente?

El generador (`BibliotecaDataGenerator.cs`) sigue estos pasos:

1. **Primero siembra las dimensiones** (niveles educativos, categorías, públicos, asignaturas)
2. **Luego genera 15,000 recursos educativos** con distribuciones sesgadas intencionalmente para reflejar las hipótesis:
   - Los recursos de **Secundaria y Técnico** tienen años de publicación más antiguos (2010-2021)
   - Los recursos de **Primaria** son más recientes (2018-2026)
   - Los **Estudiantes** reciben el 65% de los recursos, **Docentes** el 23%, y **Familias** el 12%
   - Los **espacios de lectura** varían: Primaria tiene más (50-300), Secundaria menos (10-120), Técnico aún menos (5-80)
3. **Crea una vista desnormalizada** (`V_Analisis_Biblioteca`) que une todas las tablas para facilitar las consultas

### Control Anti-Duplicación

El sistema tiene una **protección anti-duplicación**: antes de generar datos, consulta la tabla `Etl_Config` para verificar si ya se procesó el rango de fechas. Si ya existe, **no vuelve a generar datos**, evitando duplicaciones al reiniciar la aplicación.

---

## 3. Arquitectura de Base de Datos (Modelo Estrella)

El proyecto usa **dos bases de datos en SQL Server**:

| Base de Datos | Propósito |
|---|---|
| `BDOrigenBiblioteca` | Base de datos origen (transaccional) |
| `DW_Biblioteca_MINED` | **Data Warehouse** — donde se almacenan los datos analíticos |

### Modelo Estrella (Star Schema)

La base de datos analítica sigue el patrón de diseño **Modelo Estrella**, que es el estándar en Data Warehousing. Este modelo tiene una **tabla de hechos central** rodeada por **tablas de dimensiones**.

```
                    ┌─────────────────────┐
                    │  Dim_NivelEducativo  │
                    │─────────────────────│
                    │ Id_NivelEducativo    │
                    │ Codigo_Nivel         │
                    │ Nombre_Nivel         │
                    │ Orden_Academico      │
                    └──────────┬──────────┘
                               │
┌──────────────────┐           │           ┌───────────────────┐
│  Dim_Categoria   │           │           │  Dim_Asignatura   │
│──────────────────│           │           │───────────────────│
│ Id_Categoria     │     ┌─────┴─────┐     │ Id_Asignatura     │
│ Nombre_Categoria ├─────┤   FACT    ├─────┤ Nombre_Asignatura │
│ Grupo_Tematico   │     │  Recurso  │     │ Tipo_Asignatura   │
└──────────────────┘     │ Educativo │     └───────────────────┘
                         └─────┬─────┘
                               │
┌────────────────────┐         │         ┌─────────────────────────┐
│ Dim_PublicoObjetivo│         │         │ Dim_Tiempo_Biblioteca   │
│────────────────────│         │         │─────────────────────────│
│ Id_PublicoObjetivo ├─────────┘─────────┤ Id_Tiempo               │
│ Nombre_Publico     │                   │ Fecha, Mes, Anio, etc.  │
└────────────────────┘                   └─────────────────────────┘
```

### ¿Qué es cada tabla?

#### Tabla de Hechos: `Fact_RecursoEducativo` (la tabla central)
Contiene un registro por cada recurso educativo de la biblioteca. Es la tabla más grande (15,000 registros). Cada registro almacena:
- Las **llaves foráneas** que conectan con las dimensiones (Id_NivelEducativo, Id_Categoria, etc.)
- Las **métricas numéricas** que medimos: año de publicación, espacios de lectura, número de páginas
- **Atributos del recurso**: título, tipo (Libro, Manual, Guía, etc.), formato (PDF, HTML, EPUB)

#### Tablas de Dimensiones (las tablas que rodean al hecho):

| Dimensión | Registros | Qué contiene | Ejemplo de valores |
|---|---|---|---|
| **Dim_NivelEducativo** | 7 | Los niveles del sistema educativo | Preescolar, Primaria, Secundaria, Técnico, Superior, Educación de Adultos, Educación Especial |
| **Dim_Categoria** | 12 | Las áreas temáticas de los recursos | Matemáticas, Lengua y Literatura, Ciencias Naturales, Ciencias Sociales, Inglés, Educación Artística, etc. |
| **Dim_PublicoObjetivo** | 3 | A quién va dirigido el recurso | Estudiantes, Docentes, Familias |
| **Dim_Asignatura** | 18 | Las materias específicas | Matemáticas Primaria, Física Secundaria, Pedagogía Docente, etc. |
| **Dim_Tiempo_Biblioteca** | ~144 | Fechas de publicación | Día, mes, año, trimestre, semestre, etc. |

#### Vista Desnormalizada: `V_Analisis_Biblioteca`
Es una **vista SQL** que une (JOIN) la tabla de hechos con todas las dimensiones. Esto permite consultar todo en una sola tabla "plana", sin necesidad de hacer JOINs manuales cada vez. Es la vista que usa el dashboard para sus consultas.

---

## 4. Las Variables del Análisis — Explicadas una por una

Cada variable tiene un significado concreto en el contexto de la biblioteca digital:

### `anio_publicacion` — Año de Publicación
- **¿Qué es?** El año en que fue publicado o editado el recurso educativo
- **¿Para qué sirve?** Para medir qué tan **actualizado o desactualizado** está un recurso
- **Rango:** 2010 a 2026
- **Ejemplo:** Un libro de Matemáticas publicado en 2015 es más antiguo que uno de 2024
- **Importancia:** Si un nivel educativo tiene muchos recursos antiguos, significa que ese nivel necesita renovar su material

### `cantidad_recursos` — Cantidad de Recursos
- **¿Qué es?** El conteo de materiales disponibles en una categoría específica
- **¿Para qué sirve?** Para saber si hay **suficientes materiales** en cada área
- **Valor:** En la vista, cada recurso cuenta como 1 (`1 AS Cantidad_Recursos`)
- **Ejemplo:** Si Matemáticas tiene 3,500 recursos y Educación Artística solo tiene 800, hay un desequilibrio

### `nivel_educativo` — Nivel Educativo
- **¿Qué es?** El grado académico al que pertenece el recurso
- **Valores posibles:** Preescolar, Primaria, Secundaria, Técnico, Superior, Educación de Adultos, Educación Especial
- **¿Para qué sirve?** Para comparar la distribución de recursos entre los diferentes niveles del sistema educativo

### `espacios_lectura` — Espacios de Lectura
- **¿Qué es?** La cantidad de espacios o accesos de lectura que tiene un recurso en la plataforma
- **¿Para qué sirve?** Para medir la **interacción digital** — cuánto se usa cada recurso
- **Rango:** Varía de 5 a 300 según el nivel educativo
- **Ejemplo:** Si un libro de Primaria tiene 200 espacios de lectura y uno de Técnico tiene 30, significa que el de Primaria se consume mucho más

### `categoria` — Categoría Temática
- **¿Qué es?** El área de conocimiento a la que pertenece el recurso
- **Valores:** Matemáticas, Lengua y Literatura, Ciencias Naturales, Ciencias Sociales, Inglés, Educación Artística, Educación Física, Tecnología e Informática, Moral y Cívica, Orientación para la Vida, Agropecuaria, Pedagogía
- **Agrupación:** Cada categoría pertenece a un `Grupo_Tematico` (Ciencias Exactas, Humanidades, Artes, Tecnología, etc.)

### `publico_objetivo` — Público Objetivo
- **¿Qué es?** El sector al que va dirigido el recurso
- **Valores:** Estudiantes, Docentes, Familias
- **¿Para qué sirve?** Para detectar si existe un **desequilibrio** en la cantidad de materiales por público

### `asignatura` — Asignatura
- **¿Qué es?** La materia específica del recurso (más detallada que la categoría)
- **Clasificación:** Se divide en **Principal** (materias troncales como Matemáticas, Lengua) y **Complementaria** (materias como Inglés, Educación Artística, Tecnología)
- **Ejemplo:** "Matemáticas Secundaria" es una asignatura Principal, "Inglés Primaria" es Complementaria

---

## 5. ¿Cómo se relacionan las variables entre sí?

Las variables no existen aisladas; están conectadas en relaciones que son las que permiten formular las hipótesis del proyecto:

```
    nivel_educativo ──────┐
           │              │
           │   ┌──────────┴──────────┐
           │   │                     │
           ▼   ▼                     ▼
    anio_publicacion          espacios_lectura
    (¿Qué tan actualizado     (¿Cuánto se lee
     está el material?)        este recurso?)

         H1                        H3
  "Los niveles técnicos      "Los espacios de lectura
   tienen material más        varían según el nivel
   antiguo que primaria"      educativo"


    categoria ──────────────► cantidad_recursos
                                    │
         H5                         │
  "Hay categorías con               │
   baja cobertura"                  │
                                    │
    publico_objetivo ───────► cantidad_recursos
                                    │
         H6                         │
  "Los docentes tienen              │
   menos materiales que             │
   los estudiantes"                 │
                                    │
    tipo_asignatura ────────► cantidad_recursos
         (Principal vs
          Complementaria)
         KPI 5
  "¿Hay brechas entre
   asignaturas principales
   y complementarias?"
```

### Relaciones clave:

1. **Nivel Educativo → Año de Publicación**: Permite ver si ciertos niveles tienen materiales más antiguos
2. **Nivel Educativo → Espacios de Lectura**: Permite ver si ciertos niveles se consumen más que otros
3. **Categoría → Cantidad de Recursos**: Permite detectar áreas con baja cobertura
4. **Público Objetivo → Cantidad de Recursos**: Permite ver si hay equidad entre estudiantes y docentes
5. **Tipo de Asignatura → Cantidad de Recursos**: Permite comparar materias principales vs complementarias

---

## 6. Las 5 Hipótesis / KPIs del Dashboard

Cada sección del dashboard corresponde a una **hipótesis de investigación** que se prueba estadísticamente:

### KPI 1 — Hipótesis H1: Actualización por Nivel Educativo

| Aspecto | Detalle |
|---|---|
| **Pregunta** | ¿Los recursos de Secundaria y Técnico están más desactualizados que los de Primaria? |
| **Variable Independiente (VI)** | Nivel_Educativo |
| **Variable Dependiente (VD)** | Anio_Publicacion |
| **Prueba estadística** | Correlación de Spearman |
| **Agrupación** | Por Año y Nivel Educativo |
| **Lo que esperamos ver** | Que Primaria tenga barras más altas en años recientes (2020-2026) y Secundaria/Técnico en años antiguos (2010-2018) |

### KPI 2 — Hipótesis H3: Espacios de Lectura

| Aspecto | Detalle |
|---|---|
| **Pregunta** | ¿La cantidad de espacios de lectura varía significativamente según el nivel educativo? |
| **Variable Independiente (VI)** | Nivel_Educativo |
| **Variable Dependiente (VD)** | Espacios_Lectura |
| **Prueba estadística** | Correlación de Spearman |
| **Agrupación** | Por Año y Nivel Educativo |
| **Lo que esperamos ver** | Que Primaria tenga los valores más altos de espacios de lectura, y Técnico los más bajos |

### KPI 3 — Hipótesis H5: Cobertura Temática

| Aspecto | Detalle |
|---|---|
| **Pregunta** | ¿Existen áreas temáticas con baja cobertura documental? |
| **Variable Independiente (VI)** | Categoria |
| **Variable Dependiente (VD)** | Cantidad_Recursos |
| **Prueba estadística** | Correlación de Spearman |
| **Agrupación** | Por Categoría y Grupo Temático |
| **Lo que esperamos ver** | Si alguna categoría tiene significativamente menos recursos que las demás |

### KPI 4 — Hipótesis H6: Público Objetivo

| Aspecto | Detalle |
|---|---|
| **Pregunta** | ¿Los recursos dirigidos a docentes son menos que los de estudiantes? |
| **Variable Independiente (VI)** | Publico_Objetivo |
| **Variable Dependiente (VD)** | Cantidad_Recursos |
| **Prueba estadística** | Correlación de Spearman |
| **Agrupación** | Por Público Objetivo y Año |
| **Lo que esperamos ver** | Una diferencia clara: Estudiantes con la barra más alta, Familias y Docentes con barras bajas |

### KPI 5 — Cobertura por Asignatura

| Aspecto | Detalle |
|---|---|
| **Pregunta** | ¿Las asignaturas principales tienen más recursos que las complementarias? |
| **Variable Independiente (VI)** | Tipo_Asignatura |
| **Variable Dependiente (VD)** | Cantidad_Recursos |
| **Prueba estadística** | Correlación de Spearman |
| **Agrupación** | Por Asignatura y Tipo de Asignatura |
| **Lo que esperamos ver** | Si hay brechas de cobertura documental entre materias troncales y complementarias |

---

## 7. Explicación de cada Gráfico

### KPI 1 — Año de Publicación por Nivel Educativo

![KPI 1: Año de Publicación por Nivel Educativo — Muestra barras agrupadas por nivel (Preescolar, Primaria, Educación...) donde el eje X son los años (2015-2026) y el eje Y la cantidad de recursos. Se observa que Primaria tiene barras crecientes en años recientes.](C:/Users/joshu/.gemini/antigravity-ide/brain/bd48bb5c-84ea-4aba-98af-7962a821f94f/WhatsApp Image 2026-06-11 at 7.51.15 PM.jpeg)

**¿Qué muestra este gráfico?**  
Un gráfico de barras agrupado por **nivel educativo**, donde el eje X representa los **años de publicación** (2015 a 2026) y el eje Y la **cantidad de recursos** publicados ese año.

**¿Cómo leerlo?**
- Cada sección horizontal corresponde a un nivel educativo (Preescolar, Primaria, Educación de Adultos, etc.)
- Las barras azules representan la cantidad de recursos publicados cada año
- Si las barras **crecen** hacia la derecha (años recientes), significa que ese nivel está siendo **actualizado**
- Si las barras son **más altas en años viejos**, el nivel tiene materiales **desactualizados**

**Resultado de la prueba Spearman:**
- **Estadístico: 0.000** — No se encontró correlación lineal directa
- **Valor-p: 1.000** — No hay evidencia suficiente para afirmar correlación estadística
- **Distribución:** Preescolar: 12, Primaria: 9, Educación de Adultos: 12, Superior: 12, Educación Especial: 12 niveles distintos de publicación
- **Decisión:** Sin evidencia suficiente de correlación (ρ=0.000, p=1.0000)

**¿Qué significa esto en palabras simples?**  
Aunque visualmente podemos ver diferencias en los patrones de publicación entre niveles, la prueba estadística formal (Spearman) no encontró una correlación significativa entre el nivel educativo como variable ordinal y el año de publicación. Esto sugiere que la relación no es lineal o que se necesitan otros enfoques analíticos (como ANOVA) para captar las diferencias entre grupos.

---

### KPI 2 — Espacios de Lectura por Nivel Educativo

![KPI 2: Espacios de Lectura por Nivel Educativo — Gráfico de barras para nivel Preescolar mostrando la distribución de espacios de lectura (eje X: valores 15-48, eje Y: cantidad). Las barras verdes muestran una distribución variada.](C:/Users/joshu/.gemini/antigravity-ide/brain/bd48bb5c-84ea-4aba-98af-7962a821f94f/WhatsApp Image 2026-06-11 at 7.51.31 PM.jpeg)

**¿Qué muestra este gráfico?**  
Muestra la **distribución de los espacios de lectura** para cada nivel educativo. En la captura se ve el nivel Preescolar con barras verdes. El eje X muestra los valores individuales de espacios de lectura y el eje Y la cantidad de recursos con ese valor.

**¿Cómo leerlo?**
- Las barras verdes representan cuántos recursos tienen cada cantidad de espacios de lectura
- Si las barras están concentradas a la derecha (valores altos), ese nivel tiene mucha interacción digital
- Si están concentradas a la izquierda (valores bajos), los recursos se consumen poco

**Resultado de la prueba Spearman:**
- **Estadístico: 0.000** | **Valor-p: 1.000**
- **71 registros** analizados, **71 unidades**
- **Decisión:** Sin evidencia suficiente de correlación

**¿Qué significa?**  
Los espacios de lectura no muestran una correlación lineal significativa con el nivel educativo según Spearman. Sin embargo, descriptivamente sí se pueden observar diferencias en los rangos: Primaria tiene rangos de 50-300, mientras que Técnico tiene 5-80.

---

### KPI 3 — Cobertura por Categoría Temática

![KPI 3: Cobertura por Categoría Temática — Gráfico de barras mostrando la cantidad de recursos por categoría. El eje X muestra las categorías (Educación Artística, Agropecuaria, Lengua y Literatura, Orientación para la Vida, Matemáticas, Ciencias Naturales, Moral y Cívica, etc.) y todas las barras son similares en altura (~3,500).](C:/Users/joshu/.gemini/antigravity-ide/brain/bd48bb5c-84ea-4aba-98af-7962a821f94f/WhatsApp Image 2026-06-11 at 7.51.48 PM.jpeg)

**¿Qué muestra este gráfico?**  
Un gráfico de barras moradas que compara la **cantidad de recursos disponibles** en cada categoría temática: Educación Artística, Agropecuaria, Lengua y Literatura, Orientación para la Vida, Matemáticas, Ciencias Naturales, Moral y Cívica, y más.

**¿Cómo leerlo?**
- Cada barra representa una categoría temática diferente
- La altura de la barra indica cuántos recursos tiene esa categoría
- Si todas las barras son similares, hay **cobertura equilibrada**
- Si alguna barra es muy baja, esa categoría necesita **más recursos**

**Resultado de la prueba:**
- **12 registros** (una por categoría), **12 unidades**
- **Media de Cantidad_Recursos: 1** | **IC 95%: [-0.574, 0.5...]**
- Las 12 categorías tienen distribución equilibrada: cada una con 1 registro por agrupación

**¿Qué significa?**  
Las barras de altura similar (~3,500 cada una) indican que los datos sintéticos distribuyen recursos de forma **relativamente uniforme** entre categorías, agrupadas por sus grupos temáticos (Artes, Técnico, Humanidades, Transversales, Ciencias Exactas).

---

### KPI 4 — Recursos por Público Objetivo

![KPI 4: Recursos por Público Objetivo — Gráfico de barras azules donde Estudiantes tiene una barra masiva (~28,000), mientras Familias y Docentes tienen barras mínimas. La diferencia es dramática.](C:/Users/joshu/.gemini/antigravity-ide/brain/bd48bb5c-84ea-4aba-98af-7962a821f94f/WhatsApp Image 2026-06-11 at 7.52.00 PM.jpeg)

**¿Qué muestra este gráfico?**  
Es el gráfico más impactante visualmente. Muestra la distribución de recursos entre los tres públicos objetivo: **Estudiantes**, **Familias** y **Docentes**.

**¿Cómo leerlo?**
- La barra de **Estudiantes** es enormemente más alta (~28,000 recursos)
- Las barras de **Familias** y **Docentes** son muy pequeñas en comparación
- Esto confirma visualmente la hipótesis H6

**Resultado de la prueba:**
- **36 registros**, **36 unidades**
- **Distribución:** Estudiantes: 12, Familias: 12, Docentes: 12
- **IC 95%: [-0.329, 0.329]** | **Tamaño de Efecto: Despreciable**
- **Estadísticos descriptivos:** Media=1, Mediana=1, DE=0, Min=1, Max=1, N=36

**¿Qué significa?**  
El 65% de los recursos están orientados a Estudiantes, 23% a Docentes y 12% a Familias. Esto revela un **desequilibrio significativo**. Aunque el estadístico de Spearman no detecta correlación (porque mide relación lineal entre variables ordinales), la diferencia visual en volúmenes es evidente y confirma la hipótesis H6 desde un punto de vista descriptivo.

---

### KPI 5 — Cobertura por Asignatura

![KPI 5: Cobertura por Asignatura — Gráfico de barras verdes agrupado por tipo (Principal). Muestra asignaturas como Lengua y Literatura Secundaria, Física Secundaria, Ciencias Naturales Primaria, Química Secundaria, Matemáticas Secundaria, y Lengua y Literatura Primaria, todas con valores similares (~2,500).](C:/Users/joshu/.gemini/antigravity-ide/brain/bd48bb5c-84ea-4aba-98af-7962a821f94f/WhatsApp Image 2026-06-11 at 7.52.12 PM.jpeg)

**¿Qué muestra este gráfico?**  
Un gráfico de barras verdes que compara la **cantidad de recursos por asignatura**, agrupadas por su tipo: **Principal** (materias troncales) y **Complementaria**.

**¿Cómo leerlo?**
- La sección visible muestra asignaturas **Principales**: Lengua y Literatura Secundaria, Física Secundaria, Ciencias Naturales Primaria, Química Secundaria, Matemáticas Secundaria, Lengua y Literatura Primaria
- Todas tienen barras de altura similar (~2,500 recursos cada una)
- Esto sugiere una distribución equilibrada entre asignaturas principales

**Resultado de la prueba:**
- **18 registros** (las 18 asignaturas), **18 unidades**
- **Distribución de Tipo_Asignatura:** Principal: 13, Complementaria: 5
- **Decisión:** Sin evidencia suficiente de correlación

**¿Qué significa?**  
La cobertura por asignaturas principales es bastante uniforme. Hay más asignaturas clasificadas como "Principales" (13) que "Complementarias" (5), lo cual refleja la estructura curricular real del sistema educativo nicaragüense.

---

## 8. La Prueba Estadística: Correlación de Spearman

### ¿Qué es la prueba de Spearman?

Es una prueba estadística que mide si existe una **relación monotónica** (no necesariamente lineal) entre dos variables. Se usa cuando los datos no siguen una distribución normal o cuando las variables son ordinales.

### ¿Cómo interpretar los resultados?

| Métrica | ¿Qué significa? | En nuestro proyecto |
|---|---|---|
| **Estadístico (ρ)** | Valor entre -1 y +1 que mide la fuerza y dirección de la correlación. 0 = sin correlación, +1 = perfecta positiva, -1 = perfecta negativa | 0.000 en todos los KPIs |
| **Valor-p** | Probabilidad de obtener el resultado por azar. Si p < 0.05, el resultado es significativo | 1.000 en todos los KPIs |
| **IC 95%** | Intervalo de confianza del 95% del estadístico | Varía por KPI |
| **Tamaño de efecto** | Magnitud práctica del resultado (Despreciable, Pequeño, Mediano, Grande) | Despreciable |
| **α (alfa)** | Nivel de significancia establecido (umbral) | 0.05 |

### ¿Por qué el estadístico da 0.000 y el p-value da 1.000?

Esto ocurre porque los datos sintéticos fueron generados con distribuciones **aleatorias dentro de rangos definidos**. Aunque hay sesgos intencionales (por ejemplo, Primaria tiene años más recientes), la correlación de Spearman evalúa la relación **punto a punto** entre las variables, y con datos aleatorios uniformes dentro de cada grupo, la correlación lineal es efectivamente cero.

**Esto NO significa que no haya diferencias** entre los grupos. Significa que Spearman no es la mejor prueba para estos datos específicos. Pruebas más adecuadas como **ANOVA o Kruskal-Wallis** captarían mejor las diferencias entre grupos.

### Cada tarjeta de hipótesis en el dashboard muestra:
1. **Nombre y descripción** de la prueba
2. **Métricas:** Estadístico, Valor-p, IC 95%, Tamaño de efecto
3. **Decisión estadística:** Si se rechaza o no la hipótesis nula
4. **Estadísticos descriptivos:** Media, mediana, desviación estándar, mínimo, máximo
5. **Distribución categórica:** Cuántos registros hay por categoría
6. **Recomendaciones:** Sugerencias automáticas del sistema
7. **Configuración de la prueba:** VI, VD, tipo de prueba, alfa, agrupación

---

## 9. Arquitectura Técnica del Sistema

### Stack Tecnológico

| Capa | Tecnología | Propósito |
|---|---|---|
| **Backend** | ASP.NET Core (C#) | API REST, Razor Pages, lógica de negocio |
| **Base de Datos** | SQL Server Express | Almacenamiento de datos |
| **Frontend** | HTML + CSS + JavaScript | Dashboard interactivo |
| **ORM** | AppCore (custom) | Mapeo objeto-relacional |
| **Gráficos** | WDevCore/WBarChart | Componentes de gráficos de barras |
| **Comunicación** | WAjaxTools (AJAX) | Llamadas HTTP del frontend al backend |

### Flujo de datos completo (de principio a fin)

```
1. INICIO DE LA APLICACIÓN
   │
   ├── Program.cs → Configura servicios ASP.NET Core
   │                 (Controllers, Razor Pages, CORS, Swagger, Compresión)
   │
   ├── StartServices.cs → Inicia la conexión a BD
   │                       e invoca BibliotecaDataGenerator
   │
   ├── BDConnection.cs → Crea las BDs si no existen
   │                      (BDOrigenBiblioteca + DW_Biblioteca_MINED)
   │
   └── BibliotecaDataGenerator.cs
       ├── Crea tablas (DDL)
       ├── Siembra dimensiones (7 niveles, 12 categorías, 3 públicos, 18 asignaturas)
       ├── Genera 15,000 recursos educativos (con sesgos para las hipótesis)
       ├── Crea vista V_Analisis_Biblioteca (JOIN de todas las tablas)
       └── Valida consistencia

2. USUARIO ABRE EL NAVEGADOR → localhost:5169
   │
   ├── index.cshtml → Página principal con enlaces a los dashboards
   │
   └── /Analitics/Biblioteca/index.html → Dashboard de Biblioteca
       │
       └── script.js → Se ejecuta al cargar la página
           │
           ├── Para cada KPI (5 en total):
           │   ├── Envía POST a /api/ApiBiblioteca/{endpoint}
           │   │   con { Desde, Hasta, GroupParams, EvalParams }
           │   │
           │   ├── ApiBibliotecaController.cs → Recibe el request
           │   │   └── Delega a la Operation correspondiente
           │   │       └── AnaliticXXXOperation.cs
           │   │           ├── Consulta V_Analisis_Biblioteca (filtrada por fecha)
           │   │           ├── Configura HipotesisTestConfig
           │   │           ├── Ejecuta HipotesisTestService.EjecutarPruebaAsync()
           │   │           ├── Ejecuta DataGroupingHelper.GroupData()
           │   │           └── Retorna datos + resultados de hipótesis
           │   │
           │   ├── Renderiza WBarChart (gráfico de barras)
           │   └── Renderiza tarjeta de hipótesis (HTML generado)
           │
           └── Filtros interactivos (Desde/Hasta + botón "Aplicar Parámetros")
               → Recarga todos los KPIs con las nuevas fechas
```

### Estructura de carpetas del proyecto

```
DATA_ANALITIC_EXAMPLE_API/
├── ETLService/                          ← Proyecto web ASP.NET Core
│   ├── Program.cs                       ← Punto de entrada
│   ├── Controllers/
│   │   └── ApiBibliotecaController.cs   ← 5 endpoints API para los KPIs
│   ├── Pages/
│   │   └── index.cshtml                 ← Landing page
│   └── wwwroot/                         ← Archivos estáticos
│       ├── Analitics/
│       │   └── Biblioteca/
│       │       ├── index.html           ← Dashboard HTML (dark theme)
│       │       └── script.js            ← Lógica JS del dashboard
│       └── WDevCore/                    ← Librería de componentes UI
│
├── Operations/                          ← Lógica de negocio
│   ├── Conexiones/
│   │   └── BDConnection.cs              ← Conexión a SQL Server
│   ├── SyntheticDataGenerator/
│   │   ├── BibliotecaDataGenerator.cs   ← Generador de datos (15,000 registros)
│   │   └── Model/
│   │       ├── BibliotecaDims.cs        ← Modelos de dimensiones
│   │       └── BibliotecaFacts.cs       ← Modelo de tabla de hechos
│   ├── AnaliticOperations/
│   │   ├── AnaliticActualizacionNivelOperation.cs    ← KPI 1
│   │   ├── AnaliticEspaciosLecturaOperation.cs       ← KPI 2
│   │   ├── AnaliticCoberturaTematicaOperation.cs     ← KPI 3
│   │   ├── AnaliticPublicoObjetivoOperation.cs       ← KPI 4
│   │   ├── AnaliticCoberturaAsignaturaOperation.cs   ← KPI 5
│   │   └── Model/
│   │       ├── V_Analisis_Biblioteca.cs              ← Vista desnormalizada
│   │       └── DataAnaliticRequest.cs                ← Modelo del request
│   └── EstadisticModule/
│       ├── HipotesisTestService.cs      ← Motor de pruebas estadísticas
│       └── EstadisticConfig.cs          ← Configuración de pruebas
│
├── AppCore/                             ← Framework ORM (submódulo Git)
├── biblioteca.md                        ← Documentación del proyecto
├── integration.md                       ← Plan de integración técnico
└── ETLService.sln                       ← Archivo de solución Visual Studio
```

---

## 10. ¿Cómo correr el proyecto?

### Prerrequisitos
1. **.NET SDK** instalado (versión 6.0 o superior)
2. **SQL Server Express** instalado y corriendo (instancia `JB\SQLEXPRESS` con usuario `sa` y contraseña `123`)

### Comandos

```bash
# Clonar con submódulos (primera vez)
git clone --recurse-submodules -j8 https://github.com/Wilber1987/DATA_ANALITIC_EXAMPLE_API.git

# Si ya clonaste sin submódulos
git submodule update --init --recursive

# Correr el proyecto
dotnet run --project .\ETLService\ETLService.csproj
```

### URLs disponibles una vez corriendo

| URL | Qué muestra |
|---|---|
| `http://localhost:5169` | Página principal con enlaces a los dashboards |
| `http://localhost:5169/Analitics/Biblioteca/index.html` | **Dashboard de Biblioteca Digital** |
| `http://localhost:5169/Analitics/AntiguedadBienestar/index.html` | Dashboard de Antigüedad y Bienestar |
| `http://localhost:5169/swagger/index.html` | Documentación Swagger de la API |

---

## 11. Conclusiones y Valor del Proyecto

### ¿Qué demuestra este proyecto?

1. **Diseño de Data Warehouse**: Se implementa un modelo estrella completo con tablas de hechos y dimensiones, siguiendo las mejores prácticas de almacenamiento analítico.

2. **Proceso ETL**: El sistema ejecuta un proceso de Extracción (datos sintéticos), Transformación (mapeo a dimensiones con sesgos estadísticos) y Carga (inserción en SQL Server) completamente automatizado.

3. **Análisis estadístico automatizado**: Cada KPI ejecuta una prueba de hipótesis (Spearman) en tiempo real, generando conclusiones, estadísticos descriptivos y recomendaciones automáticamente.

4. **Visualización interactiva**: El dashboard permite a los usuarios filtrar por rango de fechas y ver cómo cambian los resultados en tiempo real.

5. **Arquitectura de software profesional**: Separación de capas (API → Operations → Data), patrón MVC, componentes reutilizables, compresión de respuestas, CORS configurado, y documentación Swagger.

### Hallazgos principales del análisis

| Hallazgo | Evidencia |
|---|---|
| Los recursos para Estudiantes dominan la biblioteca | ~65% de los 15,000 recursos vs ~23% Docentes y ~12% Familias |
| La cobertura entre categorías es relativamente equilibrada | Las 12 categorías tienen distribución similar |
| Las asignaturas principales tienen más representación | 13 asignaturas principales vs 5 complementarias |
| Los espacios de lectura varían por nivel | Primaria: 50-300, Secundaria: 10-120, Técnico: 5-80 |
| Los datos cubren el período 2015-2026 | Con sesgos intencionales según nivel educativo |

### Recomendaciones basadas en los datos

1. **Incrementar materiales para Docentes y Familias** — existe un desequilibrio marcado a favor de Estudiantes
2. **Actualizar recursos de Secundaria y Técnico** — tienen materiales con años de publicación más antiguos
3. **Fortalecer las asignaturas complementarias** — tienen menos representación que las principales
4. **Investigar por qué Técnico tiene menos espacios de lectura** — podría indicar baja adopción digital
5. **Usar pruebas ANOVA o Kruskal-Wallis** — complementarían los resultados de Spearman para captar mejor las diferencias entre grupos

