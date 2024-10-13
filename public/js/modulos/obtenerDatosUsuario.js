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
                const perfilUsuario = document.getElementById('perfilUsuario');
                const perfilUsuarioNav = document.getElementById('perfilUsuarioNav');
                const perfilUsuarioHeader = document.getElementById('perfilUsuarioHeader');
                const nombresUsuario = document.getElementById('nombresUsuario');
                const emailUsuario = document.getElementById('emailUsuario');

                const usuarioPerfilGlobal = respuesta.usuario.perfil ? `/images/perfiles/${respuesta.usuario.perfil}` : 'images/faces/face15.jpg'

                nombreUsuario.innerHTML = cnsNombreUsuario;
                nombreUsuarioNav.innerHTML = respuesta.usuario.nombreUsuario;
                ipUsuarioNav.innerHTML = `#${respuesta.usuario.ipUser}`;
                perfilUsuario.innerHTML = `<img class=" img-xl rounded-circle" src="${usuarioPerfilGlobal}" alt="">`
                perfilUsuarioNav.innerHTML = `<img class="img-xs rounded-circle " src="${usuarioPerfilGlobal}" alt="">`;
                perfilUsuarioHeader.innerHTML = `<img class="img-xs rounded-circle" src="${usuarioPerfilGlobal}" alt="">`;
                nombresUsuario.innerHTML = `${respuesta.usuario.nombres} ${respuesta.usuario.apellidos}`;
                emailUsuario.innerHTML = respuesta.usuario.email;
            }
            
        })
        .catch(error => {
            console.error(error);
        });
}