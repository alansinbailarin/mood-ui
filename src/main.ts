import { createApp } from "vue";
import "./style.css";
import "./showroom/showroom.css";
import App from "./App.vue";
import i18n from "./showroom/i18n";

createApp(App).use(i18n).mount("#app");
