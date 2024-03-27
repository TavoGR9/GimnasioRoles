<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, X-Requested-With");
include('conexionBD.php');

if (isset($_GET["datos"])) {
    $data = json_decode(file_get_contents("php://input"));

    $username = $data->olympus;
	
    $data = $username; // Aquí colocas el mensaje encriptado a decodificar
	$iv = 'KingWizardGodCML';

    $decodificadoFront = openssl_decrypt($data, 'aes-256-cbc', 'correoEmp', 0, $iv);

	$decodificadoFront = openssl_decrypt($data, 'aes-256-cbc', 'correoEmp', 0, $iv);
	if ($decodificadoFront === false) {
		// Hubo un error en el proceso de descifrado
		$error = openssl_error_string();
		echo "Error en openssl_decrypt: $error";
	} else {

	}


   $consultaRol = "SELECT empleado.*, empleadoBodega.id_bodega FROM empleado 
                JOIN empleadoBodega ON empleado.id_empleado = empleadoBodega.id_empleado 
                WHERE empleado.correoEmpleado = ?";

    $stmt = mysqli_prepare($enlace, $consultaRol);
	
    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "s", $decodificadoFront);
        mysqli_stmt_execute($stmt);
        $sqlData = mysqli_stmt_get_result($stmt);

        if (mysqli_num_rows($sqlData) > 0) {
            $userData = mysqli_fetch_assoc($sqlData);
            // Encriptar el email para manejar sesion storage
            $data = $userData['correoEmpleado'];
            $iv = 'KingWizardGodCML';
			$encryptedMail = openssl_encrypt($userData['correoEmpleado'], 'aes-256-cbc', 'correoEmp', 0, $iv);
			

            echo json_encode(["rolUser" => $userData['puesto'],"idGym" => $userData['id_bodega'],"encryptedMail" => $encryptedMail]);
            exit;
        } else {
            // No se encontraron datos para el usuario
            echo json_encode(["id" => '0', "rolUser" => 'No_acceso']);
            exit;
        }
    } else {
        // Manejo de error si la preparación de la consulta falla
        echo json_encode(["error" => "Error en la preparación de la consulta"]);
        exit;
    }
} else {
    http_response_code(405);
    echo json_encode(["msg" => "Method Not Allowed"]);
    exit;
}

?>