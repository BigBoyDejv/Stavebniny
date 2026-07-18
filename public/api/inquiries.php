<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    checkAdminAuth();
    $stmt = $pdo->query("SELECT * FROM inquiries ORDER BY created_at DESC");
    echo json_encode($stmt->fetchAll());
    exit();
}

if ($method === 'POST') {
    $input = getJsonInput();

    $stmt = $pdo->prepare("
        INSERT INTO inquiries (type, customer_name, customer_email, customer_phone, subject, details, status)
        VALUES (:type, :customer_name, :customer_email, :customer_phone, :subject, :details, 'new')
        RETURNING *
    ");
    $stmt->execute([
        'type' => $input['type'] ?? 'Kontakt',
        'customer_name' => $input['customer_name'] ?? '',
        'customer_email' => $input['customer_email'] ?? '',
        'customer_phone' => $input['customer_phone'] ?? '',
        'subject' => $input['subject'] ?? '',
        'details' => $input['details'] ?? ''
    ]);

    echo json_encode($stmt->fetch());
    exit();
}

if ($method === 'PUT') {
    checkAdminAuth();
    $input = getJsonInput();
    $id = $input['id'] ?? null;
    $status = $input['status'] ?? null;

    if (!$id || !$status) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing ID or status']);
        exit();
    }

    $stmt = $pdo->prepare("UPDATE inquiries SET status = :status WHERE id = :id RETURNING *");
    $stmt->execute(['status' => $status, 'id' => $id]);
    echo json_encode($stmt->fetch());
    exit();
}
