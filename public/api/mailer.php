<?php
// public/api/mailer.php

require_once __DIR__ . '/config.php';

define('MAIL_ADMIN_EMAIL', 'kubik@stavivalubela.sk');
define('MAIL_FROM_EMAIL', 'kubik@stavivalubela.sk');
define('MAIL_FROM_NAME', 'STAVIVA ĽUBEĽA Web');

// Voliteľné SMTP nastavenie (ak je vyplnené heslo, odosiela sa cez SMTP server Exohostingu)
define('SMTP_HOST', 'smtp.exohosting.sk');
define('SMTP_PORT', 587);
define('SMTP_USER', 'kubik@stavivalubela.sk');
define('SMTP_PASS', ''); // Ak chcete použiť SMTP prihlásenie, vložte sem heslo z Roundcube

/**
 * Hlavná funkcia na odoslanie HTML e-mailu
 */
function sendHtmlEmail($to, $subject, $htmlBody, $replyToEmail = null, $replyToName = null) {
    if (!empty(SMTP_PASS)) {
        $smtpResult = sendViaSmtp($to, $subject, $htmlBody, $replyToEmail, $replyToName);
        if ($smtpResult) return true;
    }
    
    return sendViaPhpMail($to, $subject, $htmlBody, $replyToEmail, $replyToName);
}

/**
 * Odoslanie pomocou natívnej PHP mail() funkcie prispôsobenej pre ExoHosting
 */
function sendViaPhpMail($to, $subject, $htmlBody, $replyToEmail = null, $replyToName = null) {
    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    
    $headers = [];
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-type: text/html; charset=utf-8';
    $headers[] = 'From: ' . '=?UTF-8?B?' . base64_encode(MAIL_FROM_NAME) . '?= <' . MAIL_FROM_EMAIL . '>';
    
    if (!empty($replyToEmail)) {
        $replyNameStr = !empty($replyToName) ? '=?UTF-8?B?' . base64_encode($replyToName) . '?= ' : '';
        $headers[] = 'Reply-To: ' . $replyNameStr . '<' . $replyToEmail . '>';
    }
    
    $headers[] = 'X-Mailer: PHP/' . phpversion();
    // Na Linux serveroch (ako ExoHosting) sa pre mail() hlavičky odporúča použiť \n namiesto \r\n
    $headerString = implode("\n", $headers);
    
    $sent = @mail($to, $encodedSubject, $htmlBody, $headerString, '-f ' . MAIL_FROM_EMAIL);
    if (!$sent) {
        $sent = @mail($to, $encodedSubject, $htmlBody, $headerString);
    }
    return $sent;
}

/**
 * Odoslanie pomocou priameho SMTP spojenia na ExoHosting
 */
function sendViaSmtp($to, $subject, $htmlBody, $replyToEmail = null, $replyToName = null) {
    $timeout = 10;
    $socket = @fsockopen(SMTP_HOST, SMTP_PORT, $errno, $errstr, $timeout);
    if (!$socket) {
        return false;
    }
    
    $read = function() use ($socket) {
        $response = '';
        while ($str = fgets($socket, 512)) {
            $response .= $str;
            if (substr($str, 3, 1) == ' ') break;
        }
        return $response;
    };

    $write = function($cmd) use ($socket) {
        fputs($socket, $cmd . "\r\n");
    };

    $read();
    $write('EHLO ' . gethostname());
    $read();

    if (SMTP_PORT == 587) {
        $write('STARTTLS');
        $read();
        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT | STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT)) {
            fclose($socket);
            return false;
        }
        $write('EHLO ' . gethostname());
        $read();
    }

    $write('AUTH LOGIN');
    $read();
    $write(base64_encode(SMTP_USER));
    $read();
    $write(base64_encode(SMTP_PASS));
    $authRes = $read();

    if (substr($authRes, 0, 3) != '235') {
        fclose($socket);
        return false;
    }

    $write('MAIL FROM: <' . MAIL_FROM_EMAIL . '>');
    $read();
    $write('RCPT TO: <' . $to . '>');
    $read();
    $write('DATA');
    $read();

    $headers = [];
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-type: text/html; charset=utf-8';
    $headers[] = 'From: ' . '=?UTF-8?B?' . base64_encode(MAIL_FROM_NAME) . '?= <' . MAIL_FROM_EMAIL . '>';
    $headers[] = 'To: <' . $to . '>';
    $headers[] = 'Subject: =?UTF-8?B?' . base64_encode($subject) . '?=';
    if (!empty($replyToEmail)) {
        $headers[] = 'Reply-To: <' . $replyToEmail . '>';
    }

    $data = implode("\r\n", $headers) . "\r\n\r\n" . $htmlBody . "\r\n.";
    $write($data);
    $read();
    $write('QUIT');
    fclose($socket);
    return true;
}

