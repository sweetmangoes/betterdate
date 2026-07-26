import type { DatePlan } from '@betterdate/shared'
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import type { RootNavigation, RootStackParamList } from '../navigation'
import { colors } from '../theme'

const categoryLabels: Record<DatePlan['stops'][number]['category'], string> = {
  food: 'Food',
  drink: 'Drink',
  activity: 'Activity',
  walk: 'Walk',
  dessert: 'Dessert',
}

export function PlanScreen() {
  const navigation = useNavigation<RootNavigation>()
  const route = useRoute<RouteProp<RootStackParamList, 'Plan'>>()
  const plan = route.params.plan
  const stops = [...plan.stops].sort((a, b) => a.order - b.order)

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.eyebrow}>Your date plan</Text>
        <Text style={styles.title}>{plan.title}</Text>
        <Text style={styles.summary}>{plan.summary}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>
            <Text style={styles.metaStrong}>Duration </Text>
            {plan.duration}
          </Text>
          <Text style={styles.meta}>
            <Text style={styles.metaStrong}>Est. cost </Text>
            {plan.estimatedCost}
          </Text>
        </View>

        {stops.map((stop, index) => (
          <View key={`${stop.order}-${stop.name}`} style={styles.stop}>
            <View style={styles.stopHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{stop.order}</Text>
              </View>
              <View style={styles.stopCopy}>
                <Text style={styles.stopName}>{stop.name}</Text>
                <Text style={styles.stopMeta}>
                  {categoryLabels[stop.category]} · {stop.neighborhood}
                  {stop.rating != null ? ` · ★ ${stop.rating.toFixed(1)}` : ''}
                </Text>
                {stop.address ? <Text style={styles.address}>{stop.address}</Text> : null}
                <Text style={styles.timeHint}>{stop.timeHint}</Text>
              </View>
            </View>
            <Text style={styles.why}>{stop.whyItFits}</Text>
            <Text style={styles.tip}>Tip: {stop.tip}</Text>
            {stop.mapsUrl ? (
              <Pressable onPress={() => Linking.openURL(stop.mapsUrl!)} style={styles.mapsLink}>
                <Text style={styles.mapsLinkText}>Open in Google Maps</Text>
              </Pressable>
            ) : null}
            {index < stops.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}

        <Text style={styles.sectionTitle}>Conversation starters</Text>
        {plan.conversationStarters.map((starter) => (
          <Text key={starter} style={styles.bullet}>
            • {starter}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>Backup idea</Text>
        <Text style={styles.body}>{plan.backupIdea}</Text>

        <Text style={styles.disclaimer}>{plan.disclaimer}</Text>

        <Pressable style={styles.button} onPress={() => navigation.navigate('Quiz')}>
          <Text style={styles.buttonText}>Plan another</Text>
        </Pressable>
        <Pressable style={styles.linkButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.linkText}>Back home</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  scroll: { padding: 24, paddingBottom: 48 },
  eyebrow: { color: colors.rose, fontWeight: '600', marginBottom: 8 },
  title: { fontSize: 30, fontWeight: '600', color: colors.charcoal, marginBottom: 12 },
  summary: { fontSize: 16, lineHeight: 24, color: colors.muted, marginBottom: 16 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 28 },
  meta: { fontSize: 14, color: colors.muted },
  metaStrong: { fontWeight: '600', color: colors.charcoal },
  stop: { marginBottom: 8 },
  stopHeader: { flexDirection: 'row', gap: 12 },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.white, fontWeight: '700' },
  stopCopy: { flex: 1 },
  stopName: { fontSize: 22, fontWeight: '600', color: colors.charcoal },
  stopMeta: { marginTop: 2, fontSize: 14, color: colors.muted },
  address: { marginTop: 4, fontSize: 13, color: colors.muted },
  timeHint: { marginTop: 6, fontSize: 14, fontWeight: '600', color: colors.rose },
  why: { marginTop: 10, marginLeft: 44, fontSize: 15, lineHeight: 22, color: colors.muted },
  tip: {
    marginTop: 6,
    marginLeft: 44,
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.muted,
  },
  mapsLink: { marginTop: 10, marginLeft: 44 },
  mapsLinkText: { fontSize: 14, fontWeight: '600', color: colors.rose },
  divider: {
    marginTop: 20,
    marginBottom: 12,
    marginLeft: 44,
    height: 1,
    backgroundColor: colors.border,
  },
  sectionTitle: {
    marginTop: 28,
    marginBottom: 10,
    fontSize: 20,
    fontWeight: '600',
    color: colors.charcoal,
  },
  bullet: { fontSize: 15, lineHeight: 22, color: colors.muted, marginBottom: 6 },
  body: { fontSize: 15, lineHeight: 22, color: colors.muted },
  disclaimer: { marginTop: 24, fontSize: 13, lineHeight: 20, color: colors.muted },
  button: {
    marginTop: 28,
    alignSelf: 'flex-start',
    backgroundColor: colors.charcoal,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
  },
  buttonText: { color: colors.white, fontWeight: '600' },
  linkButton: { marginTop: 14, alignSelf: 'flex-start', paddingVertical: 8 },
  linkText: { color: colors.muted, fontWeight: '600' },
})
