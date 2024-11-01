const userId = sessionStorage.getItem('usuarioId');

const socket = io('/', {
    autoConnect: false, // No conectes automáticamente al cargar el archivo
    query: { userId }, // Enviar el ID del usuario en la query
});


document.addEventListener("DOMContentLoaded", function () {

    socket.on('mensajePrivado', (mensaje) => {
        console.log('Mensaje privado recibido:', mensaje);

        mandarNotificacion(`Nuevo mensaje: ${mensaje.texto} de: ${mensaje.usuarioEmisor}`, 'success');
        reproducirSonidoNotificacion();
        obtenerNuevosMensajes()

        const paginaInicio = sessionStorage.getItem('pagina');
        const chatActivo = sessionStorage.getItem('chatActivo');

        if (paginaInicio === 'inicio') {
            if (chatActivo) {
                mostrarListaMensajes(chatActivo)
            }
            else {
                mostrarListaMensajes()
            }
        }
    });

    socket.on('mensajeVisto', (mensaje) => {
        console.log('Mensaje recibido:', mensaje);
        const chatActivo = sessionStorage.getItem('chatActivo');
        const paginaInicio = sessionStorage.getItem('pagina');

        if (chatActivo && paginaInicio === 'inicio') {
            if (parseInt(chatActivo) === mensaje.elQuevio) {
                console.log('entro aqui');
                mostrarListaMensajes(mensaje.elQuevio)
                crearChatUsuario(mensaje.elQuevio)
            }
            else{
                mostrarListaMensajes(parseInt(chatActivo))
            }
        }
    });

    socket.on('solicitarAmistad', (mensajeSolicitud) => {
        console.log('Solicitar amistad:', mensajeSolicitud);
        const idUsuario = sessionStorage.getItem('usuarioId');

        if (mensajeSolicitud.usuarioRecId === parseInt(idUsuario)) {
            reproducirSonidoNotificacion();
            mandarNotificacion(mensajeSolicitud.message, 'success');
            obtenerSolicitudes();
        }
    })
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


