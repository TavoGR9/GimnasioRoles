<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, X-Requested-With");
include('conexionBD.php');


// Consulta datos y recepciona una clave para consultar dichos datos con dicha clave
if (isset($_GET["consultar"])) {
    $sqlPlan = mysqli_query(
        $enlace,
        "SELECT * FROM bodega
 WHERE id_bodega =" . $_GET["consultar"]
    );
    if (mysqli_num_rows($sqlPlan) > 0) {
        $plan = mysqli_fetch_all($sqlPlan, MYSQLI_ASSOC);
        echo json_encode($plan);
        exit();
    } else {
        echo json_encode(["success" => 0]);
    }
}

if (isset($_GET["consultarArchivos"])) {
    $sqlPlan = mysqli_query(
        $enlace,
        "SELECT nombreArchivo, contenidoArchivo FROM archivos
         WHERE Gimnasio_idGimnasio =" . $_GET["consultarArchivos"]
    );
    if ($sqlPlan) {
        if (mysqli_num_rows($sqlPlan) > 0) {
            $plan = mysqli_fetch_all($sqlPlan, MYSQLI_ASSOC);
            echo json_encode($plan);
        } else {
            echo json_encode(["success" => 0]);
        }
    } else {
        // Manejar el caso de error en la consulta
        echo json_encode(["success" => 0, "error" => mysqli_error($enlace)]);
    }
    exit();
}


//obtener gimnasios activos y inactivos
if (isset($_GET["consultarGimnasios"])) {
    $sqlPlan = mysqli_query(
        $enlace,
        "SELECT * FROM bodega WHERE idBodega != 1"
    );
    if (mysqli_num_rows($sqlPlan) > 0) {
        $plan = mysqli_fetch_all($sqlPlan, MYSQLI_ASSOC);
        echo json_encode($plan);
        exit();
    } else {
        echo json_encode(["success" => 0]);
    }
}

//borrar pero se le debe de enviar una clave ( para borrado )
if (isset($_GET["borrar"])) {
    $sqlPlan = mysqli_query(
        $enlace,
        "DELETE FROM Gimnasio
 WHERE idBodega =" . $_GET["borrar"]
    );
    if ($sqlPlan) {
        echo json_encode(["success" => 1]);
        exit();
    } else {
        echo json_encode(["success" => 0]);
    }
}
//Inserta un nuevo registro y recepciona en método post los datos de nombre y correo
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    if(isset($_GET["insertar"])){

    $nombreBodega = $data->nombreBodega;
    $codigoPostal = $data->codigoPostal;
    $estado = $data->estado;
    $ciudad = $data->ciudad;
    $colonia = $data->colonia;
    $calle = $data->calle;
    $numExt = $data->numExt;
    $numInt = isset($data->numInt) && $data->numInt !== "" ? $data->numInt : NULL; 
    $numeroTelefonico = $data->numeroTelefonico;
    $tipo = $data->tipo;
    $estatus = $data->estatus;
    $Franquicia_idFranquicia = $data->Franquicia_idFranquicia;
    $casilleros = $data->casilleros;
    $regaderas = $data->regaderas;
    $estacionamiento = $data->estacionamiento;
    $bicicletero = $data->bicicletero;

    if (
        $nombreBodega != "" &&
        $codigoPostal != "" &&
        $estado != "" &&
        $ciudad != "" &&
        $colonia != "" &&
        $calle != "" &&
        $numExt != "" &&
        $numeroTelefonico != "" &&
        $tipo != "" &&
        $Franquicia_idFranquicia != "" &&
        $estatus != "" &&
        $casilleros != "" &&
        $regaderas != "" &&
        $estacionamiento != "" &&
        $bicicletero != ""
    ) {
        $stmt = $enlace->prepare("INSERT INTO bodega (nombreBodega, codigoPostal, estado, ciudad, colonia, calle, numExt, numInt, numeroTelefonico, tipo, Franquicia_idFranquicia, casilleros, estacionamiento, regaderas, bicicletero, estatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
        if ($stmt === false) {
            // La preparación de la consulta falló
            echo json_encode(["success" => 0, "error" => "Failed to prepare the query: " . $enlace->error]);
            exit();
        }
    
        $bind_result = $stmt->bind_param("sssssssssssssssi", $nombreBodega, $codigoPostal, $estado, $ciudad, $colonia, $calle, $numExt, $numInt, $numeroTelefonico, $tipo, $Franquicia_idFranquicia, $casilleros, $estacionamiento, $regaderas, $bicicletero, $estatus);
        
        if ($bind_result === false) {
            // La vinculación de los parámetros falló
            echo json_encode(["success" => 0, "error" => "Failed to bind parameters: " . $stmt->error]);
            exit();
        }
    
        $execute_result = $stmt->execute();
        
        if ($execute_result === false) {
            // La ejecución de la consulta falló
            echo json_encode(["success" => 0, "error" => "Failed to execute the query: " . $stmt->error]);
            exit();
        }
        echo json_encode(["success" => 1]);
        }
    exit();
    }
}

