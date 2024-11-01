


document.addEventListener("DOMContentLoaded", function () {
    obtenerDatosUsuario();
    obtenerSolicitudes();
    obtenerNuevosMensajes();
    conectarWSIo()
})

function obtenerDatosUsuario() {
    const urlServer = `../../usuarios/obtenerUsuario/`;
    enviarPeticiones(urlServer)
        .then(respuesta => {

            if (respuesta.estado) {
                const nombreUsuario = document.getElementById('nombreUsuario');
                const nombreUsuarioNav = document.getElementById('nombreUsuarioNav');
                const ipUsuarioNav = document.getElementById('ipUsuarioNav');
                const cnsNombreUsuario = `${respuesta.usuario.nombres} ${respuesta.usuario.apellidos}`
                
                const perfilUsuarioNav = document.getElementById('perfilUsuarioNav');
                const perfilUsuarioHeader = document.getElementById('perfilUsuarioHeader');
                const estadoUsuarioNav = document.getElementById('estadoUsuarioNav');

                const datosUsuario = document.getElementById('datosUsuario');
                const estadoUsuario = document.getElementById('estadoUsuario');
                const cambiarEstadoConectado = document.getElementById('cambiarEstadoConectado');
                const perfilUsuario = document.getElementById('perfilUsuario');
                

                const usuarioPerfilGlobal = respuesta.usuario.perfil ? `/images/perfiles/${respuesta.usuario.perfil}` : 'images/faces/face15.jpg'

                nombreUsuario.innerHTML = cnsNombreUsuario;
                nombreUsuarioNav.innerHTML = respuesta.usuario.nombreUsuario;
                ipUsuarioNav.innerHTML = `#${respuesta.usuario.ipUser}`;
                
                perfilUsuarioNav.innerHTML = `<img class="img-xs rounded-circle " src="${usuarioPerfilGlobal}" alt="">`;
                perfilUsuarioHeader.innerHTML = `<img class="img-xs rounded-circle" src="${usuarioPerfilGlobal}" alt="">`;

                if (respuesta.usuario.conectado == true) {
                    estadoUsuarioNav.classList.remove('bg-danger');
                    estadoUsuarioNav.classList.add('bg-success');
                    estadoUsuarioNav.title = 'Conectado';
                }else{                                            
                    estadoUsuarioNav.classList.remove('bg-success');
                    estadoUsuarioNav.classList.add('bg-danger');
                    estadoUsuarioNav.title = 'Desconectado';
                }

                if (datosUsuario && estadoUsuario && cambiarEstadoConectado && perfilUsuario) {

                    cambiarEstadoConectado.checked = respuesta.usuario.conectado;
                    perfilUsuario.innerHTML = `<img class=" img-xl rounded-circle" src="${usuarioPerfilGlobal}" alt="">`

                    if (respuesta.usuario.conectado == true) {
                        estadoUsuario.innerHTML = `<h6 class="font-weight-bold">
                                                    <span class="text-success">Activo</span>
                                                </h6>`;
                    }else{
                        estadoUsuario.innerHTML = `<h6 class="font-weight-bold">
                                                    <span class="text-danger">Inactivo</span>
                                                </h6>`;
                    }
                    
                    let html = '';

                    html += `
                    <div class="col-md-6">
                        <h6 class="mb-1">${respuesta.usuario.nombres}</h6>
                    </div>
                    <div class="col-md-6 d-flex justify-content-end">
                        <p class="text-muted mb-0">${respuesta.usuario.apellidos}</p>
                    </div>
                    
                    <div class="col-md-6">
                        <h6 class="mb-1">${respuesta.usuario.nombreUsuario}</h6>
                    </div>
                    <div class="col-md-6 d-flex justify-content-end">
                        <p class="text-muted mb-0">#${respuesta.usuario.ipUser}</p>
                    </div>
                    <div class="col-md-6">
                        <h6 class="mb-1">${respuesta.usuario.email}</h6>
                    </div>
                    <div class="col-md-6 d-flex justify-content-end">
                        <p class="text-muted mb-0">Peru</p>
                    </div>`

                    datosUsuario.innerHTML = html;
                }
                
            }
            
        })
        .catch(error => {
            console.error(error);
        });
}


async function obtenerSolicitudes() {
    const urlServer = `../../amistades/solicitudes/`;
    try {
        const respuesta = await enviarPeticiones(urlServer);
        const idNotifiHay = document.querySelector('#idNotifiHay');
        const totalSolicitudes = document.querySelector('#totalSolicitudes');
        let htmlNotifi = ''

        idNotifiHay.innerHTML = htmlNotifi

        if (respuesta.estado) {
            if (respuesta.total > 0) {
                htmlNotifi = `<span class="count bg-danger"></span>`
                totalSolicitudes.textContent = `${respuesta.total} ${respuesta.total > 1 ? 'solicitudes nuevas' : 'solicitud nueva'}`; 
            }

            idNotifiHay.innerHTML = htmlNotifi
        }
    } catch (error) {
        console.log(error);
    }
}


async function obtenerListaSolicitudesAmistad() {
    const modalSolicitudesAmistad = 'modalSolicitudesAmistad';
    abriModales(modalSolicitudesAmistad, true)
    crearListaSolicitudes();
}