/**
 * Notifikácia o novom dopyte / správe z formulára
 */
function sendInquiryNotification($inquiry) {
    $type = htmlspecialchars($inquiry['type'] ?? 'Konzultácia / Dopyt');
    $name = htmlspecialchars($inquiry['customer_name'] ?? $inquiry['name'] ?? 'Neznámy zákazník');
    $email = htmlspecialchars($inquiry['customer_email'] ?? $inquiry['email'] ?? '-');
    $phone = htmlspecialchars($inquiry['customer_phone'] ?? $inquiry['phone'] ?? '-');
    $subjectText = htmlspecialchars($inquiry['subject'] ?? 'Konzultačný dopyt');
    $details = nl2br(htmlspecialchars($inquiry['details'] ?? $inquiry['message'] ?? ''));

    $subject = "Nová správa / Konzultácia z webu: {$subjectText} ({$name})";

    $html = "
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background-color: #ffffff;'>
        <div style='background-color: #1e293b; color: #ffffff; padding: 20px; text-align: center;'>
            <h2 style='margin: 0; font-size: 20px;'>Nová správa z webu (STAVIVA ĽUBEĽA)</h2>
        </div>
        <div style='padding: 24px; color: #334155;'>
            <p style='font-size: 16px; margin-top: 0;'>Bola prijatá nová správa z webového formulára:</p>
            <table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>
                <tr><td style='padding: 8px 0; font-weight: bold; width: 140px;'>Typ správy:</td><td>{$type}</td></tr>
                <tr><td style='padding: 8px 0; font-weight: bold;'>Meno a priezvisko:</td><td>{$name}</td></tr>
                <tr><td style='padding: 8px 0; font-weight: bold;'>E-mail:</td><td><a href='mailto:{$email}'>{$email}</a></td></tr>
                <tr><td style='padding: 8px 0; font-weight: bold;'>Telefón:</td><td><a href='tel:{$phone}'>{$phone}</a></td></tr>
                <tr><td style='padding: 8px 0; font-weight: bold;'>Predmet:</td><td>{$subjectText}</td></tr>
            </table>
            <div style='background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 16px; margin-top: 12px; border-radius: 4px;'>
                <strong style='display: block; margin-bottom: 8px;'>Správa / Detaily:</strong>
                <div>{$details}</div>
            </div>
        </div>
        <div style='background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 12px; color: #64748b;'>
            Tento e-mail bol automaticky vygenerovaný zo stránky STAVIVA ĽUBEĽA.
        </div>
    </div>
    ";

    return sendHtmlEmail(MAIL_ADMIN_EMAIL, $subject, $html, $email !== '-' ? $email : null, $name !== 'Neznámy zákazník' ? $name : null);
}

/**
 * Notifikácia o novej objednávke z e-shopu
 */
