const { existsSync } = require('node:fs');
const { loadEnvFile } = require('node:process');
const { resolve } = require('node:path');

const envFile = resolve(__dirname, '.env');
if (existsSync(envFile)) loadEnvFile(envFile);
