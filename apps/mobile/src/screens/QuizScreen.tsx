import {
  audienceOptions,
  budgetOptions,
  emptyQuizAnswers,
  energyOptions,
  occasionOptions,
  PLAN_STORAGE_KEY,
  quizAnswersSchema,
  quizSteps,
  timeOptions,
  vibeOptions,
  type QuizAnswers,
  type QuizStepId,
} from '@betterdate/shared'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import { useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { generatePlan } from '../api'
import type { RootNavigation } from '../navigation'
import { colors } from '../theme'

function isStepComplete(step: QuizStepId, answers: QuizAnswers): boolean {
  switch (step) {
    case 'audience':
      return Boolean(answers.audience)
    case 'location':
      return answers.location.trim().length >= 2
    case 'occasion':
      return Boolean(answers.occasion)
    case 'budget':
      return Boolean(answers.budget)
    case 'time':
      return Boolean(answers.time)
    case 'energy':
      return Boolean(answers.energy)
    case 'vibes':
      return answers.vibes.length >= 1 && answers.vibes.length <= 2
    case 'constraints':
      return true
  }
}

export function QuizScreen() {
  const navigation = useNavigation<RootNavigation>()
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswers>(emptyQuizAnswers)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const step = quizSteps[stepIndex]
  const isLast = stepIndex === quizSteps.length - 1
  const progress = ((stepIndex + 1) / quizSteps.length) * 100

  function update<K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }))
    setError(null)
  }

  function toggleVibe(vibe: QuizAnswers['vibes'][number]) {
    setAnswers((prev) => {
      if (prev.vibes.includes(vibe)) {
        return { ...prev, vibes: prev.vibes.filter((v) => v !== vibe) }
      }
      if (prev.vibes.length >= 2) return prev
      return { ...prev, vibes: [...prev.vibes, vibe] }
    })
    setError(null)
  }

  async function goNext() {
    if (!isStepComplete(step.id, answers)) {
      setError(step.id === 'vibes' ? 'Pick one or two vibes.' : 'Please complete this step.')
      return
    }

    if (!isLast) {
      setStepIndex((i) => i + 1)
      setError(null)
      return
    }

    const parsed = quizAnswersSchema.safeParse(answers)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please check your answers.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const plan = await generatePlan(parsed.data)
      await AsyncStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan))
      navigation.replace('Plan', { plan })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.progressLabel}>
          Step {stepIndex + 1} of {quizSteps.length}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.subtitle}>{step.subtitle}</Text>

        <View style={styles.options}>
          {step.id === 'audience' &&
            audienceOptions.map((option) => (
              <Option
                key={option.value}
                selected={answers.audience === option.value}
                title={option.label}
                description={option.description}
                onPress={() => update('audience', option.value)}
              />
            ))}

          {step.id === 'location' && (
            <TextInput
              value={answers.location}
              onChangeText={(text) => update('location', text)}
              placeholder="e.g. Brooklyn, Williamsburg"
              placeholderTextColor={colors.muted}
              style={styles.input}
              autoFocus
            />
          )}

          {step.id === 'occasion' &&
            occasionOptions.map((option) => (
              <Option
                key={option.value}
                selected={answers.occasion === option.value}
                title={option.label}
                onPress={() => update('occasion', option.value)}
              />
            ))}

          {step.id === 'budget' &&
            budgetOptions.map((option) => (
              <Option
                key={option.value}
                selected={answers.budget === option.value}
                title={option.label}
                description={option.description}
                onPress={() => update('budget', option.value)}
              />
            ))}

          {step.id === 'time' &&
            timeOptions.map((option) => (
              <Option
                key={option.value}
                selected={answers.time === option.value}
                title={option.label}
                onPress={() => update('time', option.value)}
              />
            ))}

          {step.id === 'energy' &&
            energyOptions.map((option) => (
              <Option
                key={option.value}
                selected={answers.energy === option.value}
                title={option.label}
                description={option.description}
                onPress={() => update('energy', option.value)}
              />
            ))}

          {step.id === 'vibes' &&
            vibeOptions.map((option) => (
              <Option
                key={option.value}
                selected={answers.vibes.includes(option.value)}
                title={option.label}
                onPress={() => toggleVibe(option.value)}
              />
            ))}

          {step.id === 'constraints' && (
            <TextInput
              value={answers.constraints}
              onChangeText={(text) => update('constraints', text)}
              placeholder="Vegetarian, avoid loud bars…"
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.textarea]}
              multiline
              textAlignVertical="top"
            />
          )}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actions}>
          <Pressable
            style={[styles.secondaryButton, (stepIndex === 0 || loading) && styles.disabled]}
            disabled={stepIndex === 0 || loading}
            onPress={() => {
              setStepIndex((i) => Math.max(0, i - 1))
              setError(null)
            }}
          >
            <Text style={styles.secondaryText}>Back</Text>
          </Pressable>

          <Pressable style={[styles.primaryButton, loading && styles.disabled]} disabled={loading} onPress={goNext}>
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryText}>{isLast ? 'Generate plan' : 'Continue'}</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function Option({
  selected,
  title,
  description,
  onPress,
}: {
  selected: boolean
  title: string
  description?: string
  onPress: () => void
}) {
  return (
    <Pressable style={[styles.option, selected && styles.optionSelected]} onPress={onPress}>
      <Text style={styles.optionTitle}>{title}</Text>
      {description ? <Text style={styles.optionDescription}>{description}</Text> : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  scroll: { padding: 24, paddingBottom: 48 },
  progressLabel: { fontSize: 14, fontWeight: '600', color: colors.rose, marginBottom: 10 },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.border,
    overflow: 'hidden',
    marginBottom: 28,
  },
  progressFill: { height: '100%', backgroundColor: colors.rose },
  title: { fontSize: 30, fontWeight: '600', color: colors.charcoal, marginBottom: 10 },
  subtitle: { fontSize: 16, lineHeight: 24, color: colors.muted, marginBottom: 24 },
  options: { gap: 10 },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionSelected: {
    borderColor: colors.rose,
    backgroundColor: colors.roseSoft,
  },
  optionTitle: { fontSize: 16, fontWeight: '600', color: colors.charcoal },
  optionDescription: { marginTop: 4, fontSize: 14, color: colors.muted },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.charcoal,
  },
  textarea: { minHeight: 120 },
  error: { marginTop: 16, color: colors.rose, fontSize: 14 },
  actions: {
    marginTop: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: colors.creamDark,
  },
  secondaryText: { color: colors.charcoal, fontWeight: '600' },
  primaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: colors.charcoal,
    minWidth: 140,
    alignItems: 'center',
  },
  primaryText: { color: colors.white, fontWeight: '600' },
  disabled: { opacity: 0.5 },
})
