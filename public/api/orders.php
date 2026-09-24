<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

function getOrdersJsonFile() {
    return __DIR__ . '/orders_store.json';
}

function readOrdersFromJson() {
    $file = getOrdersJsonFile();
    if (file_exists($file)) {
        $content = @file_get_contents($file);
        $data = @json_decode($content, true);
        if (is_array($data)) return $data;
    }
    return [];
}

function saveOrderToJson($order) {
    try {
        $file = getOrdersJsonFile();
        $list = readOrdersFromJson();
        $exists = false;
        foreach ($list as $item) {
            if (($item['id'] ?? '') === $order['id']) {
                $exists = true;
                break;
            }
        }
        if (!$exists) {
            array_unshift($list, $order);
            @file_put_contents($file, json_encode($list, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }
    } catch (Throwable $e) {}
}

function deleteOrderFromJson($id) {
    try {
        $file = getOrdersJsonFile();
        $list = readOrdersFromJson();
        $newList = array_values(array_filter($list, function($item) use ($id) {
            return ($item['id'] ?? '') !== $id;
        }));
        @file_put_contents($file, json_encode($newList, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    } catch (Throwable $e) {}
}

if ($pdo) {
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS orders (
                id VARCHAR(64) PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                customer_name TEXT,
                customer_email TEXT,
                customer_phone TEXT,
                delivery_method TEXT DEFAULT 'pickup',
                delivery_address TEXT,
                delivery_city TEXT,
                delivery_zip TEXT,
                delivery_price NUMERIC(10,2) DEFAULT 0.00,
                total_price NUMERIC(10,2) DEFAULT 0.00,
                payment_method TEXT DEFAULT 'cash',
                note TEXT,
                status VARCHAR(32) DEFAULT 'new',
                items TEXT
            )
        ");
        @$pdo->exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT");
        @$pdo->exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT");
        @$pdo->exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT");
        @$pdo->exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method TEXT");
        @$pdo->exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT");
        @$pdo->exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_city TEXT");
        @$pdo->exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_zip TEXT");
        @$pdo->exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_price NUMERIC(10,2)");
        @$pdo->exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_price NUMERIC(10,2)");
        @$pdo->exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT");
        @$pdo->exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS note TEXT");
        @$pdo->exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS status VARCHAR(32)");
        @$pdo->exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS items TEXT");
        @$pdo->exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_info TEXT");
        @$pdo->exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP");
    } catch (Throwable $t) {}
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    checkAdminAuth();
    $dbList = [];
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC");
            $dbList = $stmt->fetchAll() ?: [];
        } catch (Throwable $e) {
            try {
                $stmt2 = $pdo->query("SELECT * FROM orders");
                $dbList = $stmt2->fetchAll() ?: [];
            } catch (Throwable $e2) {
                $dbList = [];
            }
        }
    }

    $fileList = readOrdersFromJson();

    $merged = $dbList;
    $existingIds = [];
    foreach ($dbList as $item) {
        if (!empty($item['id'])) $existingIds[strval($item['id'])] = true;
    }
    foreach ($fileList as $item) {
        $idStr = strval($item['id'] ?? '');
        if ($idStr && empty($existingIds[$idStr])) {
            $merged[] = $item;
        }
    }

    foreach ($merged as &$order) {
        if (isset($order['items']) && is_string($order['items'])) {
            $order['items'] = json_decode($order['items'], true);
        }
        if (isset($order['shipping_info']) && is_string($order['shipping_info'])) {
            $order['shipping_info'] = json_decode($order['shipping_info'], true);
        }
        if (empty($order['customer_name']) && !empty($order['shipping_info'])) {
            $order['customer_name'] = trim(($order['shipping_info']['firstName'] ?? '') . ' ' . ($order['shipping_info']['lastName'] ?? ''));
        }
        if (empty($order['customer_email']) && !empty($order['shipping_info']['email'])) {
            $order['customer_email'] = $order['shipping_info']['email'];
        }
        if (empty($order['customer_phone']) && !empty($order['shipping_info']['phone'])) {
            $order['customer_phone'] = $order['shipping_info']['phone'];
        }
        if (empty($order['items']) && !empty($order['shipping_info']['items']) && is_array($order['shipping_info']['items'])) {
            $order['items'] = $order['shipping_info']['items'];
        }
    }

    echo json_encode($merged);
    exit();
}

if ($method === 'POST') {
    $input = getJsonInput();

    // Honeypot anti-spam check
    if (!empty($input['_honeypot'])) {
        echo json_encode(['success' => true, 'id' => 'spam-' . time(), 'status' => 'new', 'spam' => true]);
        exit();
    }

    $orderId = $input['id'] ?? null;
    if (!$orderId || !preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $orderId)) {
        try {
            $bytes = random_bytes(16);
            $bytes[6] = chr(ord($bytes[6]) & 0x0f | 0x40);
            $bytes[8] = chr(ord($bytes[8]) & 0x3f | 0x80);
            $orderId = vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($bytes), 4));
        } catch (Throwable $e) {
            $orderId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000,
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
            );
        }
    }

    $itemsData = $input['items'] ?? [];
    $shippingObj = [
        'firstName' => $input['customer_name'] ?? $input['firstName'] ?? '',
        'lastName' => $input['lastName'] ?? '',
        'email' => $input['customer_email'] ?? $input['email'] ?? '',
        'phone' => $input['customer_phone'] ?? $input['phone'] ?? '',
        'address' => $input['delivery_address'] ?? $input['address'] ?? '',
        'city' => $input['delivery_city'] ?? $input['city'] ?? '',
        'zip' => $input['delivery_zip'] ?? $input['zip'] ?? '',
        'deliveryMethod' => $input['delivery_method'] ?? 'pickup',
        'message' => $input['note'] ?? $input['message'] ?? '',
        'items' => is_array($itemsData) ? $itemsData : []
    ];
    $shippingJson = json_encode($shippingObj, JSON_UNESCAPED_UNICODE);

    $order = [
        'id' => $orderId,
        'customer_name' => $input['customer_name'] ?? trim(($input['firstName'] ?? '') . ' ' . ($input['lastName'] ?? '')) ?: 'Zákazník',
        'customer_email' => $input['customer_email'] ?? $input['email'] ?? '',
        'customer_phone' => $input['customer_phone'] ?? $input['phone'] ?? '',
        'delivery_method' => $input['delivery_method'] ?? 'pickup',
        'delivery_address' => $input['delivery_address'] ?? $input['address'] ?? '',
        'delivery_city' => $input['delivery_city'] ?? $input['city'] ?? '',
        'delivery_zip' => $input['delivery_zip'] ?? $input['zip'] ?? '',
        'delivery_price' => floatval($input['delivery_price'] ?? 0),
        'total_price' => floatval($input['total_price'] ?? 0),
        'payment_method' => $input['payment_method'] ?? 'cash',
        'note' => $input['note'] ?? $input['message'] ?? '',
        'status' => $input['status'] ?? 'dopyt',
        'items' => is_array($itemsData) ? $itemsData : [],
        'shipping_info' => $shippingObj,
        'created_at' => date('Y-m-d H:i:s')
    ];

    if ($pdo) {
        try {
            $stmt = $pdo->prepare("
                INSERT INTO orders (
                    id, customer_name, customer_email, customer_phone,
                    delivery_method, delivery_address, delivery_city, delivery_zip,
                    delivery_price, total_price, payment_method, note, status, items, shipping_info, created_at
                ) VALUES (
                    :id, :customer_name, :customer_email, :customer_phone,
                    :delivery_method, :delivery_address, :delivery_city, :delivery_zip,
                    :delivery_price, :total_price, :payment_method, :note, :status, :items, :shipping_info, :created_at
                )
            ");
            $stmt->execute([
                'id' => $order['id'],
                'customer_name' => $order['customer_name'],
                'customer_email' => $order['customer_email'],
                'customer_phone' => $order['customer_phone'],
                'delivery_method' => $order['delivery_method'],
                'delivery_address' => $order['delivery_address'],
                'delivery_city' => $order['delivery_city'],
                'delivery_zip' => $order['delivery_zip'],
                'delivery_price' => $order['delivery_price'],
                'total_price' => $order['total_price'],
                'payment_method' => $order['payment_method'],
                'note' => $order['note'],
                'status' => $order['status'],
                'items' => json_encode($order['items'], JSON_UNESCAPED_UNICODE),
                'shipping_info' => $shippingJson,
                'created_at' => $order['created_at']
            ]);
        } catch (Throwable $dbErr1) {
            try {
                $stmt2 = $pdo->prepare("
                    INSERT INTO orders (id, total_price, status, shipping_info, created_at)
                    VALUES (:id, :total_price, :status, :shipping_info, :created_at)
                ");
                $stmt2->execute([
                    'id' => $order['id'],
                    'total_price' => $order['total_price'],
                    'status' => $order['status'],
                    'shipping_info' => $shippingJson,
                    'created_at' => $order['created_at']
                ]);
            } catch (Throwable $dbErr2) {
                try {
                    $stmt3 = $pdo->prepare("
                        INSERT INTO orders (id, status, created_at)
                        VALUES (:id, :status, :created_at)
                    ");
                    $stmt3->execute([
                        'id' => $order['id'],
                        'status' => $order['status'],
                        'created_at' => $order['created_at']
                    ]);
                } catch (Throwable $dbErr3) {
                    error_log('PDO Orders insert error: ' . $dbErr3->getMessage());
                }
            }
        }
    }

    // Vždy uložíme aj do lokálneho JSON súboru na servery pre garanciu
    saveOrderToJson($order);

    try {
        require_once __DIR__ . '/mailer.php';
        sendOrderNotification($order);
    } catch (Throwable $e) {}

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

    if ($pdo) {
        try {
            $stmt = $pdo->prepare("UPDATE orders SET status = :status WHERE id = :id");
            $stmt->execute(['status' => $status, 'id' => $id]);
        } catch (Throwable $e) {}
    }
    echo json_encode(['id' => $id, 'status' => $status]);
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
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("DELETE FROM orders WHERE id = :id");
            $stmt->execute(['id' => $id]);
        } catch (Throwable $e) {}
    }
    deleteOrderFromJson($id);
    echo json_encode(['success' => true]);
    exit();
}
