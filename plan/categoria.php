<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, X-Requested-With");
include('conexionBD.php');

// Manejo de solicitudes OPTIONS para CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Manejo de la solicitud de inserción de bodega


if (isset($_GET["insertar"])) {
    $data = json_decode(file_get_contents("php://input"));

    $nombreCategoriaP = $data->nombreCategoriaP;
  
    // Ejecutar la consulta para insertar la bodega
    $query = "CALL addCategoria('$nombreCategoriaP', @id_categoria)";
    $categoria = mysqli_query($enlace, $query);
	
    if ($categoria) {
        $id_categoria = mysqli_query($enlace, "SELECT @id_categoria as id_categoria")->fetch_assoc()['id_categoria'];
        echo json_encode(array('success' => 1, 'id_categoria' => $id_categoria));
		
    } else {
        // Si hubo un problema con la consulta, devolver un mensaje de error
        echo json_encode(array('success' => 0, 'message' => 'Error al insertar la bodega'));
		echo "Error en la consulta: " . mysqli_error($enlace);
    }
}

if (isset($_GET["categoriaName"])) {
    // Obtener el valor de categoriaName desde la URL
    $nombreCategoriaP = $_GET["categoriaName"];

    // Escapar el nombre de la categoría para evitar inyección de SQL
    $nombreCategoriaEscapado = mysqli_real_escape_string($enlace, $nombreCategoriaP);

    // Construir la consulta SQL con el nombre de la categoría escapado
    $query = "SELECT * FROM categoria WHERE nombreCategoria = '$nombreCategoriaEscapado'";

    // Ejecutar la consulta para obtener la categoría
    $categoria = mysqli_query($enlace, $query);

    if ($categoria) {
        // Verificar si se encontró alguna categoría con ese nombre
        if (mysqli_num_rows($categoria) > 0) {
            // Si se encontró una categoría con ese nombre, devolver un mensaje de éxito
           $categoriaEncontrada = mysqli_fetch_assoc($categoria);
		   echo json_encode(array('success' => 1, 'categoria' => $categoriaEncontrada));
        } else {
            // Si no se encontró ninguna categoría con ese nombre, devolver un mensaje de error
            echo json_encode(array('success' => 0, 'message' => 'No se encontró ninguna categoría con ese nombre'));
        }
    } else {
        // Si hubo un problema con la consulta, devolver un mensaje de error
        echo json_encode(array('success' => 0, 'message' => 'Error al obtener la categoría'));
        echo "Error en la consulta: " . mysqli_error($enlace);
    }
}


if (isset($_GET["consultarCategorias"])) {

    $query = "SELECT nombreCategoria FROM categoria";

    // Ejecutar la consulta para obtener las categorías
    $categoria = mysqli_query($enlace, $query);

    if ($categoria) {
        // Verificar si se encontraron categorías
        if (mysqli_num_rows($categoria) > 0) {
            // Si se encontraron categorías, devolver un mensaje de éxito y las categorías
            $categorias = mysqli_fetch_all($categoria, MYSQLI_ASSOC);
			echo json_encode(["success" => 1, "categorias" => $categorias]);
        } else {
            // Si no se encontraron categorías, devolver un mensaje de error
            echo json_encode(array('success' => 0, 'message' => 'No se encontraron categorías'));
        }
    } else {
        // Si hubo un problema con la consulta, devolver un mensaje de error
        echo json_encode(array('success' => 0, 'message' => 'Error al obtener las categorías'));
        echo "Error en la consulta: " . mysqli_error($enlace);
    }
}



/////sub categoria////////////////////////////////////********************

if (isset($_GET["insertarSubC"])) {
    $data = json_decode(file_get_contents("php://input"));

    $idcatte = $data -> idcatte;
    $nomsubcate = $data->nomsubcate;
  
    // Ejecutar la consulta para insertar la bodega
    $query = "CALL insertsubcate('$idcatte', '$nomsubcate', @id_producto)";
    $categoria = mysqli_query($enlace, $query);
	
    if ($categoria) {
        $id_producto = mysqli_query($enlace, "SELECT @id_producto as id_producto")->fetch_assoc()['id_producto'];
        echo json_encode(array('success' => 1, 'id_producto' => $id_producto));
		
    } else {
        // Si hubo un problema con la consulta, devolver un mensaje de error
        echo json_encode(array('success' => 0, 'message' => 'Error al insertar la bodega'));
		echo "Error en la consulta: " . mysqli_error($enlace);
    }
}


