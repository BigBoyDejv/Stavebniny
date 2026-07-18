<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

checkAdminAuth();

if (empty($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded']);
    exit();
}

$file = $_FILES['file'];
$uploadDir = __DIR__ . '/../uploads/';

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('img_', true) . '.' . ($extension ?: 'webp');
$targetPath = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    // Vracia relacnu URL pre ulozenie v databaze
    $publicUrl = '/uploads/' . $filename;
    echo json_encode(['url' => $publicUrl]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save uploaded file on server']);
}
