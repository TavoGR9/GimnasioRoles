<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, X-Requested-With");
include('conexionBD.php');

// Manejo de solicitudes OPTIONS para CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Manejo de la solicitud de inserción de bodega
if (isset($_GET["insertar"])) {
    $data = json_decode(file_get_contents("php://input"));

    $id_bod = $data->id_bod;
    $email = $data->email;
    $idCategoriaP = $data->idCategoriaP;
	$codigoP = $data->codigoP;

    // Ejecutar la consulta para insertar la bodega
    $query = "CALL addBodegaEmpleado('$id_bod', '$email', '$idCategoriaP', '$codigoP')";
    $empleado = mysqli_query($enlace, $query);
	
    if ($empleado) {
        echo json_encode(array('success' => 1));
		
    } else {
        // Si hubo un problema con la consulta, devolver un mensaje de error
        echo json_encode(array('success' => 0, 'message' => 'Error al insertar la bodega'));
		echo "Error en la consulta: " . mysqli_error($enlace);
    }
}
?>
