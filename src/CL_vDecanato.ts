import { CL_mAporte, TipoAporte } from "./CL_mAporte.js";

// Vista del decanato / administrador. Provee métodos para:
// - obtener elementos del DOM (con prefijo opcional)
// - abrir/cerrar modal de edición/creación
// - limpiar inputs y cargar datos para edición
// - renderizar la tabla con botones de editar/eliminar/ver reportes
export default class CL_vDecanato {
  private prefix: string;

  constructor(prefix: string = "") {
    this.prefix = prefix;
  }

  // Helper que lanza si no encuentra el elemento (ayuda en debugging)
  private getEl<T extends HTMLElement>(id: string): T {
    const el = document.getElementById(this.prefix + id) as T | null;
    if (!el) throw new Error(`Elemento no encontrado: ${this.prefix}${id}`);
    return el;
  }

  // Getters para elementos usados por el controlador
  public get lblTotal() { return this.getEl<HTMLSpanElement>("lbl-total-aportes"); }
  public get contenedorLista() { return this.getEl<HTMLTableSectionElement>("lista-aportes"); }
  public get modal() { return this.getEl<HTMLDivElement>("modal-aporte"); }
  
  // Inputs del formulario
  public get inpId() { return this.getEl<HTMLInputElement>("inp-id"); }
  public get inpFechaAporte() { return this.getEl<HTMLInputElement>("inp-fecha-aporte"); }
  public get inpTipoAporte() { return this.getEl<HTMLSelectElement>("inp-tipo-aporte"); }
  public get inpDescripcion() { return this.getEl<HTMLInputElement>("inp-descripcion"); }
  public get inpMontoAporte() { return this.getEl<HTMLInputElement>("inp-monto-aporte"); }
  public get inpNombreAporte() { return this.getEl<HTMLInputElement>("inp-nombre-aporte"); }
  public get inpTipoAportante() { return this.getEl<HTMLSelectElement>("inp-tipo-aportante"); } // Cambiado a select

  // Botones principales
  public get btnMostrarForm() { return this.getEl<HTMLButtonElement>("btn-mostrar-form-aporte"); }
  public get btnAceptar() { return this.getEl<HTMLButtonElement>("btn-aceptar-aporte"); }
  public get btnEliminarCancelar() { return this.getEl<HTMLButtonElement>("btn-eliminar-cancelar-aporte"); }

  // Filtros
  public get filtroTipoDonador() { return this.getEl<HTMLSelectElement>("filtro-tipo-donador"); }
  public get filtroMontoMin() { return this.getEl<HTMLInputElement>("filtro-monto-min"); }

  public modoEdicion: boolean = false;

  // Panel de reportes (para vista admin)
  public get panelReporte() { return this.getEl<HTMLDivElement>("panel-reporte"); }
  public get lblReporteSobre() { return this.getEl<HTMLSpanElement>("lbl-reporte-sobre"); }
  public get listaReportes() { return this.getEl<HTMLDivElement>("lista-reportes"); }
  public get btnCerrarReporte() { return this.getEl<HTMLButtonElement>("btn-cerrar-reporte"); }

  // *Nuevos elementos para estadísticas (Admin)*
  public get btnMostrarEstadisticas() { return this.getEl<HTMLButtonElement>("btn-ver-estadisticas"); }
  public get modalEstadisticas() { return this.getEl<HTMLDivElement>("modal-estadisticas"); }
  public get btnCerrarEstadisticas() { return this.getEl<HTMLButtonElement>("btn-cerrar-estadisticas"); }
  public get lblEstadisticasTotal() { return this.getEl<HTMLSpanElement>("est-total-aportes"); }
  public get lblEstadisticasEfectivoCant() { return this.getEl<HTMLTableCellElement>("est-efectivo-cant"); }
  public get lblEstadisticasEfectivoPorc() { return this.getEl<HTMLTableCellElement>("est-efectivo-porc"); }
  public get lblEstadisticasEfectivoMonto() { return this.getEl<HTMLTableCellElement>("est-efectivo-monto"); }
  public get lblEstadisticasEspecieCant() { return this.getEl<HTMLTableCellElement>("est-especie-cant"); }
  public get lblEstadisticasEspeciePorc() { return this.getEl<HTMLTableCellElement>("est-especie-porc"); }
  public get lblEstadisticasEspecieMonto() { return this.getEl<HTMLTableCellElement>("est-especie-monto"); }
  public get lblEstadisticasMontoTotalGral() { return this.getEl<HTMLTableCellElement>("est-monto-total-gral"); }


  // Abrir modal de creación/edición. Si limpiar=true resetea campos y
  // pone el id habilitado (modo creación).
  public abrirModal(limpiar: boolean = true): void {
    this.modal.classList.remove("hidden");
    if (limpiar) {
      this.limpiarInputs();
      this.inpId.disabled = false;
      this.modoEdicion = false;
      this.btnEliminarCancelar.textContent = "✖ Cancelar";
    } else {
      // Modo edición
      this.inpId.disabled = false; // Permitimos edición de ID en admin
      this.modoEdicion = true;
      this.btnEliminarCancelar.textContent = "✖ Cancelar";
    }
  }

  public cerrarModal(): void {
    this.modal.classList.add("hidden");
  }

  // Limpia todos los campos del formulario
  public limpiarInputs(): void {
    this.inpId.value = "";
    this.inpFechaAporte.value = "";
    this.inpTipoAporte.value = "Efectivo";
    this.inpDescripcion.value = "";
    this.inpMontoAporte.value = "";
    this.inpNombreAporte.value = "";
    this.inpTipoAportante.value = "Natural"; // Asegurar valor por defecto
  }

  // Pinta la tabla con la data (vista administrador: puede editar y ver reportes)
  public actualizarLista(aportes: CL_mAporte[], total: number): void {
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
  public cargarDatosEnInputs(ap: CL_mAporte): void {
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
  public obtenerDatosDeInputs(): CL_mAporte | null {
    const idNum = parseInt(this.inpId.value);
    const montoNum = parseFloat(this.inpMontoAporte.value);

    if (
      isNaN(idNum) ||
      isNaN(montoNum) ||
      this.inpNombreAporte.value.trim() === "" ||
      this.inpFechaAporte.value.trim() === "" ||
      this.inpDescripcion.value.trim() === ""
    ) {
      return null;
    }

    return new CL_mAporte(
      idNum,
      this.inpFechaAporte.value.trim(),
      this.inpTipoAporte.value as TipoAporte,
      this.inpDescripcion.value.trim(),
      montoNum,
      this.inpNombreAporte.value.trim(),
      this.inpTipoAportante.value.trim()
    );
  }
}