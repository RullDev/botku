import fs from 'fs';

const JSON_DATA = { welcome: JSON.parse(fs.readFileSync('./database/json/func_welcome.json', 'utf-8')) };

export const welcomeJSON = JSON_DATA.welcome;
