const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");
const dialogflow = require('@google-cloud/dialogflow');
const { WebhookClient, Payload } = require('dialogflow-fulfillment');
const express = require("express");
const MODEL_NAME = "gemini-1.5-pro-latest";
const API_KEY = "AIzaSyBbvKXO7WOE51uIz7RZ2jurmQEIo8ViMfE";

async function runChat(queryText) {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // console.log(genAI)
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
        temperature: 1,
        topK: 0,
        topP: 0.95,
        maxOutputTokens: 200,
    };

    const chat = model.startChat({
        generationConfig,
        history: [
        ],
    });

    const result = await chat.sendMessage(queryText);
    const response = result.response;
    return response.text();
}

const webApp = express();
const PORT = process.env.PORT || 5006;
webApp.use(express.urlencoded({
    extended: true
}));
webApp.use(express.json());
webApp.use((req, res, next) => {
    console.log(`Path ${req.path} with Method ${req.method}`);
    next();
});
webApp.get('/', (req, res) => {
    res.sendStatus(200);
    res.send("Status Okay")
});

webApp.post('/dialogflow', async (req, res) => {

    var id = (res.req.body.session).substr(43);
    console.log(id)
    const agent = new WebhookClient({
        request: req,
        response: res
    });

    async function fallback() {
        let action = req.body.queryResult.action;
        let queryText = req.body.queryResult.queryText;

        if (action === 'input.unknown') {
            let result = await runChat(queryText);
            agent.add(result);
            console.log(result)
        }else{
            agent.add(result);
            console.log(result)
        }
    }

    function hi(agent) {
        console.log(`Default Welcome Intent  =>  hi`);
        agent.add("Hey, Sayalani the Welfare Assistant🤖 here, at your service. What can I do for you lets addmision in saylani masss it training tell me your details?")
    }

    function Addmision(agent) {
        const {admision, name,number ,city,email, phone , address} = agent.parameters;
    
       agent.add(`Thank you ${name} your cnic is ${number} and city is ${city} check it your email ${email} and messege for ${phone} your location is ${address}`)
    }


    function about(agent) {
        console.log(`About  =>  about`);
        agent.add("Saylani Welfere provide free food🍔🍕 ,Education,👨‍🎓and free it courses including Web development, A i-chatbot , 3d animation,flutter development,python lets addmision in saylani masss it training tell me your details what's your name? ")
    }
    var nodemailer = require('nodemailer');

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ayanimranayanahmed@gmail.com',
        pass: 'prirhgyhonemfjqg'
      }
    });
    
    var mailOptions = {
      from: 'ayanimranayanahmed@gmail.com',
      to: ['hammadn788@gmail.com, ayanibnimran@gmail.com'],
      subject: 'Saylani form',
      text : `Subject: Confirmation of Student Details

Dear Student,

Thank you for providing your information. We have confirmed the following details:

If you have any further questions or need assistance, feel free to reach out.
` };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });


    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', hi); 
    intentMap.set('Default Failback Intent', fallback); 
    intentMap.set('admit', Addmision); 
    agent.handleRequest(intentMap);
})

webApp.listen(PORT, () => {
    console.log(`Server is up and running at http://localhost:${PORT}/`);
});