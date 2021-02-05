const sgMail=require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:{
            name:'taske manager',
            email:'ahmed.moahmed442@gmail.com'
        },
        subject:'created new account',
        text:'welcome '+name+' to task manager app,thanks for using it',
    })
       
}
const cancelEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:{
            name:'taske manager',
            email:'ahmed.moahmed442@gmail.com'
        },
        subject:'account is canceld',
        text:'your acoount'+email+' are canceld,  thanks for using it',
    })
       
}

module.exports={
    sendWelcomeEmail,
    cancelEmail
}