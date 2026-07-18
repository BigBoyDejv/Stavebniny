<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    checkAdminAuth();
    $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC");
    $orders = $stmt->fetchAll();
    foreach ($orders as &$order) {
        if (is_string($order['items'])) {
            $order['items'] = json_decode($order['items'], true);
        }
    }
    echo json_encode($orders);
    exit();
}

if ($method === 'POST') {
    $input = getJsonInput();

    $stmt = $pdo->prepare("
        INSERT INTO orders (
            customer_name, customer_email, customer_phone,
            delivery_method, delivery_address, delivery_city, delivery_zip,
            delivery_price, total_price, payment_method, note, status, items
        ) VALUES (
            :customer_name, :customer_email, :customer_phone,
            :delivery_method, :delivery_address, :delivery_city, :delivery_zip,
            :delivery_price, :total_price, :payment_method, :note, :status, :items
        ) RETURNING *
    ");
    $stmt->execute([
        'customer_name' => $input['customer_name'] ?? '',
        'customer_email' => $input['customer_email'] ?? '',
        'customer_phone' => $input['customer_phone'] ?? '',
        'delivery_method' => $input['delivery_method'] ?? 'pickup',
        'delivery_address' => $input['delivery_address'] ?? '',
        'delivery_city' => $input['delivery_city'] ?? '',
        'delivery_zip' => $input['delivery_zip'] ?? '',
        'delivery_price' => $input['delivery_price'] ?? 0,
        'total_price' => $input['total_price'] ?? 0,
        'payment_method' => $input['payment_method'] ?? 'cash',
        'note' => $input['note'] ?? '',
        'status' => 'new',
        'items' => json_encode($input['items'] ?? [])
    ]);

    $order = $stmt->fetch();
    $order['items'] = json_decode($order['items'], true);
    echo json_encode($order);
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

    $stmt = $pdo->prepare("UPDATE orders SET status = :status WHERE id = :id RETURNING *");
    $stmt->execute(['status' => $status, 'id' => $id]);
    $order = $stmt->fetch();
    if ($order && is_string($order['items'])) {
        $order['items'] = json_decode($order['items'], true);
    }
    echo json_encode($order);
    exit();
}
