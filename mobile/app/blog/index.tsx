import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Newspaper } from 'lucide-react-native';
import { colors, radius } from '@/theme';
import { Screen } from '@/components/layout/Screen';
import { TopBar } from '@/components/layout/TopBar';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { getBlogPosts } from '@/lib/api/client';
import { formatDate } from '@/lib/shared/formatters';
import { useLang } from '@/lib/hooks/useLang';
import type { BlogPost } from '@/lib/shared/types';

const CATS = ['all', 'guide', 'comparison', 'news', 'tips'] as const;
const CAT_TONE: Record<string, 'navy' | 'primary' | 'warning' | 'gold'> = { guide: 'navy', comparison: 'primary', news: 'warning', tips: 'gold' };
const GRADIENTS: Record<string, readonly [string, string]> = { guide: [colors.navy, '#2B4170'], comparison: [colors.primary, '#00E676'], news: ['#B45309', colors.warning], tips: ['#B8860B', colors.gold] };

export default function BlogListScreen() {
  const { t } = useTranslation();
  const lang = useLang();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [cat, setCat] = useState<(typeof CATS)[number]>('all');
  const posts = useMemo(() => getBlogPosts(cat), [cat]);

  return (
    <Screen plain>
      <TopBar title={t('blog.title')} subtitle={t('blog.subtitle')} />
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 32 }}
        ListHeaderComponent={
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {CATS.map((c) => (
              <Chip key={c} small label={t(`blog.categories.${c}`)} selected={cat === c} onPress={() => setCat(c)} />
            ))}
          </View>
        }
        renderItem={({ item }) => <PostCard post={item} lang={lang} onPress={() => router.push(`/blog/${item.slug}`)} />}
        ListEmptyComponent={<EmptyState icon={<Newspaper size={32} color={colors.textSecondary} />} title={t('blog.empty')} />}
      />
    </Screen>
  );
}

function PostCard({ post, lang, onPress }: { post: BlogPost; lang: 'ar' | 'en'; onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <Card padded={false} onPress={onPress} style={styles.card}>
      <LinearGradient colors={GRADIENTS[post.category] ?? GRADIENTS.guide} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cover}>
        <Newspaper size={28} color="rgba(255,255,255,0.8)" />
      </LinearGradient>
      <View style={{ padding: 14, gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Badge label={t(`blog.categories.${post.category}`)} tone={CAT_TONE[post.category] ?? 'navy'} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Clock size={12} color={colors.textMuted} />
            <Text variant="caption" color={colors.textMuted}>
              {t('blog.minutes', { count: post.reading_minutes ?? 5 })}
            </Text>
          </View>
        </View>
        <Text variant="bodyBold">{lang === 'ar' ? post.title_ar ?? post.title : post.title}</Text>
        <Text variant="small" color={colors.textSecondary} numberOfLines={3}>
          {lang === 'ar' ? post.excerpt_ar ?? post.excerpt : post.excerpt}
        </Text>
        <Text variant="caption" color={colors.textMuted}>
          {post.published_at ? formatDate(post.published_at, lang) : ''} · {post.author_name ?? 'Hawwely'}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 14, overflow: 'hidden' },
  cover: { height: 110, alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
});
