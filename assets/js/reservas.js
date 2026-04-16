/* reservas.js
   Este archivo hace 3 cosas:
   1) muestra las reservas del cliente que inició sesión
   2) rellena automáticamente nombre y correo en el formulario
   3) permite agregar una nueva reserva de forma simple
*/

document.addEventListener("DOMContentLoaded", function () {
  cargarReservasCliente();
  prepararFormularioReserva();
});

function cargarReservasCliente() {
  const contenedor = document.getElementById("reservasContainer");
  const loginPrompt = document.getElementById("loginPrompt");
  const formWrapper = document.getElementById("reservaFormWrapper");
  if (!contenedor) return;

  const sesionGuardada = localStorage.getItem("hotel_session");

  if (!sesionGuardada) {
    contenedor.innerHTML = "";
    if (loginPrompt) loginPrompt.hidden = false;
    if (formWrapper) formWrapper.style.display = "none";
    return;
  }

  const sesion = JSON.parse(sesionGuardada);

  if (sesion.role !== "cliente") {
    contenedor.innerHTML = "<p style='text-align:center;color:#ffffff;background:rgba(0,0,0,0.45);padding:10px 16px;border-radius:8px;max-width:560px;margin:0 auto 26px;'>Esta sección es solo para clientes.</p>";
    if (loginPrompt) loginPrompt.hidden = true;
    if (formWrapper) formWrapper.style.display = "none";
    return;
  }

  if (loginPrompt) loginPrompt.hidden = true;
  if (formWrapper) formWrapper.style.display = "block";

  fetch("../assets/data/reservas.json")
    .then(function (respuesta) {
      return respuesta.json();
    })
    .then(function () {
      const reservasLocales = JSON.parse(localStorage.getItem("reservas_locales")) || [];

      const reservasCliente = reservasLocales.filter(function (reserva) {
        return reserva.email.toLowerCase() === sesion.email.toLowerCase();
      });

      if (reservasCliente.length === 0) {
        contenedor.innerHTML = `
          <div class="reserva-welcome">Bienvenido(a), ${sesion.name}</div>
          <article class="reserva-empty">
            <h3>Aún no tienes reservaciones</h3>
            <p>Completa el formulario de abajo para registrar tu próxima estadía.</p>
          </article>
        `;
        return;
      }

      contenedor.innerHTML = `<div class="reserva-welcome">Bienvenido(a), ${sesion.name}</div>`;

      reservasCliente.forEach(function (reserva) {
        contenedor.innerHTML += `
          <article class="reserva-card">
            <div class="reserva-card__header">
              <h3 class="reserva-card__title">Reserva #${reserva.id}</h3>
              <span class="reserva-card__badge">${reserva.estado}</span>
            </div>
            <div class="reserva-card__details">
              <div class="reserva-detail">
                <span>Cliente</span>
                <strong>${reserva.cliente}</strong>
              </div>
              <div class="reserva-detail">
                <span>Reservación</span>
                <strong>${reserva.habitacion}</strong>
              </div>
              <div class="reserva-detail">
                <span>Check-in</span>
                <strong>${reserva.checkIn}</strong>
              </div>
              <div class="reserva-detail">
                <span>Check-out</span>
                <strong>${reserva.checkOut}</strong>
              </div>
              <div class="reserva-detail">
                <span>Total a pagar</span>
                <strong>$${(reserva.totalPrice || 0).toFixed(2)}</strong>
              </div>
            </div>
          </article>
        `;
      });
    })
    .catch(function (error) {
      console.log("Error al cargar reservas:", error);
      contenedor.innerHTML = "<p>No se pudieron cargar las reservas.</p>";
    });
}

