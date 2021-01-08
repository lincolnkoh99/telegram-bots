const Telegraf = require('telegraf');

const bot = new Telegraf('919329485:AAHnDgQKUYNhEm2vstEi-gwTeRMI-2y4WRo');

const axios = require('axios');
const fs = require('fs');

const helpMessage =
  `
*Simple API Bot*
/fortune - get a fortune cookie
/cat - get a random cat pic
/cat \`<text>\` - get cat image with text
/dogbreeds - get list of dog breeds
/dogs \`<breed>\` - get image of dog breed
`;

bot.help(ctx => {
  // ctx.reply(helpMessage); //reply to user quicky
  //allows you to send to specific user and change options
  bot.telegram.sendMessage(ctx.from.id, helpMessage, {
    parse_mode: "markdown"
  })
})

bot.command('fortune', (ctx) => {
  axios.get('http://yerkee.com/api/fortune')
    .then(res => {
      ctx.reply(res.data.fortune) //reply text message
    }).catch(e => {
      console.log(e); //catch errors
    })
})

bot.command('cat', async (ctx) => {
  let input = ctx.message.text; //store input in variable as string
  let inputArray = input.split(" "); //split string input by spaces into an array

  //check array length
  if (inputArray.length == 1) { //if user only gives "/cat" command
    try {
      let res = await axios.get('https://aws.random.cat/meow');
      ctx.replyWithPhoto(res.data.file) //reply with image link
    } catch (e) {
      console.log(e); //catch errors
    }
  } else { //if user give arguments
    inputArray.shift(); //remove first item of array which is "/cat"
    input = inputArray.join(" "); //join all items in array into a string
    ctx.replyWithPhoto(`https://cataas.com/cat/says/${input}`); //reply with image link
  }
})

bot.command('dogbreeds', (ctx) => {
  let rawdata = fs.readFileSync("./dogbreeds.json", "utf8"); //read json file
  let data = JSON.parse(rawdata); //convert json to javascript

  let message = "Dog Breeds:\n";
  data.forEach(item => {          //loop each item in array 
    message += `-${item}\n`;      //concat each item into message variable
  })

  ctx.reply(message);
})

bot.command("dog", (ctx) => {
  let input = ctx.message.text.split(" "); //split user input into array
  if (input.length != 2) {   //check if user has inputted an argument eg "/dog g"
    ctx.reply("You must give a dog breed as the second argument");
    return; //stops code from executing
  }
  let breedInput = input[1]; //store breed into a variable

  let rawdata = fs.readFileSync("./dogbreeds.json", "utf8"); //read json file
  let data = JSON.parse(rawdata); //convert json to javascript

  if (data.includes(breedInput)) {  //if there is exact match of breed in array
    axios.get(`https://dog.ceo/api/breed/${breedInput}/images/random`)
      .then(res => {
        ctx.replyWithPhoto(res.data.message);
      }).catch(e => {
        console.log(e);
      })
  } else {  //if there is no exact match of breed (user has typed the wrong breed)
    let suggestions = data.filter(item => { //filter each item in array
      return item.startsWith(breedInput); //if item satisfy this and return true, it will be included into suggestions array
    })

    let message = `Did you mean:\n`;

    suggestions.forEach(item => {
      message += `-${item}\n`;    //concat each item into message
    })

    if (suggestions.length == 0) {   //if there is no suggestions (array is empty) 
      ctx.reply("Cannot find breed");
    } else {
      ctx.reply(message);  //reply user with message
    }
  }
})

bot.launch();
