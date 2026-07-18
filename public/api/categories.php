<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $type = $_GET['type'] ?? null;
    $sql = "SELECT * FROM categories";
    $params = [];
    if ($type) {
        $sql .= " WHERE type = :type";
        $params['type'] = $type;
    }
    $sql .= " ORDER BY name ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll());
    exit();
}

if ($method === 'POST') {
    checkAdminAuth();
    $input = getJsonInput();
    $name = trim($input['name'] ?? '');
    $type = $input['type'] ?? 'material';

    if (!$name) {
        http_response_code(400);
        echo json_encode(['error' => 'Name required']);
        exit();
    }

    $stmt = $pdo->prepare("INSERT INTO categories (name, type) VALUES (:name, :type) RETURNING *");
    $stmt->execute(['name' => $name, 'type' => $type]);
    echo json_encode($stmt->fetch());
    exit();
}

if ($method === 'DELETE') {
    checkAdminAuth();
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing ID']);
        exit();
    }
    $stmt = $pdo->prepare("DELETE FROM categories WHERE id = :id");
    $stmt->execute(['id' => $id]);
    echo json_encode(['success' => true]);
    exit();
}
