import { Resend } from 'resend';
import dotenv from 'dotenv'
dotenv.config()

let resend = null
if(!process.env.RESEND_API){
    console.log("RESEND_API not provided in .env — email sending disabled in development")
} else {
    resend = new Resend(process.env.RESEND_API);
}

const sendEmail = async({sendTo, subject, html })=>{
    try {
        if(!resend){
            console.log(`(dev) skipping email send to ${sendTo} — subject: ${subject}`)
            return { message: 'dev email skipped' }
        }

        const { data, error } = await resend.emails.send({
            from: 'Binkeyit <noreply@amitprajapati.co.in>',
            to: sendTo,
            subject: subject,
            html: html,
        });

        if (error) {
            console.error({ error });
            return { error };
        }

        return data
    } catch (error) {
        console.log(error)
        return { error }
    }
}

export default sendEmail

