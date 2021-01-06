const Telegraf = require('telegraf');

const bot = new Telegraf('1531480023:AAFylAWHy7Dd4LfVMpz8ooXo1khpt7rrlNE');

bot.start((ctx) => {
  ctx.reply(ctx.from.first_name + " have entered the start command and it is a " + ctx.updateSubTypes[0]);
})

bot.help((ctx) => {
  ctx.reply("You have entered the help command");
})

bot.settings((ctx) => {
  ctx.reply("You have entered the settings command");
})

bot.command(["test", "Test", "test1"], (ctx) => {
  ctx.reply("Hello World");
})

bot.hears("cat", (ctx) => {
  ctx.reply("Meow");
})

bot.on("sticker", (ctx) => {
  ctx.reply("This is a sticker message");
})

bot.launch();