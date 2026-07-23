import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { DatePlan } from '@betterdate/shared'

export type RootStackParamList = {
  Home: undefined
  Quiz: undefined
  Plan: { plan: DatePlan }
}

export type RootNavigation = NativeStackNavigationProp<RootStackParamList>
