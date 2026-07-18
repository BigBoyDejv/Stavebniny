<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $type = $_GET['type'] ?? null;
    $category = $_GET['category'] ?? null;

    $sql = "SELECT * FROM products WHERE 1=1";
    $params = [];

    if ($type) {
        $sql .= " AND type = :type";
        $params['type'] = $type;
    }
    if ($category) {
        $sql .= " AND category = :category";
        $params['category'] = $category;
    }

    $sql .= " ORDER BY created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll();

    echo json_encode($products);
    exit();
}

if ($method === 'POST') {
    checkAdminAuth();
    $input = getJsonInput();

    $stmt = $pdo->prepare("
        INSERT INTO products (name, description, price, category, sku, stock_quantity, image_url, type, unit)
        VALUES (:name, :description, :price, :category, :sku, :stock_quantity, :image_url, :type, :unit)
        RETURNING *
    ");
    $stmt->execute([
        'name' => $input['name'] ?? '',
        'description' => $input['description'] ?? '',
        'price' => $input['price'] ?? 0,
        'category' => $input['category'] ?? '',
        'sku' => $input['sku'] ?? ('SKU-' . time()),
        'stock_quantity' => $input['stock_quantity'] ?? 0,
        'image_url' => $input['image_url'] ?? '',
        'type' => $input['type'] ?? 'material',
        'unit' => $input['unit'] ?? 'ks'
    ]);

    echo json_encode($stmt->fetch());
    exit();
}

if ($method === 'PUT') {
    checkAdminAuth();
    $input = getJsonInput();
    $id = $input['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing product ID']);
        exit();
    }

    $stmt = $pdo->prepare("
        UPDATE products SET
            name = :name,
            description = :description,
            price = :price,
            category = :category,
            sku = :sku,
            stock_quantity = :stock_quantity,
            image_url = :image_url,
            type = :type,
            unit = :unit
        WHERE id = :id
        RETURNING *
    ");
    $stmt->execute([
        'id' => $id,
        'name' => $input['name'] ?? '',
        'description' => $input['description'] ?? '',
        'price' => $input['price'] ?? 0,
        'category' => $input['category'] ?? '',
        'sku' => $input['sku'] ?? '',
        'stock_quantity' => $input['stock_quantity'] ?? 0,
        'image_url' => $input['image_url'] ?? '',
        'type' => $input['type'] ?? 'material',
        'unit' => $input['unit'] ?? 'ks'
    ]);

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

    $stmt = $pdo->prepare("DELETE FROM products WHERE id = :id");
    $stmt->execute(['id' => $id]);

    echo json_encode(['success' => true]);
    exit();
}
