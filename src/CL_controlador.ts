// Controlador central que conecta el modelo (CL_mDecanato) con las vistas
// (CL_vAportes para usuarios y CL_vDecanato para administradores).
// - Recibe `initialData` para poblar el modelo (útil para persistencia)
// - Recibe `onChange` callback que se invoca cada vez que la lista cambia
//   (esto permite que la lógica de persistencia viva fuera del controlador).
import CL_mDecanato, { EstadisticasAportes } from "./CL_mDecanato.js";
import CL_vDecanato  from "./CL_vDecanato.js";
import { CL_vAportes } from "./CL_vAportes.js";
import { DATA_APORTES_INICIAL } from "./data.js";
import { CL_mAporte } from "./CL_mAporte.js";

export class Controlador {

  private decanato: CL_mDecanato;
  private vistaAdmin?: CL_vDecanato;
  private vistaUser?: CL_vAportes;
  private onChange?: (aportes: CL_mAporte[]) => void;

  private currentUserReportTarget?: number;
  private currentAdminEditingId?: number;

  constructor(initialData?: CL_mAporte[], onChange?: (aportes: CL_mAporte[]) => void) {
    this.onChange = onChange;
    this.decanato = new CL_mDecanato(initialData ?? DATA_APORTES_INICIAL);
    // Intento instanciar las vistas. En algunos entornos una vista puede
    // no existir (por ejemplo sólo se muestra la vista user o admin), por
    // eso se encapsula en try/catch para no romper la inicialización.
    try { this.vistaUser = new CL_vAportes(""); } catch (e) { console.error("Error al instanciar vista user:", e); }
    try { this.vistaAdmin = new CL_vDecanato("admin-"); } catch (e) { console.error("Error al instanciar vista admin:", e); }

    // Configuro listeners y reduzco a una llamada para renderizar la UI
    this.setupEventListeners();
    this.updateUI();
  }

  private setupEventListeners(): void {
    if (this.vistaUser) {
      // --- Listeners / acciones disponibles para la vista de usuario ---
      // Añadir aporte (usuario)
      this.vistaUser.btnMostrarForm.addEventListener("click", () => this.vistaUser!.abrirModal(true));
      this.vistaUser.btnAceptar.addEventListener("click", (e) => {
        e.preventDefault();
        const nuevo = this.vistaUser!.obtenerDatosDeInputs();
        if (!nuevo) { alert("Completa los campos requeridos"); return; }
        // Intentar registrar; si el id ya existe se informa y no se registra
        const ok = this.decanato.registrarAporte(nuevo);
        if (!ok) { alert("El ID ya existe. Elige otro ID."); return; }
        if (this.onChange) this.onChange(this.decanato.obtenerTodos());
        this.vistaUser!.cerrarModal();
        this.updateUI();
      });

      // Cancelar/ cerrar modal de añadir aporte (usuario)
      this.vistaUser.btnCerrarModal.addEventListener("click", (e) => {
        e.preventDefault();
        this.vistaUser!.cerrarModal();
      });

      // Reportes (usuario): abrir panel para redactar reporte sobre un aporte
      this.vistaUser.contenedorLista.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        if (target && target.classList.contains("btn-reportar-aporte")) {
          const idStr = target.getAttribute("data-id");
          if (idStr) {
            const id = parseInt(idStr);
            this.currentUserReportTarget = id;
            this.vistaUser!.abrirPanelReporte(id);
          }
        }
      });

      // Envío de reporte: añade el reporte al modelo y persiste mediante onChange
      this.vistaUser.btnEnviarReporte.addEventListener("click", () => {
        const text = this.vistaUser!.inpReporte.value.trim();
        if (!text || this.currentUserReportTarget == null) return;
        this.decanato.agregarReporte(this.currentUserReportTarget, { fecha: new Date().toISOString(), texto: text });
        if (this.onChange) this.onChange(this.decanato.obtenerTodos());
        this.vistaUser!.cerrarPanelReporte();
        this.updateUI();
      });

      this.vistaUser.btnCancelarReporte.addEventListener("click", () => {
        this.vistaUser!.cerrarPanelReporte();
      });

      // Filtros usuario: desencadenan re-renderizado de la lista
      this.vistaUser.filtroTipoDonador.addEventListener("change", () => this.updateUI());
      this.vistaUser.filtroMontoMin.addEventListener("input", () => this.updateUI());
      
