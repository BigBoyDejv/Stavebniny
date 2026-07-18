<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($action === 'items') {
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM rental_items ORDER BY created_at DESC");
        $items = $stmt->fetchAll();
        foreach ($items as &$item) {
            if (is_string($item['accessories'])) {
                $item['accessories'] = json_decode($item['accessories'], true);
            }
        }
        echo json_encode($items);
        exit();
    }

    if ($method === 'POST') {
        checkAdminAuth();
        $input = getJsonInput();
        $stmt = $pdo->prepare("
            INSERT INTO rental_items (name, category, price4h, price24h, deposit, image_url, description, note, accessories, availability)
            VALUES (:name, :category, :price4h, :price24h, :deposit, :image_url, :description, :note, :accessories, :availability)
            RETURNING *
        ");
        $stmt->execute([
            'name' => $input['name'] ?? '',
            'category' => $input['category'] ?? '',
            'price4h' => $input['price4h'] ?? 0,
            'price24h' => $input['price24h'] ?? 0,
            'deposit' => $input['deposit'] ?? 0,
            'image_url' => $input['image_url'] ?? '',
            'description' => $input['description'] ?? '',
            'note' => $input['note'] ?? '',
            'accessories' => json_encode($input['accessories'] ?? []),
            'availability' => $input['availability'] ?? true
        ]);
        $item = $stmt->fetch();
        $item['accessories'] = json_decode($item['accessories'], true);
        echo json_encode($item);
        exit();
    }

    if ($method === 'PUT') {
        checkAdminAuth();
        $input = getJsonInput();
        $id = $input['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing ID']);
            exit();
        }
        $stmt = $pdo->prepare("
            UPDATE rental_items SET
                name = :name, category = :category, price4h = :price4h, price24h = :price24h,
                deposit = :deposit, image_url = :image_url, description = :description,
                note = :note, accessories = :accessories, availability = :availability
            WHERE id = :id RETURNING *
        ");
        $stmt->execute([
            'id' => $id,
            'name' => $input['name'] ?? '',
            'category' => $input['category'] ?? '',
            'price4h' => $input['price4h'] ?? 0,
            'price24h' => $input['price24h'] ?? 0,
            'deposit' => $input['deposit'] ?? 0,
            'image_url' => $input['image_url'] ?? '',
            'description' => $input['description'] ?? '',
            'note' => $input['note'] ?? '',
            'accessories' => json_encode($input['accessories'] ?? []),
            'availability' => $input['availability'] ?? true
        ]);
        $item = $stmt->fetch();
        $item['accessories'] = json_decode($item['accessories'], true);
        echo json_encode($item);
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
        $stmt = $pdo->prepare("DELETE FROM rental_items WHERE id = :id");
        $stmt->execute(['id' => $id]);
        echo json_encode(['success' => true]);
        exit();
    }
}

if ($action === 'bookings') {
    if ($method === 'GET') {
        checkAdminAuth();
        $stmt = $pdo->query("SELECT * FROM rental_bookings ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll());
        exit();
    }

    if ($method === 'POST') {
        $input = getJsonInput();
        $stmt = $pdo->prepare("
            INSERT INTO rental_bookings (
                rental_item_id, customer_name, customer_email, customer_phone,
                start_date, end_date, start_time, end_time,
                delivery_method, delivery_address, delivery_city, delivery_zip,
                delivery_municipality, delivery_price, status, note
            ) VALUES (
                :rental_item_id, :customer_name, :customer_email, :customer_phone,
                :start_date, :end_date, :start_time, :end_time,
                :delivery_method, :delivery_address, :delivery_city, :delivery_zip,
                :delivery_municipality, :delivery_price, 'pending', :note
            ) RETURNING *
        ");
        $stmt->execute([
            'rental_item_id' => $input['rental_item_id'] ?? null,
            'customer_name' => $input['customer_name'] ?? '',
            'customer_email' => $input['customer_email'] ?? '',
            'customer_phone' => $input['customer_phone'] ?? '',
            'start_date' => $input['start_date'] ?? null,
            'end_date' => $input['end_date'] ?? null,
            'start_time' => $input['start_time'] ?? '08:00',
            'end_time' => $input['end_time'] ?? '08:00',
            'delivery_method' => $input['delivery_method'] ?? 'pickup',
            'delivery_address' => $input['delivery_address'] ?? '',
            'delivery_city' => $input['delivery_city'] ?? '',
            'delivery_zip' => $input['delivery_zip'] ?? '',
            'delivery_municipality' => $input['delivery_municipality'] ?? '',
            'delivery_price' => $input['delivery_price'] ?? 0,
            'note' => $input['note'] ?? ''
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
        $stmt = $pdo->prepare("UPDATE rental_bookings SET status = :status WHERE id = :id RETURNING *");
        $stmt->execute(['status' => $status, 'id' => $id]);
        echo json_encode($stmt->fetch());
        exit();
    }
}

http_response_code(404);
echo json_encode(['error' => 'Invalid rental endpoint']);
