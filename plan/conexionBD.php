<?php
$bd = "Sistema_gimnasio";
//$bd = "superhou_prueba"; 
$enlace =  mysqli_connect('localhost:3306', 'root', '', $bd);
//$enlace =  mysqli_connect('localhost', 'root', '', $bd);

if (!$enlace) {
    die('Conexión incorrecta: ' . mysqli_connect_error());
} else {
    $tildes = mysqli_query($enlace, "SET NAMES 'utf8'");
    mysqli_set_charset($enlace, 'utf8');
    $esp = mysqli_query($enlace, "SET lc_time_names = 'es_ES'");

    if (!$esp) {
        die('Error al establecer configuraciones: ' . mysqli_error($enlace));
    } else {
        //echo json_encode(["success"=>1]);
    }
}
?>
