<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, X-Requested-With");
include('conexionBD.php');

// Obtener el cuerpo de la solicitud como JSON y decodificarlo
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (isset($_GET["obtenerVista"])) {
    $id_bodega = $_GET["obtenerVista"];

    // Preparar la consulta utilizando una consulta preparada
    $consulta = "SELECT * FROM vistaclientedetallemem WHERE id_bodega = ?";
    $stmt = mysqli_prepare($enlace, $consulta);
    mysqli_stmt_bind_param($stmt, "i", $id_bodega);
    mysqli_stmt_execute($stmt);
    $vista = mysqli_stmt_get_result($stmt);

    if ($vista) {
        // Si la consulta se ejecutó correctamente, obtener los datos de la vista
        $datos = mysqli_fetch_all($vista, MYSQLI_ASSOC);
        echo json_encode(['data' => $datos]);
    } else {
        // Si hubo un problema con la consulta, devolver un mensaje de error
        echo json_encode(['success' => 0, 'message' => 'Error al obtener la vista']);
    }
}

if (isset($_GET["histoCliente"])){

    $idCliente= $_GET['histoCliente'];

    $cliMemHistorial="SELECT cli.clave AS ID,
       gym.nombreBodega AS Sucursal,
       cli.nombreCompleto AS Nombre,
       CASE 
            WHEN mem.titulo IS NULL THEN 'N/A'
            ELSE mem.titulo
       END AS Membresia,
       CASE 
            WHEN mem.precio IS NULL THEN 'N/A'
            ELSE mem.precio
       END AS Precio,
       CASE 
            WHEN mem.duracion IS NULL THEN 'N/A' 
            ELSE mem.duracion
       END AS Duracion,
       CASE
            WHEN detMem.fechaInicio IS NULL THEN 'N/A'
            ELSE DATE_FORMAT(detMem.fechaInicio, '%d/%m/%Y')
       END AS Fecha_Inicio,
       CASE
            WHEN detMem.fechaFin IS NULL THEN 'N/A'
            ELSE DATE_FORMAT(detMem.fechaFin, '%d/%m/%Y') 
       END AS Fecha_Fin,
       CASE 
            WHEN detMem.estatus = 0 AND NOW() >= detMem.fechaInicio AND NOW() <= detMem.fechaFin THEN 'Desactivado' 
            WHEN detMem.estatus = 1 THEN 'Activo'
            ELSE 'Terminado' 
        END AS Status
        FROM Bodega gym, 
            Usuario cli,
            DetalleMembresia detMem,
            Membresia mem,
            TransaccionPago trans,
			usuariobodega ub
        WHERE cli.clave = $idCliente
		    AND gym.id_bodega = ub.id_bodega
			AND ub.id_usuario =  cli.clave
			AND cli.clave = detMem.Cliente_ID_Cliente
            AND detMem.Membresia_idMem = mem.idMem
            AND trans.Cliente_ID_Cliente = detMem.Cliente_ID_Cliente
            AND trans.DetalleMembresia_idDetMem = detMem.idDetMem
            AND trans.estatusPago = 'Va'
            AND NOT (detMem.estatus = 0 AND NOW() >= detMem.fechaInicio AND NOW() <= detMem.fechaFin) -- Selecciona registros que no cumplen con la condición
            ORDER BY cli.clave, detMem.fechaInicio DESC, detMem.fechaFin DESC";
                
    //  echo $consultaProveedores;        
    $sqlData = mysqli_query($enlace, $cliMemHistorial);
    if($sqlData){
        if(mysqli_num_rows($sqlData) > 0) {
            //$clientes = mysqli_fetch_assoc($resultado); // Obtener el resultado como un solo objeto asociativo
            $memHist = mysqli_fetch_all($sqlData, MYSQLI_ASSOC); // Obtener los datos como un array asociativo
            echo json_encode($memHist);
            exit();
        } else {
            echo json_encode(["msg" => "No hay resultados"]);
            exit();
        }
    }else {
        // Manejo de errores
        echo "Error en la consulta: " . mysqli_error($enlace);
        exit();
    }
}

if (isset($_GET["consClienteId"]) && isset($_GET["consDetMemId"])){
    // Definir los ID para el procedimiento almacenado
    $clienteID = intval($_GET['consClienteId']);
    $detMemID = intval($_GET["consDetMemId"]);

    // Llamar al procedimiento almacenado
    //$sql = "CALL updatePagoEfectivo($clienteID, $detMemID)";   
    $sql = "CALL PagoMembresia($clienteID, $detMemID)";
    $result = $enlace->query($sql);

    // Verificar si se ejecutó correctamente
    if ($result) {
        echo json_encode(["msg" => "Data success"]);
        exit();
    } else {
        // Mostrar un mensaje de error si la llamada al procedimiento falla
        echo json_encode(["msg" => "Error al ejecutar el procedimiento almacenado: " . $enlace->error]);
        exit();
    } 
}



