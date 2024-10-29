const userId = sessionStorage.getItem('usuarioId');

const socket = io('/', {
    autoConnect: false, // No conectes automáticamente al cargar el archivo
    query: { userId }, // Enviar el ID del usuario en la query
});


document.addEventListener("DOMContentLoaded", function () {
    socket.on('mensajePrivado', (mensaje) => {
        console.log('Mensaje privado recibido:', mensaje);

        mandarNotificacion(`Nuevo mensaje: ${mensaje.texto} de: ${mensaje.usuarioEmisor}`, 'success');

        const paginaInicio = sessionStorage.getItem('pagina');
        if (paginaInicio === 'inicio') {
            mostrarListaMensajes();
        }
    });
});


function conectarSocket(token) {
    socket.connect(); // Conectar al WebSocket

    socket.on('connect', () => {
        console.log('Conectado al WebSocket', userId);
        socket.emit('usuarioConectado', { token }); // Enviar token al servidor
    });

    // Escuchar mensajes del servidor
    socket.on('mensaje', (mensaje) => {
        console.log('Mensaje recibido:', mensaje);
        mandarNotificacion(mensaje.texto, 'info');
    });
}

function conectarWSIo() {

    const token = sessionStorage.getItem('token'); // Obtener el token de las cookies
    if (token) {
        conectarSocket(token); // Conectar al WebSocket si hay un token
    }
}




