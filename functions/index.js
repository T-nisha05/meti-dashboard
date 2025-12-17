const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "tanishapandya429@gmail.com",
        pass: "wfoj vidg otuq wurp"
    },
});

exports.sendInternshipReminder = functions.pubsub
    .schedule("every 24 hours")
    .onRun(async () => {
        const snapshot = await admin.firestore().collection("internships").get();

        const emails = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.createdBy) {
                emails.push(data.createdBy);
            }
        });

        if (emails.length === 0) {
            return null;
        }

        const mailOptions = {
            from: "YOUR_EMAIL@gmail.com",
            to: emails,
            subject: "📌 Internship Reminder",
            text: "Don't forget to track your internship applications on Internix!",
        };

        await transporter.sendMail(mailOptions);

        return null;
    });
