//iniciar pagina
const btnSubirImagen = document.querySelector('.file-upload-browse');
const inpImagen = document.querySelector('.file-upload-default');
const inpDetallesImagen = document.querySelector('.file-upload-info');
const btnConfirmar = document.querySelector('#btnConfirmar');

document.addEventListener("DOMContentLoaded", function () {
   
})

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
    const formData = {
        perfil : inpImagen.files[0].name        
    };
    enviarPeticiones(`/usuarios/registrarPerfil`, 'POST', formData)
        .then(respuesta => {
            if (respuesta.estatus) {
                mandarNotificacion(respuesta.message, respuesta.icono)
                confirmarModal.hide();
            }
        })
        .catch(error => {
            console.error(error);
        });
});