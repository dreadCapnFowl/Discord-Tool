const Discord = require('discord.js');
var conf = require('./config.js')
var fs = require('fs')
var readlineSync = require('readline-sync');

var token = 'NjUwNDM4Mzk5MDQ3NDk5Nzk4.XfSKJw.dO7TyfIwvGzhvRYKb-3fDQANtp4';

if (!conf.get('token'))
{
  var tok = readlineSync.question(`
Token not set.
Please enter your Discord token:

> `);
  checkToken(tok)
}
const client = new Discord.Client();
client.on('ready',async () => {
  console.log(`${client.user.tag} authenticated.`)
})
client.on('message', msg => {
  function respond(msg, text, color)
  {
    if (!color)
      color = '#FFFFFF';

    const emb = new Discord.RichEmbed()
    .setAuthor(`@${msg.author.username}`, '', '')
    .addField(msg.content, text)
    .setColor(color)
    msg.channel.send({ embed: emb })
  }

  function membersToFile(filename, members)
  {
    var membs = {};
    members = members.array()
    for (var i = 0; i < members.length; i++)
    {
      var m = members[i]
      membs[m.id] = {
        name: m.username,
        disc: m.discriminator
      }
    }
    fs.writeFileSync(filename, JSON.stringify(membs))
  }

  if (msg.content[0] != '/') return;
  if (msg.author.id != client.user.id) return;

  var tokens = msg.content.split(' ')
  tokens[0] = tokens[0].substring(1);

  if (tokens[0] == 'created')
  {
    client.fetchUser(tokens[1]).then(u => {
      respond(msg, `
        ${u.tag} created:

        ${u.createdAt}
      `)
    }).catch(e => {
      respond(msg, `Invalid ID.

        Try /created [ID]`)
    })
  }
  if (tokens[0] == 'joined')
  {
    var m = msg.guild.members.find(m => m.user.id == tokens[1])
    if (m) {
      respond(msg, `
        ${m.user.tag} joined:

        ${m.joinedAt}
      `)
    } else {
      respond(msg, `Invalid ID.

        Try /joined [ID]`)
    }
  }
  if (tokens[0] == 'roles')
  {
    var rstr = '';
    msg.guild.roles.array().forEach(role => {
      var r = `<@&${role.id}>\n`;
      if ((rstr + r).length >= 2000) {
        msg.channel.send(rstr)
        rstr = '';
      }
      rstr += r;
    })

    respond(msg, `Found ${msg.guild.roles.array().length} roles:`)
    msg.channel.send(rstr)
  }
  if (tokens[0] == 'membercount')
  {
    respond(msg, `${msg.channel.guild.memberCount} total members.`)
  }
  if (tokens[0] == 'dumprole')
  {
    if (tokens.length < 3) {
      respond(msg, '/dumprole [file] [role]')
    } else {
      var role = tokens.slice(2).join(' ')
      console.log(`Finding members with role '${role}'`)
      var r = msg.channel.guild.roles.get(role)
      if (!r)
      {
        console.log(`Could not get ${role} by ID.`)
        r = msg.guild.roles.find(r => r.name == role);
        //console.log(msg.guild.members.find(member => member.roles.has(r.id)))
        if (!r)
        {
          respond(msg, 'Could not find that role.', '#FF0000')
        } else {
          var membs = r.members;
          if (membs)
          {
            membersToFile(tokens[1], membs);
            respond(msg, `Dumped ${membs.array().length} members with ${r.name} to ${tokens[1]}`)
          } else {
            respond(msg, 'This role has no members.')
          }
        }
      } else {
        var membs = r.members;
        if (membs)
        {
          membersToFile(tokens[1], membs);
          respond(msg, `Dumped ${membs.array().length} members with ${r.name} to ${tokens[1]}`)
        } else {
          respond(msg, 'This role has no members.')
        }
      }
    }
  }
  if (tokens[0] == 'rolemembers')
  {
    if (tokens.length == 0)
    {
      respond(msg, 'You did not specify any roles.', '#FF0000')
    } else {
      var role = tokens.slice(1).join(' ')
      console.log(`Finding members with role '${role}'`)

      var r = msg.channel.guild.roles.get(role)


      if (!r)
      {
        console.log(`Could not get ${role} by ID.`)
        r = msg.guild.roles.find(r => r.name == role);
        //console.log(msg.guild.members.find(member => member.roles.has(r.id)))
        if (!r)
        {
          respond(msg, 'Could not find that role.', '#FF0000')
        } else {
          var membs = r.members;
          if (membs)
          {
            respond(msg, `Found ${membs.array().length} members with role ${r.name} (by role name)`)
          } else {
            respond(msg, 'This role has no members.')
          }
        }
      } else {
        var membs = r.members;
        if (membs)
        {
          respond(msg, `Found ${membs.array().length} members with role ${r.name} (by role ID)`)
        } else {
          respond(msg, 'This role has no members.')
        }
      }

    }

  }

});
client.login(conf.get('token'));

async function checkToken(tok)
{
  return new Promise((resolve, reject) => {
    const checker = new Discord.Client();
    checker.on('ready',async () => {
      conf.set('token', tok);
      resolve(checker.user.tag)
      checker.destroy()
    })
    checker.login(token).catch(e => {
      reject(e)
    })
  })
}
