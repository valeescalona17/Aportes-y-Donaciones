import { CL_mAporte, TipoAporte } from "./CL_mAporte.js";

// Estructura de retorno para las estadísticas
export interface EstadisticasAportes {
  totalAportes: number;
  efectivo: {
    cantidad: number;
    porcentaje: number;
    montoTotal: number;
  };
  especie: {
    cantidad: number;
    porcentaje: number;
    montoTotal: number;
  };
  montoTotalGeneral: number;
}

// Modelo que gestiona la colección de aportes. Responsable de:
// - registrar (crear/actualizar) aportes
// - agregar y obtener reportes asociados a un aporte
// - eliminar, buscar y devolver listas
export default class CL_mDecanato {

  // Array interno que guarda los CL_mAporte
  private listaAportes: CL_mAporte[] = [];

  constructor(datosIniciales: CL_mAporte[] = []) {
    // Inicializo con datos pasados (útil para persistencia/seed)
    this.listaAportes = datosIniciales;
  }

  // registrarAporte: si el id ya existe actualiza (manteniendo reportes previos),
  // si no existe lo inserta.
  // registrarAporte: inserta un nuevo aporte. Devuelve `false` si ya existe
  // un aporte con el mismo id (no se permite duplicados al registrar).
  public registrarAporte(ap: CL_mAporte): boolean {
    const indice = this.listaAportes.findIndex(a => a.id === ap.id);
    if (indice >= 0) {
      // No permitir registrar si el id ya existe
      return false;
    }
    this.listaAportes.push(ap);
    return true;
  }

  // actualizarAporte: actualiza un aporte existente (útil para modo edición).
  // Devuelve true si se encontró y actualizó, false si no existe el id.
  public actualizarAporte(ap: CL_mAporte): boolean {
    const indice = this.listaAportes.findIndex(a => a.id === ap.id);
    if (indice < 0) return false;
    const existentes = this.listaAportes[indice].reportes ?? [];
    const nuevos = ap.reportes ?? [];
    this.listaAportes[indice] = new CL_mAporte(
      ap.id,
      ap.fechaAporte,
      ap.tipoAporte,
      ap.descripcion,
      ap.montoAporte,
      ap.nombreAporte,
      ap.tipoAportante,
      existentes.concat(nuevos)
    );
    return true;
  }

  // Actualiza un aporte encontrado por su id original. Permite cambiar el id
  // del registro (siempre que el nuevo id no choque con otro existente).
  public actualizarAporteConId(originalId: number, nuevoAp: CL_mAporte): boolean {
    const idxOriginal = this.listaAportes.findIndex(a => a.id === originalId);
    if (idxOriginal < 0) return false;
    // Verificar conflicto si el nuevo id ya existe en otra entrada
    const idxConflicto = this.listaAportes.findIndex(a => a.id === nuevoAp.id && a.id !== originalId);
    if (idxConflicto >= 0) return false;
    const existentes = this.listaAportes[idxOriginal].reportes ?? [];
    const nuevos = nuevoAp.reportes ?? [];
    // Reemplazo en la misma posición para preservar orden
    this.listaAportes[idxOriginal] = new CL_mAporte(
      nuevoAp.id,
      nuevoAp.fechaAporte,
      nuevoAp.tipoAporte,
      nuevoAp.descripcion,
      nuevoAp.montoAporte,
      nuevoAp.nombreAporte,
      nuevoAp.tipoAportante,
      existentes.concat(nuevos)
    );
    return true;
  }

  // Agrega un reporte al aporte con id dado. Si no existe el aporte no hace nada.
  public agregarReporte(id: number, reporte: { fecha: string; texto: string }): void {
    const ap = this.listaAportes.find(a => a.id === id);
    if (!ap) return;
    ap.reportes = ap.reportes ?? [];
    ap.reportes.push(reporte);
  }

  // Devuelve los reportes de un aporte (o array vacío si no existieran)
  public obtenerReportes(id: number): { fecha: string; texto: string }[] {
    const ap = this.listaAportes.find(a => a.id === id);
    return ap ? (ap.reportes ?? []) : [];
  }

  // Elimina un aporte por id
  public eliminarAporte(id: number): void {
    // Eliminar el aporte con el id dado
    this.listaAportes = this.listaAportes.filter(a => a.id !== id);
    // Reindexar IDs para que queden secuenciales (1,2,3,...) minimizando código
    // Esto mueve los IDs de los elementos restantes (manteniendo sus reportes).
    this.listaAportes.forEach((a, index) => { a.id = index + 1; });
  }

  // Busca un aporte por id y lo devuelve si existe
  public buscarPorId(id: number): CL_mAporte | undefined {
    return this.listaAportes.find(a => a.id === id);
  }

  // Cuenta total de aportes
  public contarTotal(): number {
    return this.listaAportes.length;
  }

  // Devuelve la lista completa (por referencia — si quieres inmutabilidad,
  // conviene devolver una copia con `slice()`)
  public obtenerTodos(): CL_mAporte[] {
    // Devuelve una copia ordenada por `id` ascendente para asegurar que
    // la presentación siempre muestre aportes en orden secuencial (1,2,3,...)
    return [...this.listaAportes].sort((a, b) => a.id - b.id);
  }

  /**
   * Calcula la cantidad, el porcentaje y el monto total de aportes
   * clasificados por tipo (Efectivo y Especie).
   * @returns EstadisticasAportes con los resultados calculados.
   */
  public calcularEstadisticas(): EstadisticasAportes {
    const totalAportes = this.listaAportes.length;
    let efectivoCount = 0;
    let especieCount = 0;
    let efectivoMonto = 0;
    let especieMonto = 0;

    this.listaAportes.forEach(ap => {
      if (ap.tipoAporte === "Efectivo") {
        efectivoCount++;
        efectivoMonto += ap.montoAporte;
      } else if (ap.tipoAporte === "Especie") {
        especieCount++;
        especieMonto += ap.montoAporte;
      }
    });

    const montoTotalGeneral = efectivoMonto + especieMonto;

    // Calcular porcentajes. Si totalAportes es 0, el porcentaje es 0 para ambos.
    const efectivoPorcentaje = totalAportes > 0 ? (efectivoCount / totalAportes) * 100 : 0;
    const especiePorcentaje = totalAportes > 0 ? (especieCount / totalAportes) * 100 : 0;

    return {
      totalAportes,
      efectivo: {
        cantidad: efectivoCount,
        porcentaje: efectivoPorcentaje,
        montoTotal: efectivoMonto,
      },
      especie: {
        cantidad: especieCount,
        porcentaje: especiePorcentaje,
        montoTotal: especieMonto,
      },
      montoTotalGeneral,
    };
  }
}