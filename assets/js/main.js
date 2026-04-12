/* main.js
   Este archivo se usa en todas las páginas.
   Se encarga de:
   1) revisar si hay sesión
   2) cambiar el botón del navbar
   3) proteger páginas privadas como dashboard y mis reservas
*/

document.addEventListener("DOMContentLoaded", function () {
  protegerRutasPrivadas();
  actualizarBotonNavbar();
});

/* 
  Esta función revisa si la página actual necesita sesión
  y también valida el rol del usuario.
*/
function protegerRutasPrivadas() {
  const rutaActual = window.location.pathname;
  const sesionGuardada = localStorage.getItem("hotel_session");

  // Si no hay sesión y quiere entrar a páginas privadas
  if (!sesionGuardada) {
    if (rutaActual.includes("/dashboard/") || rutaActual.includes("mi-reserva.html")) {
      window.location.href = obtenerRuta("login");
    }
    return;
  }

  const sesion = JSON.parse(sesionGuardada);

  // Si entra al dashboard, solo admin o staff pueden verlo
  if (rutaActual.includes("/dashboard/")) {
    if (sesion.role !== "admin" && sesion.role !== "staff") {
      window.location.href = obtenerRuta("inicio");
      return;
    }
  }

  // Si entra a Mis Reservas, solo cliente puede verlo
  if (rutaActual.includes("mi-reserva.html")) {
    if (sesion.role !== "cliente") {
      window.location.href = obtenerRuta("inicio");
      return;
    }
  }
}

/*
  Cambia el botón del navbar según exista sesión o no.
*/
function actualizarBotonNavbar() {
  const botonNavbar = document.getElementById("navAuth");
  if (!botonNavbar) return;

  const sesionGuardada = localStorage.getItem("hotel_session");

  // Si NO hay sesión
  if (!sesionGuardada) {
    botonNavbar.textContent = "Iniciar Sesión";
    botonNavbar.href = obtenerRuta("login");
    botonNavbar.onclick = null;
    return;
  }

  // Si SÍ hay sesión
  const sesion = JSON.parse(sesionGuardada);

  botonNavbar.textContent = `Cerrar sesión (${sesion.name})`;
  botonNavbar.href = "#";

  botonNavbar.onclick = function (e) {
    e.preventDefault();

    localStorage.removeItem("hotel_session");
    localStorage.removeItem("busqueda_hotel");

    window.location.href = obtenerRuta("inicio");
  };
} 
/*
  Devuelve la ruta correcta según en qué carpeta esté la página.
*/
function obtenerRuta(destino) {
  const rutaActual = window.location.pathname;
  const estoyEnSubcarpeta =
    rutaActual.includes("/pages/") || rutaActual.includes("/dashboard/");

  if (destino === "login") {
    return estoyEnSubcarpeta ? "../login.html" : "login.html";
  }

  if (destino === "inicio") {
    return estoyEnSubcarpeta ? "../index.html" : "index.html";
  }

  if (destino === "habitaciones") {
    return estoyEnSubcarpeta ? "../pages/habitaciones.html" : "pages/habitaciones.html";
  }

  return "";
}