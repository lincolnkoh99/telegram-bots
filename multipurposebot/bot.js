const Telegraf = require('telegraf');
const bot = new Telegraf('1439806464:AAGOv3XQS4BA6Gygp896ZILiHqUtXrcJq60');
const axios = require("axios"); 

const helpMessage = `
Enter one of the following commands:
/start - start the bot
/help - command reference
/weather - check the weather condition with a specific city name
/module - check a module information from the NUS mods
/carpark - check the carpark vacancy report in many places in Singapore
send a location to the telegram bot - check the weather condition at that specific location
`;

//START COMMAND
bot.start((ctx) => {
    ctx.reply("Hi I am SGMadeEasy Bot");
    ctx.reply(helpMessage);
  })
  
//HELP COMMAND
bot.help((ctx) => {
    ctx.reply(helpMessage);
  })

//MODULE COMMAND
bot.command('module', (ctx) => {

  bot.telegram.sendChatAction(ctx.chat.id, "typing");
  msg = ctx.message.text;
  let today = new Date().toISOString().slice(0, 10);
  let date = today.split("-");
  secondYear = (parseInt(date[0]) + 1).toString(10); 
  url = `https://api.nusmods.com/v2/2020-2021/modules/${msg.substring(msg.indexOf(' ')).trim().toUpperCase()}.json`;
  
  axios.get(url)
  .then((res) => {
      const info = res.data;

      //module title
      const mod_title = "- Module Title: " + info.moduleCode + " " + info.title;

      //check SU
      const canSU = "attributes" in info && info.attributes.su ? "- This module can be S/Ued\n" : "";

      //module credits
      const module_credits = "- Module Credits: " + info.moduleCredit;
      //semester 2 exam date && lecture slots
      let sem2_exam_date = "Not offered this semester";
      let lecture_slots = "- The followings are the lecture slots:\n";
      let lectures_info = "";
      for (let i = 0; i < info.semesterData.length; i++) {
          const semesterData = info.semesterData[i];
          if (semesterData.semester == 2) {
              sem2_exam_date = "examDate" in info.semesterData[i] ? info.semesterData[i].examDate : "No Exam";
              const timetable = semesterData.timetable;
              for (let i = 0; i < timetable.length; i++) {
                  if (timetable[i].lessonType == "Lecture") {
                      lectures_info += 'Lecture L' + timetable[i].classNo + ': '
                                  + timetable[i].day + ' ' + timetable[i].startTime + '-' + timetable[i].endTime
                                  + ' ' + timetable[i].venue + '\n';
                  }
              }
          }
      }
      exam = sem2_exam_date != "No Exam" && sem2_exam_date != "Not offered this semester"
                                             ? sem2_exam_date.substring(0, sem2_exam_date.indexOf("T"))
                                             : sem2_exam_date;
      sem2_exam_date_shortened = sem2_exam_date == "Not offered this semester" ? "- " + sem2_exam_date
                                                                               : "- Semester 2 Exam Date: " + exam;
      if (lectures_info == "") {
          lecture_slots = "";
      } else {
          lecture_slots += "" + lectures_info;
      }



      bot.telegram.sendMessage(ctx.chat.id,
`Hi ${ctx.update.message.from.first_name}, these are the module information.

${mod_title}
${module_credits}
${canSU, sem2_exam_date_shortened}
${lecture_slots}`,
      {
          reply_to_message_id: ctx.message.message_id
      });                            
  }).catch((error) => {
      if (error.response) {
          bot.telegram.sendMessage(ctx.chat.id, "Module not found",
      {
          reply_to_message_id: ctx.message.message_id
      });
      }
  });
  
});

