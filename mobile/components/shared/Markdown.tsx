import { Fragment, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, fonts, radius } from '@/theme';
import { Text } from '@/components/ui/Text';

/**
 * Minimal markdown renderer for blog posts / legal text:
 * headings (#, ##, ###), paragraphs, bullet & numbered lists, **bold**,
 * blockquotes, simple pipe tables, horizontal rules.
 */
export function Markdown({ source }: { source: string }) {
  const blocks = parse(source);
  return <View style={styles.wrap}>{blocks.map((b, i) => renderBlock(b, i))}</View>;
}

type Block =
  | { type: 'h'; level: number; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'table'; rows: string[][] }
  | { type: 'hr' };

function parse(src: string): Block[] {
  const lines = src.replace(/\r/g, '').split('\n');
  const out: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      out.push({ type: 'h', level: h[1].length, text: h[2] });
      i++;
      continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      out.push({ type: 'hr' });
      i++;
      continue;
    }
    if (line.trim().startsWith('|')) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const cells = lines[i].trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
        if (!cells.every((c) => /^:?-{2,}:?$/.test(c))) rows.push(cells);
        i++;
      }
      out.push({ type: 'table', rows });
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      out.push({ type: 'ul', items });
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ''));
        i++;
      }
      out.push({ type: 'ol', items });
      continue;
    }
    if (line.startsWith('>')) {
      const parts: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        parts.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      out.push({ type: 'quote', text: parts.join(' ') });
      continue;
    }
    const parts: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6})\s/.test(lines[i]) && !/^\s*[-*]\s+/.test(lines[i]) && !lines[i].trim().startsWith('|') && !lines[i].startsWith('>')) {
      parts.push(lines[i].trim());
      i++;
    }
    out.push({ type: 'p', text: parts.join(' ') });
  }
  return out;
}

/** **bold**, *italic*, `code`, [text](url) → plain text with bold spans. */
function inline(text: string): ReactNode {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);
  return tokens.map((tok, i) => {
    if (tok.startsWith('**') && tok.endsWith('**')) return <Text key={i} variant="bodyBold" style={styles.inlineBold}>{tok.slice(2, -2)}</Text>;
    if (tok.startsWith('`') && tok.endsWith('`')) return <Text key={i} style={styles.code}>{tok.slice(1, -1)}</Text>;
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(tok);
    if (link) return <Text key={i} color={colors.primaryDark} style={styles.inlineBold}>{link[1]}</Text>;
    return <Fragment key={i}>{tok.replace(/\*([^*]+)\*/g, '$1')}</Fragment>;
  });
}

function renderBlock(b: Block, key: number) {
  switch (b.type) {
    case 'h':
      return (
        <Text key={key} variant={b.level <= 2 ? 'h2' : 'h3'} style={styles.h}>
          {inline(b.text)}
        </Text>
      );
    case 'p':
      return (
        <Text key={key} variant="body" style={styles.p}>
          {inline(b.text)}
        </Text>
      );
    case 'quote':
      return (
        <View key={key} style={styles.quote}>
          <Text variant="body" color={colors.navy}>
            {inline(b.text)}
          </Text>
        </View>
      );
    case 'hr':
      return <View key={key} style={styles.hr} />;
    case 'ul':
    case 'ol':
      return (
        <View key={key} style={styles.list}>
          {b.items.map((it, i) => (
            <View key={i} style={styles.li}>
              <Text variant="body" color={colors.primaryDark} style={styles.bullet}>
                {b.type === 'ul' ? '•' : `${i + 1}.`}
              </Text>
              <Text variant="body" style={{ flex: 1 }}>
                {inline(it)}
              </Text>
            </View>
          ))}
        </View>
      );
    case 'table':
      return (
        <View key={key} style={styles.table}>
          {b.rows.map((row, r) => (
            <View key={r} style={[styles.tr, r === 0 && styles.th]}>
              {row.map((cell, c) => (
                <Text key={c} variant={r === 0 ? 'captionBold' : 'caption'} style={styles.td}>
                  {inline(cell)}
                </Text>
              ))}
            </View>
          ))}
        </View>
      );
  }
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  h: { marginTop: 18, marginBottom: 6 },
  p: { marginBottom: 10 },
  inlineBold: { fontSize: undefined, lineHeight: undefined },
  code: { fontFamily: fonts.inter, backgroundColor: '#F1F5F9', paddingHorizontal: 4, borderRadius: 4 },
  quote: { borderStartWidth: 4, borderStartColor: colors.primary, backgroundColor: colors.primaryLight, padding: 12, borderRadius: radius.sm, marginBottom: 10 },
  hr: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  list: { gap: 6, marginBottom: 10 },
  li: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  bullet: { width: 22, textAlign: 'center' },
  table: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, overflow: 'hidden', marginBottom: 12 },
  tr: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  th: { backgroundColor: '#F1F5F9' },
  td: { flex: 1, padding: 8 },
});
