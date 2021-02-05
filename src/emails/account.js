const sgMail=require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'ahmed.moahmed442@gmail.com',
        subject:'hi '+name,
        text:'welcome to task manager app, '+name+' thanks for using it',
    })
       
}
const cancelEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'ahmed.moahmed442@gmail.com',
        subject:'hi '+name,
        text:'your acoount'+email+' are canceld,  thanks for using it',
    })
       
}

module.exports={
    sendWelcomeEmail,
    cancelEmail
}