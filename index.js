var Request = require("request");
const config = require('./config');

function poll() {

    try {
        var options = {
            url: 'https://api.stackexchange.com/2.2/questions?team=stackoverflow.com/c/' + config.app.stackOverflowTeamName + '&site=stackoverflow&order=desc&sort=creation&fromdate=' + lastDate + '&key=' + config.app.apiKey,
            headers: {
                'Accept': 'application/json',
                'X-API-Access-Token': config.app.apiAccessToken
            },
            json: true,
            gzip: true
        }

        Request(options,
            (error, response, body) => {

                if (error) {
                    return;
                }

                if (response.statusCode != 200) {
                    console.log('Failed: ' + response.statusCode + ' ' + response.statusMessage);
                    return;
                }

                var questions = JSON.parse(JSON.stringify(body)).items;

                questions.forEach(function (x) {

                    var json = '{'
                        + '"@context": "https://schema.org/extensions",'
                        + '"@type": "MessageCard",'
                        + '"themeColor": "0072C6",'
                        + '"title": "' + x.title + '",'
                        + '"text": "Asked by ' + x.owner.display_name + '",'
                        + '"potentialAction": ['
                        + '{'
                        + '"@type": "OpenUri",'
                        + '"name": "See Question",'
                        + '"targets": ['
                        + '{ "os": "default", "uri": "' + x.link + '" }'
                        + ']'
                        + '}'
                        + ']'
                        + '}';

                    var teamsOptions = {
                        url: config.app.teamsWebHookUrl,
                        headers: {
                            'Accept': 'application/json'
                        },
                        json: true,
                        form: json
                    }

                    console.log('Sending ' + json);

                    Request.post(teamsOptions,
                        (error, response, body) => {

                            if (error) {
                                return;
                            }

                            if (response.statusCode != 200) {
                                console.log('Failed: ' + response.statusCode + ' ' + response.statusMessage);
                                return;
                            }
                        })
                });

                lastDate = Math.floor(Date.now() / 1000);
            })
    }
    catch
    {

    }

    setTimeout(poll(), 60000);
}


var lastDate = Math.floor(Date.now() / 1000);
poll();