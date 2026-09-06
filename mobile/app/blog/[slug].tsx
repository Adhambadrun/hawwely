import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Share2 } from 'lucide-react-native';
import { colors } from '@/theme';
import { Screen } from '@/components/layout/Screen';
import { TopBar } from '@/components/layout/TopBar';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Markdown } from '@/components/shared/Markdown';
import { CompareForm } from '@/components/compare/CompareForm';
import { getBlogPost, getBlogPosts } from '@/lib/api/client';
import { APP_URL } from '@/lib/shared/constants';
import { formatDate } from '@/lib/shared/formatters';
import { useLang } from '@/lib/hooks/useLang';
import { shareText } from '@/lib/utils/share';
import * as WebBrowser from 'expo-web-browser';
import i18n from '@/i18n';

export default function BlogPostScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t } = useTranslation();
  const lang = useLang();
  const router = useRouter();
  const post = getBlogPost(slug ?? '');
  if (!post) {
    return (
      <Screen plain>
        <TopBar />
        <EmptyState title={t('blog.empty')} actionLabel={t('common.back')} onAction={() => router.back()} />
      </Screen>
    );
  }
  const title = lang === 'ar' ? post.title_ar ?? post.title : post.title;
  const content = lang === 'ar' ? post.content_ar ?? post.content : post.content;
  const url = `${APP_URL}${lang === 'en' ? '/en' : ''}/blog/${post.slug}`;
  const related = getBlogPosts(post.category).filter((p) => p.id !== post.id).slice(0, 2);

  return (
    <Screen padded={false}>
      <TopBar action={<Button title="" variant="outline" size="sm" icon={<Share2 size={16} color={colors.navy} />} onPress={() => shareText(i18n.t('share.post', { title, url }), t('blog.share'))} accessibilityLabel={t('blog.share')} style={{ paddingHorizontal: 10 }} />} />
      <LinearGradient colors={[colors.navy, '#0F172A']} style={styles.hero}>
        <Badge label={t(`blog.categories.${post.category}`)} tone="gold" />
        <Text variant="h1" color={colors.white}>
          {title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text variant="caption" color="rgba(255,255,255,0.7)">
            {post.author_name ?? 'Hawwely'} · {post.published_at ? formatDate(post.published_at, lang) : ''}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Clock size={12} color="rgba(255,255,255,0.7)" />
            <Text variant="caption" color="rgba(255,255,255,0.7)">
              {t('blog.minutes', { count: post.reading_minutes ?? 5 })}
            </Text>
          </View>
        </View>
      </LinearGradient>
      <View style={styles.body}>
        <Markdown source={content} />
        <Card style={{ marginTop: 20 }}>
          <Text variant="h3" style={{ marginBottom: 8 }}>
            {t('home.compareTitle')}
          </Text>
          <CompareForm compact />
        </Card>
        {related.length ? (
          <>
            <SectionHeader title={t('blog.related')} />
            {related.map((p) => (
              <Card key={p.id} onPress={() => router.push(`/blog/${p.slug}`)} style={{ marginBottom: 10 }}>
                <Text variant="bodyBold">{lang === 'ar' ? p.title_ar ?? p.title : p.title}</Text>
                <Text variant="caption" color={colors.textSecondary} numberOfLines={2}>
                  {lang === 'ar' ? p.excerpt_ar ?? p.excerpt : p.excerpt}
                </Text>
              </Card>
            ))}
          </>
        ) : null}
        <Button title={t('blog.openWeb')} variant="ghost" onPress={() => WebBrowser.openBrowserAsync(url)} style={{ alignSelf: 'center', marginTop: 8 }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 16, paddingVertical: 24, gap: 12 },
  body: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
});
