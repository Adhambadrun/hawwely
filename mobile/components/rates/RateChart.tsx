import { useMemo, useState } from 'react';
import { I18nManager, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop, Line, Circle, Text as SvgText } from 'react-native-svg';
import { colors, fonts } from '@/theme';
import { Text } from '@/components/ui/Text';
import type { RateHistoryPoint } from '@/lib/shared/types';
import { formatRate } from '@/lib/shared/formatters';
import { useLang } from '@/lib/hooks/useLang';

function shortDate(iso: string, lang: 'ar' | 'en') {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'Africa/Cairo' }).format(d);
}

/**
 * Lightweight area chart drawn with react-native-svg (no chart-kit dependency).
 * Shows mid-market (green) and optionally a service line (navy, dashed).
 */
export function RateChart({ points, serviceKey = false, height = 180 }: { points: RateHistoryPoint[]; serviceKey?: boolean; height?: number }) {
  const [width, setWidth] = useState(0);
  const lang = useLang();
  const key: 'mid_market_rate' | 'exchange_rate' = serviceKey ? 'exchange_rate' : 'mid_market_rate';

  const geo = useMemo(() => {
    if (!points.length || width === 0) return null;
    const padX = 8;
    const padTop = 16;
    const padBottom = 24;
    const values = points.map((p) => p[key]);
    const mids = points.map((p) => p.mid_market_rate);
    const all = serviceKey ? [...values, ...mids] : values;
    let min = Math.min(...all);
    let max = Math.max(...all);
    if (max - min < 1e-6) {
      min -= 0.01;
      max += 0.01;
    }
    const span = max - min;
    min -= span * 0.1;
    max += span * 0.1;
    const w = width - padX * 2;
    const h = height - padTop - padBottom;
    const x = (i: number) => {
      const t = points.length === 1 ? 0.5 : i / (points.length - 1);
      const tt = I18nManager.isRTL ? 1 - t : t;
      return padX + tt * w;
    };
    const y = (v: number) => padTop + (1 - (v - min) / (max - min)) * h;
    const line = (arr: number[]) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    const linePath = line(values);
    const areaPath = `${linePath} L${x(points.length - 1).toFixed(1)},${(padTop + h).toFixed(1)} L${x(0).toFixed(1)},${(padTop + h).toFixed(1)} Z`;
    const midPath = serviceKey ? line(mids) : null;
    const last = values[values.length - 1];
    const lastPt = { x: x(points.length - 1), y: y(last) };
    const hi = values.indexOf(Math.max(...values));
    const lo = values.indexOf(Math.min(...values));
    const labels = [0, Math.floor((points.length - 1) / 2), points.length - 1].map((i) => ({ x: x(i), label: shortDate(points[i].recorded_at, lang) }));
    return { linePath, areaPath, midPath, lastPt, hi: { x: x(hi), y: y(values[hi]), v: values[hi] }, lo: { x: x(lo), y: y(values[lo]), v: values[lo] }, labels, baseline: padTop + h };
  }, [points, width, height, key, serviceKey, lang]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View onLayout={onLayout} style={{ height }} accessibilityLabel="chart">
      {geo && width > 0 ? (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="area" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.primary} stopOpacity={0.35} />
              <Stop offset="1" stopColor={colors.primary} stopOpacity={0.02} />
            </LinearGradient>
          </Defs>
          <Line x1={0} x2={width} y1={geo.baseline} y2={geo.baseline} stroke={colors.border} strokeWidth={1} />
          <Path d={geo.areaPath} fill="url(#area)" />
          {geo.midPath ? <Path d={geo.midPath} stroke={colors.primary} strokeWidth={2} fill="none" /> : null}
          <Path d={geo.linePath} stroke={serviceKey ? colors.navy : colors.primary} strokeWidth={2.5} fill="none" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={serviceKey ? '6 4' : undefined} />
          <Circle cx={geo.lastPt.x} cy={geo.lastPt.y} r={5} fill={colors.white} stroke={serviceKey ? colors.navy : colors.primary} strokeWidth={2.5} />
          <SvgText x={geo.hi.x} y={geo.hi.y - 6} fontSize={10} fontFamily={fonts.interMedium} fill={colors.success} textAnchor="middle">
            {formatRate(geo.hi.v, 'en')}
          </SvgText>
          <SvgText x={geo.lo.x} y={geo.lo.y + 14} fontSize={10} fontFamily={fonts.interMedium} fill={colors.danger} textAnchor="middle">
            {formatRate(geo.lo.v, 'en')}
          </SvgText>
          {geo.labels.map((l, i) => (
            <SvgText key={i} x={l.x} y={height - 6} fontSize={10} fontFamily={fonts.inter} fill={colors.textMuted} textAnchor={i === 0 ? (I18nManager.isRTL ? 'end' : 'start') : i === 2 ? (I18nManager.isRTL ? 'start' : 'end') : 'middle'}>
              {l.label}
            </SvgText>
          ))}
        </Svg>
      ) : (
        <View style={styles.placeholder}>
          <Text variant="caption" color={colors.textMuted}>
            —
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' } });
