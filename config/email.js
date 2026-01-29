// Configuration pour l'envoi d'emails
const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || '';
const EMAIL_TO = process.env.EMAIL_TO || EMAIL_USER;

// Configuration du transporteur Gmail (vous pouvez adapter pour un autre service)
// Note: Pour Gmail, vous devez utiliser un mot de passe d'application
// Générez-le ici: https://myaccount.google.com/apppasswords
const transporter = (EMAIL_USER && EMAIL_PASSWORD)
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
      }
    })
  : null;

/**
 * Envoie un email de notification quand un nouveau message est reçu
 */
const sendNotificationEmail = async (messageData, options = {}) => {
  try {
    if (!transporter) {
      console.warn('⚠️ Email non configuré: définissez EMAIL_USER et EMAIL_PASSWORD dans Render.');
      return false;
    }

    const adminUrl = options.adminUrl || process.env.ADMIN_URL || 'http://localhost:3000/admin';
    const recipient = options.to || EMAIL_TO;

    const mailOptions = {
      from: EMAIL_USER,
      to: recipient,
      subject: `📬 Nouveau message de ${messageData.name} - Webly`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;">
          
          <!-- Container principal -->
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); margin-top: 20px; margin-bottom: 20px;">
            
            <!-- En-tête -->
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">📬 Nouveau Message</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Webly Admin</p>
            </div>
            
            <!-- Contenu principal -->
            <div style="padding: 40px 30px;">
              
              <!-- Date et heure -->
              <div style="background: linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(30, 64, 175, 0.05) 100%); border-left: 4px solid #2563eb; padding: 15px 20px; border-radius: 6px; margin-bottom: 30px;">
                <p style="margin: 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Reçu le</p>
                <p style="margin: 8px 0 0 0; font-size: 16px; color: #1e293b; font-weight: 600;">${messageData.date} à ${messageData.time}</p>
              </div>
              
              <!-- Section contact -->
              <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Coordonnées du Contact</h3>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                  <div style="margin-bottom: 15px; display: flex; gap: 12px;">
                    <div style="font-size: 24px;">👤</div>
                    <div>
                      <p style="margin: 0; font-size: 13px; color: #94a3b8; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Nom</p>
                      <p style="margin: 5px 0 0 0; font-size: 16px; color: #1e293b; font-weight: 600;">${messageData.name}</p>
                    </div>
                  </div>
                  
                  <div style="margin-bottom: 15px; display: flex; gap: 12px;">
                    <div style="font-size: 24px;">📧</div>
                    <div>
                      <p style="margin: 0; font-size: 13px; color: #94a3b8; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Email</p>
                      <p style="margin: 5px 0 0 0;"><a href="mailto:${messageData.email}" style="font-size: 16px; color: #2563eb; text-decoration: none; font-weight: 600;">${messageData.email}</a></p>
                    </div>
                  </div>
                  
                  ${messageData.phone ? `
                  <div style="margin-bottom: 15px; display: flex; gap: 12px;">
                    <div style="font-size: 24px;">📱</div>
                    <div>
                      <p style="margin: 0; font-size: 13px; color: #94a3b8; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Téléphone</p>
                      <p style="margin: 5px 0 0 0; font-size: 16px; color: #1e293b; font-weight: 600;"><a href="tel:${messageData.phone}" style="text-decoration: none; color: #1e293b;">${messageData.phone}</a></p>
                    </div>
                  </div>
                  ` : ''}
                  
                  ${messageData.company ? `
                  <div style="display: flex; gap: 12px;">
                    <div style="font-size: 24px;">🏢</div>
                    <div>
                      <p style="margin: 0; font-size: 13px; color: #94a3b8; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Entreprise</p>
                      <p style="margin: 5px 0 0 0; font-size: 16px; color: #1e293b; font-weight: 600;">${messageData.company}</p>
                    </div>
                  </div>
                  ` : ''}
                </div>
              </div>
              
              <!-- Section message -->
              <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">💬 Contenu du Message</h3>
                
                <div style="background: #f8fafc; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0; border-left: 4px solid #f59e0b;">
                  <p style="margin: 0; line-height: 1.8; color: #1e293b; font-size: 15px; white-space: pre-wrap; word-wrap: break-word;">${messageData.message}</p>
                </div>
              </div>
              
              <!-- Bouton d'action -->
              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${adminUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; letter-spacing: 0.3px; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3); transition: all 0.2s ease;">
                  ➜ Accéder au Tableau de Bord
                </a>
              </div>
              
            </div>
            
            <!-- Pied de page -->
            <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 25px 30px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                Ceci est un message automatique. Veuillez ne pas répondre directement à cet email.<br>
                Consultez votre tableau de bord pour répondre au message.
              </p>
              <p style="margin: 12px 0 0 0; font-size: 11px; color: #cbd5e1;">
                © 2026 ConsultPro - Tous droits réservés
              </p>
            </div>
            
          </div>
          
        </body>
        </html>
      `,
      text: `
Nouveau message reçu:

Nom: ${messageData.name}
Email: ${messageData.email}
${messageData.phone ? `Téléphone: ${messageData.phone}` : ''}
${messageData.company ? `Entreprise: ${messageData.company}` : ''}

Message:
${messageData.message}

Date: ${messageData.date} à ${messageData.time}
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé à ${recipient} pour le message de ${messageData.name}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
};

/**
 * Envoie une facture par email après un paiement
 */
const sendInvoiceEmail = async (paymentData) => {
  try {
    const {
      customerEmail,
      customerName,
      serviceName,
      amount,
      date,
      transactionId,
      invoiceNumber
    } = paymentData;

    // Générer le numéro de facture s'il n'existe pas
    const invNumber = invoiceNumber || `INV-${Date.now()}`;
    const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const mailOptions = {
      from: process.env.EMAIL_USER || 'hugo.perdereau72@gmail.com',
      to: customerEmail,
      subject: `📋 Facture #${invNumber} - Webly`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;">
          
          <!-- Container principal -->
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); margin-top: 20px; margin-bottom: 20px;">
            
            <!-- En-tête -->
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700;">📋 Facture</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Webly - Plateforme de Services</p>
            </div>
            
            <!-- Contenu principal -->
            <div style="padding: 40px 30px;">
              
              <!-- En-tête facture -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px;">
                <div>
                  <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Facturé à</p>
                  <p style="margin: 5px 0 0 0; font-size: 16px; color: #1e293b; font-weight: 600;">${customerName}</p>
                  <p style="margin: 3px 0 0 0; font-size: 14px; color: #64748b;">${customerEmail}</p>
                </div>
                <div style="text-align: right;">
                  <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Numéro de facture</p>
                  <p style="margin: 5px 0 0 0; font-size: 16px; color: #1e293b; font-weight: 600;">#${invNumber}</p>
                  <p style="margin: 3px 0 0 0; font-size: 14px; color: #64748b;">${formattedDate}</p>
                </div>
              </div>
              
              <!-- Tableau détails -->
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                  <tr style="border-bottom: 2px solid #e2e8f0;">
                    <th style="padding: 12px 0; text-align: left; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Description</th>
                    <th style="padding: 12px 0; text-align: right; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 15px 0; font-size: 15px; color: #1e293b; font-weight: 600;">${serviceName}</td>
                    <td style="padding: 15px 0; text-align: right; font-size: 15px; color: #1e293b; font-weight: 600;">${amount}€</td>
                  </tr>
                </tbody>
              </table>
              
              <!-- Résumé totaux -->
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <div style="display: grid; grid-template-columns: 1fr auto; gap: 20px; margin-bottom: 10px;">
                  <p style="margin: 0; font-size: 14px; color: #64748b;">Sous-total</p>
                  <p style="margin: 0; font-size: 14px; color: #1e293b; font-weight: 600;">${amount}€</p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr auto; gap: 20px; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">
                  <p style="margin: 0; font-size: 14px; color: #64748b;">TVA (0%)</p>
                  <p style="margin: 0; font-size: 14px; color: #1e293b; font-weight: 600;">0€</p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr auto; gap: 20px;">
                  <p style="margin: 0; font-size: 16px; color: #1e293b; font-weight: 700;">Total</p>
                  <p style="margin: 0; font-size: 16px; color: #2563eb; font-weight: 700;">${amount}€</p>
                </div>
              </div>
              
              <!-- Informations de transaction -->
              <div style="background: #f1f5f9; padding: 15px 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin-bottom: 30px;">
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">ID de Transaction</p>
                <p style="margin: 0; font-size: 13px; color: #1e293b; font-family: monospace; word-break: break-all;">${transactionId}</p>
              </div>
              
              <!-- Message de confirmation -->
              <div style="background: #f0fdf4; padding: 15px 20px; border-radius: 8px; border-left: 4px solid #22c55e; margin-bottom: 30px;">
                <p style="margin: 0; font-size: 14px; color: #166534;">
                  ✅ Paiement reçu et confirmé. Cette facture est votre preuve d'achat.
                </p>
              </div>
              
            </div>
            
            <!-- Pied de page -->
            <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 25px 30px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                Merci pour votre confiance ! Cette facture est valable pour une durée de 2 ans.<br>
                Gardez-la précieusement pour vos archives comptables.
              </p>
              <p style="margin: 12px 0 0 0; font-size: 11px; color: #cbd5e1;">
                © 2026 Webly - Tous droits réservés | contact@webly.com
              </p>
            </div>
            
          </div>
          
        </body>
        </html>
      `,
      text: `
FACTURE #${invNumber}
${'='.repeat(50)}

Facturé à:
${customerName}
${customerEmail}

Description: ${serviceName}
Montant: ${amount}€
Total: ${amount}€

Date: ${formattedDate}
ID de Transaction: ${transactionId}

Merci pour votre achat !
Webly - Plateforme de Services
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Facture envoyée à ${customerEmail} (Facture #${invNumber})`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la facture:', error);
    return false;
  }
};

module.exports = {
  sendNotificationEmail,
  sendInvoiceEmail,
  transporter
};
