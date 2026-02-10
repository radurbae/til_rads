'use client';

import { useAppSettings } from '@/components/AppSettings/AppSettingsProvider';
import { t, type TranslationKey, type TranslationValues } from '@/lib/i18n';

interface TextProps {
    id: TranslationKey;
    values?: TranslationValues;
}

export default function Text({ id, values }: TextProps) {
    const { language } = useAppSettings();
    return <>{t(language, id, values)}</>;
}
