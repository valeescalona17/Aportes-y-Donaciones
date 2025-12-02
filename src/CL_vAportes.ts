// Nota: Archivo no proporcionado, pero necesario ya que CL_controlador.ts lo importa
// y el index.html usa elementos sin prefijo.

import { CL_mAporte } from "./CL_mAporte.js";

// Vista de usuario. Provee métodos para:
// - obtener elementos del DOM
// - abrir/cerrar modal de adición de aporte
// - abrir/cerrar panel de reporte
// - renderizar la tabla de aportes
export class CL_vAportes {
  private prefix: string;

  constructor(prefix: string = "") {
    this.prefix = prefix;
  }

  // Helper que lanza si no encuentra el elemento
  private getEl<T extends HTMLElement>(id: string): T {
    const el = document.getElementById(this.prefix + id) as T | null;
    if (!el) throw new Error(`Elemento no encontrado: ${this.prefix}${id}`);
    return el;
  }

  // Getters para elementos usados por el controlador
  public get lblTotal() { return this.getEl<HTMLSpanElement>("lbl-total-aportes"); }
  public get contenedorLista() { return this.getEl<HTMLTableSectionElement>("lista-aportes"); }
  public get modalAporte() { return this.getEl<HTMLDivElement>("modal-aporte"); }
  public get panelReporte() { return this.getEl<HTMLDivElement>("panel-reporte"); }
  
  // Inputs del formulario de aporte
  public get inpId() { return this.getEl<HTMLInputElement>("inp-id"); }
  public get inpFechaAporte() { return this.getEl<HTMLInputElement>("inp-fecha-aporte"); }
  public get inpTipoAporte() { return this.getEl<HTMLSelectElement>("inp-tipo-aporte"); }
  public get inpDescripcion() { return this.getEl<HTMLInputElement>("inp-descripcion"); }
  public get inpMontoAporte() { return this.getEl<HTMLInputElement>("inp-monto-aporte"); }
  public get inpNombreAporte() { return this.getEl<HTMLInputElement>("inp-nombre-aporte"); }
  public get inpTipoAportante() { return this.getEl<HTMLSelectElement>("inp-tipo-aportante"); }

  // Botones principales
  public get btnMostrarForm() { return this.getEl<HTMLButtonElement>("btn-mostrar-form-aporte"); }
  public get btnAceptar() { return this.getEl<HTMLButtonElement>("btn-aceptar-aporte"); }
  public get btnCerrarModal() { return this.getEl<HTMLButtonElement>("btn-eliminar-cancelar-aporte"); }

  // Filtros
  public get filtroTipoDonador() { return this.getEl<HTMLSelectElement>("filtro-tipo-donador"); }
  public get filtroMontoMin() { return this.getEl<HTMLInputElement>("filtro-monto-min"); }

  // Reporte de fallas (usuario)
  public get inpReporte() { return this.getEl<HTMLInputElement>("inp-reporte-falla"); }
  public get btnEnviarReporte() { return this.getEl<HTMLButtonElement>("btn-enviar-reporte"); }
  public get btnCancelarReporte() { return this.getEl<HTMLButtonElement>("btn-cancelar-reporte"); }
  public get lblReporteSobre() { return this.getEl<HTMLSpanElement>("lbl-reporte-sobre"); }

  // *Nuevos elementos para estadísticas*
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


  // Abrir modal de creación/edición de aporte
  public abrirModal(limpiar: boolean = true): void {
    this.modalAporte.classList.remove("hidden");
    if (limpiar) {
      this.limpiarInputs();
      // En vista usuario, el ID siempre se introduce y no se edita un existente.
      this.inpId.disabled = false; 
      // El botón de cancelar en esta vista siempre es "Cancelar"
      this.btnCerrarModal.textContent = "✖ Cancelar";
    }
  }

  public cerrarModal(): void {
    this.modalAporte.classList.add("hidden");
    this.limpiarInputs();
  }
  
  public abrirPanelReporte(id: number): void {
    this.lblReporteSobre.textContent = id.toString().padStart(3, "0");
    this.panelReporte.classList.remove("hidden");
    this.inpReporte.value = "";
  }

  public cerrarPanelReporte(): void {
    this.panelReporte.classList.add("hidden");
  }

  // Limpia todos los campos del formulario de aporte
  public limpiarInputs(): void {
    this.inpId.value = "";
    this.inpFechaAporte.value = "";
    this.inpTipoAporte.value = "Efectivo";
    this.inpDescripcion.value = "";
    this.inpMontoAporte.value = "";
    this.inpNombreAporte.value = "";
    this.inpTipoAportante.value = "Natural"; // Asegurar valor por defecto
  }

  // Pinta la tabla con la data (vista usuario: solo puede reportar)
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
          <button class="btn-reportar-aporte" data-id="${ap.id}">Reportar</button>
        </td>
      `;
      this.contenedorLista.appendChild(tr);
    });
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
      this.inpTipoAporte.value as any, // TipoAporte
      this.inpDescripcion.value.trim(),
      montoNum,
      this.inpNombreAporte.value.trim(),
      this.inpTipoAportante.value.trim()
    );
  }
}