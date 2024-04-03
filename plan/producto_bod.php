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

    $idProducto = $data->idProducto;
    $detalleUnidadMedida = $data->detalleUnidadMedida;
	$precioCompra = $data->precioCompra;
    $detalleCompra = $data->detalleCompra;
	$id_marcaV = $data->id_marcaV;
    $descripcion = $data->descripcion;
	$codigoBarra = $data->codigoBarra;
    $ItemNumber = $data->ItemNumber;
	$activo = $data->activo;
    $sat = $data->sat;
	$ieps = $data->ieps;
    $iva = $data->iva;
	$factura = $data->factura;
    $STYLE_ITEM_ID = $data->STYLE_ITEM_ID;
	$precioCaja = $data->precioCaja;
    $cantidadMayoreo = $data->cantidadMayoreo;

    // Ejecutar la consulta para insertar la bodega
    $query = "CALL insertarproductop4('$idProducto', '$detalleUnidadMedida','$precioCompra', '$detalleCompra','$id_marcaV', '$descripcion','$codigoBarra', '$ItemNumber','$activo', '$sat','$ieps', '$iva','$factura', '$STYLE_ITEM_ID','$precioCaja', '$cantidadMayoreo')";
    $categoria = mysqli_query($enlace, $query);
	
    if ($categoria) {
        echo json_encode(array('success' => 1));
		
    } else {
        // Si hubo un problema con la consulta, devolver un mensaje de error
        echo json_encode(array('success' => 0, 'message' => 'Error al insertar la bodega'));
		echo "Error en la consulta: " . mysqli_error($enlace);
    }
}
?>
