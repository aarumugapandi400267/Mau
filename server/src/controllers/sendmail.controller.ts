import { Request, Response } from "express";
import { transport, logger, contactCollection } from "../config";
import { MailOptions, cosineSimilarity } from "../utils/common.utils";
import { summarizer, embeddingModel } from "../config/gemini.config"
import { Contact } from "../models";
import agenda from "../utils/agenda.util";
import { parse } from "path";

export const sendmail = async (req: Request, res: Response): Promise<any> => {
	try {
		const mailOptions: MailOptions = req.body.mailOptions;

		const options = {
			from: process.env.EMAIL,
			...mailOptions,
		};

		const info = await transport.sendMail(options);
		logger.info("Email sent: " + info.response);

		return res.status(200).json({ message: "Email sent successfully" });
	} catch (error: any) {
		logger.error("Error sending email: " + error.message);
		return res.status(500).json({ error: "Failed to send email" });
	}
}

export const sendUsingMau = async (req: Request, res: Response): Promise<any> => {
	try {
		const description = String(req.body.description || "").replace(/[<>]/g, ""); // Basic sanitization

		let currentDateTime = new Date();

		// Step 1: Prompt for extraction with clear delimiters
		const prompt = `
			Extract the following variables from the given input text:

			to (string): Extract the recipient's name from the text.
			subject (string): Generate a subject line.
			html (string): Compose a rich HTML email body using modern and elegant design (semantic tags, inline styles, and color theme appropriate to the context). If the input lacks detail, infer a suitable tone and content. Use high-end formatting.
			scheduledDate (string): Extract an ISO 8601 date-time string if mentioned and if mentioned like tomorrow or next month, ${currentDateTime} is the current data time, then calculate the date using from this date or if mentioned like now return empty string.

			Constraints:
			- The sender's name is Aarumugapandi. Use that tone and style.
			- Return only the JSON object in this exact format:

			{
			"to": "toaddress",
			"subject": "subject",
			"html": "body",
			"scheduledDate": "ISO 8601 timestamp string"
			}

			Input Text:
			[START]
			${description}
			[END]
		`;

		const extractedData = await summarizer.generateContent(prompt);

		const rawOutput = extractedData.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
		const cleanedJson = rawOutput.replace(/```json|```/g, "").trim();

		let parsed;
		try {
			parsed = JSON.parse(cleanedJson);
		} catch (err) {
			logger.error("Failed to parse AI response:", err);
			return res.status(400).json({ message: "Invalid response from AI." });
		}

		const result = await contactCollection.aggregate([
			{
				$search: {
					index: "contact",
					text: {
						query: parsed.to,
						path: ["name", "email"],
						fuzzy: { maxEdits: 1 }
					}
				}
			},
			{
				$addFields: {
					score: { $meta: "searchScore" }
				}
			},
			{ $sort: { score: -1 } }
		]).toArray();

		const options = {
			from: process.env.EMAIL,
			to: result[0].email,
			subject: parsed.subject,
			html: parsed.html
		};

		if (parsed.scheduledDate) {
			const date = new Date(parsed.scheduledDate);
			
			if (isNaN(date.getTime())) {
				return res.status(400).json({ message: "Invalid scheduled date." });
			}

			logger.info("📨 Email will sent to " + parsed.to + " at " + parsed.scheduledDate);

			await agenda.schedule(date, "send_email", { options });
			res.send(`📅 Email scheduled successfully for ${parsed.scheduledDate}.`);
		} else {
			const info = await transport.sendMail(options);
			logger.info("📨 Email sent immediately: " + info?.response);
			res.send(parsed.html);
		}
	} catch (error) {
		logger.error("Error in sendUsingMau:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
};
