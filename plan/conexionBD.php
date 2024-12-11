<?php
//$bd = "Sistema_gimnasio";
//$enlace =  mysqli_connect('localhost:3307', 'root', '', $bd);
$enlace = mysqli_connect("localhost", "root", "", "gimnasioolympus");

if (!$enlace) {
	die('Conexión incorrecta: ' . mysqli_connect_error());
} else {
	//echo 'conexion correcta de sistema';
	$tildes = mysqli_query($enlace, "SET NAMES 'utf8'");
	mysqli_set_charset($enlace, 'utf8');
	$esp = mysqli_query($enlace, "SET lc_time_names = 'es_ES'");

	if (!$esp) {
		die('Error al establecer configuraciones: ' . mysqli_error($enlace));
	} else {
		//echo json_encode(["success"=>1]);
	}
}

function conectar()
{
	$bd  = "gimnasioolympus";
	$enlace =  mysqli_connect('localhost', 'root', '', $bd);
	$tildes = mysqli_query($enlace,"SET NAMES 'utf8'");
	mysqli_set_charset($enlace,'utf8');
	$esp = mysqli_query($enlace,"SET lc_time_names = 'es_ES'" );
	if (!$enlace) {
		die('No pudo conectarse: ' . mysql_error());
	} else {
	}
	mysqli_select_db($enlace,$bd);
	return $enlace;
	mysqli_close($enlace);
	mysqli_free_result($enlace);
}
?>