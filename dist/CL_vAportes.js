// Nota: Archivo no proporcionado, pero necesario ya que CL_controlador.ts lo importa
// y el index.html usa elementos sin prefijo.
import { CL_mAporte } from "./CL_mAporte.js";
// Vista de usuario. Provee métodos para:
// - obtener elementos del DOM
// - abrir/cerrar modal de adición de aporte
// - abrir/cerrar panel de reporte
// - renderizar la tabla de aportes
export class CL_vAportes {
    constructor(prefix = "") {
        this.prefix = prefix;
    }
    // Helper que lanza si no encuentra el elemento
    getEl(id) {
        const el = document.getElementById(this.prefix + id);
        if (!el)
            throw new Error(`Elemento no encontrado: ${this.prefix}${id}`);
        return el;
    }
    // Getters para elementos usados por el controlador
    get lblTotal() { return this.getEl("lbl-total-aportes"); }
    get contenedorLista() { return this.getEl("lista-aportes"); }
    get modalAporte() { return this.getEl("modal-aporte"); }
    get panelReporte() { return this.getEl("panel-reporte"); }
    // Inputs del formulario de aporte
    get inpId() { return this.getEl("inp-id"); }
    get inpFechaAporte() { return this.getEl("inp-fecha-aporte"); }
    get inpTipoAporte() { return this.getEl("inp-tipo-aporte"); }
    get inpDescripcion() { return this.getEl("inp-descripcion"); }
    get inpMontoAporte() { return this.getEl("inp-monto-aporte"); }
    get inpNombreAporte() { return this.getEl("inp-nombre-aporte"); }
    get inpTipoAportante() { return this.getEl("inp-tipo-aportante"); }
    // Botones principales
    get btnMostrarForm() { return this.getEl("btn-mostrar-form-aporte"); }
    get btnAceptar() { return this.getEl("btn-aceptar-aporte"); }
    get btnCerrarModal() { return this.getEl("btn-eliminar-cancelar-aporte"); }
    // Filtros
    get filtroTipoDonador() { return this.getEl("filtro-tipo-donador"); }
    get filtroMontoMin() { return this.getEl("filtro-monto-min"); }
    // Reporte de fallas (usuario)
    get inpReporte() { return this.getEl("inp-reporte-falla"); }
    get btnEnviarReporte() { return this.getEl("btn-enviar-reporte"); }
    get btnCancelarReporte() { return this.getEl("btn-cancelar-reporte"); }
    get lblReporteSobre() { return this.getEl("lbl-reporte-sobre"); }
    // *Nuevos elementos para estadísticas*
    get btnMostrarEstadisticas() { return this.getEl("btn-ver-estadisticas"); }
    get modalEstadisticas() { return this.getEl("modal-estadisticas"); }
    get btnCerrarEstadisticas() { return this.getEl("btn-cerrar-estadisticas"); }
    get lblEstadisticasTotal() { return this.getEl("est-total-aportes"); }
    get lblEstadisticasEfectivoCant() { return this.getEl("est-efectivo-cant"); }
    get lblEstadisticasEfectivoPorc() { return this.getEl("est-efectivo-porc"); }
    get lblEstadisticasEfectivoMonto() { return this.getEl("est-efectivo-monto"); }
    get lblEstadisticasEspecieCant() { return this.getEl("est-especie-cant"); }
    get lblEstadisticasEspeciePorc() { return this.getEl("est-especie-porc"); }
    get lblEstadisticasEspecieMonto() { return this.getEl("est-especie-monto"); }
    get lblEstadisticasMontoTotalGral() { return this.getEl("est-monto-total-gral"); }
    // Abrir modal de creación/edición de aporte
    abrirModal(limpiar = true) {
        this.modalAporte.classList.remove("hidden");
        if (limpiar) {
            this.limpiarInputs();
            // En vista usuario, el ID siempre se introduce y no se edita un existente.
            this.inpId.disabled = false;
            // El botón de cancelar en esta vista siempre es "Cancelar"
            this.btnCerrarModal.textContent = "✖ Cancelar";
        }
    }
    cerrarModal() {
        this.modalAporte.classList.add("hidden");
        this.limpiarInputs();
    }
    abrirPanelReporte(id) {
        this.lblReporteSobre.textContent = id.toString().padStart(3, "0");
        this.panelReporte.classList.remove("hidden");
        this.inpReporte.value = "";
    }
    cerrarPanelReporte() {
        this.panelReporte.classList.add("hidden");
    }
    // Limpia todos los campos del formulario de aporte
    limpiarInputs() {
        this.inpId.value = "";
        this.inpFechaAporte.value = "";
        this.inpTipoAporte.value = "Efectivo";
        this.inpDescripcion.value = "";
        this.inpMontoAporte.value = "";
        this.inpNombreAporte.value = "";
        this.inpTipoAportante.value = "Natural"; // Asegurar valor por defecto
    }
    // Pinta la tabla con la data (vista usuario: solo puede reportar)
    actualizarLista(aportes, total) {
        this.lblTotal.textContent = total.toString();
        this.contenedorLista.innerHTML = "";
        aportes.forEach(ap => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td>${ap.id.toString().padStart(3, "0")}</td>
        <td>${ap.fechaAporte}</td>
        <td>${ap.tipoAporte}</td>
        <td>${ap.descripcion}</td>
        <td class="text-right">$ ${ap.montoAporte.toFixed(2)}</td>
        <td>${ap.nombreAporte}</td>
        <td>${ap.tipoAportante}</td>
        <td>
          <button class="btn-reportar-aporte" data-id="${ap.id}">Reportar</button>
        </td>
      `;
            this.contenedorLista.appendChild(tr);
        });
    }
    // Construye un CL_mAporte a partir de los inputs; valida campos básicos.
    obtenerDatosDeInputs() {
        const idNum = parseInt(this.inpId.value);
        const montoNum = parseFloat(this.inpMontoAporte.value);
        if (isNaN(idNum) ||
            isNaN(montoNum) ||
            this.inpNombreAporte.value.trim() === "" ||
            this.inpFechaAporte.value.trim() === "" ||
            this.inpDescripcion.value.trim() === "") {
            return null;
        }
        return new CL_mAporte(idNum, this.inpFechaAporte.value.trim(), this.inpTipoAporte.value, // TipoAporte
        this.inpDescripcion.value.trim(), montoNum, this.inpNombreAporte.value.trim(), this.inpTipoAportante.value.trim());
    }
}
