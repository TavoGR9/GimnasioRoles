<?php


session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, X-Requested-With");
include('conexionBD.php');
// Consulta datos y recepciona una clave para consultar dichos datos con dicha clave
if (isset($_GET["consultar"])){
    $sqlPlan = mysqli_query($enlace,"SELECT * FROM Membresia
 WHERE idMem=".$_GET["consultar"]);
    if(mysqli_num_rows($sqlPlan) > 0){
        $plan = mysqli_fetch_all($sqlPlan,MYSQLI_ASSOC);
        echo json_encode($plan);
        exit();
    }
    else{  echo json_encode(["success"=>0]); }
}

if (isset($_GET["consultarGYM"])){
        $sqlPlan = mysqli_query($enlace,"SELECT * FROM Membresia WHERE Gimnasio_idGimnasio=".$_GET["consultarGYM"]);
        if(mysqli_num_rows($sqlPlan) > 0){
            $plan = mysqli_fetch_all($sqlPlan,MYSQLI_ASSOC);

            foreach($plan as $index => $membresia) {
                $sqlServicios = mysqli_query($enlace,"
                SELECT servicio_membresia.*, Membresia.titulo, servicios_individuales.nombre_servicio, servicios_individuales.precio_unitario 
                FROM servicio_membresia, servicios_individuales, Membresia
                WHERE servicio_membresia.fk_servicios_individuales = servicios_individuales.id_servicios_individuales 
                AND servicio_membresia.fk_idMem = Membresia.idMem
                AND servicio_membresia.fk_idMem =".$membresia['idMem']
                );
                if(mysqli_num_rows($sqlServicios) > 0){
                    $servicios = mysqli_fetch_all($sqlServicios,MYSQLI_ASSOC);
                    // Agregar los servicios a la membresía
                    $plan[$index]['servicios'] = $servicios;
                } else {
                    $plan[$index]['servicios'] = [];
                }
            }
            
            echo json_encode($plan);
            exit();
        }
        else{  echo json_encode(["success"=>0]); }
    
}

// CONSULTA MEMBRESIAS POR ID
if (isset($_GET["consultarMembresia"])){
    $sqlPlan = mysqli_query($enlace,"SELECT * FROM Membresia WHERE idMem=".$_GET["consultarMembresia"]);
    if(mysqli_num_rows($sqlPlan) > 0){
        $plan = mysqli_fetch_all($sqlPlan,MYSQLI_ASSOC);

        foreach($plan as $index => $membresia) {
            $sqlServicios = mysqli_query($enlace,"
            SELECT servicio_membresia.*, Membresia.titulo, servicios_individuales.nombre_servicio, servicios_individuales.precio_unitario 
            FROM servicio_membresia, servicios_individuales, Membresia
            WHERE servicio_membresia.fk_servicios_individuales = servicios_individuales.id_servicios_individuales 
            AND servicio_membresia.fk_idMem = Membresia.idMem
            AND servicio_membresia.fk_idMem =".$membresia['idMem']
            );
            if(mysqli_num_rows($sqlServicios) > 0){
                $servicios = mysqli_fetch_all($sqlServicios,MYSQLI_ASSOC);
                // Agregar los servicios a la membresía
                $plan[$index]['servicios'] = $servicios;
            } else {
                $plan[$index]['servicios'] = [];
            }
        }
        
        echo json_encode($plan);
        exit();
    }
    else{  echo json_encode(["success"=>0]); }

}

//borrar pero se le debe de enviar una clave ( para borrado )
if (isset($_GET["borrar"])){
    $sqlPlan = mysqli_query($enlace,"DELETE FROM Membresia
 WHERE idMem=".$_GET["borrar"]);
    if($sqlPlan){
        echo json_encode(["success"=>1]);
        exit();
    }
    else{  echo json_encode(["success"=>0]); }
}
//Inserta un nuevo registro y recepciona en método post los datos de nombre y correo
if (isset($_GET["insertar"])) {
    $data = json_decode(file_get_contents("php://input"));
    $titulo = $data->titulo;
    $detalles = $data->detalles;
    $duracion = $data->duracion;
    $precio = $data->precio;
    $servicioseleccionado = $data->servicioseleccionado;
    $status = $data->status;
    $tipo_membresia = $data->tipo_membresia;
    $Gimnasio_idGimnasio = $data->Gimnasio_idGimnasio;

    if (
        ($titulo != "") &&
        ($duracion != "") &&
        ($precio != "") &&
        ($status != "") &&
        ($tipo_membresia != "") &&
        ($Gimnasio_idGimnasio != "")
    ) {
        $stmt = $enlace->prepare("INSERT INTO Membresia (titulo,detalles,duracion,precio,status,tipo_membresia,Gimnasio_idGimnasio) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sssssss", $titulo, $detalles, $duracion, $precio, $status, $tipo_membresia, $Gimnasio_idGimnasio);
        $stmt->execute();
		
        $last_id = mysqli_insert_id($enlace);
        // Obtener detalles del registro insertado
        $stmtDetalles = $enlace->prepare("SELECT * FROM Membresia WHERE idMem = ?");
        $stmtDetalles->bind_param("s", $last_id);
        $stmtDetalles->execute();
        $resultDetalles = $stmtDetalles->get_result();

        if ($resultDetalles) {
            $registroInsertado = $resultDetalles->fetch_assoc();
            echo json_encode(["success" => 1, "registroInsertado" => $registroInsertado]);
        } else {
            echo json_encode(["success" => 0, "error" => $stmtDetalles->error]);
        }

        // Insertar servicios relacionados si hay alguno seleccionado
        if ($last_id != 0 && $servicioseleccionado != "") {
            $stmtServicio = $enlace->prepare("INSERT INTO servicio_membresia (fk_servicios_individuales, fk_idMem) VALUES (?, ?)");
            foreach ($servicioseleccionado as $servicio) {
                $stmtServicio->bind_param("ss", $servicio->id_servicios_individuales, $last_id);
                $stmtServicio->execute();
            }
        }
    } else {
        if (isset($stmt)) {
            echo json_encode(["success" => 0, "error" => $stmt->error]);
        } else {
            echo json_encode(["success" => 0, "error" => "Alguno de los campos requeridos está vacío"]);
        }
    }

    exit();
}

if (isset($_GET["consultarGYMMem"])){
    $idBodega = mysqli_real_escape_string($enlace, $_GET["consultarGYMMem"]);
    
    $sqlPlan = mysqli_query($enlace, "SELECT * FROM Membresia WHERE Gimnasio_idGimnasio = $idBodega AND tipo_membresia = 1");

    if ($sqlPlan) {
        if (mysqli_num_rows($sqlPlan) > 0) {
            $plan = mysqli_fetch_all($sqlPlan, MYSQLI_ASSOC);
            echo json_encode($plan);
            exit();
        } else {
            echo json_encode(["success" => 0]);
        }
    } else {
        // Manejar el error en caso de que la consulta falle
        echo json_encode(["error" => mysqli_error($enlace)]);
    }
}

if (isset($_GET["consultarGYMPlanT"])) {
    $idBodega = mysqli_real_escape_string($enlace, $_GET["consultarGYMPlanT"]);

    // Consulta preparada
    $sql = "SELECT * FROM Membresia WHERE Gimnasio_idGimnasio = ? AND tipo_membresia = 3";
    $stmt = mysqli_prepare($enlace, $sql);
    mysqli_stmt_bind_param($stmt, "i", $idBodega);
    mysqli_stmt_execute($stmt);

    $result = mysqli_stmt_get_result($stmt);

    if ($result) {
        if (mysqli_num_rows($result) > 0) {
            $plan = mysqli_fetch_all($result, MYSQLI_ASSOC);
            echo json_encode(["success" => 1, "data" => $plan]);
            exit();
        } else {
            echo json_encode(["success" => 0, "warning" => "No se encontraron planes para este gimnasio y tipo de membresía."]);
        }
    } else {
        // Manejo de errores más preciso
        echo json_encode(["error" => "Error en la consulta SQL. Consulta tus registros para más detalles."]);
    }

    mysqli_stmt_close($stmt);
}
//insertar un plan personalizado
if(isset($_GET["insertarplan"])){
    $data = json_decode(file_get_contents("php://input"));
    $titulo=$data->titulo;
    $detalles=$data->detalles;
    $duracion=$data->duracion;
    $precio=$data->precio;
    $status=$data->status;
    $tipo_membresia=$data->tipo_membresia;
    $Gimnasio_idGimnasio=$data->Gimnasio_idGimnasio;
    $fechaInicio = date('Y-m-d', strtotime($data->fechaInicio));
    $fechaFin = date('Y-m-d', strtotime($data->fechaFin));
    //$membresias=$data->membresias;
	

   if(($titulo != "") && ($duracion != "") && ($precio != "") && ($status != "") && ($tipo_membresia != "") && ($Gimnasio_idGimnasio != "") && ($fechaInicio != "") && ($fechaFin != "")){    
    $stmt = $enlace->prepare("INSERT INTO Membresia (titulo,detalles,duracion,precio,status,tipo_membresia,Gimnasio_idGimnasio, fechaInicio, fechaFin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");    
    $stmt->bind_param("sssiiiiss", $titulo, $detalles, $duracion, $precio, $status, $tipo_membresia, $Gimnasio_idGimnasio, $fechaInicio, $fechaFin);
    $stmt->execute();
    //obten el ID del ultimo registro insertado
    $last_id = mysqli_insert_id($enlace);

    echo json_encode(["success" => 1, "id" => $last_id]);

}
 else {
        if(isset($stmt)) {
            echo json_encode(["success"=>0, "error"=>$stmt->error]);
        } else {
            echo json_encode(["success"=>0, "error"=>"Alguno de los campos requeridos está vacío"]);
        }
    }
        exit();
}
///
if (isset($_GET["insertarPlanM"])) {
    $data = json_decode(file_get_contents("php://input"));

    $duracion = $data->duracion;
    $nombreMem = $data->nombreMem;
    $idMem = $data->idMem;
	$idPlan = $data->idPlan;

    if (($duracion != "") && ($nombreMem != "") && ($idMem != "")) {    
    $stmt = $enlace->prepare("INSERT INTO planMem (duracion, nombreMem, idMem, idPlan) VALUES (?, ?, ?, ?)");    
    $stmt->bind_param("ssii", $duracion, $nombreMem, $idMem, $idPlan);

    if ($stmt->execute()) {
        
    } else {
        echo json_encode(["error" => $stmt->error]);
    }

    $stmt->close();
}
}

//actualizar el plan
if (isset($_GET["actualizarPlan"])) {
    $data = json_decode(file_get_contents("php://input"));
	
    $idMemP = (isset($data->idMemP)) ? $data->idMemP : $_GET["actualizarPlan"];
    $titulo = $data->titulo;
    $detalles = $data->detalles;
    $duracion = $data->duracion;
    $precio = $data->precio;
    $Gimnasio_idGimnasio = $data->Gimnasio_idGimnasio;
    $fechaInicio = $data->fechaInicio;
    $fechaFin = $data->fechaFin;

    // Iniciar la transacción
    mysqli_begin_transaction($enlace);

    $stmtActualizar = mysqli_prepare($enlace, "UPDATE Membresia SET titulo=?, detalles=?, duracion=?, precio=?, fechaInicio=?, fechaFin=?, Gimnasio_idGimnasio=? WHERE idMem=?");
	
    mysqli_stmt_bind_param($stmtActualizar, "ssisssii", $titulo, $detalles, $duracion, $precio, $fechaInicio, $fechaFin, $Gimnasio_idGimnasio, $idMemP);
	

	 if (mysqli_stmt_execute($stmtActualizar)) {
        $stmtEliminarPlanMem = mysqli_prepare($enlace, "DELETE FROM planMem WHERE idPlan=?");
        mysqli_stmt_bind_param($stmtEliminarPlanMem, "i", $idMemP);

        if (mysqli_stmt_execute($stmtEliminarPlanMem)) {
            // Verificar si el campo 'membresias' está presente y es un array
            if (isset($data->membresias) && is_array($data->membresias)) {
                foreach ($data->membresias as $membresia) {
                    // Acceder a los valores individuales de cada membresía
                    $idMem = $membresia->idMem;
                    $tituloMem = $membresia->titulo;
                    $duracionMem = $membresia->duracion;

                    // Insertar en la tabla 'planMem'
                    $stmtInsertarPlanMem = mysqli_prepare($enlace, "INSERT INTO planMem (duracion, nombreMem, idMem, idPlan) VALUES (?, ?, ?, ?)");
                    mysqli_stmt_bind_param($stmtInsertarPlanMem, "ssii", $duracionMem, $tituloMem, $idMem, $idMemP);

                    if (!mysqli_stmt_execute($stmtInsertarPlanMem)) {
                        // Hubo un error al insertar en 'planMem', deshacer la transacción
                        mysqli_rollback($enlace);
                        echo json_encode(["error" => "Error al insertar en 'planMem': " . mysqli_stmt_error($stmtInsertarPlanMem)]);
                        exit();
                    }

                    mysqli_stmt_close($stmtInsertarPlanMem);
                }

                // Todo ha sido exitoso, confirmar la transacción
                mysqli_commit($enlace);
                exit();
            } else {
                // El campo 'membresias' no está presente o no es un array
                echo json_encode(["error" => "El campo 'membresias' no está presente o no es un array en el objeto \$data"]);
            }
        } else {
            // Error al ejecutar la consulta de eliminación
            echo json_encode(["error" => "Error al eliminar registros de 'planMem': " . mysqli_stmt_error($stmtEliminarPlanMem)]);
        }

        mysqli_stmt_close($stmtEliminarPlanMem);
    } else {
        // Error al ejecutar la consulta de actualización
        echo json_encode(["error" => "Error en la consulta SQL para actualizar 'Membresia': " . mysqli_stmt_error($stmtActualizar)]);
    }
}

//consoltar plan
if (isset($_GET["consultarPlan"])) {
    // Validar y sanitizar el parámetro de entrada
    $idMem = filter_var($_GET["consultarPlan"], FILTER_SANITIZE_NUMBER_INT);

    // Consulta preparada para obtener la información de la membresía
    $sqlPlan = mysqli_prepare($enlace, "SELECT * FROM Membresia WHERE idMem=?");
    mysqli_stmt_bind_param($sqlPlan, "i", $idMem);
    mysqli_stmt_execute($sqlPlan);
    
    $resultPlan = mysqli_stmt_get_result($sqlPlan);

    if (mysqli_num_rows($resultPlan) > 0) {
        $plan = mysqli_fetch_all($resultPlan, MYSQLI_ASSOC);

        foreach ($plan as $index => $membresia) {
            // Consulta preparada para obtener los servicios asociados a la membresía
            $sqlServicios = mysqli_prepare($enlace, "
                SELECT M.titulo, PM.* FROM Membresia M
                LEFT JOIN planMem PM ON M.idMem = PM.idPlan
                WHERE M.idMem = ?");
            
            mysqli_stmt_bind_param($sqlServicios, "i", $membresia['idMem']);
            mysqli_stmt_execute($sqlServicios);

            $resultServicios = mysqli_stmt_get_result($sqlServicios);

            if (mysqli_num_rows($resultServicios) > 0) {
                $servicios = mysqli_fetch_all($resultServicios, MYSQLI_ASSOC);
                $plan[$index]['servicios'] = $servicios;
            } else {
                $plan[$index]['servicios'] = [];
            }
        }

        echo json_encode($plan);
        exit();
    } else {
        echo json_encode(["success" => 0]);
    }
} 


if(isset($_GET["actualizar"])){
    
    $data = json_decode(file_get_contents("php://input"));

    $idMem=(isset($data->idMem))?$data->idMem:$_GET["actualizar"];
    $titulo=$data->titulo;
    $detalles=$data->detalles;
    $duracion=$data->duracion;
	$ofertas=$data->ofertas;
    $entrenador=$data->entrenador;
    $precio=$data->precio;
    $canchaAcc=$data->canchaAcc;
    $albercaAcc=$data->albercaAcc;
    $gymAcc=$data->gymAcc;
    $Gimnasio_idGimnasio=$data->Gimnasio_idGimnasio ;
    
    $sqlPlan = mysqli_query($enlace,"UPDATE Membresia SET titulo='$titulo',detalles='$detalles',duracion='$duracion',ofertas='$ofertas',entrenador='$entrenador',precio='$precio',canchaAcc='$canchaAcc',albercaAcc='$albercaAcc',gymAcc='$gymAcc',Gimnasio_idGimnasio='$Gimnasio_idGimnasio' WHERE idMem='$idMem'");
    echo json_encode(["success"=>1]);
    exit();
}

$request_method = $_SERVER["REQUEST_METHOD"];
if($request_method == "PUT"){
    $data = json_decode(file_get_contents("php://input"));

    $idMem = $data->idMem; // necesitas el id de la membresía que deseas actualizar
    $titulo=$data->titulo;
    $detalles=$data->detalles;
    $duracion=$data->duracion;
    $precio=$data->precio;
    $servicioseleccionado = $data->servicioseleccionado;
    $status=$data->status;
    $tipo_membresia=$data->tipo_membresia;
    $Gimnasio_idGimnasio =$data->Gimnasio_idGimnasio;

    $stmt = null;
    

    if(($titulo!="")&&($detalles!="")&&($duracion!="")&&($precio!="")&&($status!="")&&($tipo_membresia!="")&&($Gimnasio_idGimnasio!="")){    
        $stmt = $enlace->prepare("UPDATE Membresia SET titulo = ?, detalles = ?, duracion = ?, precio = ?, status = ?, tipo_membresia = ?, Gimnasio_idGimnasio = ? WHERE idMem = ?");  
        if($stmt === false) {
            die("Error en la consulta SQL: " .$enlace->error);
        }
        $stmt->bind_param("ssssiiis", $titulo, $detalles, $duracion, $precio, $status, $tipo_membresia, $Gimnasio_idGimnasio, $idMem);
        $stmt->execute();

        if($servicioseleccionado != ""){
            // Primero, elimina todas las relaciones existentes en servicio_membresia para esta membresía
            $stmt = $enlace->prepare("DELETE FROM servicio_membresia WHERE fk_idMem = ?");
            $stmt->bind_param("s", $idMem);
            $stmt->execute();

            // Luego, inserta las nuevas relaciones en servicio_membresia
            $stmt = $enlace->prepare("INSERT INTO servicio_membresia (fk_servicios_individuales, fk_idMem) VALUES (?, ?)");

                $stmt->bind_param("ss", $servicioseleccionado->id_servicios_individuales, $idMem);
                $stmt->execute();
            
        }

        echo json_encode(["success"=>1]);
    } else {
        //La ejecucion de la consulta preparada fallo
        $error = $stmt ? $stmt->error : "Datos de entrada no válidos";
        echo json_encode(["success"=>0, "error"=>$error]);
    }
    exit();
}


// Consulta todos los registros de la tabla empleados
$sqlPlan = mysqli_query($enlace, "SELECT * FROM Membresia WHERE tipo_membresia = 1");

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


/**
 *  +++++++++++++++++++++    Fin  Consultas Areli   +++++++++++++++++++++++++++++++++++++++
 */

 ?>