function sendOrderNotification($order) {
    $id = htmlspecialchars($order['id'] ?? '');
    $name = htmlspecialchars($order['customer_name'] ?? '');
    $email = htmlspecialchars($order['customer_email'] ?? '');
    $phone = htmlspecialchars($order['customer_phone'] ?? '');
    $deliveryMethod = htmlspecialchars($order['delivery_method'] ?? 'pickup');
    $address = htmlspecialchars(($order['delivery_address'] ?? '') . ' ' . ($order['delivery_city'] ?? '') . ' ' . ($order['delivery_zip'] ?? ''));
    $totalPrice = number_format((float)($order['total_price'] ?? 0), 2, ',', ' ') . ' €';
    $paymentMethod = htmlspecialchars($order['payment_method'] ?? 'cash');
    $note = nl2br(htmlspecialchars($order['note'] ?? ''));

    $subject = "Nová objednávka #{$id} - {$name} ({$totalPrice})";

    $itemsHtml = '';
    $items = is_array($order['items']) ? $order['items'] : [];
    foreach ($items as $item) {
        $itemName = htmlspecialchars($item['name'] ?? 'Položka');
        $itemQty = htmlspecialchars($item['quantity'] ?? 1);
        $itemUnit = htmlspecialchars($item['unit'] ?? 'ks');
        $itemPrice = number_format((float)($item['price'] ?? 0), 2, ',', ' ') . ' €';
        $itemsHtml .= "<tr>
            <td style='padding: 8px; border-bottom: 1px solid #e2e8f0;'>{$itemName}</td>
            <td style='padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;'>{$itemQty} {$itemUnit}</td>
            <td style='padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;'>{$itemPrice}</td>
        </tr>";
    }

    $html = "
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background-color: #ffffff;'>
        <div style='background-color: #16a34a; color: #ffffff; padding: 20px; text-align: center;'>
            <h2 style='margin: 0; font-size: 20px;'>Nová Objednávka #{$id}</h2>
        </div>
        <div style='padding: 24px; color: #334155;'>
            <p style='font-size: 16px; margin-top: 0;'>Bola vytvorená nová objednávka na webe:</p>
            <table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>
                <tr><td style='padding: 6px 0; font-weight: bold; width: 140px;'>Zákazník:</td><td>{$name}</td></tr>
                <tr><td style='padding: 6px 0; font-weight: bold;'>E-mail:</td><td><a href='mailto:{$email}'>{$email}</a></td></tr>
                <tr><td style='padding: 6px 0; font-weight: bold;'>Telefón:</td><td><a href='tel:{$phone}'>{$phone}</a></td></tr>
                <tr><td style='padding: 6px 0; font-weight: bold;'>Doprava:</td><td>{$deliveryMethod} (" . ($deliveryMethod === 'delivery' ? $address : 'Osobný odber') . ")</td></tr>
                <tr><td style='padding: 6px 0; font-weight: bold;'>Platba:</td><td>{$paymentMethod}</td></tr>
                " . ($note ? "<tr><td style='padding: 6px 0; font-weight: bold;'>Poznámka:</td><td>{$note}</td></tr>" : "") . "
            </table>

            <h3 style='border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 20px;'>Objednané položky:</h3>
            <table style='width: 100%; border-collapse: collapse;'>
                <thead>
                    <tr style='background-color: #f8fafc;'>
                        <th style='text-align: left; padding: 8px;'>Názov</th>
                        <th style='text-align: center; padding: 8px;'>Množstvo</th>
                        <th style='text-align: right; padding: 8px;'>Cena</th>
                    </tr>
                </thead>
                <tbody>
                    {$itemsHtml}
                </tbody>
            </table>

            <div style='margin-top: 20px; text-align: right; font-size: 18px; font-weight: bold; color: #16a34a;'>
                Celková suma: {$totalPrice}
            </div>
        </div>
    </div>
    ";

    return sendHtmlEmail(MAIL_ADMIN_EMAIL, $subject, $html, $order['customer_email'] ?? null, $order['customer_name'] ?? null);
}

/**
 * Notifikácia o novej rezervácii požičovne
 */
function sendRentalNotification($booking) {
    $name = htmlspecialchars($booking['customer_name'] ?? '');
    $email = htmlspecialchars($booking['customer_email'] ?? '');
    $phone = htmlspecialchars($booking['customer_phone'] ?? '');
    $startDate = htmlspecialchars($booking['start_date'] ?? '');
    $endDate = htmlspecialchars($booking['end_date'] ?? '');
    $startTime = htmlspecialchars($booking['start_time'] ?? '');
    $endTime = htmlspecialchars($booking['end_time'] ?? '');
    $note = nl2br(htmlspecialchars($booking['note'] ?? ''));

    $subject = "Nová rezervácia v požičovni od {$name}";

    $html = "
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background-color: #ffffff;'>
        <div style='background-color: #d97706; color: #ffffff; padding: 20px; text-align: center;'>
            <h2 style='margin: 0; font-size: 20px;'>Nová Rezervácia Požičovne</h2>
        </div>
        <div style='padding: 24px; color: #334155;'>
            <p style='font-size: 16px; margin-top: 0;'>Bola odoslaná nová žiadosť o náradie/stroj:</p>
            <table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>
                <tr><td style='padding: 6px 0; font-weight: bold; width: 140px;'>Zákazník:</td><td>{$name}</td></tr>
                <tr><td style='padding: 6px 0; font-weight: bold;'>E-mail:</td><td><a href='mailto:{$email}'>{$email}</a></td></tr>
                <tr><td style='padding: 6px 0; font-weight: bold;'>Telefón:</td><td><a href='tel:{$phone}'>{$phone}</a></td></tr>
                <tr><td style='padding: 6px 0; font-weight: bold;'>Dátum prevzatia:</td><td>{$startDate} o {$startTime}</td></tr>
                <tr><td style='padding: 6px 0; font-weight: bold;'>Dátum vrátenia:</td><td>{$endDate} o {$endTime}</td></tr>
                " . ($note ? "<tr><td style='padding: 6px 0; font-weight: bold;'>Poznámka:</td><td>{$note}</td></tr>" : "") . "
            </table>
        </div>
    </div>
    ";

    return sendHtmlEmail(MAIL_ADMIN_EMAIL, $subject, $html, $booking['customer_email'] ?? null, $booking['customer_name'] ?? null);
}
