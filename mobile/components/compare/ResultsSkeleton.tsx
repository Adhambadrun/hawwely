import { View } from 'react-native';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';

export function ResultsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={{ gap: 12 }}>
      <Skeleton height={72} />
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <Skeleton width={44} height={44} round />
            <View style={{ flex: 1, gap: 6 }}>
              <Skeleton width="60%" height={14} />
              <Skeleton width="40%" height={10} />
            </View>
          </View>
          <Skeleton width="55%" height={30} style={{ alignSelf: 'center' }} />
          <Skeleton height={48} />
        </Card>
      ))}
    </View>
  );
}
