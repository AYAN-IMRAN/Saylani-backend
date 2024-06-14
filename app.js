const dialogflow = require('@google-cloud/dialogflow');
const { WebhookClient, Suggestion } = require('dialogflow-fulfillment');
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");
var nodemailer = require("nodemailer");
const express = require("express")
const cors = require("cors");
require('dotenv').config();

const MODEL_NAME = "gemini-1.5-pro";
const API_KEY = process.env.API_KEY;

async function runChat(queryText) {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // console.log(genAI)
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
        temperature: 1,
        topK: 0,
        topP: 0.95,
        maxOutputTokens: 50,
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

const app = express();
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use((req, res, next) => {
    console.log(`Path ${req.path} with Method ${req.method}`);
    next();
});
app.get('/', (req, res) => {
    res.sendStatus(200);
    res.send("Status Okay")
});
app.use(cors());

const PORT = process.env.PORT || 8080;

app.post("/webhook", async (req, res) => {
    var id = (res.req.body.session).substr(43);
    console.log(id)
    const agent = new WebhookClient({ request: req, response: res });
function hi(agent) {
    console.log(`Default Welcome Intent  =>  hi`);
    agent.add("Hey, Sayalani the Welfare Assistant🤖 here, at your service. ")
}

function Addmision(agent) {
    console.log('Dialogflow Parameters:', agent.parameters);

    const stdnumber = agent.parameters['stdnumber'];
    const stdcity = agent.parameters['stdcity'];
    const stdemail = agent.parameters['stdemail'];
    const stdphone = agent.parameters['stdphone'];
    const stdaddress = agent.parameters['stdaddress'];
   agent.add(`Thank you your cnic is ${stdnumber} and city is ${stdcity} check it your email ${stdemail} and messege for ${stdphone} your location is ${stdaddress}`)
}



var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ayanimranayanahmed@gmail.com',
    pass: process.env.APP_PASSWORD,
  }
});

var mailOptions = {
  from: 'ayanimranayanahmed@gmail.com',
  to: ["hammadn788@gmail.com" ,'ayanibnimran@gmail.com'],
  subject: 'Saylani form',
  html : `<!DOCTYPE html>
<html>
<head>
	<title>Welcome to SMIT!</title>
	<style>
		body {
			font-family: Arial, sans-serif;
			background-color: #f5f5f5;
		}
		.container {
			max-width: 600px;
			margin: 40px auto;
			padding: 20px;
			background-color: #fff;
			border: 1px solid #ddd;
			border-radius: 10px;
			box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		}
		.header {
			background-color:#4CAF50;
			color: #fff;
			padding: 10px;
			text-align: center;
			border-radius: 10px 10px 0 0;
		}
		.header h1 {
			margin: 0;
			font-size: 24px;
			font-weight: bold;
			color: #fff;
		}
		.content {
			padding: 20px;
		}
		.content h2 {
			margin-top: 0;
			font-size: 18px;
			font-weight: bold;
			color: #333;
		}
		.content table {
			border-collapse: collapse;
			width: 100%;
		}
		.content th,.content td {
			border: 1px solid #ddd;
			padding: 10px;
			text-align: left;
		}
		.content th {
			background-color: #f0f0f0;
		}
		.footer {
			background-color:#4CAF50;
			color: #fff;
			padding: 10px;
			text-align: center;
			border-radius: 0 0 10px 10px;
		}
		.footer p {
			margin: 0;
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<img src="https://firebasestorage.googleapis.com/v0/b/ayan-todo-app-943dc.appspot.com/o/card%20logo.png?alt=media&token=3afcb803-2d5e-4a03-9882-24dbf49d51a8" alt="SMIt Logo" style="width: 50px; height: 50px; margin: 10px;">
			<h1>Welcome to SMIt 🎓!</h1>
		</div>
		<div class="content">
			<p>Dear Student,</p>
			<p>This email confirms your enrollment at SMIT! We're excited to have you Saylani Mass It Training.</p>
			<h2>Student Alert:</h2>
            <p>Welcome to SMIT! We are absolutely delighted to extend a warm welcome to you as you begin your journey as a new student with us. We hope this letter finds you and your family in good health and high spirits.</p>
			
			<h2>Next Steps:</h2>
			<p>Information about next steps, including orientation and class schedules, will be sent to your email address soon.</p>
			<p>If you have any questions, visit our Website <a href="https://www.saylaniwelfare.com/" target="_blank">Saylani Welfere</a>.</p>
		</div>
		<div class="footer">
			<h3>Welcome to SMIt!</h3>
			<h4>Sincerely,</h4>
			<h3>The Saylani Welfere Team</h3>
		</div>
	</div>
</body>
</html>` };


transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
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


let intentMap = new Map();
intentMap.set('Default Welcome Intent', hi); 
intentMap.set('Default Fallback Intent', fallback); 
intentMap.set('admit', Addmision); 
agent.handleRequest(intentMap);
})

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});