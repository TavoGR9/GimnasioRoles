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

    // Validar que los datos requeridos estén presentes
    if (!isset($data->nombre) || !isset($data->direccion) || !isset($data->numeroTelefonico)) {
        echo json_encode(array('success' => 0, 'message' => 'Faltan datos requeridos'));
        exit();
    }

    $nombre = $data->nombre;
    $direccion = $data->direccion;
    $numeroTelefonico = $data->numeroTelefonico;

    // Ejecutar la consulta para insertar la bodega
    $query = "CALL addBodega('$nombre', '$direccion', '$numeroTelefonico', @id_bodega)";
    $empleado = mysqli_query($enlace, $query);
	
    if ($empleado) {
		$id_bodega = mysqli_query($enlace, "SELECT @id_bodega as id_bodega")->fetch_assoc()['id_bodega'];
        echo json_encode(array('success' => 1, 'id_bodega' => $id_bodega));
		
    } else {
        // Si hubo un problema con la consulta, devolver un mensaje de error
        echo json_encode(array('success' => 0, 'message' => 'Error al insertar la bodega'));
		echo "Error en la consulta: " . mysqli_error($enlace);
    }
}

if (isset($_GET["consultar"])) {
    // Crear la conexión a la base de datos (suponiendo que ya has incluido el archivo de conexión)

    // Llamar al procedimiento almacenado para obtener las bodegas
    $query = "CALL getBodegasT()";

    // Ejecutar la consulta
    $result = mysqli_query($enlace, $query);

    if ($result) {
        // Si la consulta se ejecutó correctamente, obtener los datos y devolverlos como respuesta JSON
        $resultado = mysqli_fetch_all($result,MYSQLI_ASSOC);
        echo json_encode($resultado);
        exit();
		
    } else {
        // Si hubo un problema con la consulta, devolver un mensaje de error
        echo json_encode(array('success' => 0, 'message' => 'Error al consultar las bodegas'));
        // Además, puedes imprimir el error de MySQL para obtener más detalles sobre el problema
        echo "Error en la consulta: " . mysqli_error($enlace);
    }

    // Cerrar la conexión a la base de datos
    mysqli_close($enlace);
}

if (isset($_GET["actualizar"])) {
    $data = json_decode(file_get_contents("php://input"));

    // Validar que los datos requeridos estén presentes
    if (!isset($data->nombre) || !isset($data->direccion) || !isset($data->numeroTelefonico)) {
        echo json_encode(array('success' => 0, 'message' => 'Faltan datos requeridos'));
        exit();
    }

    $nombre = $data->nombre;
    $direcc = $data->direccion;
    $numero = $data->numeroTelefonico;

    // Ejecutar la consulta para insertar la bodega
    $query = "CALL updateBodega('$nombre', '$direcc', '$numero')";
    $empleado = mysqli_query($enlace, $query);
	
    if ($empleado) {
        echo json_encode(array('success' => 1));
		exit();
    } else {
        // Si hubo un problema con la consulta, devolver un mensaje de error
        echo json_encode(array('success' => 0, 'message' => 'Error al insertar la bodega'));
		echo "Error en la consulta: " . mysqli_error($enlace);
    }
}

?>
