const sendgrid = require("@sendgrid/mail");
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors({ origin: "*" })); // Allow all origins (for development)
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse form data

// Check if SendGrid API Key is Loaded
if (!process.env.SENDGRID_API_KEY) {
  console.error("ERROR: Missing SENDGRID_API_KEY in .env file!");
  process.exit(1); // Stop server if no API key
}

// Set SendGrid API Key
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

// POST route to send email
app.post("/send-email", async (req, res) => {
  console.log("Received Body:", req.body); // Debug request data

  const { name, email, subject, message } = req.body;

  // Validate input fields
  if (!name || !email || !subject || !message) {
    console.log("Missing fields!");
    return res.status(400).json({ error: "All fields are required!" });
  }

  // Simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format!" });
  }

  try {
    const msg = {
      to: "awokeworket@gmail.com", // Your email
      from: "awokeworket@gmail.com", // Must be a verified SendGrid sender
      subject: subject,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `<strong>Name:</strong> ${name}<br><strong>Email:</strong> ${email}<br><strong>Message:</strong> ${message}`, // Optional HTML format
    };

    await sendgrid.send(msg);
    console.log("Email sent successfully!");
    res.json({ success: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error.response?.body || error);
    res.status(500).json({
      error: "Failed to send email",
      details: error.response?.body || error.message,
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