function prepararFormularioReserva() {
  const formulario = document.getElementById("miFormulario");
  if (!formulario) return;

  const sesionGuardada = localStorage.getItem("hotel_session");
  if (!sesionGuardada) return;

  const sesion = JSON.parse(sesionGuardada);

  if (sesion.role !== "cliente") return;

  const campoNombre = document.getElementById("name");
  const campoEmail = document.getElementById("email");
  const fechaEntradaInput = document.getElementById("arrival-date");
  const fechaSalidaInput = document.getElementById("departure-date");
  const nochesInput = document.getElementById("nights");
  const roomsInput = document.getElementById("rooms");
  const roomTypeSelect = document.getElementById("room-type");

  // Mapeo de precios para habitaciones y paquetes
  const preciosMap = {
    "Habitación Simple": 50,
    "Habitación Doble": 80,
    "Suite": 150,
    "Paquete Romántico": 150,
    "Paquete Familiar": 200,
    "Paquete de Negocios": 120
  };

  if (campoNombre) {
    campoNombre.value = sesion.name;
  }

  if (campoEmail) {
    campoEmail.value = sesion.email;
  }

  // Pre-seleccionar habitación o paquete si viene desde otra página
  if (roomTypeSelect) {
    const params = new URLSearchParams(window.location.search);
    const reservaParam = params.get("habitacion") || params.get("paquete");

    if (reservaParam) {
      const opcion = Array.from(roomTypeSelect.options).find(
        function (o) {
          return o.value && o.value.toLowerCase() === reservaParam.toLowerCase();
        }
      );

      if (opcion) {
        roomTypeSelect.value = opcion.value;
      }
    }
  }

  // Obtener fecha actual en formato YYYY-MM-DD
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  const fechaMinima = `${anio}-${mes}-${dia}`;

  // Bloquear fechas anteriores a hoy
  fechaEntradaInput.min = fechaMinima;
  fechaSalidaInput.min = fechaMinima;

  function calcularNoches() {
    const entrada = fechaEntradaInput.value;
    const salida = fechaSalidaInput.value;

    if (!entrada || !salida) {
      nochesInput.value = "";
      actualizarPrecioTotal();
      return;
    }

    const fechaEntrada = new Date(entrada);
    const fechaSalida = new Date(salida);

    const diferencia = fechaSalida - fechaEntrada;
    const noches = diferencia / (1000 * 60 * 60 * 24);

    if (noches > 0) {
      nochesInput.value = noches;
      actualizarPrecioTotal();
    } else {
      nochesInput.value = "";
      actualizarPrecioTotal();
    }
  }

  function actualizarPrecioTotal() {
    const tipoSeleccionado = roomTypeSelect.value;
    const cantidad = roomsInput.value || 0;
    const noches = nochesInput.value || 0;
    
    const precioUnitario = preciosMap[tipoSeleccionado] || 0;
    const total = precioUnitario * cantidad * noches;
    
    const precioDisplay = document.getElementById("precio-unitario");
    const cantidadDisplay = document.getElementById("cantidad-display");
    const nochesDisplay = document.getElementById("noches-display");
    const totalDisplay = document.getElementById("total-precio");
    
    if (precioDisplay) {
      precioDisplay.textContent = precioUnitario > 0 ? "$" + precioUnitario + ".00" : "-";
    }
    if (cantidadDisplay) {
      cantidadDisplay.textContent = cantidad > 0 ? cantidad : "-";
    }
    if (nochesDisplay) {
      nochesDisplay.textContent = noches > 0 ? noches : "-";
    }
    if (totalDisplay) {
      totalDisplay.textContent = total > 0 ? "$" + total.toFixed(2) : "$0.00";
    }
  }

  fechaEntradaInput.addEventListener("change", function () {
    // La salida no puede ser anterior a la entrada
    fechaSalidaInput.min = fechaEntradaInput.value || fechaMinima;

    // Si ya había una fecha de salida menor, la limpiamos
    if (fechaSalidaInput.value && fechaSalidaInput.value <= fechaEntradaInput.value) {
      fechaSalidaInput.value = "";
    }

    calcularNoches();
  });

  fechaSalidaInput.addEventListener("change", calcularNoches);

  roomTypeSelect.addEventListener("change", actualizarPrecioTotal);
  roomsInput.addEventListener("change", actualizarPrecioTotal);
  roomsInput.addEventListener("input", actualizarPrecioTotal);

  formulario.addEventListener("submit", function (e) {
    e.preventDefault();
    guardarNuevaReserva(sesion, preciosMap);
  });
}

function guardarNuevaReserva(sesion, preciosMap) {
  const nombre = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const llegada = document.getElementById("arrival-date").value;
  const salida = document.getElementById("departure-date").value;
  const noches = document.getElementById("nights").value;
  const habitaciones = document.getElementById("rooms").value;
  const tipoHabitacion = document.getElementById("room-type").value;

  if (!nombre || !email || !llegada || !salida || !noches || !habitaciones || !tipoHabitacion) {
    alert("Por favor completa todos los campos.");
    return;
  }

  const fechaLlegada = new Date(llegada);
  const fechaSalida = new Date(salida);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (fechaLlegada < hoy) {
    alert("La fecha de llegada no puede ser anterior a hoy.");
    return;
  }

  if (fechaSalida < hoy) {
    alert("La fecha de salida no puede ser anterior a hoy.");
    return;
  }

  if (fechaSalida <= fechaLlegada) {
    alert("La fecha de salida debe ser posterior a la fecha de llegada.");
    return;
  }

  if (noches <= 0) {
    alert("Las fechas no son válidas.");
    return;
  }

  let reservasLocales = JSON.parse(localStorage.getItem("reservas_locales")) || [];

  const precioUnitario = preciosMap[tipoHabitacion] || 0;
  const totalPrice = precioUnitario * habitaciones * noches;

  const nuevaReserva = {
    id: Date.now(),
    cliente: nombre,
    email: email,
    habitacion: tipoHabitacion,
    checkIn: llegada,
    checkOut: salida,
    estado: "Pendiente",
    nights: noches,
    rooms: habitaciones,
    precioUnitario: precioUnitario,
    totalPrice: totalPrice
  };

  reservasLocales.push(nuevaReserva);
  localStorage.setItem("reservas_locales", JSON.stringify(reservasLocales));

  alert("Reserva guardada correctamente.\nTotal a pagar: $" + totalPrice.toFixed(2));

  document.getElementById("arrival-date").value = "";
  document.getElementById("departure-date").value = "";
  document.getElementById("nights").value = "";
  document.getElementById("rooms").value = "";
  document.getElementById("room-type").selectedIndex = 0;
  document.getElementById("precio-unitario").textContent = "-";
  document.getElementById("cantidad-display").textContent = "-";
  document.getElementById("noches-display").textContent = "-";
  document.getElementById("total-precio").textContent = "$0.00";

  // Restaurar límite mínimo de salida
  const fechaEntradaInput = document.getElementById("arrival-date");
  const fechaSalidaInput = document.getElementById("departure-date");
  fechaSalidaInput.min = fechaEntradaInput.min;
  cargarReservasCliente();
}