//Actualizar una sucursal
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    if(isset($_GET["actualizar"])){

        $idBodega = $data->idBodega;
        $nombreBodega = $data->nombreBodega;
        $codigoPostal = $data->codigoPostal;
        $estado = $data->estado;
        $ciudad = $data->ciudad;
        $colonia = $data->colonia;
        $calle = $data->calle;
        $numExt = $data->numExt;
        $numInt = isset($data->numInt) && $data->numInt !== "" ? $data->numInt : NULL; 
        $telefono = $data->telefono;
        $tipo = $data->tipo;
        $estatus = $data->estatus;
        $Franquicia_idFranquicia = $data->Franquicia_idFranquicia;
        $casilleros = $data->casilleros;
        $regaderas = $data->regaderas;
        $estacionamiento = $data->estacionamiento;
        $bicicletero = $data->bicicletero;

        if (
            $nombreBodega != "" &&
            $codigoPostal != "" &&
            $estado != "" &&
            $ciudad != "" &&
            $colonia != "" &&
            $calle != "" &&
            $numExt != "" &&
            $telefono != "" &&
            $tipo != "" &&
            $Franquicia_idFranquicia != "" &&
            $estatus != "" &&
            $casilleros != "" &&
            $regaderas != "" &&
            $estacionamiento != "" &&
            $bicicletero != ""
        ) {
            $stmt = $enlace->prepare("UPDATE Gimnasio SET nombreBodega=?, codigoPostal=?, estado=?, ciudad=?, colonia=?, calle=?, numExt=?, numInt=?, telefono=?, tipo=?, Franquicia_idFranquicia=?, casilleros=?, estacionamiento=?, regaderas=?, bicicletero=? ,estatus=? WHERE idBodega=?");
        
            if ($stmt === false) {
                // La preparación de la consulta falló
                echo json_encode(["success" => 0, "error" => "Failed to prepare the query: " . $enlace->error]);
                exit();
            }
        
            $bind_result = $stmt->bind_param("sssssssssssssssis", $nombreBodega, $codigoPostal, $estado, $ciudad, $colonia, $calle, $numExt, $numInt, $telefono, $tipo, $Franquicia_idFranquicia, $casilleros, $estacionamiento,$regaderas, $bicicletero, $estatus, $idBodega);
            
            if ($bind_result === false) {
                // La vinculación de los parámetros falló
                echo json_encode(["success" => 0, "error" => "Failed to bind parameters: " . $stmt->error]);
                exit();
            }
        
            $execute_result = $stmt->execute();
            
            if ($execute_result === false) {
                // La ejecución de la consulta falló
                echo json_encode(["success" => 0, "error" => "Failed to execute the query: " . $stmt->error]);
                exit();
            }
            echo json_encode(["success" => 1]);
        }
    exit();
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    parse_str(file_get_contents("php://input"),$post_vars);
    $idBodega = $post_vars['idBodega'];
    $estatus = $post_vars['estatus'];
    $actualizarEstatus = $post_vars['actualizarEstatus'];

    if ($actualizarEstatus == '1') {
        $sqlPlan = "UPDATE Gimnasio SET estatus='$estatus' WHERE idBodega='$idBodega'";

        if (mysqli_query($enlace, $sqlPlan)) {
            $response = ["success" => 1];
        } else {
            $response = ["success" => 0, "error" => mysqli_error($enlace)];
        }
    } else {
        $response = ["success" => 0, "error" => "No se realizó ninguna operación"];
    }

    echo json_encode($response);
    exit();
}


// Consulta todos los registros de la tabla gimnasio
$sqlPlan = mysqli_query($enlace, "SELECT * FROM bodega WHERE estatus=1");

if ($sqlPlan) {
    if (mysqli_num_rows($sqlPlan) > 0) {
        $plan = mysqli_fetch_all($sqlPlan, MYSQLI_ASSOC);
        echo json_encode($plan);
    } else {
        echo json_encode([["success" => 0]]);
    }
} else {
    // Manejo de errores
    echo "Error en la consulta: " . mysqli_error($enlace);
}
?>
