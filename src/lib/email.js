import axios from 'axios';

// FEATURE FLAG: Zapnuté pre produkčné nasadenie
export const ENABLE_EMAIL_NOTIFICATIONS = true;

/**
 * Odosiela e-mailovú notifikáciu cez bezplatnú službu FormSubmit.co.
 * Pri prvom odoslaní príde na cieľový e-mail aktivačný odkaz, ktorý je potrebné kliknúť.
 * 
 * @param {object} params
 * @param {string} params.type - Typ dopytu ('Kontakt', 'Objednávka', 'Rezervácia')
 * @param {string} params.emailTo - Adresa príjemcu (napr. settings.contact_email / kubik@stavivalubela.sk)
 * @param {string} params.customerName - Meno zákazníka
 * @param {string} params.customerEmail - E-mail zákazníka
 * @param {string} params.customerPhone - Telefón zákazníka
 * @param {string} params.subject - Predmet e-mailu
 * @param {string} params.details - Textový obsah dopytu / zoznam produktov / poznámka
 */
export async function sendEmailNotification({
  type,
  emailTo,
  customerName,
  customerEmail,
  customerPhone,
  subject,
  details
}) {
  if (!ENABLE_EMAIL_NOTIFICATIONS) {
    console.info(`[Email Notification Omitted] Flag ENABLE_EMAIL_NOTIFICATIONS is set to false. Inquiry data was saved to database only. Data:`, {
      type, emailTo, customerName, customerEmail, customerPhone, subject, details
    });
    return;
  }

  const recipient = emailTo || 'kubik@stavivalubela.sk';

  try {
    const payload = {
      _subject: `STAVEBNINY ĽUBEĽA: ${type.toUpperCase()} - ${subject}`,
      _honey: '', // Spambot honeypot
      _captcha: 'false', // Vypne captcha overenie pre plynulé odoslanie cez AJAX
      "Typ dopytu": type,
      "Meno zákazníka": customerName,
      "E-mail zákazníka": customerEmail,
      "Telefónne číslo": customerPhone || 'Nezadané',
      "Predmet": subject,
      "Detaily dopytu": details
    };

    const response = await axios.post(`https://formsubmit.co/ajax/${recipient}`, payload);
    
    if (response.status === 200) {
      console.info(`[Email Notification Sent] Inquiry successfully forwarded to ${recipient}`);
    } else {
      console.warn(`[Email Notification Warning] Response status: ${response.status}`, response.data);
    }
  } catch (err) {
    console.error(`[Email Notification Error] Failed to send email via FormSubmit:`, err.message);
  }
}
