document.addEventListener('DOMContentLoaded', (event) => {
    cargarPeliculas()
        .then(() => cargarCarrito())
        .catch(error => console.error('Error al cargar datos:', error));
});

let items = [];
let carrito = [];
let total = 0;
const TASA_INTERES = 0.1;

document.getElementById('comprar').addEventListener('click', () => mostrarPeliculas(false));
document.getElementById('alquilar').addEventListener('click', () => mostrarPeliculas(true));
document.getElementById('verCarrito').addEventListener('click', mostrarCarrito);
document.getElementById('finalizarCompra').addEventListener('click', mostrarFinalizar);
document.getElementById('borrarCarrito').addEventListener('click', borrarCarrito);
document.getElementById('calcularCuotas').addEventListener('click', calcularCuotas);
document.getElementById('pagoEfectivo').addEventListener('click', pagoEfectivo);
document.getElementById('pagoCuotas').addEventListener('click', pagoCuotas);

function cargarPeliculas() {
    return fetch('./data/peliculas.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            items = data;
            mostrarPeliculas(false);  // Mostrar todas las películas al inicio
        })
        .catch(error => {
            console.error('Error al cargar el archivo JSON:', error);
            alert('Hubo un problema al cargar las películas. Por favor, intente nuevamente más tarde.');
        });
}

function mostrarPeliculas(alquiler) {
    const peliculasDisponibles = document.getElementById('peliculasDisponibles');
    const listaPeliculas = document.getElementById('listaPeliculas');
    peliculasDisponibles.classList.remove('hidden');
    listaPeliculas.innerHTML = '';

    items.forEach((item, i) => {
        if ((alquiler && item.alquiler) || !alquiler) {
            const li = document.createElement('li');
            li.textContent = `${i + 1}: ${item.titulo} - ${item.genero} (${item.año}) - ${alquiler ? item.costoAlquilerPorDia + ' pesos por día' : item.precio + ' pesos'}`;
            li.dataset.index = i;
            listaPeliculas.appendChild(li);

            li.addEventListener('click', (event) => {
                seleccionarPelicula(i, alquiler);
            });
        }
    });
}

function seleccionarPelicula(index, alquiler) {
    const item = items[index];
    if (alquiler && item.alquiler) {
        let diasAlquiler = parseInt(prompt('Ingrese la cantidad de días de alquiler:'));
        if (!isNaN(diasAlquiler) && diasAlquiler > 0) {
            item.duracionAlquiler = diasAlquiler;
            carrito.push({ ...item, alquiler });
            total += item.costoAlquilerPorDia * diasAlquiler;
            alert(`${item.titulo} ha sido agregado al carrito por ${diasAlquiler} días.`);
        } else {
            alert('Por favor, ingrese un número válido de días.');
        }
    } else {
        carrito.push({ ...item, alquiler });
        total += item.precio;
        alert(`${item.titulo} ha sido agregado al carrito.`);
    }
    guardarCarrito();
}

function mostrarCarrito() {
    cargarCarrito();
    const carritoDiv = document.getElementById('carrito');
    const listaCarrito = document.getElementById('listaCarrito');
    const totalCarrito = document.getElementById('totalCarrito');
    carritoDiv.classList.remove('hidden');
    listaCarrito.innerHTML = '';

    carrito.forEach((item, i) => {
        const li = document.createElement('li');
        li.textContent = `${item.titulo} - ${item.genero} (${item.año}) - ${item.alquiler ? item.costoAlquilerPorDia + ' pesos por día' : item.precio + ' pesos'}`;
        listaCarrito.appendChild(li);
    });
    totalCarrito.textContent = total;
}

function mostrarFinalizar() {
    const finalizarDiv = document.getElementById('finalizar');
    const totalFinalizar = document.getElementById('totalFinalizar');
    finalizarDiv.classList.remove('hidden');
    totalFinalizar.textContent = total;

    const tieneAlquileres = carrito.some(item => item.alquiler);
    const cuotasDiv = document.getElementById('cuotas');
    if (tieneAlquileres) {
        cuotasDiv.classList.add('hidden');
    } else {
        cuotasDiv.classList.remove('hidden');
    }
}

function calcularCuotas() {
    const cantidadCuotas = parseInt(document.getElementById('cantidadCuotas').value);
    if (![3, 6].includes(cantidadCuotas)) {
        alert('Por favor, ingrese 3 o 6 cuotas.');
        return;
    }
    const totalConInteres = total * (1 + TASA_INTERES);
    const valorCuota = totalConInteres / cantidadCuotas;

    const resultadoCuotasDiv = document.getElementById('resultadoCuotas');
    const totalInteres = document.getElementById('totalInteres');
    const valorCuotaElement = document.getElementById('valorCuota');
    totalInteres.textContent = totalConInteres.toFixed(2);
    valorCuotaElement.textContent = valorCuota.toFixed(2);
    resultadoCuotasDiv.classList.remove('hidden');
}

function pagoEfectivo() {
    alert('Compra realizada con éxito. Total pagado: ' + total + ' pesos.');
    borrarCarrito();
    location.reload();
}

function pagoCuotas() {
    const cantidadCuotas = parseInt(document.getElementById('cantidadCuotas').value);
    if (![3, 6].includes(cantidadCuotas)) {
        alert('Por favor, ingrese 3 o 6 cuotas.');
        return;
    }
    alert('Compra en cuotas realizada con éxito. Total pagado con interés: ' + (total * (1 + TASA_INTERES)).toFixed(2) + ' pesos.');
    borrarCarrito();
    location.reload();
}

function cargarCarrito() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        total = carrito.reduce((sum, item) => sum + (item.alquiler ? item.costoAlquilerPorDia * item.duracionAlquiler : item.precio), 0);
    }
}

function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function borrarCarrito() {
    carrito = [];
    total = 0;
    localStorage.removeItem('carrito');
    mostrarCarrito();
    alert('El carrito ha sido borrado.');
}

function round(numero, decimales = 2) {
    const factor = Math.pow(10, decimales);
    return Math.round(numero * factor) / factor;
}