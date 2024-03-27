<?php

session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, X-Requested-With");
include('conexionBD.php');

if(isset($_GET['insertar'])){
    $data = json_decode(file_get_contents("php://input"));

    if(!isset($data->id_servicios_individuales) || !isset($data->fk_idMem)){
        http_response_code(400);
        echo json_encode(["error" => "Datos inválidos"]);
        exit();
    }
    $fk_servicios_individuales = $data->id_servicios_individuales;
    $fk_idMem = $data->fk_idMem;

    if(($fk_servicios_individuales!="")&&($fk_idMem!="")){
        $stmt = $enlace->prepare("INSERT INTO servicio_membresia (fk_servicios_individuales, fk_idMem) VALUES (?, ?)");
        $stmt->bind_param("ss", $fk_servicios_individuales, $fk_idMem);

        if($stmt->execute()){
            echo json_encode(["message" => "Insertado con exito"]);
        }else{
            http_response_code(500);
            echo json_encode(["error" => "Fallo al insertar"]);
        }
    }
}

if(isset($_GET['insertarservicio'])){
    $data = json_decode(file_get_contents("php://input"));

    $id_servicios_individuales = $data->id_servicios_individuales;
    $nombre_servicio = $data->nombre_servicio;
    $precio_unitario = $data->precio_unitario;
    $detalles = $data->detalles;
    $fk_idGimnasio = $data->fk_idGimnasio;

    if(($nombre_servicio!="")&&($precio_unitario!="")&&($detalles!="")&&($fk_idGimnasio!="")){
        $stmt = $enlace->prepare("INSERT INTO servicios_individuales (nombre_servicio,detalles, precio_unitario, fk_idGimnasio) VALUES (?, ?, ?, ?)");
        if(!$stmt){
            echo "Error: ".$enlace->error;
        }
        $stmt->bind_param("ssii", $nombre_servicio, $detalles,$precio_unitario, $fk_idGimnasio);

        if($stmt->execute()){
            // Obtener el ID del último registro insertado
            $idInsertado = $stmt->insert_id;

            // Consulta para obtener los datos del registro recién insertado
            $consulta = $enlace->query("SELECT * FROM servicios_individuales WHERE id_servicios_individuales = $idInsertado");
            $registroInsertado = $consulta->fetch_assoc();

            echo json_encode(["success"=>1, "registroInsertado" => $registroInsertado]);
        }else{
			$errorDetails = $stmt->error;
            http_response_code(500);
             echo json_encode(["error" => "Fallo al insertar", "errorDetails" => $errorDetails]);
        }
    }
}


if(isset($_GET['getServicio'])){
    $id_servicio = $_GET['getServicio'];

    $stmt = $enlace->prepare("SELECT * FROM servicios_individuales WHERE id_servicios_individuales = ?");
    $stmt->bind_param("i", $id_servicio);

    if($stmt->execute()){
        $result = $stmt->get_result();
        $servicio = $result->fetch_assoc();

        if($servicio){
            echo json_encode($servicio);
        }else{
            http_response_code(404);
            echo json_encode(["error" => "Servicio no encontrado"]);
        }
    }else{
        http_response_code(500);
        echo json_encode(["error" => "Fallo al obtener el servicio"]);
    }
}

if(isset($_GET['actualizarServicio'])){
    $data = json_decode(file_get_contents("php://input"));

    if(!isset($data->id_servicios_individuales) || !isset($data->nombre_servicio) || !isset($data->precio_unitario) || !isset($data->detalles) || !isset($data->fk_idGimnasio)){
        http_response_code(400);
        echo json_encode(["error" => "Datos inválidos"]);
        exit();
    }

    $id_servicios_individuales = $data->id_servicios_individuales;
    $nombre_servicio = $data->nombre_servicio;
    $precio_unitario = $data->precio_unitario;
    $detalles = $data->detalles;
    $fk_idGimnasio = $data->fk_idGimnasio;

    $stmt = $enlace->prepare("UPDATE servicios_individuales SET nombre_servicio = ?, detalles = ?, precio_unitario = ?, fk_idGimnasio = ? WHERE id_servicios_individuales = ?");
    $stmt->bind_param("ssiii", $nombre_servicio, $detalles, $precio_unitario, $fk_idGimnasio, $id_servicios_individuales);

    if($stmt->execute()){
        echo json_encode(["message" => "Actualizado con exito"]);
    }else{
        http_response_code(500);
        echo json_encode(["error" => "Fallo al actualizar"]);
    }
}
?>