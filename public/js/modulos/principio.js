//iniciar pagina
const modalUpdateDatosUsuario = new bootstrap.Modal(document.querySelector('#modalUpdateDatosUsuario'));

const btnSubirImagen = document.querySelector('.file-upload-browse');
const inpImagen = document.querySelector('.file-upload-default');
const inpDetallesImagen = document.querySelector('.file-upload-info');
const btnConfirmar = document.querySelector('#btnConfirmar');
const cambiarEstadoConectado = document.querySelector('#cambiarEstadoConectado');
const formularioUpdateDatos = document.querySelector('#formUpdateDatos');



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

    formularioUpdateDatos.addEventListener('submit', (event) => {
        event.preventDefault();

        const apellidos = document.getElementById('updateApellidos').value;
        const nombres = document.getElementById('updateNombres').value;
        const updateClave = document.getElementById('updateClave').value;
        const updateClave2 = document.getElementById('updateClave2').value;

        if (updateClave){
            if (updateClave !== updateClave2) {
                mandarNotificacion('Las contraseñas no coinciden', 'error')
                return;
            }
        }

        const jsonCuerpo = {
            apellidos: apellidos.trim(),
            nombres: nombres.trim(),
            clave: updateClave.trim(),
        }

        enviarPeticiones('/usuarios/actualizarUsuario/', 'POST', jsonCuerpo)
            .then(respuesta => {
                if (respuesta.estado) {
                    obtenerDatosUsuario();
                    formularioUpdateDatos.reset();
                    modalUpdateDatosUsuario.hide();
                }
                mandarNotificacion(respuesta.message, respuesta.icono)
            })
            .catch(error => {
                console.error(error);
            });
    });
})

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
