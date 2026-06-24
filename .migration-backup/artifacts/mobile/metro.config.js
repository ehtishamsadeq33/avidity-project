const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver = config.resolver || {};
config.resolver.blockList = /.*(?:@puppeteer[\\/]browsers|puppeteer-core|puppeteer)[\\/].*/;

module.exports = config;
