<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Config
$country = $_POST['country'] ?? '';
$UPLOAD_DIR = __DIR__ . '/audio_contributions/' . $country . '/';
$ALLOWED_TYPES = ['audio/webm', 'audio/wav', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/m4a', 'audio/x-m4a', 'application/octet-stream'];
$MAX_SIZE = 10 * 1024 * 1024; // 10MB

$VALID_COUNTRIES = [
    'argentina', 'bolivia', 'chile', 'colombia', 'costa_rica',
    'cuba', 'dominican_republic', 'ecuador', 'el_salvador', 'guatemala',
    'honduras', 'mexico', 'nicaragua', 'panama', 'paraguay',
    'peru', 'puerto_rico', 'spain', 'uruguay', 'usa', 'venezuela'
];

// Create upload dir — 0775 so web server can write
if (!is_dir($UPLOAD_DIR)) {
    if (!mkdir($UPLOAD_DIR, 0775, true)) {
        echo json_encode(['success' => false, 'error' => 'Cannot create upload directory']);
        exit;
    }
}

// Check dir is writable
if (!is_writable($UPLOAD_DIR)) {
    echo json_encode(['success' => false, 'error' => 'Upload directory not writable']);
    exit;
}

// Validate request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$country = $_POST['country'] ?? '';
if (!in_array($country, $VALID_COUNTRIES)) {
    echo json_encode(['success' => false, 'error' => 'Invalid country: ' . $country]);
    exit;
}

if (!isset($_FILES['audio']) || $_FILES['audio']['error'] !== UPLOAD_ERR_OK) {
    $err = $_FILES['audio']['error'] ?? 'no file';
    echo json_encode(['success' => false, 'error' => 'File upload error: ' . $err]);
    exit;
}

$file = $_FILES['audio'];

// Check size
if ($file['size'] > $MAX_SIZE) {
    echo json_encode(['success' => false, 'error' => 'File too large (max 10MB)']);
    exit;
}

// Accept any audio — browser webm/opus often reports as application/octet-stream
$ext = pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'webm';
$ext = preg_replace('/[^a-z0-9]/i', '', $ext) ?: 'webm';
$filename = $country . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
$dest = $UPLOAD_DIR . $filename;

if (move_uploaded_file($file['tmp_name'], $dest)) {
    $log = __DIR__ . '/audio_contributions/contributions.log';
    $entry = date('Y-m-d H:i:s') . ' | ' . $country . ' | ' . $filename . ' | ' . $file['size'] . ' bytes' . $_SERVER['HTTP_USER_AGENT'] . PHP_EOL;
    file_put_contents($log, $entry, FILE_APPEND);
    echo json_encode(['success' => true, 'file' => $filename]);
}
else {
    echo json_encode(['success' => false, 'error' => 'Failed to move uploaded file to ' . $dest]);
}
?>