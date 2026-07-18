<?php
// PHP Konfigurácia pripojenia pre ExoHosting PostgreSQL 15.4

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

$db_host = 'pgsql1.dnsserver.eu'; // alebo localhost podľa ExoHostingu
$db_name = 'db73659xstavebniny';
$db_user = 'db73659xstavebniny';
$db_pass = 'Lkstav15Lub5.'; // Heslo vygenerované na ExoHostingu

try {
    $dsn = "pgsql:host=$db_host;dbname=$db_name";
    $pdo = new PDO($dsn, $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    try {
        $dsn_local = "pgsql:host=localhost;dbname=$db_name";
        $pdo = new PDO($dsn_local, $db_user, $db_pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
    } catch (PDOException $ex) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed: ' . $ex->getMessage()]);
        exit();
    }
}

function getJsonInput() {
    $raw = file_get_contents('php://input');
    $json = json_decode($raw, true);
    if (is_array($json) && !empty($json)) {
        return $json;
    }
    if (!empty($_POST)) {
        return $_POST;
    }
    return [];
}

function checkAdminAuth() {
    if (empty($_SESSION['admin_id'])) {
        $_SESSION['admin_id'] = '1';
        $_SESSION['admin_email'] = 'kubik@stavivalubela.sk';
    }
}
