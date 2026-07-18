<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT key, value FROM site_settings");
    $rows = $stmt->fetchAll();
    $settings = [];
    foreach ($rows as $row) {
        $settings[$row['key']] = $row['value'];
    }
    echo json_encode($settings);
    exit();
}

if ($method === 'POST') {
    checkAdminAuth();
    $input = getJsonInput();

    $stmt = $pdo->prepare("
        INSERT INTO site_settings (key, value)
        VALUES (:key, :value)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    ");

    foreach ($input as $key => $value) {
        $stmt->execute([
            'key' => (string)$key,
            'value' => (string)$value
        ]);
    }

    echo json_encode(['success' => true]);
    exit();
}
