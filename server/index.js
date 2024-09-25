// Copyright (c) 2022 Panshak Solomon

import express from "express";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import puppeteer from "puppeteer"; // Replaced html-pdf with puppeteer
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import invoiceRoutes from "./routes/invoices.js";
import clientRoutes from "./routes/clients.js";
import userRoutes from "./routes/userRoutes.js";
import profile from "./routes/profile.js";
import pdfTemplate from "./documents/index.js"; // Assuming this generates HTML content for PDF
import emailTemplate from "./documents/email.js";

const app = express();
dotenv.config();

app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.use("/api/invoices", invoiceRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profiles", profile);

// NODEMAILER TRANSPORT FOR SENDING INVOICE VIA EMAIL
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Utility function to generate PDF using Puppeteer
const generatePdf = async (htmlContent) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf({
    path: `${__dirname}/invoice.pdf`,
    format: "A4",
  });
  await browser.close();
  return pdfBuffer;
};

// SEND PDF INVOICE VIA EMAIL
app.post("/send-pdf", async (req, res) => {
  const { email, company } = req.body;

  try {
    const pdfBuffer = await generatePdf(pdfTemplate(req.body));

    // Send mail with defined transport object
    transporter.sendMail(
      {
        from: `Accountill <hello@accountill.com>`, // sender address
        to: `${email}`, // list of receivers
        replyTo: `${company.email}`,
        subject: `Invoice from ${
          company.businessName ? company.businessName : company.name
        }`, // Subject line
        text: `Invoice from ${
          company.businessName ? company.businessName : company.name
        }`, // plain text body
        html: emailTemplate(req.body), // HTML body
        attachments: [
          {
            filename: "invoice.pdf",
            content: pdfBuffer, // Attach the generated PDF buffer
          },
        ],
      },
      (mailErr) => {
        if (mailErr) {
          return res.status(500).send("Error sending email"); // Respond once for email error
        }
        res.status(200).send("PDF invoice sent successfully"); // Respond once for success
      }
    );
  } catch (error) {
    console.error("PDF creation error:", error); // Log error
    res.status(500).send("Error creating PDF");
  }
});

// CREATE AND SEND PDF INVOICE
app.post("/create-pdf", async (req, res) => {
  try {
    const pdfBuffer = await generatePdf(pdfTemplate(req.body));
    // Write PDF to file or handle as required
    res.status(200).send("PDF created successfully");
  } catch (error) {
    console.error("PDF creation error:", error); // Log the error to debug
    return res
      .status(500)
      .json({ message: "Error creating PDF", error: error.message });
  }
});

// FETCH PDF INVOICE
app.get("/fetch-pdf", (req, res) => {
  res.sendFile(`${__dirname}/invoice.pdf`);
});

app.use(express.static(path.join(__dirname, "./dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./dist", "index.html"));
});

// Database Connection
const DB_URL = process.env.DB_URL;
const PORT = process.env.PORT || 5000;

mongoose
  .connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() =>
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))
  )
  .catch((error) => console.log(error.message));

mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