if (isset($_GET["listaMembre"])){

    $varConsulta = mysqli_real_escape_string($enlace, $_GET['listaMembre']); // Validar y sanitizar la entrada del usuario

    $listaMembresias="SELECT gim.nombreBodega AS Sucursal,
                        mem.titulo AS Membresia,
                        mem.idMem AS IDmembresia,
                        gim.id_bodega AS IDgimnasio
                    FROM Bodega gim,
                        Membresia mem
                    WHERE gim.id_bodega = mem.Gimnasio_idGimnasio
                    AND gim.id_bodega = ?";

   // $sqlData = mysqli_query($enlace, $listaMembresias);

    $stmt = mysqli_prepare($enlace, $listaMembresias); // Preparar la consulta
    mysqli_stmt_bind_param($stmt, "s", $varConsulta); // Vincular el parámetro
    mysqli_stmt_execute($stmt); // Ejecutar la consulta
    $sqlData = mysqli_stmt_get_result($stmt); // Obtener los resultados

    if($sqlData){
        if(mysqli_num_rows($sqlData) > 0) {
            //$plan = mysqli_fetch_assoc($resultado); // Obtener el resultado como un solo objeto asociativo
            $Membresias = mysqli_fetch_all($sqlData, MYSQLI_ASSOC); // Obtener los datos como un array asociativo
            echo json_encode($Membresias);
            exit();
        } else {
            echo json_encode(["msg" => "No hay resultados"]);
            exit();
        }
    }else {
        // Manejo de errores
        echo "Error en la consulta: " . mysqli_error($enlace);
        exit();
    }
}


if (isset($_GET["infoMembre"])){

    $varConsulta = mysqli_real_escape_string($enlace, $_GET['infoMembre']); // Validar y sanitizar la entrada del usuario

    $dataMembresia="SELECT duracion AS Duracion,
                        precio AS Precio,
                        titulo AS Membresia,
                        idMem AS IDmembresia
                    FROM Membresia
                    WHERE idMem = ?";

   // $sqlData = mysqli_query($enlace, $listaMembresias);

    $stmt = mysqli_prepare($enlace, $dataMembresia); // Preparar la consulta
    mysqli_stmt_bind_param($stmt, "s", $varConsulta); // Vincular el parámetro
    mysqli_stmt_execute($stmt); // Ejecutar la consulta
    $sqlData = mysqli_stmt_get_result($stmt); // Obtener los resultados

    if($sqlData){
        if(mysqli_num_rows($sqlData) > 0) {
            $Result = mysqli_fetch_assoc($sqlData); // Obtener el resultado como un solo objeto asociativo
            //$Result = mysqli_fetch_all($sqlData, MYSQLI_ASSOC); // Obtener los datos como un array asociativo
            echo json_encode($Result);
            exit();
        } else {
            echo json_encode(["msg" => "No hay resultados"]);
            exit();
        }
    }else {
        // Manejo de errores
        echo "Error en la consulta: " . mysqli_error($enlace);
        exit();
    }
}


if (isset($_GET["consultClienteId"]) && isset($_GET["consultMemId"]) && isset($_GET["detalleMemId"])) {
    // Definir los ID para el procedimiento almacenado
    $clienteID = intval($_GET['consultClienteId']);
    $MemID = intval($_GET["consultMemId"]);
    $detMemID = intval($_GET["detalleMemId"]);

    $ClientesActivos = "SELECT ID, 
                        Nombre, 
                        Membresia, 
                        Membresia_idMem,
                        accion
                    FROM viewClienteActivoInactivo 
                    WHERE ID = $clienteID
                        ORDER BY Fecha_Fin
                        LIMIT 1";
                    //    AND Membresia_idMem = $MemID

    $sqlData = mysqli_query($enlace, $ClientesActivos);

    // Verificar si la consulta se ejecutó correctamente
    if ($sqlData) {
        $row = mysqli_fetch_assoc($sqlData);
        $accion = $row['accion'];
        $idMembresia = $row['Membresia_idMem'];

        // Lógica condicional
        if (($accion === 'Online' && intval($idMembresia) === $MemID) || ($accion === 'Update' && intval($idMembresia) === $MemID)) {
            // Llamar al procedimiento almacenado del pago de clientes nuevos y reenovacion pero solo cuando es la misma membresia
            $sql = "CALL PagoMembresia($clienteID, $detMemID)";
        } elseif ($accion === 'Activo'){
            // Llamar al procedimiento almacenado para adelantos de pago de membresia 
            $sql = "CALL adelantoMembresiaPago($clienteID, $MemID)";
        } else {
            // Llamar al procedimiento almacenado para reenovacion de membresia (cambio de membresia)
            $sql = "CALL insertUpdateCambioMembresia($clienteID, $MemID)";
        }

        // Ejecutar el procedimiento almacenado
        $result = $enlace->query($sql);

        // Verificar si se ejecutó correctamente
        if ($result) {
            echo json_encode(["msg" => "Accion satisfactoria"]);
            exit();
        } else {
            // Mostrar un mensaje de error si la llamada al procedimiento falla
            echo json_encode(["msg" => "Error al ejecutar el procedimiento almacenado: " . $enlace->error]);
            exit();
        }
    } else {
        // Mostrar un mensaje de error si la consulta falla
        echo json_encode(["msg" => "Error al ejecutar la consulta: " . $enlace->error]);
        exit();
    }
}

?>
