// Modelo que representa un aporte/donación.
// Usado por el controlador y las vistas para leer/crear/editar registros.
export type TipoAporte = "Efectivo" | "Especie";

// Estructura simple para reportes asociados a un aporte
export type Reporte = {
  fecha: string;
  texto: string;
};

// Clase de datos: campos públicos para acceso sencillo desde vistas.
export  class CL_mAporte {
  constructor(
    public id: number,              // número de aporte
    public fechaAporte: string,     // fecha en formato ISO o legible
    public tipoAporte: TipoAporte,  // Efectivo / Especie
    public descripcion: string,     // descripción del aporte
    public montoAporte: number,     // monto en dinero (0 si no aplica)
    public nombreAporte: string,    // nombre del aportante
    public tipoAportante: string,   // 'Natural' / 'Jurídico' u otro
    public reportes: Reporte[] = [] // reportes relacionados (inicialmente vacío)
  ) {}
}