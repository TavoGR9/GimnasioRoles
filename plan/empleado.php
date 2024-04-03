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

if (isset($_GET["insertar"])) {
    $data = json_decode(file_get_contents("php://input"));

    // Acceder a las propiedades del objeto correctamente usando la notación de flecha (->)
    $nombre = $data->nombre;
    $puesto = $data->puesto;
    $email = isset($data->email) && $data->email !== "" ? $data->email : null;
    $jefe = $data->jefe;
    $correoEmp = $data->correoEmp;
    $pass = md5($data->pass);
    $foto = $data->foto;
    $celular = $data->celular;

    // Verificar si el correo electrónico ya existe en la base de datos
    $consulta = mysqli_query($enlace, "SELECT COUNT(*) AS total FROM Usuario WHERE Correo = '$correoEmp'");

    if ($consulta) {
        // Si la consulta se ejecutó correctamente
        $resultado = mysqli_fetch_assoc($consulta);
        if ($resultado['total'] > 0) {
            // Si el correo electrónico ya existe, enviar una respuesta indicando que ya está registrado
            $response = array('success' => 0, 'message' => 'MailExists');
            header('Content-Type: application/json');
            echo json_encode($response);
        } else {
            // Si el correo electrónico no existe, ejecutar la consulta para insertar el empleado
            $empleado = mysqli_query($enlace, "CALL addEmpleado('$nombre','$puesto','$email','$jefe','$correoEmp','$pass','$foto','$celular')");

            if ($empleado) {
                // Si la consulta se ejecutó correctamente, obtener el correo electrónico del empleado insertado
                $response = array('success' => 1, 'correoEmp' => $correoEmp);
                header('Content-Type: application/json');
                echo json_encode($response);
            } else {
                // Si hubo un problema con la consulta, devolver un mensaje de error
                echo json_encode(array('success' => 0, 'message' => 'Error al insertar empleado'));
            }
        }
    } else {
        // Si hubo un error con la consulta, devolver un mensaje de error
        echo json_encode(array('success' => 0, 'message' => 'Error al verificar el correo electrónico'));
    }
}



    if(isset($_GET["obtEmp"])){
        $ubicarEmpleado = mysqli_query($conexionBD, "SELECT emp.nombreCompleto, emp.telefono
        FROM empleado emp WHERE emp.id_empleado=".$_GET["obtEmp"]) or die(mysqli_error($conexionBD));

        if (mysqli_num_rows($ubicarEmpleado) > 0) {
            $entrenador = mysqli_fetch_all($ubicarEmpleado,MYSQLI_ASSOC);
            echo json_encode($entrenador);
            mysqli_close($conexionBD);
            exit();
        }
    }
	
//////////////////////************************************************Insertar Usuario	
if (isset($_GET["insertarUsuario"])) {
    $data = json_decode(file_get_contents("php://input"));

    $email = $data->email;
    $pass = $data->pass;
    $user = isset($data->user) && $data->user !== "" ? $data->user : null;
    $fon = $data->fon;
    $no_clave = $data->no_clave;
    $nombre = $data->nombre;
    $fechaNacimiento = $data->fechaNacimiento;
    $destino = $data->destino;
    $direccion = $data->direccion;
	$codigoPromotor = $data->codigoPromotor;
    $Genero = $data->Genero;
    $fotoUrl = $data->fotoUrl;

    // Verificar si el correo electrónico ya existe
    $consulta = mysqli_query($enlace, "SELECT COUNT(*) AS total FROM Usuario WHERE Correo = '$email'");
    if ($consulta) {
        // Si la consulta se ejecutó correctamente
        $resultado = mysqli_fetch_assoc($consulta);
        if ($resultado['total'] > 0) {
            // Si el correo electrónico ya existe, enviar una respuesta indicando que ya está registrado
            $response = array('success' => 0, 'message' => 'MailExists');
            header('Content-Type: application/json');
            echo json_encode($response);
        } else {
            // Si el correo electrónico no existe, ejecutar la consulta para insertar el empleado
            $empleado = mysqli_query($enlace, "CALL registroUsuario('$email','$pass','$user','$fon','$no_clave','$nombre','$destino','$direccion','$codigoPromotor','$Genero','$fechaNacimiento','$fotoUrl')");

            if ($empleado) {
                // Si la consulta se ejecutó correctamente, obtener el correo electrónico del empleado insertado
                $response = array('success' => 1, 'no_clave' => $no_clave);
                header('Content-Type: application/json');
                echo json_encode($response);
            } else {
                // Si hubo un problema con la consulta, devolver un mensaje de error
                echo json_encode(array('success' => 0, 'message' => 'Error al insertar empleado'));
            }
        }
    } else {
        // Si hubo un error con la consulta, devolver un mensaje de error
        echo json_encode(array('success' => 0, 'message' => 'Error al verificar el correo electrónico'));
    }
}


if (isset($_GET["insertarUsuarioBodega"])) {
    $data = json_decode(file_get_contents("php://input"));

    $id_usuario = $data->id_usuario;
    $id_bodega = $data->id_bodega;
    $status = $data->status;
	
	$query = "CALL addBodegaUsuario('$id_usuario', '$id_bodega', '$status')";
    $usuario = mysqli_query($enlace, $query);
	
    if ($usuario) {
        echo json_encode(array('success' => 1)); // Corrección aquí
    } else {
        // Si hubo un problema con la consulta, devolver un mensaje de error
        echo json_encode(array('success' => 0, 'message' => 'Error al insertar la bodega'));
		echo "Error en la consulta: " . mysqli_error($enlace);
    }  
}


?>
