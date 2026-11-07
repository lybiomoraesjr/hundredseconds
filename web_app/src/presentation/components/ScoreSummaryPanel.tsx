import { Group, Stack, Text } from '@mantine/core'
import type { ScoreSummary } from '../../application/ports/ScoreGateway'
import { messages } from '../i18n/messages'

const format = (value: number | null | undefined) => (value == null ? messages.summary.empty : String(value))

export function ScoreSummaryPanel({ summary }: { summary: ScoreSummary | null }) {
  const rows: Array<[label: string, value: number | null | undefined]> = [
    [messages.summary.personalBest, summary?.personalBest],
    [messages.summary.todayBest, summary?.todayBest],
    [messages.summary.yearBest, summary?.yearBest],
  ]
  return (
    <Stack gap={2} align="flex-end">
      {rows.map(([label, value]) => (
        <Group key={label} gap={6} wrap="nowrap">
          <Text size="sm" c="white">{label}</Text>
          <Text size="sm" fw={700} c="white" miw={24} ta="right">{format(value)}</Text>
        </Group>
      ))}
    </Stack>
  )
}
