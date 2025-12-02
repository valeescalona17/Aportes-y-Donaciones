// Importo el controlador y datos iniciales.
// Estos imports permiten instanciar la aplicación y usar el modelo `CL_mAporte`.
import { Controlador } from "./CL_controlador.js";
import { DATA_APORTES_INICIAL } from "./data.js";
import { CL_mAporte } from "./CL_mAporte.js";

// Clave usada en localStorage para persistir los aportes.
const STORAGE_KEY = "campanas_aportes_v1";

// saveAportes: guarda el array de aportes en localStorage.
// Se captura cualquier excepción para evitar romper la UI si el almacenamiento falla.
const saveAportes = (aportes: CL_mAporte[]) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(aportes)); }
  catch (e) { console.warn("No se pudo guardar en localStorage:", e); }
};

// loadAportes: lee los datos de localStorage y los mapea a instancias de CL_mAporte.
// Devuelve `null` si no hay nada guardado o si ocurre un error al parsear.
const loadAportes = (): CL_mAporte[] | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null; // sin datos persistidos
    const parsed = JSON.parse(raw) as any[];
    // Mapeo rápido: reconstruyo objetos CL_mAporte con lo guardado.
    // Uso `p.reportes ?? []` para mantener compatibilidad si no existía ese campo.
    return parsed.map(p => new CL_mAporte(
      p.id,
      p.fechaAporte,
      p.tipoAporte,
      p.descripcion,
      p.montoAporte,
      p.nombreAporte,
      p.tipoAportante,
      p.reportes ?? []
    ));
  } catch (e) { console.warn("No se pudo leer/parsear localStorage:", e); return null; }
};

// clearAportes: elimina la clave del localStorage (útil para pruebas).
const clearAportes = () => { try { localStorage.removeItem(STORAGE_KEY); } catch (e) { console.warn(e); } };

// Inicialización única al cargar el DOM.
// - cargo datos guardados o uso los datos iniciales del proyecto
// - instancio `Controlador` pasando `saveAportes` como callback para persistir cambios
// - configuro los botones de login/logout del modo administrador
// - expongo `clearAportes` en `window` para permitir limpieza desde la consola
document.addEventListener("DOMContentLoaded", () => {
  // Cargo datos guardados (si existen) o uso los datos iniciales del proyecto
  const inicial = loadAportes() ?? DATA_APORTES_INICIAL;

  // El controlador es responsable de toda la lógica y de notificar cambios.
  new Controlador(inicial, saveAportes);

  // Elementos de UI usados para alternar entre vistas (user/admin).
  const user = document.getElementById("user-section");
  const admin = document.getElementById("admin-section");
  const login = document.getElementById("btn-login-admin") as HTMLButtonElement | null;
  const logout = document.getElementById("btn-logout-admin") as HTMLButtonElement | null;

  // Por defecto oculto la vista admin y el botón de logout.
  if (admin) admin.classList.add("hidden");
  if (logout) logout.classList.add("hidden");

  // Login admin: pide contraseña y alterna las secciones.
  // La contraseña está hardcodeada a 'initcode' según tu requisito.
  login?.addEventListener("click", () => {
    const pwd = prompt("Contraseña admin:");
    if (pwd === "initcode") {
      admin?.classList.remove("hidden");
      user?.classList.add("hidden");
      login.classList.add("hidden");
      logout?.classList.remove("hidden");
    } else {
      alert("Contraseña incorrecta");
    }
  });

  // Logout admin: vuelve a mostrar la vista de usuario.
  logout?.addEventListener("click", () => {
    admin?.classList.add("hidden");
    user?.classList.remove("hidden");
    login?.classList.remove("hidden");
    logout.classList.add("hidden");
  });

  // Función expuesta para pruebas: limpia localStorage y recarga la página.
  (window as any).clearAportes = () => { clearAportes(); location.reload(); };
  // resetAportes: restaura los datos precargados definidos en `data.ts`
  // y recarga la página. Útil para volver al estado inicial durante pruebas.
  (window as any).resetAportes = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DATA_APORTES_INICIAL));
    } catch (e) {
      console.warn('No se pudo escribir en localStorage:', e);
    }
    location.reload();
  };
});
