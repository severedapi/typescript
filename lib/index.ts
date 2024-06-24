import { Command } from '@commander-js/extra-typings';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { isProject } from './_types/guards/project.guard';
import { ServerBuilder } from './ServerBuilder';

// Load environment variables from .env file
dotenv.config();

// Define the Command
const program = new Command()
    .version('1.0.0')
    .option('-c, --config <path>', 'Specify config file path')
    .option('-v, --verbose', 'Enable verbose mode')
    .parse(process.argv);

// Read config file path from options or use default
const configPath = program.opts().config || process.env.CONFIG_PATH || './config.sev-api.json';

// Read config file
let config;
try {
    const configFile = fs.readFileSync(configPath, 'utf-8');
    config = JSON.parse(configFile);
} catch (err) {
    if (err instanceof Error) {
        console.error(`Error reading config file: ${err.message}`);
    }
    process.exit(1);
}

try {
    if (isProject(config)) {
        const builder = new ServerBuilder();
        builder.setCustomDomain(config.custom_domain)
            .setEndpoints(config.endpoints)
            .setModels(config.models)
            .setProjectName(config.project_name)
            .setUsername(config.username)
            .setProjectRootUrl(config.project_root_url);
        builder.build();
        builder.run();
    } else {
        throw new Error('Config is not a project');
    }
} catch (err) {
    if (err instanceof Error) {
        console.error(err);
    }
    process.exit(1);
}
