<?php
session_start();
header("Access-Control-Allow-Origin: *");
include('conexionBD.php'); // Incluye el archivo de conexión

$email = $_REQUEST['email'];
$pass = md5($_REQUEST['pass']);

$usuario = array();

$Usuarios = mysqli_query($enlace, "CALL login('$email','$pass')") or die(mysqli_error($enlace));

if ($Usuarios && mysqli_num_rows($Usuarios) > 0) {
    $row = mysqli_fetch_assoc($Usuarios);
    
    // Generar un IV de la longitud correcta (16 bytes) utilizando random_bytes
    $iv = 'KingWizardGodCML';

    // Cifrar el correo electrónico utilizando openssl_encrypt
    $encryptedMail = openssl_encrypt($row['Correo'], 'aes-256-cbc', 'correoEmp', 0, $iv);

    // Construir un array asociativo con los datos del usuario, incluyendo el correo electrónico normal y el cifrado
    $usuario = array(
        'Correo' => $row['Correo'],
        'encryptedMail' => $encryptedMail, // Codificar el texto cifrado para que sea seguro para su uso en JSON
        'IV' => base64_encode($iv), // También puedes incluir el IV en la respuesta si es necesario
        'rol' => $row['rol']
        // Agrega aquí más campos del usuario si es necesario
    );

    // Devolver los datos del usuario en formato JSON
    header('Content-Type: application/json');
    echo json_encode($usuario);
} else {
    echo "0";
}
?>