async function crearListaSolicitudes() {
    const urlServer = `amistades/solicitudes/`;
    const solicitudesAmistadUsuarios = document.querySelector('#solicitudesAmistadUsuarios');
    let html = ''
    try {
        const respuesta = await enviarPeticiones(urlServer);

        if (respuesta.estado) {
            if (respuesta.solicitudes.length > 0) {
                respuesta.solicitudes.forEach(solicitud => {
                    html += `
                        <div class="col-12">
                                <div class="preview-list">
                                    <div class="preview-item border-bottom">
                                        <div class="preview-thumbnail">
                                            <img class=" rounded-3" src="/images/perfiles/${solicitud.perfil}" alt="image">                                            
                                        </div>
                                        <div class="preview-item-content d-sm-flex flex-grow">
                                            <div class="flex-grow">
                                                <h6 class="preview-subject">${solicitud.nombreUsuario}</h6>
                                                <p class="text-muted mb-0">${solicitud.estado ? 'Conectado' : 'Inactivo'}</p>
                                            </div>
                                            <div class="mr-auto text-sm-right pt-2 pt-sm-0">
                                                <button class="btn btn-danger btn-icon" onclick="rechazarSolicitud(${solicitud.id})"><i class="mdi mdi-cancel"></i></button>
                                                <button class="btn btn-primary btn-icon" onclick="aceptarSolicitud(${solicitud.id})"><i class="mdi mdi-check"></i></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    `
                })

                solicitudesAmistadUsuarios.innerHTML = html

                return;

            } else {
                solicitudesAmistadUsuarios.innerHTML = `<div class="text-center">
                    <h6>No hay solicitudes</h6>
                </div>`

                return;
            }
        }


    } catch (error) {
        console.log(error);

    }
}


function aceptarSolicitud(idSolicitud) {
    const urlServer = `amistades/aceptarSolicitud/${idSolicitud}/`;
    enviarPeticiones(urlServer, 'POST')
        .then(respuesta => {
            if (respuesta.estado) {
                crearListaSolicitudes();
                contruirListaAmigosChat();
                obtenerSolicitudes();
            }
            mandarNotificacion(respuesta.message, respuesta.icono)
        })
        .catch(error => {
            console.error(error);
        });
}

function rechazarSolicitud(idSolicitud) {
    const urlServer = `amistades/rechazarSolicitud/${idSolicitud}/`;
    enviarPeticiones(urlServer, 'POST')
        .then(respuesta => {
            if (respuesta.estado) {
                crearListaSolicitudes();
                contruirListaAmigosChat();
                obtenerSolicitudes();
            }
            mandarNotificacion(respuesta.message, respuesta.icono)
        })
        .catch(error => {
            console.error(error);
        });
}

function logout() {
    enviarPeticiones(`/usuarios/logout`, 'POST')
        .then(respuesta => {
            if (respuesta.estado) {
                mandarNotificacion(respuesta.message, respuesta.icono)
                //eliminar localStorage
                localStorage.clear();                
                window.location.href = '/';
                
            }
        })
        .catch(error => {
            console.error(error);
        });
}

async function obtenerNuevosMensajes() {
    const urlServer = `../../amistades/nuevosMensajes/`;
    const nuevosMensajesUsuarios = document.querySelector('#nuevosMensajesUsuarios');
    const nuevoMensajeSpan = document.querySelector('#nuevoMensajeSpan');

    let html = ''
    try {
        const respuesta = await enviarPeticiones(urlServer);
        if (respuesta.estado) {

            if (respuesta.mensajes.length > 0) {
                nuevoMensajeSpan.innerHTML = `<span class="count bg-success"></span>`
            }else{
                nuevoMensajeSpan.innerHTML = ``
                nuevosMensajesUsuarios.innerHTML = `<div class="text-center">
                    <h6>No hay mensajes</h6>
                </div>`
                return;
            }

            respuesta.mensajes.map((usuario) => {
                html += `
                    <a class="dropdown-item preview-item" onclick="verChatUsuarioUrl(${usuario.id})">
                        <div class="preview-thumbnail">
                            <img src="/images/perfiles/${usuario.perfil}" alt="image"
                                class="rounded-circle profile-pic">
                        </div>
                        <div class="preview-item-content">
                            <p class="preview-subject ellipsis mb-1">${usuario.nombreUsuario} te envio un mensaje</p>
                            <p class="text-muted mb-0">${usuario.fecha}</p>
                        </div>
                    </a>
                `; 
            })

            nuevosMensajesUsuarios.innerHTML = html
        }

    } catch (error) {
        nuevosMensajesUsuarios.innerHTML = `<div class="text-center">
            <h6>No hay solicitudes</h6>
        </div>`
    }
}

async function verChatUsuarioUrl(idReceptor) {
    const url = `amistades/verChatUsuario/${idReceptor}/`;

    try {
        const respuesta = await enviarPeticiones(url, 'POST');
        if (respuesta.estado) {
            obtenerNuevosMensajes();
            if (window.location.pathname.includes("inicio")) {
                mostrarListaMensajes(parseInt(idReceptor));
                verChatUsuario(parseInt(idReceptor));
            } else {
                window.location.href = `/inicio?usuario=${idReceptor}`;
            }
        }
    } catch (error) {
        console.error(error);
    }
}
