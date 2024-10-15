//iniciar pagina
const btnSubirImagen = document.querySelector('.file-upload-browse');
const inpImagen = document.querySelector('.file-upload-default');
const inpDetallesImagen = document.querySelector('.file-upload-info');
const btnConfirmar = document.querySelector('#btnConfirmar');
const cambiarEstadoConectado = document.querySelector('#cambiarEstadoConectado');

document.addEventListener("DOMContentLoaded", function () {

    btnSubirImagen.addEventListener('click', function () {
        inpImagen.click();
    });
    
    // Mostrar el nombre del archivo seleccionado en el campo de texto deshabilitado
    inpImagen.addEventListener('change', function () {
        if (inpImagen.files.length > 0) {
            // Abrir modal de confirmar registro de imagen 
            inpDetallesImagen.value = inpImagen.files[0].name;
            confirmarModal.show();
        }
    });
    
    btnConfirmar.addEventListener('click', function () { 
        const formData = new FormData();
        formData.append('perfil', inpImagen.files[0]);  // Asegúrate de enviar el archivo correctamente
        console.log(formData);
    
        enviarImagenes(`/usuarios/registrarPerfil`, 'POST', formData) // 'true' indica que no se envía como JSON
            .then(respuesta => {
                if (respuesta.estado) {                
                    confirmarModal.hide();
                    obtenerDatosUsuario();
                    inpDetallesImagen.value = '';
                }
                mandarNotificacion(respuesta.message, respuesta.icono);
            })
            .catch(error => {
                console.error(error);
            });
    });

    cambiarEstadoConectado.addEventListener('change', function () {
        const estado = cambiarEstadoConectado.checked;
        updateConectado(estado);
    });
})


function updateDatosUsuario() {
    const apellidosInput = document.getElementById('updateApellidos');
    const nombresInput = document.getElementById('updateNombres');
    
    const apellidos = apellidosInput.value;
    const nombres = nombresInput.value;

    const jsonCuerpo = {
        apellidos: apellidos.trim(),
        nombres: nombres.trim(),
    }

    enviarPeticiones('/usuarios/actualizarUsuario/', 'POST', jsonCuerpo)
        .then(respuesta => {
            if (respuesta.estado) {
                obtenerDatosUsuario();
                apellidosInput.value = "";
                nombresInput.value = "";
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
                window.location.href = '/';
                
            }
        })
        .catch(error => {
            console.error(error);
        });
}

function updateConectado(estado) {
    const jsonCuerpo = {
        estado: estado
    }

    enviarPeticiones(`/usuarios/cambiarEstadoConectado/`, 'POST', jsonCuerpo)
        .then(respuesta => {
            if (respuesta.estado) {
                obtenerDatosUsuario();
            }
            mandarNotificacion(respuesta.message, respuesta.icono)
        })
        .catch(error => {
            console.error(error);
        });
    
}

//permitir solo imagenes
