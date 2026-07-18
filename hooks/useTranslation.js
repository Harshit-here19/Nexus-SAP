import { useSettings } from "../context/SettingsContext";

import en from "../locales/en.json";
import hi from "../locales/hi.json";

const languages = {
    en,
    hi
};

export default function useTranslation() {
    const { settings } = useSettings();

    const lang = languages[settings.language] || en;

    const t = (key) => {
        const keys = key.split(".");

        let value = lang;

        for (const k of keys) {
            value = value?.[k];
        }

        return value || key;
    };

    return { t };
}