const Discord = require('discord.js');
const { default: axios } = require('axios');
const StaticMaps = require('staticmaps');
const scoring = require('../scoring');

const nasa_key = process.env.NASA_KEY;

function people(msg) {
    const url = "http://api.open-notify.org/astros.json";
    axios({
        method: 'get',
        url: url,
    }).then((response) => {
        data = response.data;
        const embed = new Discord.MessageEmbed()
            .setColor('#f5b642')
            .setTitle('**The people currently in space**')
        for (var i = 0; i < data['people'].length; i++) {
            embed.addField(data['people'][i]['name'], data['people'][i]['craft'], true)
        }
        msg.channel.send(embed);
    });

}

function issLoc(msg) {
    const url = "http://api.open-notify.org/iss-now.json";
    axios({
        method: 'get',
        url: url,
    }).then((response) => {
        data = response.data;
        const lon = parseFloat(data['iss_position']['longitude']);
        const lat = parseFloat(data['iss_position']['latitude']);
        const coords = [lon, lat];
        const options = {
            width: 600,
            height: 400
        };
        const map = new StaticMaps(options);
        const marker = {
            img: `${__dirname}/../img/iss.png`,
            width: 54,
            height: 21,
            coord: coords,
        };
        map.addMarker(marker);
        map.render([0, 0], 1)
            .then(() => map.image.save(`${__dirname}/../img/iss-map.png`))
            .then(() => {
                const attachment = new Discord.MessageAttachment(`${__dirname}/../img/iss-map.png`, 'map.png');
                const embed = new Discord.MessageEmbed()
                    .setTitle(`The ISS is above ${lat}, ${lon}`)
                    .attachFiles(attachment)
                    .setImage('attachment://map.png');
                msg.channel.send({ embed });
            })
            .catch(console.log);
    });
    scoring.inc(msg.author.id, 1);
}

function apod(msg) {
    const url = "https://api.nasa.gov/planetary/apod?api_key=" + nasa_key;
    axios({
        method: 'get',
        url: url,
    }).then((response) => {
        data = response.data;
        const embed = {
            color: 0x0099ff,
            title: `**${data['title']}**`,
            image: {
                url: data['url'],
            },
            fields: [{
                name: 'Explanation',
                value: data['explanation']
            }]
        };
        msg.channel.send({ embed: embed });
    });
}

module.exports = {
    issLoc: issLoc,
    apod: apod,
    people: people
};
