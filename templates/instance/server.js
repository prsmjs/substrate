import { createSubstrate } from "@prsm/substrate";
import config from "./substrate.config.js";

const substrate = await createSubstrate(config);
const server = await substrate.listen();
const port = server.address().port;
console.log(`substrate listening on http://localhost:${port}`);
