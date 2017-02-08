import * as db from 'sqlite';
import * as request from 'request';

var Config = require('./config.json');

var peopleTracked = {}

function check() {
	db.open(Config.db_path).then(function() {
		db.all('SELECT * FROM steamids').then(function(players) {
			for(let player of players) {
				var steamid = player.steamid;
				var data = JSON.parse(player.data);

				if(steamid in peopleTracked) {
					if(data.NumberOfVACBans > peopleTracked[steamid].NumberOfVACBans || data.NumberOfGameBans > peopleTracked[steamid].NumberOfGameBans) {
						console.log(data.personaname + ' has just been banned.');

						request({
							method: 'POST',
							url: Config.discord.webhook_url,
							json: true,
							body: {
								username: Config.discord.username,
								embeds: [{
									author: {
										icon_url: data.avatar,
										url: 'http://steamcommunity.com/profiles/' + steamid,
										name: data.personaname +' has just been banned.'
									},
									title: 'Click here to view the match list.',
									type: 'rich',
									description: 'Thanks, Gaben!',
									url: Config.web_url + '/index.html#/player/' + steamid,
									color: 16711680
								}]
							}
						})

					}
				}

				peopleTracked[steamid] = data;
			}

			db.close();

		}).catch(function(err) {
			console.log('Oh shit.')
			console.log(err)
		})
	})
}

check();
setInterval(check, 1000 * 60 * 60);
