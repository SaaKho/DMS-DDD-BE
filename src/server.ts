// server.ts
import { Command } from "commander";
import "newrelic";
import config from "./utils/config";
import app from ".";

const program = new Command();

program
  .name("Document Management System")
  .description("Bootstraps the Express server")
  .version("1.0.0");

program
  .command("start")
  .description("Start the server")
  .action(() => {
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  });

program.parse(process.argv);
