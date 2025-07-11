import cronstrue from "cronstrue";
import { Request, Response } from "express";
import { transport, logger, contactCollection } from "../config";
import { MailOptions, cosineSimilarity } from "../utils/common.utils";
import { summarizer, embeddingModel } from "../config/gemini.config"
import agenda from "../utils/agenda.util";

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
			every (boolean): If the email is to be sent like every day, every week or every month, set this to true, otherwise false.
			scheduledDate (string): Extract scheduledDate as ISO 8601 if a specific time is mentioned (use ${currentDateTime} for relative terms like "tomorrow"), return a cron string for recurring phrases (like "every Friday"), and return "" for "now" or if no time is given.
			clear (boolean): If the scheduledDate or every is not clear, make it to false else true
			description (string): Generate the description or reason for the email or failed reason.

			Constraints:
			- The sender's name is Aarumugapandi. Use that tone and style.
			- Return only the JSON object in this exact format:

			{
			"to": "toaddress",
			"subject": "subject",
			"html": "body",
			"scheduledDate": "ISO 8601 timestamp string | cron expression | empty string",
			"every": true/false,
			"clear": true/false,
			"description": "description"
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
						fuzzy: {
							maxEdits: 2,
							prefixLength: 0,
							maxExpansions: 50
						}
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
		console.log(parsed)
		if (parsed.scheduledDate) {

			logger.info("📨 Email will sent to " + parsed.to + " at " + cronstrue.toString(parsed.scheduledDate));
			console.log(parsed.clear)
			if (!parsed.clear){
				logger.warn("Not the clear information")
				return res.status(400).json({
					message:parsed.description
				})
			} 
			
			if (parsed.every) {
				logger.info("📅 Email will be sent " + cronstrue.toString(parsed.scheduledDate));
				await agenda.every(parsed.scheduledDate, "send_email", { options });
			} else {
				logger.info("📅 Email will be sent at " + cronstrue.toString(parsed.scheduledDate));
				const date = new Date(parsed.scheduledDate);
				await agenda.schedule(date, "send_email", { options });
			}
			res.send(`📅 Email scheduled successfully for ${cronstrue.toString(parsed.scheduledDate)}.`);
		} else {
			const info = await transport.sendMail(options);
			logger.info("📨 Email sent immediately: " + info?.response);
			res.send(parsed.html);
		}
	} catch (error) {
		logger.error("Error in send using Mau:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
};
