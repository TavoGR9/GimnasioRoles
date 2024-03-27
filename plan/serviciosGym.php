<?php

session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, X-Requested-With");
include('conexionBD.php');


// Lee el json 
$data = json_decode(file_get_contents('php://input'), true);

// Verificacion de ID
if (isset($data["id"])){
    $stmt = $enlace->prepare("SELECT * FROM servicios_individuales WHERE fk_idGimnasio = ?");
    $stmt->bind_param("i", $data["id"]);
} else {
    $stmt = $enlace->prepare("SELECT * FROM servicios_individuales");
}

$stmt->execute();
$result = $stmt->get_result();
if($result->num_rows > 0){
    $servicios = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode($servicios);
} else {
    echo json_encode(["success"=>0]);
}

?>