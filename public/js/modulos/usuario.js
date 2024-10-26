const fromLogin = document.getElementById('formLogin');
const fromRegistro = document.getElementById('formRegistro');


//inicio de pagina
document.addEventListener("DOMContentLoaded", function () {

    // eliminar todo el localStorage
    localStorage.clear();

    // mandarNotificacion('Hola', 'error')
    fromLogin.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = document.getElementById('emailLogin').value;
        const clave = document.getElementById('claveLogin').value;
        
        if (email.trim() === '' || clave.trim() === '') {
            mandarNotificacion('Todos los campos son obligatorios', 'error')
            return;
        }

        const jsonCuerpo = {
            email: email,
            clave: clave
        }

        enviarPeticiones('/usuarios/loginUsuario', 'POST', jsonCuerpo)
            .then(respuesta => {
                if (respuesta.estado) {
                    fromLogin.reset();
                    document.cookie = `token=${respuesta.token}; path=/`;

                    sessionStorage.setItem('token', respuesta.token);
                    sessionStorage.setItem('usuarioId', respuesta.usuarioId);

                    window.location.href = '/inicio';
                }
                mandarNotificacion(respuesta.message, respuesta.icono)
            })
            .catch(error => {
                console.log(error);
            });
        
    });

    fromRegistro.addEventListener('submit', (event) => {
        event.preventDefault();
        const nombres = document.getElementById('rgsNombres').value;
        const apellidos = document.getElementById('rgsApellidos').value;
        const email = document.getElementById('rgsEmail').value;
        const clave = document.getElementById('rgsClave').value;
        const clave2 = document.getElementById('rgsClave2').value;
        const nombreUsuario = document.getElementById('rgsNombreUsuario').value;

        if (nombres.trim() === '' || apellidos.trim() === '' || email.trim() === '' || clave.trim() === '' || clave2.trim() === '' || nombreUsuario.trim() === '') {
            mandarNotificacion('Todos los campos son obligatorios', 'error')
            return;
        }

        if (clave !== clave2) {
            mandarNotificacion('Las contraseñas no coinciden', 'error')
            return;
        }

        const jsonCuerpo = {
            nombres: nombres,
            apellidos: apellidos,
            email: email,
            clave: clave,
            nombreUsuario: nombreUsuario,
            rolId : 2
        }

        enviarPeticiones('/usuarios/registrarUsuario', 'POST', jsonCuerpo)
            .then(respuesta => {
                if (respuesta.estado) {
                    document.getElementById("divLogin").style.display = 'block';
                    document.getElementById("divRegister").style.display = 'none';
                    fromRegistro.reset();
                }
                mandarNotificacion(respuesta.message, respuesta.icono)
            })
            .catch(error => {
                console.log(error);
            });

    });
});


