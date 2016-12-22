/**
 * Created by lenny on 22.12.16.
 */
var config = {};

config.secret = 'secrettosubstitute';
config.socketPath = "/run/commander.sk";
config.refToActOn = "refs/heads/master";
config.port = 65530;


config.commandMap = {
    "repo1": "1\n",
    "repo2": "2\n"
};

module_exports = config;