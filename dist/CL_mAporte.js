// Clase de datos: campos públicos para acceso sencillo desde vistas.
export class CL_mAporte {
    constructor(id, // número de aporte
    fechaAporte, // fecha en formato ISO o legible
    tipoAporte, // Efectivo / Especie
    descripcion, // descripción del aporte
    montoAporte, // monto en dinero (0 si no aplica)
    nombreAporte, // nombre del aportante
    tipoAportante, // 'Natural' / 'Jurídico' u otro
    reportes = [] // reportes relacionados (inicialmente vacío)
    ) {
        this.id = id;
        this.fechaAporte = fechaAporte;
        this.tipoAporte = tipoAporte;
        this.descripcion = descripcion;
        this.montoAporte = montoAporte;
        this.nombreAporte = nombreAporte;
        this.tipoAportante = tipoAportante;
        this.reportes = reportes;
    }
}
