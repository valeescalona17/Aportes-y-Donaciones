import { CL_mAporte } from "./CL_mAporte.js";
// Vista del decanato / administrador. Provee métodos para:
// - obtener elementos del DOM (con prefijo opcional)
// - abrir/cerrar modal de edición/creación
// - limpiar inputs y cargar datos para edición
// - renderizar la tabla con botones de editar/eliminar/ver reportes
export default class CL_vDecanato {
    constructor(prefix = "") {
        this.modoEdicion = false;
        this.prefix = prefix;
    }
    // Helper que lanza si no encuentra el elemento (ayuda en debugging)
    getEl(id) {
        const el = document.getElementById(this.prefix + id);
        if (!el)
            throw new Error(`Elemento no encontrado: ${this.prefix}${id}`);
        return el;
    }
    // Getters para elementos usados por el controlador
    get lblTotal() { return this.getEl("lbl-total-aportes"); }
    get contenedorLista() { return this.getEl("lista-aportes"); }
    get modal() { return this.getEl("modal-aporte"); }
    // Inputs del formulario
    get inpId() { return this.getEl("inp-id"); }
    get inpFechaAporte() { return this.getEl("inp-fecha-aporte"); }
    get inpTipoAporte() { return this.getEl("inp-tipo-aporte"); }
    get inpDescripcion() { return this.getEl("inp-descripcion"); }
    get inpMontoAporte() { return this.getEl("inp-monto-aporte"); }
    get inpNombreAporte() { return this.getEl("inp-nombre-aporte"); }
    get inpTipoAportante() { return this.getEl("inp-tipo-aportante"); } // Cambiado a select
    // Botones principales
    get btnMostrarForm() { return this.getEl("btn-mostrar-form-aporte"); }
    get btnAceptar() { return this.getEl("btn-aceptar-aporte"); }
    get btnEliminarCancelar() { return this.getEl("btn-eliminar-cancelar-aporte"); }
    // Filtros
    get filtroTipoDonador() { return this.getEl("filtro-tipo-donador"); }
    get filtroMontoMin() { return this.getEl("filtro-monto-min"); }
    // Panel de reportes (para vista admin)
    get panelReporte() { return this.getEl("panel-reporte"); }
    get lblReporteSobre() { return this.getEl("lbl-reporte-sobre"); }
    get listaReportes() { return this.getEl("lista-reportes"); }
    get btnCerrarReporte() { return this.getEl("btn-cerrar-reporte"); }
    // *Nuevos elementos para estadísticas (Admin)*
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
    // Abrir modal de creación/edición. Si limpiar=true resetea campos y
    // pone el id habilitado (modo creación).
    abrirModal(limpiar = true) {
        this.modal.classList.remove("hidden");
        if (limpiar) {
            this.limpiarInputs();
            this.inpId.disabled = false;
            this.modoEdicion = false;
            this.btnEliminarCancelar.textContent = "✖ Cancelar";
        }
        else {
            // Modo edición
            this.inpId.disabled = false; // Permitimos edición de ID en admin
            this.modoEdicion = true;
            this.btnEliminarCancelar.textContent = "✖ Cancelar";
        }
    }
    cerrarModal() {
        this.modal.classList.add("hidden");
    }
    // Limpia todos los campos del formulario
    limpiarInputs() {
        this.inpId.value = "";
        this.inpFechaAporte.value = "";
        this.inpTipoAporte.value = "Efectivo";
        this.inpDescripcion.value = "";
        this.inpMontoAporte.value = "";
        this.inpNombreAporte.value = "";
        this.inpTipoAportante.value = "Natural"; // Asegurar valor por defecto
    }
    // Pinta la tabla con la data (vista administrador: puede editar y ver reportes)
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
          <button class="btn-editar-aporte" data-id="${ap.id}">Editar</button>
          <button class="btn-eliminar-aporte" data-id="${ap.id}">Eliminar</button>
          <button class="btn-ver-reportes" data-id="${ap.id}">Ver reportes</button>
        </td>
      `;
            this.contenedorLista.appendChild(tr);
        });
    }
    // Cargar datos en el modal para editar un registro existente
    cargarDatosEnInputs(ap) {
        this.modoEdicion = true;
        this.abrirModal(false);
        // Permitimos que el admin pueda editar el campo `id`.
        this.inpId.value = ap.id.toString();
        this.inpFechaAporte.value = ap.fechaAporte;
        this.inpTipoAporte.value = ap.tipoAporte;
        this.inpDescripcion.value = ap.descripcion;
        this.inpMontoAporte.value = ap.montoAporte.toString();
        this.inpNombreAporte.value = ap.nombreAporte;
        this.inpTipoAportante.value = ap.tipoAportante;
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
        return new CL_mAporte(idNum, this.inpFechaAporte.value.trim(), this.inpTipoAporte.value, this.inpDescripcion.value.trim(), montoNum, this.inpNombreAporte.value.trim(), this.inpTipoAportante.value.trim());
    }
}
