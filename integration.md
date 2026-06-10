# Plan de Integración Definitivo: Proyecto Biblioteca Digital MINED
*(Revisión de Arquitectura Senior con Ubicación Exacta de Archivos)*

## 1. Visión General de la Integración
Este plan detalla la implementación exacta para la "Biblioteca Digital del MINED". La clave del éxito reside en que el módulo de UI (HTML/JS) depende fuertemente del objeto `hipotesisTestResults` generado por `HipotesisTestService.EjecutarPruebaAsync`. Todo estará parametrizado con `HipotesisTestConfig`.

## 2. Bases de Datos y Generación Sintética (Seed)
**Objetivo:** Disponer de una base de datos `DW_Biblioteca_MINED` autogenerada en el arranque.

- **Configuración de Conexión:**
  - 📍 **Archivo a Modificar:** `Operations/Conexiones/BDConnection.cs`
  - *Cambio:* Alterar la cadena apuntando a la BD `DW_Biblioteca_MINED`.

- **Generación de Entorno de Pruebas y Seed:**
  - 📍 **Archivo a Modificar:** `Operations/SyntheticDataGenerator/SyntheticDataGeneratorOperation.cs`
  - *Cambio:* Ejecutar creación de esquema (`Dim_NivelEducativo`, `Dim_Categoria`, `Dim_PublicoObjetivo`, `Dim_Asignatura`, `Dim_Tiempo` y `Fact_RecursosEducativos`) y la vista desnormalizada obligatoria `V_Analisis_Biblioteca`. Llenar con datos sintéticos randomizados.

- **Modelo de Entidad (C#):**
  - 📍 **Archivo a Crear:** `Operations/AnaliticOperations/Model/V_Analisis_Biblioteca.cs`
  - *Cambio:* Clase en C# que representa la vista plana para que el ORM trabaje sobre ella.

## 3. KPIs y Lógica de Hipótesis (EstadisticModule)
📍 **Ubicación de los archivos lógicos:** `Operations/AnaliticOperations/`

Se crearán los siguientes 5 archivos, cada uno configurando `HipotesisTestConfig<V_Analisis_Biblioteca>`:

| KPI | Archivo a Crear | Hipótesis / Prueba a Configurar |
| --- | --- | --- |
| **KPI 1** | `AnaliticActualizacionNivelOperation.cs` | **H1:** `Indep`: Nivel_Educativo_Valor, `Dep`: Anio_Publicacion (ANOVA/Spearman) |
| **KPI 2** | `AnaliticEspaciosLecturaOperation.cs` | **H3:** `Indep`: Nivel_Educativo_Valor, `Dep`: Espacios_Lectura (Kruskal-Wallis/Spearman) |
| **KPI 3** | `AnaliticCoberturaTematicaOperation.cs`| **H5:** `Indep`: Categoria_Valor, `Dep`: Cantidad_Recursos (Descriptiva/Clusterización) |
| **KPI 4** | `AnaliticPublicoObjetivoOperation.cs` | **H6:** `Indep`: Publico_Objetivo_Valor, `Dep`: Cantidad_Recursos (Chi-cuadrado/Spearman) |
| **KPI 5** | `AnaliticCoberturaAsignaturaOperation.cs`| **Obj:** `Indep`: Asignatura, `Dep`: Cantidad_Recursos (Spearman) |

## 4. Controladores (ETLService - API)
- 📍 **Archivo a Crear:** `ETLService/Controllers/ApiBibliotecaController.cs`
- *Cambio:* Endpoints POST (ej. `/api/ApiBiblioteca/ActualizacionNivel`) recibiendo `DataAnaliticRequest` y delegando la función a las clases creadas en el paso anterior.

## 5. FrontEnd (HTML/JS con WDevCore)
📍 **Ubicación del módulo FrontEnd:** `ETLService/wwwroot/Biblioteca/`

- 📍 **Archivo a Crear:** `ETLService/wwwroot/Biblioteca/index.html`
  - *Cambio:* Layout de 5 contenedores para los gráficos. **Se rechaza categóricamente el uso de gráficos de pastel**, utilizando componentes dinámicos de `WDevCoreJS` como `WBarChart`.
  
- 📍 **Archivo a Crear:** `ETLService/wwwroot/Biblioteca/script.js`
  - *Cambio:* Llamadas a la API vía `WAjaxTools.PostRequest`, dibujado de los componentes de gráficos (barras, líneas) y llamado obligatorio a `generarTarjetasHipotesis(response.hipotesisTestResults)` para cada gráfico.

## 6. Secuencia de Ejecución
1. Modificar `BDConnection.cs`.
2. Reescribir `SyntheticDataGeneratorOperation.cs`.
3. Crear el modelo `V_Analisis_Biblioteca.cs`.
4. Crear las 5 operaciones lógicas en `Operations/AnaliticOperations/`.
5. Crear el controlador `ApiBibliotecaController.cs` en `ETLService/Controllers/`.
6. Diseñar la vista `index.html` y el código cliente `script.js` en `wwwroot/Biblioteca/`.
