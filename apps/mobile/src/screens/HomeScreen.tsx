import { useNavigation } from '@react-navigation/native'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import type { RootNavigation } from '../navigation'
import { colors } from '../theme'

export function HomeScreen() {
  const navigation = useNavigation<RootNavigation>()

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.brand}>Better Date</Text>
        <Text style={styles.headline}>Intentional dates,{'\n'}planned for where you are.</Text>
        <Text style={styles.sub}>
          Eliminate bad dates with a short preference quiz and a thoughtful local plan.
        </Text>
        <Pressable style={styles.button} onPress={() => navigation.navigate('Quiz')}>
          <Text style={styles.buttonText}>Start the quiz</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    justifyContent: 'center',
  },
  brand: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.rose,
    marginBottom: 16,
  },
  headline: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: 16,
  },
  sub: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.muted,
    marginBottom: 32,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: colors.charcoal,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
})
