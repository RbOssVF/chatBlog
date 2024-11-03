const modalConfirmacionPeticiones3 = new bootstrap.Modal(document.querySelector('#modalConfirmacionPeticiones'));


document.addEventListener("DOMContentLoaded", async function () {
    await obtenerDatosPerfil()
    await obtenerListaAmigos()
    conectarWSIo()

    if (sessionStorage.getItem('token')) {
        iniciarTemporizadorToken();
    }

})

async function obtenerDatosPerfil() {
    const txtDatosUsuarioOcultos = document.getElementById('txtDatosUsuarioOcultos');
    const idUsuario = txtDatosUsuarioOcultos.getAttribute('data-id-usuario');
    const estadoUsuarioPerfil = document.getElementById('estadoUsuarioPerfil');
    const datosUsuarioPerfil = document.getElementById('datosUsuarioPerfil');
    const perfilUsuarioDatos = document.getElementById('perfilUsuarioDatos');
    const urlServer = `../../usuarios/seleccionarUsuario/${idUsuario}`;
    let html = ''

    try {
        
        const respuesta = await enviarPeticiones(urlServer);
        if (respuesta.estado){
            
            perfilUsuarioDatos.innerHTML = `<img class=" img-xl rounded-circle imagen-cuadrada" src="/images/perfiles/${respuesta.usuario.perfil}" alt="">`
            
            if (respuesta.usuario.conectado) {
                estadoUsuarioPerfil.innerHTML = `<h6 class="font-weight-bold">
                                            <span class="text-success">Activo</span>
                                        </h6>`;
            }else{
                estadoUsuarioPerfil.innerHTML = `<h6 class="font-weight-bold">
                                            <span class="text-danger">Inactivo</span>
                                        </h6>`;
            }

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
            </div>

            <div class="col-md-12 d-flex flex-column flex-md-row justify-content-between mt-3">
                <button class="btn btn-facebook btn-sm mb-2 mb-md-0" onclick="eliminarAmigo(${idUsuario})">Eliminar amigo</button>
                <button class="btn btn-behance btn-sm mb-2 mb-md-0" onclick="bloquearAmigo(${idUsuario})">Bloquear</button>
                <button class="btn btn-primary btn-sm" onclick="empezarChatAhora(${idUsuario})">Enviar mensaje</button>
            </div>`

            datosUsuarioPerfil.innerHTML = html;

        }

    } catch (error) {
        html = `<div class="alert alert-danger" role="alert">
                    ${error}
                </div>`
        datosUsuarioPerfil.innerHTML = html;
        return;
    }

}

async function obtenerListaAmigos() {
    const idAmigo = document.getElementById('txtDatosUsuarioOcultos').getAttribute('data-id-usuario');
    const url = `../../confAmistad/listaAmistadesUsuario/${idAmigo}/`;
    let html = ''
    const divListaAmigosPerfil = document.querySelector('#divListaAmigosPerfil');
    const textCantidadAmigosPerfil = document.querySelector('#textCantidadAmigosPerfil');

    try {
        
        const respuesta = await enviarPeticiones(url);

        if (respuesta.estado) {

            if (respuesta.listaAmigos.length == 0) {
                divListaAmigosPerfil.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        No hay amigos
                    </div>
                `
                return;
            }
    
            textCantidadAmigosPerfil.innerHTML = `${respuesta.listaAmigos.length} ${respuesta.listaAmigos.length > 1 ? 'amigos' : 'amigo'}`

            respuesta.listaAmigos.map((amigo) => {
                html += `
                    <div class="preview-item border-bottom">
                        <div class="user-thumbnail me-3">
                            <img class="img-xs rounded-circle" src="/images/perfiles/${amigo.perfil}" alt="${amigo.nombreUsuario}">
                        </div>
                        <div class="preview-item-content d-sm-flex flex-grow">
                            <div class="flex-grow">
                                <h6 class="preview-subject">${amigo.nombreUsuario}</h6>
                                <p class="text-muted mb-0">${amigo.estado ? 'Conectado' : 'Inactivo'}</p>
                            </div>
                            <div class="mr-auto text-sm-right pt-2 pt-sm-0">
                                ${amigo.id == respuesta.usuarioLogueado ? 
                                    `<button class="btn btn-primary btn-icon" onclick="verMiPerfil()"><i class="mdi mdi-account"></i></button>` :
                                    `<button class="btn btn-primary btn-icon" onclick="verPerfilAmigodeAmigo(${amigo.id})"><i class="mdi mdi-account"></i></button>`
                                }
                            </div>
                        </div>
                    </div>
                `
            })

            divListaAmigosPerfil.innerHTML = html
        }

    } catch (error) {
        divListaAmigosPerfil.innerHTML = `
            <div class="alert alert-danger" role="alert">
                ${error}
            </div>
        `
        return;
    }
}

function verMiPerfil() {
    window.location.href = `/configuracion`
}
function verPerfilAmigodeAmigo(idAmigodeAmigo) {
    window.location.href = `/perfil/${idAmigodeAmigo}/`;
}

async function eliminarAmigo(idAmigo) {
    const url = `../../confAmistad/borrarAmistad/${idAmigo}/`;
    modalConfirmacionPeticiones3.show();
    const btnConfirmar = document.getElementById('btnConfirmar');

    btnConfirmar.addEventListener('click', async function () {
        modalConfirmacionPeticiones3.hide();
        try {
            const respuesta = await enviarPeticiones(url, 'POST');
            if (respuesta.estado) {
                listarAmigosConf();
            }
            mandarNotificacion(respuesta.message, respuesta.icono)
        } catch (error) {
            mandarNotificacion('Algo salio mal', 'error')
        }
    })
}


async function empezarChatAhora(idAmigo) {
    const url = `../../amistades/verChatUsuario/${idAmigo}/`;

    try {
        const respuesta = await enviarPeticiones(url, 'POST');
        if (respuesta.estado) {
            obtenerNuevosMensajes();
            if (window.location.pathname.includes("inicio")) {
                mostrarListaMensajes(parseInt(idAmigo));
                verChatUsuario(parseInt(idAmigo));
            } else {
                window.location.href = `/inicio?usuario=${idAmigo}`;
            }
        }
    } catch (error) {
        console.error(error);
    }
}