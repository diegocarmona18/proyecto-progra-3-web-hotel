/* main.js
   Este archivo se usa en todas las páginas.
   Se encarga de:
   1) revisar si hay sesión
   2) cambiar el botón del navbar
   3) proteger páginas privadas como dashboard y mis reservas
   4) mostrar acceso al dashboard solo para admin o staff
*/

document.addEventListener("DOMContentLoaded", function () {
  protegerRutasPrivadas();
  actualizarBotonNavbar();
  mostrarAccesoDashboard();
});

/* 
  Esta función revisa si la página actual necesita sesión
  y también valida el rol del usuario.
*/
function protegerRutasPrivadas() {
  const rutaActual = window.location.pathname;
  const sesionGuardada = localStorage.getItem("hotel_session");

  if (!sesionGuardada) {
    if (rutaActual.includes("/dashboard/") || rutaActual.includes("mi-reserva.html")) {
      window.location.href = obtenerRuta("login");
    }
    return;
  }

  const sesion = JSON.parse(sesionGuardada);

  if (rutaActual.includes("/dashboard/")) {
    if (sesion.role !== "admin" && sesion.role !== "staff") {
      window.location.href = obtenerRuta("inicio");
      return;
    }
  }

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

  if (!sesionGuardada) {
    botonNavbar.textContent = "Iniciar Sesión";
    botonNavbar.href = obtenerRuta("login");
    botonNavbar.onclick = null;
    return;
  }

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
  Muestra el acceso al dashboard solo para admin o staff
*/
function mostrarAccesoDashboard() {
  const dashboardItem = document.getElementById("navDashboardItem");
  if (!dashboardItem) return;

  const sesionGuardada = localStorage.getItem("hotel_session");
  if (!sesionGuardada) {
    dashboardItem.style.display = "none";
    return;
  }

  const sesion = JSON.parse(sesionGuardada);

  if (sesion.role === "admin" || sesion.role === "staff") {
    dashboardItem.style.display = "list-item";
  } else {
    dashboardItem.style.display = "none";
  }
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