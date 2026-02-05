const Contact = require('../models/contactModel');
const nodemailer = require('nodemailer');

// Check for required environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('FATAL ERROR: EMAIL_USER or EMAIL_PASS is not defined in environment variables.');
}

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // This must be an App Password
    }
});

exports.submitContact = async (req, res) => {
    const { name, email, message, phone } = req.body;

    // Additional check inside handler for better error reporting
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return res.status(500).json({
            success: false,
            message: 'Server configuration error: Missing email credentials',
            error: 'Missing EMAIL_USER or EMAIL_PASS on the backend environment'
        });
    }

    try {
        // Save to MongoDB
        await Contact.create({ name, email, message, phone });

        // Send Email Notification
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'samithayaram@gmail.com',
            subject: `New Contact Submission: ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`, // Fallback text
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
                    .header { background-color: #8b5cf6; padding: 30px; text-align: center; }
                    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
                    .content { padding: 40px; background-color: #ffffff; }
                    .field { margin-bottom: 25px; }
                    .label { display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #8b5cf6; letter-spacing: 1px; margin-bottom: 5px; }
                    .value { font-size: 16px; color: #1e293b; font-weight: 500; }
                    .message-box { background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #8b5cf6; margin-top: 10px; }
                    .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>New Inquiry Received</h1>
                    </div>
                    <div class="content">
                        <div class="field">
                            <span class="label">Full Name</span>
                            <div class="value">${name}</div>
                        </div>
                        <div class="field">
                            <span class="label">Email Address</span>
                            <div class="value">${email}</div>
                        </div>
                        <div class="field">
                            <span class="label">Phone Number</span>
                            <div class="value">${phone || 'Not provided'}</div>
                        </div>
                        <div class="field">
                            <span class="label">Message</span>
                            <div class="message-box">
                                <div class="value">${message}</div>
                            </div>
                        </div>
                    </div>
                    <div class="footer">
                        Sent from QualityAuto Website Contacts Form
                    </div>
                </div>
            </body>
            </html>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: 'Message sent and saved successfully!' });
    } catch (err) {
        console.error('Contact Error:', err);
        res.status(500).json({ success: false, message: 'Failed to process request', error: err.message });
    }
};