      // *** Estadísticas (usuario) ***
      this.vistaUser.btnMostrarEstadisticas.addEventListener("click", () => this.handleMostrarEstadisticas(this.vistaUser!));
      this.vistaUser.btnCerrarEstadisticas.addEventListener("click", () => this.vistaUser!.modalEstadisticas.classList.add("hidden"));
    }

    if (this.vistaAdmin) {
      // --- Listeners / acciones disponibles para la vista de administrador ---
      // En la vista admin hay botones para crear, editar, eliminar y ver reportes
      this.vistaAdmin.btnMostrarForm.addEventListener("click", () => { this.currentAdminEditingId = undefined; this.vistaAdmin!.abrirModal(true); });
      this.vistaAdmin.btnAceptar.addEventListener("click", (e) => { e.preventDefault(); this.handleAdminAceptar(); });
      this.vistaAdmin.btnEliminarCancelar.addEventListener("click", (e) => { e.preventDefault(); this.handleAdminEliminarCancelar(); });

      // Handler central para clicks sobre la tabla admin (delegación)
      this.vistaAdmin.contenedorLista.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        if (!target) return;
        const idStr = target.getAttribute("data-id");
        if (!idStr) return;
        const id = parseInt(idStr);
        if (target.classList.contains("btn-editar-aporte")) {
          // Editar: cargar datos en el modal para que el admin modifique
          this.handleEditarAdmin(id);
        } else if (target.classList.contains("btn-eliminar-aporte")) {
          // Pedir confirmación al usuario antes de eliminar
          const confirmDelete = confirm("¿Seguro que quieres eliminar?");
          if (confirmDelete) {
            this.decanato.eliminarAporte(id);
            if (this.onChange) this.onChange(this.decanato.obtenerTodos());
            this.updateUI();
          } else {
            // Usuario canceló la acción: no hacer nada
          }
        } else if (target.classList.contains("btn-ver-reportes")) {
          const reportes = this.decanato.obtenerReportes(id);
          // renderizar en listaReportes
          this.vistaAdmin!.lblReporteSobre.textContent = id.toString().padStart(3, "0");
          this.vistaAdmin!.listaReportes.innerHTML = reportes.map(r => `<div class=\"rep\"><small>${r.fecha}</small><div>${r.texto}</div></div>`).join("");
          // Mostrar panel con reportes para el registro seleccionado
          this.vistaAdmin!.panelReporte.classList.remove("hidden");
        }
      });

      this.vistaAdmin.btnCerrarReporte.addEventListener("click", () => {
        this.vistaAdmin!.panelReporte.classList.add("hidden");
      });

      // Filtros admin: igual comportamiento que en la vista user
      this.vistaAdmin.filtroTipoDonador.addEventListener("change", () => this.updateUI());
      this.vistaAdmin.filtroMontoMin.addEventListener("input", () => this.updateUI());
      
      // *** Estadísticas (admin) ***
      this.vistaAdmin.btnMostrarEstadisticas.addEventListener("click", () => this.handleMostrarEstadisticas(this.vistaAdmin!));
      this.vistaAdmin.btnCerrarEstadisticas.addEventListener("click", () => this.vistaAdmin!.modalEstadisticas.classList.add("hidden"));
    }
  }
  
  private handleMostrarEstadisticas(vista: CL_vAportes | CL_vDecanato): void {
    const stats = this.decanato.calcularEstadisticas();
    this.actualizarModalEstadisticas(stats, vista);
    vista.modalEstadisticas.classList.remove("hidden");
  }
  
  private actualizarModalEstadisticas(stats: EstadisticasAportes, vista: CL_vAportes | CL_vDecanato): void {
    vista.lblEstadisticasTotal.textContent = stats.totalAportes.toString();
    
    // Efectivo
    vista.lblEstadisticasEfectivoCant.textContent = stats.efectivo.cantidad.toString();
    vista.lblEstadisticasEfectivoPorc.textContent = `${stats.efectivo.porcentaje.toFixed(2)} %`;
    vista.lblEstadisticasEfectivoMonto.textContent = `$ ${stats.efectivo.montoTotal.toFixed(2)}`;
    
    // Especie
    vista.lblEstadisticasEspecieCant.textContent = stats.especie.cantidad.toString();
    vista.lblEstadisticasEspeciePorc.textContent = `${stats.especie.porcentaje.toFixed(2)} %`;
    vista.lblEstadisticasEspecieMonto.textContent = `$ ${stats.especie.montoTotal.toFixed(2)}`;
    
    // Total General
    vista.lblEstadisticasMontoTotalGral.textContent = `$ ${stats.montoTotalGeneral.toFixed(2)}`;
  }

  private handleAdminAceptar(): void {
    if (!this.vistaAdmin) return;
    const nuevoAp = this.vistaAdmin.obtenerDatosDeInputs();
    if (nuevoAp === null) { alert("Error: completa todos los campos requeridos."); return; }
    // Si estamos en modo edición: permitimos cambiar el id usando el id original
    if (this.vistaAdmin.modoEdicion) {
      const originalId = this.currentAdminEditingId ?? nuevoAp.id;
      const ok = this.decanato.actualizarAporteConId(originalId, nuevoAp);
      if (!ok) { alert("Error: ID duplicado o aporte original no encontrado."); return; }
      this.currentAdminEditingId = undefined;
    } else {
      const ok = this.decanato.registrarAporte(nuevoAp);
      if (!ok) { alert("El ID ya existe. Elige otro ID."); return; }
    }
    if (this.onChange) this.onChange(this.decanato.obtenerTodos());
    this.vistaAdmin.cerrarModal();
    this.updateUI();
  }

  private handleAdminEliminarCancelar(): void {
    if (!this.vistaAdmin) return;
    // Nota de comportamiento: en edición el botón actúa como "Cancelar" y
    // limpia los inputs; la eliminación se realiza desde el botón de la fila
    // para evitar borrados accidentales.
    this.vistaAdmin.limpiarInputs();
    this.vistaAdmin.cerrarModal();
    this.currentAdminEditingId = undefined;
    this.updateUI();
  }

  private handleEditarAdmin(id: number): void {
    const ap = this.decanato.buscarPorId(id);
    if (ap && this.vistaAdmin) {
      // Guardar el id original para manejar cambios de id en la edición
      this.currentAdminEditingId = id;
      this.vistaAdmin.cargarDatosEnInputs(ap);
    }
  }

  private updateUI(): void {
    const todos = this.decanato.obtenerTodos();

    // Seleccionar filtros según la vista actualmente visible (user vs admin).
    // Antes se elegía `vistaUser` simplemente por existir, lo que ignoraba
    // los filtros del admin cuando ambos views estaban instanciados.
    let tipoFiltro = "Todos";
    let montoMinStr = "";
    const adminSection = document.getElementById("admin-section");
    const userSection = document.getElementById("user-section");
    const adminVisible = adminSection ? !adminSection.classList.contains("hidden") : false;
    const userVisible = userSection ? !userSection.classList.contains("hidden") : false;

    if (adminVisible && this.vistaAdmin) {
      tipoFiltro = this.vistaAdmin.filtroTipoDonador.value;
      montoMinStr = this.vistaAdmin.filtroMontoMin.value;
    } else if (userVisible && this.vistaUser) {
      tipoFiltro = this.vistaUser.filtroTipoDonador.value;
      montoMinStr = this.vistaUser.filtroMontoMin.value;
    }

    let montoMin: number | null = null;
    if (montoMinStr.trim() !== "") {
      const val = parseFloat(montoMinStr);
      if (!isNaN(val) && val >= 0) {
        montoMin = val;
      }
    }

    // Copia de la lista que luego irá filtrada según criterios seleccionados
    let filtrados = todos;

    // Filtrar por tipo de aportante si aplica
    if (tipoFiltro !== "Todos") {
      filtrados = filtrados.filter(ap => ap.tipoAportante === tipoFiltro);
    }

    // Filtrar por monto mínimo si el usuario/ admin lo indicó
    if (montoMin !== null) {
      const min = montoMin;
      filtrados = filtrados.filter(ap => ap.montoAporte >= min);
    }

    // Envío los datos filtrados a ambas vistas (si existen). Cada vista
    // sabe cómo presentar y qué controles mostrar/ocultar.
    const total = filtrados.length;
    if (this.vistaUser) this.vistaUser.actualizarLista(filtrados, total);
    if (this.vistaAdmin) this.vistaAdmin.actualizarLista(filtrados, total);
  }
}