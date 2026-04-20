import DefaultTheme from "vitepress/theme";
import { enhanceAppWithTabs } from "vitepress-plugin-tabs/client";
import Layout from "./Layout.vue";
import { VPButton } from 'vitepress/theme'
import "./custom.css";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    enhanceAppWithTabs(app);
    app.component('VPButton', VPButton);
  },
};
