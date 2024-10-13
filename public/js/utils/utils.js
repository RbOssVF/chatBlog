const notyf = new Notyf({
    position: {
        x: 'right', // 'left' o 'right'
        y: 'top',   // 'top' o 'bottom'
    },
    duration: 2000, // Duración en milisegundos (5 segundos)
});


const modalConfirmacionPeticiones = document.querySelector('#modalConfirmacionPeticiones');
const confirmarModal = new bootstrap.Modal(modalConfirmacionPeticiones);


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