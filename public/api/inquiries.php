<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

function getInquiryJsonFile() {
    return __DIR__ . '/inquiries_store.json';
}

function readInquiriesFromJson() {
    $file = getInquiryJsonFile();
    if (file_exists($file)) {
        $content = @file_get_contents($file);
        $data = @json_decode($content, true);
        if (is_array($data)) return $data;
    }
    return [];
}

function saveInquiryToJson($inquiry) {
    try {
        $file = getInquiryJsonFile();
        $list = readInquiriesFromJson();
        $exists = false;
        foreach ($list as $item) {
            if (($item['id'] ?? '') === $inquiry['id']) {
                $exists = true;
                break;
            }
        }
        if (!$exists) {
            array_unshift($list, $inquiry);
            @file_put_contents($file, json_encode($list, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }
    } catch (Throwable $e) {}
}

function deleteInquiryFromJson($id) {
    try {
        $file = getInquiryJsonFile();
        $list = readInquiriesFromJson();
        $newList = array_values(array_filter($list, function($item) use ($id) {
            return ($item['id'] ?? '') !== $id;
        }));
        @file_put_contents($file, json_encode($newList, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    } catch (Throwable $e) {}
}

if ($pdo) {
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS inquiries (
                id VARCHAR(64) PRIMARY KEY,
                type TEXT,
                customer_name TEXT,
                customer_email TEXT,
                customer_phone TEXT,
                subject TEXT,
                details TEXT,
                status VARCHAR(32) DEFAULT 'new',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ");
        @$pdo->exec("ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS type TEXT");
        @$pdo->exec("ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS customer_name TEXT");
        @$pdo->exec("ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS customer_email TEXT");
        @$pdo->exec("ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS customer_phone TEXT");
        @$pdo->exec("ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS subject TEXT");
        @$pdo->exec("ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS details TEXT");
        @$pdo->exec("ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS status VARCHAR(32)");
        @$pdo->exec("ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS created_at TIMESTAMP");
        @$pdo->exec("ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS name TEXT");
        @$pdo->exec("ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS email TEXT");
        @$pdo->exec("ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS message TEXT");
    } catch (Throwable $t) {}
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    checkAdminAuth();
    $dbList = [];
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT * FROM inquiries ORDER BY created_at DESC");
            $dbList = $stmt->fetchAll() ?: [];
        } catch (Throwable $e) {
            try {
                $stmt2 = $pdo->query("SELECT * FROM inquiries");
                $dbList = $stmt2->fetchAll() ?: [];
            } catch (Throwable $e2) {
                $dbList = [];
            }
        }
    }
    
    $fileList = readInquiriesFromJson();

    // Slúčenie DB s JSON súborom bez duplikátov
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

    echo json_encode($merged);
    exit();
}

if ($method === 'POST') {
    $input = getJsonInput();
    
    // Honeypot anti-spam check
    if (!empty($input['_honeypot'])) {
        // Zistený spam bot - vrátime falošný úspech, aby neskúšal znova s inou metódou
        echo json_encode(['success' => true, 'id' => 'spam-' . time(), 'status' => 'new', 'spam' => true]);
        exit();
    }

    $inquiryId = $input['id'] ?? null;
    if (!$inquiryId || !preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $inquiryId)) {
        try {
            $bytes = random_bytes(16);
            $bytes[6] = chr(ord($bytes[6]) & 0x0f | 0x40);
            $bytes[8] = chr(ord($bytes[8]) & 0x3f | 0x80);
            $inquiryId = vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($bytes), 4));
        } catch (Throwable $e) {
            $inquiryId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000,
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
            );
        }
    }

    $inquiry = [
        'id' => $inquiryId,
        'type' => $input['type'] ?? 'Konzultácia / Dopyt',
        'customer_name' => $input['customer_name'] ?? $input['name'] ?? '',
        'customer_email' => $input['customer_email'] ?? $input['email'] ?? '',
        'customer_phone' => $input['customer_phone'] ?? $input['phone'] ?? '',
        'subject' => $input['subject'] ?? 'Konzultačný dopyt',
        'details' => $input['details'] ?? $input['message'] ?? '',
        'name' => $input['customer_name'] ?? $input['name'] ?? '',
        'email' => $input['customer_email'] ?? $input['email'] ?? '',
        'phone' => $input['customer_phone'] ?? $input['phone'] ?? '',
        'message' => $input['details'] ?? $input['message'] ?? '',
        'status' => 'new',
        'created_at' => date('Y-m-d H:i:s')
    ];

    if ($pdo) {
        try {
            $stmt = $pdo->prepare("
                INSERT INTO inquiries (id, type, customer_name, customer_email, customer_phone, subject, details, name, email, message, status, created_at)
                VALUES (:id, :type, :customer_name, :customer_email, :customer_phone, :subject, :details, :name, :email, :message, :status, :created_at)
            ");
            $stmt->execute([
                'id' => $inquiry['id'],
                'type' => $inquiry['type'],
                'customer_name' => $inquiry['customer_name'],
                'customer_email' => $inquiry['customer_email'],
                'customer_phone' => $inquiry['customer_phone'],
                'subject' => $inquiry['subject'],
                'details' => $inquiry['details'],
                'name' => $inquiry['customer_name'],
                'email' => $inquiry['customer_email'],
                'message' => $inquiry['details'],
                'status' => $inquiry['status'],
                'created_at' => $inquiry['created_at']
            ]);
        } catch (Throwable $dbErr) {
            try {
                $stmt2 = $pdo->prepare("
                    INSERT INTO inquiries (id, customer_name, customer_email, details)
                    VALUES (:id, :cname, :cemail, :cdetails)
                ");
                $stmt2->execute([
                    'id' => $inquiry['id'],
                    'cname' => $inquiry['customer_name'],
                    'cemail' => $inquiry['customer_email'],
                    'cdetails' => $inquiry['details']
                ]);
            } catch (Throwable $dbErr2) {
                error_log('PDO Inquiries insert error: ' . $dbErr2->getMessage());
            }
        }
    }

    // Vždy uložíme aj do lokálneho JSON súboru na servery pre garanciu uloženia
    saveInquiryToJson($inquiry);

    if (empty($input['silent'])) {
        try {
            require_once __DIR__ . '/mailer.php';
            sendInquiryNotification($inquiry);
        } catch (Throwable $e) {}
    }

    echo json_encode($inquiry);
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
            $stmt = $pdo->prepare("UPDATE inquiries SET status = :status WHERE id = :id");
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
            $stmt = $pdo->prepare("DELETE FROM inquiries WHERE id = :id");
            $stmt->execute(['id' => $id]);
        } catch (Throwable $e) {}
    }
    deleteInquiryFromJson($id);
    echo json_encode(['success' => true]);
    exit();
}

