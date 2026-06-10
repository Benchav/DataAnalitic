using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Operations.AnaliticOperations;
using Operations.AnaliticOperations.Model;

namespace ETLService.Controllers
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class ApiBibliotecaController : ControllerBase
    {
        /// <summary>
        /// KPI 1 - H1: Tasa de actualización por nivel educativo
        /// </summary>
        [HttpPost]
        public async Task<ActionResult> ActualizacionNivel(DataAnaliticRequest request)
        {
            return Ok(await AnaliticActualizacionNivelOperation.GetByPeriodo(request));
        }

        /// <summary>
        /// KPI 2 - H3: Espacios de lectura por nivel educativo
        /// </summary>
        [HttpPost]
        public async Task<ActionResult> EspaciosLectura(DataAnaliticRequest request)
        {
            return Ok(await AnaliticEspaciosLecturaOperation.GetByPeriodo(request));
        }

        /// <summary>
        /// KPI 3 - H5: Cobertura temática por categoría
        /// </summary>
        [HttpPost]
        public async Task<ActionResult> CoberturaTematica(DataAnaliticRequest request)
        {
            return Ok(await AnaliticCoberturaTematicaOperation.GetByPeriodo(request));
        }

        /// <summary>
        /// KPI 4 - H6: Disponibilidad por público objetivo
        /// </summary>
        [HttpPost]
        public async Task<ActionResult> PublicoObjetivo(DataAnaliticRequest request)
        {
            return Ok(await AnaliticPublicoObjetivoOperation.GetByPeriodo(request));
        }

        /// <summary>
        /// KPI 5: Cobertura documental por asignaturas
        /// </summary>
        [HttpPost]
        public async Task<ActionResult> CoberturaAsignatura(DataAnaliticRequest request)
        {
            return Ok(await AnaliticCoberturaAsignaturaOperation.GetByPeriodo(request));
        }
    }
}
