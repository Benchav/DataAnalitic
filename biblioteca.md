# Proyecto de Analítica de Datos: Análisis de Cobertura y Distribución de Recursos en la Biblioteca Digital del MINED


## 1. correr el proyecto

dotnet run --project .\ETLService\ETLService.csproj

## 1.1 Contexto del Proyecto

La Biblioteca Digital del MINED constituye un repositorio educativo que reúne materiales digitales dirigidos a diferentes niveles académicos y públicos dentro del sistema educativo nicaragüense. La plataforma contiene libros, manuales, guías, cartillas y otros recursos organizados en distintas categorías educativas y temáticas.

Debido al crecimiento continuo de la cantidad de contenidos disponibles, surge la necesidad de aplicar técnicas de analítica de datos que permitan comprender cómo se distribuyen los recursos dentro de la biblioteca, cuáles áreas poseen mayor cobertura documental y qué sectores presentan menor disponibilidad de materiales educativos.

Para ello, el proyecto propone la construcción de una base de datos estructurada que permita clasificar y analizar los recursos disponibles según variables académicas, temáticas y de público objetivo.

## 2. Planteamiento del Problema

Actualmente, la Biblioteca Digital del MINED ofrece una amplia variedad de recursos educativos; sin embargo, no se dispone de una estructura analítica que permita evaluar de manera integral la cobertura documental existente entre niveles educativos, asignaturas y públicos destinatarios.

Esta situación dificulta identificar:

- Qué niveles educativos poseen mayor representación documental.
- Qué asignaturas cuentan con más recursos disponibles.
- Qué áreas temáticas presentan baja cobertura.
- Si existe equilibrio entre materiales dirigidos a docentes y estudiantes.
- Qué categorías requieren fortalecimiento o ampliación de contenidos.
La ausencia de análisis estructurados limita la capacidad de generar indicadores que apoyen la toma de decisiones relacionadas con la planificación, organización y actualización de la biblioteca digital.

Ante esta problemática, se plantea el desarrollo de un proyecto de analítica de datos orientado a clasificar y analizar los recursos de la Biblioteca Digital del MINED para identificar patrones de distribución y posibles brechas documentales.

## 3. Objetivo General

Diseñar y analizar una base de datos estructurada de la Biblioteca Digital del MINED para identificar patrones de cobertura y distribución de recursos educativos digitales.

## 4. Objetivos Específicos

- Clasificar los recursos educativos según nivel académico, categoría temática y público objetivo.
- Analizar la cobertura documental entre asignaturas principales y complementarias.
- Identificar los niveles educativos con mayor concentración de recursos.
- Detectar áreas temáticas con baja disponibilidad documental.
- Comparar la disponibilidad de recursos dirigidos a estudiantes y docentes.
## 6. Variables de Análisis

| Dimensión | Variables | Descripción |
| --- | --- | --- |
| Vigencia tecnológica | anio_publicacion | Año de edición o publicación del recurso digital, utilizado para medir la obsolescencia. |
| Cobertura documental | cantidad_recursos | Número de materiales disponibles dentro de cada categoría analizada. |
| Nivel educativo | nivel_educativo | Nivel académico al que pertenece el recurso (Primaria, Secundaria, etc.). |
| Interacción digital | espacios_lectura | Frecuencia de accesos, visualizaciones o clics registrados en la plataforma para cada recurso. |
| Clasificación temática | categoria | Área temática o categoría donde se encuentra organizado el recurso. |
| Cobertura temática | cobertura_tematica | Nivel de representación documental dentro de cada categoría. |
| Público objetivo | publico_objetivo | Sector al que va dirigido el recurso (docentes o estudiantes). |

## 7. Hipótesis de Investigación

| Hipótesis | Variables | Técnica de análisis |
| --- | --- | --- |
| H1 Los recursos educativos orientados a niveles de educación técnica o secundaria presentan una menor tasa de actualización (años de publicación recientes) en comparación con los nieveles de educación primaria. | nivel_educativo, anio_publicacion | ANOVA / Prueba t de Student |
| H3 La cantidad de espacios de lectura de los recursos, varía según nivel educativo. | nivel_educativo, espacios_lectura | ANOVA o Kruskal-Wallis |
| H5 La clasificación estructurada de los recursos permite identificar áreas temáticas con baja cobertura documental. | categoria, cobertura_tematica | Análisis descriptivo / Clusterización |
| H6 Los recursos dirigidos a docentes presentan menor disponibilidad que los orientados a estudiantes. | publico_objetivo, cantidad_recursos | Chi-cuadrado |

## 9. Enfoque Analítico del Proyecto

- El análisis de datos estará orientado a:
- Comparar la cobertura documental entre asignaturas principales y complementarias.
- Analizar la distribución de recursos por nivel educativo.
- Detectar categorías temáticas con menor representación documental.
- Comparar la disponibilidad de recursos para docentes y estudiantes.
- Generar gráficos y dashboards que permitan visualizar patrones de distribución y cobertura.