//WEATHER COMMAND WITH CITY NAME
bot.command("weather", async (ctx) => {
  let input = ctx.message.text; 
  let inputArray = input.split(" "); 
  let message = ""; 

  if (inputArray.length == 1) { 
    ctx.reply("Empty input");
    return; 
  } else {
    inputArray.shift(); 
    message = inputArray.join(" ").trim(); 
  }

  try{
    const res = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${message}&appid=5feda1acb09a4997c01b58109514c78f&units=metric`);
    out = ""; 
    out += "Weather: " + res.data.weather[0].main + " - " + res.data.weather[0].description + "\n"; 
    out += "feels_like: " + res.data.main.feels_like + "°\n";
    out += "temp_min: " + res.data.main.temp_min + "°\n";
    out += "temp_max: " + res.data.main.temp_max + "°\n";
    out += "pressure: " + res.data.main.pressure + "\n";
    out += "humidity: " + res.data.main.humidity + "\n";
    ctx.reply(out);
    
  } catch (error) {
    ctx.reply("City not found!"); 
  }
})


//WEATHER COMMAND WITH LOCATION
bot.on("location", async (ctx) => {
  latitude = ctx.message.location.latitude; 
  longitude = ctx.message.location.longitude; 
  try{
    const res = await axios.get(`http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=5feda1acb09a4997c01b58109514c78f&units=metric`);
    out = ""; 
    out += "Weather: " + res.data.weather[0].main + " - " + res.data.weather[0].description + "\n"; 
    out += "feels_like: " + res.data.main.feels_like + "°\n";
    out += "temp_min: " + res.data.main.temp_min + "°\n";
    out += "temp_max: " + res.data.main.temp_max + "°\n";
    out += "pressure: " + res.data.main.pressure + "\n";
    out += "humidity: " + res.data.main.humidity + "\n";
    ctx.reply(out);
    
  } catch (error) {
    ctx.reply("City not found!"); 
  }
})


//CARPARK COMMAND
var carparks;
var areaCarparks;
var index = [];
for (var i = 0; i < 30; i++) { // a magic number indeed
    index[i] = i.toString();
}
bot.command("carpark", async (ctx) => {
    const res = await axios.get('http://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2', {
  headers: {
    'AccountKey': 'LYe7Kx/1RaOsLeOqH0Os0A==',
    'accept' : 'application/json'
  }
})
    carparks = res.data.value;
    ctx.telegram.sendMessage(ctx.chat.id, "Driving and finding carpark slots? Choose your area.",
    {
        reply_markup: {
            inline_keyboard: [[{text: 'Orchard', callback_data: 'Orchard'}, {text: 'Marina', callback_data: 'Marina'}],
                              [{text: 'Harbourfront', callback_data: 'Harbfront'}, {text: 'Jurong Lake District', callback_data: 'JurongLakeDistrict'}],
                              [{text: 'Others', callback_data: 'Others'}]
                             ]
            
        }
    });
})


bot.action("back", (ctx) => {
    ctx.deleteMessage();
    ctx.telegram.sendMessage(ctx.chat.id, "Driving and finding carpark slots? Choose your area.",
    {
        reply_markup: {
            inline_keyboard: [[{text: 'Orchard', callback_data: 'Orchard'}, {text: 'Marina', callback_data: 'Marina'}],
                              [{text: 'Harbourfront', callback_data: 'Harbfront'}, {text: 'Jurong Lake District', callback_data: 'JurongLakeDistrict'}],
                              [{text: 'Others', callback_data: 'Others'}]
                             ]
            
        }
    });
})



const areas = ['Orchard', 'Marina', 'Harbfront', 'JurongLakeDistrict', 'Others'];    
bot.action(areas, (ctx) => { //
    const carparksFilter = carparks.filter((elem) => {
        return elem.Area == ctx.match;
    })
    ctx.deleteMessage();
    areaCarparks = carparksFilter;
    ctx.telegram.sendMessage(ctx.chat.id, "Click on the carpark you wish to see remaining slots",
        {
            reply_markup: {
                inline_keyboard: mapLocation(carparksFilter)
                    //call mapLocation() here
                
            }
        })
});    

bot.action(index, (ctx) => { // send message to tell the carpark slots
    ctx.answerCbQuery();
    const slot = areaCarparks[parseInt(ctx.match, 10)].AvailableLots;
    var name = areaCarparks[parseInt(ctx.match, 10)].Development;
    if (name == "Bugis+") {
        name = "Bugis\\+";
    }
    ctx.telegram.sendMessage(ctx.chat.id,
`*${name}*
*${slot}* slots`,
                             {parse_mode: 'MarkdownV2'});
})

function mapLocation(A) { // to form the inline query array
    arr = []
    var count = 0;
    var i, j
    for (i = 0; i < A.length / 2; i++) {
        arr[i] = [];
        for (j = 0; j < 2; j++) {
            arr[i][j] = {text: A[2 * i + j].Development,
                         callback_data: (2 * i + j).toString()};
            count++;
            if (count == A.length) {
                break;
            }
        }
    }
    if (A.length % 2 == 0) {
        arr.push([{text: 'Back to main menu', callback_data: 'back'}]);
    } else {
        arr[arr.length - 1][1] = {text: 'Back to main menu', callback_data: 'back'};
    }
    return arr;
}


bot.launch();