if (isset($_GET["SubcategoriaName"]) && isset($_GET["id"])) {
    // Obtener los valores de SubcategoriaName e id desde la URL
    $nombreSubCategoriaP = $_GET["SubcategoriaName"];
    $id_categoria = $_GET["id"];

    // Escapar los valores para evitar inyección de SQL
    $nombreCategoriaEscapado = mysqli_real_escape_string($enlace, $nombreSubCategoriaP);
    $idSubCategoriaEscapado = mysqli_real_escape_string($enlace, $id_categoria);

    // Construir la consulta SQL con los valores escapados
    $query = "SELECT * FROM producto WHERE nombreProducto = '$nombreCategoriaEscapado' AND id_categoria = '$idSubCategoriaEscapado'";

    // Ejecutar la consulta para obtener el producto
    $producto = mysqli_query($enlace, $query);

    if ($producto) {
        // Verificar si se encontró algún producto con ese nombre y ID
        if (mysqli_num_rows($producto) > 0) {
            // Si se encontró el producto, devolver un mensaje de éxito
            $productoEncontrado = mysqli_fetch_assoc($producto);
            echo json_encode(array('success' => 1, 'producto' => $productoEncontrado));
        } else {
            // Si no se encontró ningún producto con ese nombre e ID, devolver un mensaje de error
            echo json_encode(array('success' => 0, 'message' => 'No se encontró ningún producto con ese nombre e ID'));
        }
    } else {
        // Si hubo un problema con la consulta, devolver un mensaje de error
        echo json_encode(array('success' => 0, 'message' => 'Error al obtener el producto'));
        echo "Error en la consulta: " . mysqli_error($enlace);
    }
}


if (isset($_GET["consultarSubCategorias"])) {

    $query = "SELECT nombreProducto FROM producto";

    // Ejecutar la consulta para obtener las categorías
    $subCategoria = mysqli_query($enlace, $query);

    if ($subCategoria) {
        // Verificar si se encontraron categorías
        if (mysqli_num_rows($subCategoria) > 0) {
            // Si se encontraron categorías, devolver un mensaje de éxito y las categorías
            $subCategoria = mysqli_fetch_all($subCategoria, MYSQLI_ASSOC);
			echo json_encode(["success" => 1, "subCategoria" => $subCategoria]);
        } else {
            // Si no se encontraron categorías, devolver un mensaje de error
            echo json_encode(array('success' => 0, 'message' => 'No se encontraron categorías'));
        }
    } else {
        // Si hubo un problema con la consulta, devolver un mensaje de error
        echo json_encode(array('success' => 0, 'message' => 'Error al obtener las categorías'));
        echo "Error en la consulta: " . mysqli_error($enlace);
    }
}

/////marca

if (isset($_GET["insertarMarca"])) {
    $data = json_decode(file_get_contents("php://input"));

    $marcaP = $data->marcaP;
  
    // Ejecutar la consulta para insertar la bodega
    $query = "CALL addmarca('$marcaP', @id_marcas)";
    $categoria = mysqli_query($enlace, $query);
	
    if ($categoria) {
        $id_marcas = mysqli_query($enlace, "SELECT @id_marcas as id_marcas")->fetch_assoc()['id_marcas'];
        echo json_encode(array('success' => 1, 'id_marcas' => $id_marcas));
		
    } else {
        // Si hubo un problema con la consulta, devolver un mensaje de error
        echo json_encode(array('success' => 0, 'message' => 'Error al insertar la bodega'));
		echo "Error en la consulta: " . mysqli_error($enlace);
    }
}


if (isset($_GET["marcaName"])) {
    // Obtener el valor de categoriaName desde la URL
    $nombreMarca = $_GET["marcaName"];

    // Escapar el nombre de la categoría para evitar inyección de SQL
    $nombreMarcas = mysqli_real_escape_string($enlace, $nombreMarca);

    // Construir la consulta SQL con el nombre de la categoría escapado
    $query = "SELECT * FROM marcasproducto WHERE marca = '$nombreMarcas'";
	

    // Ejecutar la consulta para obtener la categoría
    $marcasproducto = mysqli_query($enlace, $query);
	
    if ($marcasproducto) {
        // Verificar si se encontró alguna categoría con ese nombre
        if (mysqli_num_rows($marcasproducto) > 0) {
            // Si se encontró una categoría con ese nombre, devolver un mensaje de éxito
           $MarcaEncontrada = mysqli_fetch_assoc($marcasproducto);
		   echo json_encode(array('success' => 1, 'marcasproducto' => $MarcaEncontrada));
        } else {
            // Si no se encontró ninguna categoría con ese nombre, devolver un mensaje de error
            echo json_encode(array('success' => 0, 'message' => 'No se encontró ninguna categoría con ese nombre'));
        }
    } else {
        // Si hubo un problema con la consulta, devolver un mensaje de error
        echo json_encode(array('success' => 0, 'message' => 'Error al obtener la categoría'));
        echo "Error en la consulta: " . mysqli_error($enlace);
    }
}


if (isset($_GET["consultarMarcas"])) {

    $query = "SELECT marca FROM marcasproducto";

    // Ejecutar la consulta para obtener las categorías
    $marcas = mysqli_query($enlace, $query);

    if ($marcas) {
        // Verificar si se encontraron categorías
        if (mysqli_num_rows($marcas) > 0) {
            // Si se encontraron categorías, devolver un mensaje de éxito y las categorías
            $marcas = mysqli_fetch_all($marcas, MYSQLI_ASSOC);
			echo json_encode(["success" => 1, "marcas" => $marcas]);
        } else {
            // Si no se encontraron categorías, devolver un mensaje de error
            echo json_encode(array('success' => 0, 'message' => 'No se encontraron categorías'));
        }
    } else {
        // Si hubo un problema con la consulta, devolver un mensaje de error
        echo json_encode(array('success' => 0, 'message' => 'Error al obtener las categorías'));
        echo "Error en la consulta: " . mysqli_error($enlace);
    }
}

?>
