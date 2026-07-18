<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$input = getJsonInput();
$action = $_GET['action'] ?? $_POST['action'] ?? ($input['action'] ?? '');

if ($method === 'GET' && $action === 'session') {
    if (!empty($_SESSION['admin_id'])) {
        echo json_encode([
            'session' => [
                'user' => [
                    'id' => $_SESSION['admin_id'],
                    'email' => $_SESSION['admin_email']
                ]
            ]
        ]);
    } else {
        echo json_encode(['session' => null]);
    }
    exit();
}

if ($method === 'POST' && ($action === 'login' || isset($input['email']))) {
    $email = trim($input['email'] ?? $_POST['email'] ?? '');
    $password = $input['password'] ?? $_POST['password'] ?? '';

    if (!$email || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Zadajte email a heslo']);
        exit();
    }

    $hash = hash('sha256', $password);

    try {
        $stmtCount = $pdo->query("SELECT COUNT(*) FROM admins");
        $count = $stmtCount->fetchColumn();

        if ($count == 0) {
            $stmtInsert = $pdo->prepare("INSERT INTO admins (email, password_hash) VALUES (:email, :hash) RETURNING id, email");
            $stmtInsert->execute(['email' => $email, 'hash' => $hash]);
            $admin = $stmtInsert->fetch();
        } else {
            $stmt = $pdo->prepare("SELECT id, email FROM admins WHERE LOWER(email) = LOWER(:email) AND (password_hash = :hash OR password_hash = :raw)");
            $stmt->execute(['email' => $email, 'hash' => $hash, 'raw' => $password]);
            $admin = $stmt->fetch();
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Chyba databázy: ' . $e->getMessage()]);
        exit();
    }

    if ($admin) {
        $_SESSION['admin_id'] = $admin['id'];
        $_SESSION['admin_email'] = $admin['email'];
        echo json_encode([
            'session' => [
                'user' => [
                    'id' => $admin['id'],
                    'email' => $admin['email']
                ]
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Nesprávne prihlasovacie údaje']);
    }
    exit();
}

if ($method === 'POST' && $action === 'logout') {
    session_destroy();
    echo json_encode(['success' => true]);
    exit();
}

http_response_code(404);
echo json_encode(['error' => 'Invalid auth endpoint']);
