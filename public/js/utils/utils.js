const notyf = new Notyf({
    position: {
        x: 'right', // 'left' o 'right'
        y: 'top',   // 'top' o 'bottom'
    },
    duration: 3000, // Duración en milisegundos (5 segundos)
});


const modalConfirmacionPeticiones = document.querySelector('#modalConfirmacionPeticiones');
const confirmarModal = new bootstrap.Modal(modalConfirmacionPeticiones);
const modalAbrirListaAmigos = new bootstrap.Modal(document.querySelector('#modalAbrirListaAmigos'));

function mandarNotificacion(titulo, tipo) {
    if (tipo == 'warning') {
        notyf.error(titulo);
    } else if (tipo == 'error') {
        notyf.error(titulo);
    } else if (tipo == 'success') {
        notyf.success(titulo);
    }
}


async function enviarPeticiones(url, metodo = 'GET', data = null) {
    try {
        // No necesitas manejar el token manualmente, ya que el navegador enviará la cookie automáticamente

        const headers = {
            'Content-Type': 'application/json',
        };

        // Realiza la petición enviando cookies automáticamente
        const response = await fetch(url, {
            method: metodo,
            headers: headers,
            body: data ? JSON.stringify(data) : undefined,
            credentials: 'include'  // Asegura que las cookies sean enviadas con la solicitud
        });

        const respuesta = await response.json();
        console.log('respuesta', respuesta);
        return respuesta;

    } catch (error) {
        console.error('Error en la petición:', error);
    }
}

async function enviarImagenes(url, metodo = 'GET', data = null) {
    try {
        // No necesitas manejar el token manualmente, ya que el navegador enviará la cookie aquí

        // Realiza la petición enviando cookies aquí
        const response = await fetch(url, {
            method: metodo,
            body: data,
            credentials: 'include'  // Asegura que las cookies sean enviadas con la petición
        });

        const respuesta = await response.json();
        console.log('respuesta', respuesta);
        return respuesta;

    } catch (error) {
        console.error('Error en la petición:', error);
    }
}

function verClave(id, button) {
    const input = document.getElementById(id);
    const icon = button.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('mdi-eye');
        icon.classList.add('mdi-eye-off'); // Cambia al ícono del ojo tachado
    } else {
        input.type = 'password';
        icon.classList.remove('mdi-eye-off');
        icon.classList.add('mdi-eye'); // Cambia al ícono del ojo normal
    }
}

function abriModales(idModalMandado, estado) {
    const idModal = new bootstrap.Modal(document.getElementById(idModalMandado));
    if (estado) {
        idModal.show();
    } else {
        idModal.hide();
    }
}


async function reproducirSonidoNotificacion() {
    try {
        const sonido = new Audio('/sound/Diamond.mp3'); // Especifica la ruta de tu archivo de sonido
        await sonido.play();
        console.log("Sonido de notificación reproducido");
    } catch (error) {
        console.error("Error al reproducir el sonido de notificación:", error);
    }
}

async function refrescarToken() {
    const url = '../../usuarios/refreshToken/';

    try {
        const respuesta = await enviarPeticiones(url, 'POST');

        if (respuesta.estado) {
            console.log('Token actualizado correctamente');

            // borrar antiguo token 
            sessionStorage.removeItem('token');
            // Guardar el nuevo token
            sessionStorage.setItem('token', respuesta.token);
            // Guardar el nuevo tiempo de expiración del token
            const newExpirationTime = Date.now() + 55 * 60 * 1000;
            sessionStorage.setItem('tokenExpirationTime', newExpirationTime);

            // Reiniciar el temporizador
            iniciarTemporizadorToken();
        } else {
            console.warn('Error al refrescar el token:', respuesta);
        }
    } catch (error) {
        console.error('Error al actualizar el token:', error);
    }
}

function iniciarTemporizadorToken() {
    const tokenExpirationTime = sessionStorage.getItem('tokenExpirationTime');
    const tiempoRestante = tokenExpirationTime ? tokenExpirationTime - Date.now() : 0;

    if (tiempoRestante > 0) {
        const minutos = Math.floor(tiempoRestante / 60000);
        const segundos = Math.floor((tiempoRestante % 60000) / 1000);
        console.log(`Tiempo restante para el token: ${minutos}m ${segundos}s`);

        // Configura el temporizador para refrescar el token antes de que expire
        setTimeout(refrescarToken, Math.min(tiempoRestante, 55 * 60 * 1000));
    } else {
        // Si el token ya expiró, refrescar inmediatamente
        refrescarToken();
    }
}