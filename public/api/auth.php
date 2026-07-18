<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

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

if ($method === 'POST' && $action === 'login') {
    $input = getJsonInput();
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';

    if (!$email || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password required']);
        exit();
    }

    $hash = hash('sha256', $password);
    $stmt = $pdo->prepare("SELECT id, email FROM admins WHERE email = :email AND password_hash = :hash");
    $stmt->execute(['email' => $email, 'hash' => $hash]);
    $admin = $stmt->fetch();

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
