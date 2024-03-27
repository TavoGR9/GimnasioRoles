<?php

session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, X-Requested-With");
include('conexionBD.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['archivos']['error']) && $_FILES['archivos']['error'] === UPLOAD_ERR_OK) {
    $archivoZIP = $_FILES['archivos'];

    // Obtén otros campos del formulario
    $nombreArchivo = $_POST['nombreArchivo'];
    $tipoArchivo = $_POST['tipoArchivo'];
    $Gimnasio_idGimnasio = $_POST['Gimnasio_idGimnasio'];

    // Verifica el tipo de archivo si es necesario (puedes ajustar esto según tus necesidades)
    $tipoArchivoSubido = mime_content_type($archivoZIP['tmp_name']);
    if ($tipoArchivoSubido !== 'application/zip') {
        http_response_code(400); // Solicitud incorrecta
        echo json_encode(['success' => 0, 'msg' => 'error_tipo_archivo_no_soportado']);
        exit;
    }

    $directorioDestino = "/var/www/olympus.arvispace.com/gimnasioRoles/configuracion/superAdministrador/Documentacion/";

    // Genera un nombre único para el archivo ZIP
    $nombreArchivoUnico = uniqid('doc_') . '_archivos.zip';
    $docDestinoZIP = $directorioDestino . $nombreArchivoUnico;

    // Mueve el archivo ZIP al directorio de destino
    if (move_uploaded_file($archivoZIP['tmp_name'], $docDestinoZIP)) {
        $directorioRelativo = "olympus.arvispace.com/gimnasioRoles/configuracion/superAdministrador/Documentacion/";
        $docDestinoRelativa = $directorioRelativo . $nombreArchivoUnico;

        // Inserta información en la base de datos
        $sqlArchivo = $conexionBD->prepare("INSERT INTO archivos (nombreArchivo, tipoArchivo, contenidoArchivo, Gimnasio_idGimnasio) VALUES (?, ?, ?, ?)");
        $sqlArchivo->bind_param("sssi", $nombreArchivo, $tipoArchivo, $docDestinoRelativa, $Gimnasio_idGimnasio);

        if ($sqlArchivo->execute()) {
            echo json_encode(["success" => 1, "msg" => "Carga exitosa"]);
        } else {
            http_response_code(500); // Error interno del servidor
            echo json_encode(["success" => 0, "msg" => "error_al_insertar", "error" => $sqlArchivo->error]);
        }
    } else {
        http_response_code(500); // Error interno del servidor
        echo json_encode(["success" => 0, "msg" => "error_al_guardar_archivo"]);
    }

    exit();
} else {
    http_response_code(400); // Solicitud incorrecta
    echo json_encode(['success' => 0, 'msg' => 'error_archivo_no_recibido']);
    exit;
}



?>
