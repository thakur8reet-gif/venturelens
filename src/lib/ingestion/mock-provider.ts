import type { Startup } from "../domain";
import { demoStartups } from "../demo-data";
import type { StartupProvider } from "./provider";

export class DemoStartupProvider implements StartupProvider {
  readonly name = "demo";

  async discover(): Promise<Startup[]> {
    return demoStartups;
  }
}
