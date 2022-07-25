import { register, apps } from "@netless/fastboard";
import App from "../src/index";

export const registering = register({ kind: App.kind, src: App });
apps.clear();
apps.push({
  kind: App.kind,
  label: App.label,
  icon: App.icon,
  onClick: fastboard => {
    fastboard.manager.addApp({ kind: App.kind });
  },
});
