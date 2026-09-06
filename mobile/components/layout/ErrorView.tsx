import { AlertTriangle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme';
import { EmptyState } from '@/components/ui/EmptyState';

export function ErrorView({ onRetry, message }: { onRetry?: () => void; message?: string }) {
  const { t } = useTranslation();
  return <EmptyState icon={<AlertTriangle size={36} color={colors.warning} />} title={t('common.error')} text={message ?? t('common.errorText')} actionLabel={onRetry ? t('common.retry') : undefined} onAction={onRetry} />;
}
