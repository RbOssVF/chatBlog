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
                const nombresUsuario = document.getElementById('nombresUsuario');
                const emailUsuario = document.getElementById('emailUsuario');
                const perfilUsuario = document.getElementById('perfilUsuario');

                const cambiarEstadoConectado = document.getElementById('cambiarEstadoConectado');
                const estadoUsuario = document.getElementById('estadoUsuario');
                const estadoUsuarioNav = document.getElementById('estadoUsuarioNav');

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

                if (cambiarEstadoConectado && estadoUsuario && perfilUsuario && nombresUsuario && emailUsuario) {
                    cambiarEstadoConectado.checked = respuesta.usuario.conectado;

                    nombresUsuario.innerHTML = `${respuesta.usuario.nombres} ${respuesta.usuario.apellidos}`;

                    emailUsuario.innerHTML = respuesta.usuario.email;

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
                }
                
            }
            
        })
        .catch(error => {
            console.error(error);
        });
}