<?php
// PHP Konfigurácia pripojenia pre ExoHosting (PostgreSQL / MySQL / SQLite Fallback)

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

$db_host = 'pgsql1.dnsserver.eu';
$db_name = 'db73659xstavebniny';
$db_user = 'db73659xstavebniny';
$db_pass = 'Lkstav15Lub5.';

$pdo = null;

// 1. Skúšame PostgreSQL
try {
    $dsn = "pgsql:host=$db_host;dbname=$db_name";
    $pdo = new PDO($dsn, $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e1) {
    try {
        $dsn_local = "pgsql:host=localhost;dbname=$db_name";
        $pdo = new PDO($dsn_local, $db_user, $db_pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
    } catch (PDOException $e2) {
        // 2. Skúšame MySQL
        try {
            $dsn_mysql = "mysql:host=localhost;dbname=$db_name;charset=utf8mb4";
            $pdo = new PDO($dsn_mysql, $db_user, $db_pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
        } catch (PDOException $e3) {
            // 3. Fallback na rozhranie SQLite v lokálnom súbore
            try {
                $sqlite_file = __DIR__ . '/stavebniny_db.sqlite';
                $pdo = new PDO("sqlite:" . $sqlite_file, null, null, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]);
            } catch (PDOException $e4) {
                $pdo = null;
            }
        }
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
        http_response_code(401);
        echo json_encode(['error' => 'Neautorizovaný prístup. Prosím, prihláste sa.']);
        exit();
    }
}

