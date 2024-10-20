document.addEventListener("DOMContentLoaded", function () {
    obtenerDatosUsuario();
})

function obtenerDatosUsuario() {
    const urlServer = `usuarios/obtenerUsuario/`;
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

function logout() {
    enviarPeticiones(`/usuarios/logout`, 'POST')
        .then(respuesta => {
            if (respuesta.estado) {
                mandarNotificacion(respuesta.message, respuesta.icono)                
                window.location.href = '/';
                
            }
        })
        .catch(error => {
            console.error(error);
        });
}