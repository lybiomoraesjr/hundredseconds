import { Button, Center, Group, Loader, Modal, Paper, Table, Tabs, Text, Title } from '@mantine/core'
import { useEffect, useState } from 'react'
import { useAppServices } from '../../application/AppServices'
import type { LeaderboardEntry } from '../../application/ports/ScoreGateway'
import { LeaderboardPeriod, type GameMode } from '../../domain'
import { messages } from '../i18n/messages'

const PERIODS = [LeaderboardPeriod.USER, LeaderboardPeriod.DAY, LeaderboardPeriod.WEEK, LeaderboardPeriod.YEAR]

interface HighscoresModalProps {
  mode: GameMode
  onClose: () => void
}

/** Mounted only while open, so every opening loads fresh data. */
export function HighscoresModal({ mode, onClose }: HighscoresModalProps) {
  const { scoreGateway } = useAppServices()
  const [period, setPeriod] = useState<LeaderboardPeriod>(LeaderboardPeriod.USER)
  const [loaded, setLoaded] = useState<{ key: string; entries: LeaderboardEntry[] } | null>(null)

  const requestKey = `${mode}:${period}`
  // While the selected tab has not loaded yet, show the loader
  const entries = loaded?.key === requestKey ? loaded.entries : null

  useEffect(() => {
    let active = true
    scoreGateway.getLeaderboard(mode, period)
      .then((result) => active && setLoaded({ key: `${mode}:${period}`, entries: result }))
      .catch(() => active && setLoaded({ key: `${mode}:${period}`, entries: [] }))
    return () => {
      active = false
    }
  }, [mode, period, scoreGateway])

  return (
    <Modal opened onClose={onClose} size="lg" centered
      title={<Text fw={700}>{messages.highscores} · {messages.modes[mode]}</Text>}
      closeButtonProps={{ 'aria-label': messages.leaderboard.close }}>
      <Tabs value={period} onChange={(value) => value && setPeriod(value as LeaderboardPeriod)}>
        <Tabs.List mb="md">
          {PERIODS.map((p) => <Tabs.Tab key={p} value={p}>{messages.leaderboard.tabs[p]}</Tabs.Tab>)}
        </Tabs.List>
      </Tabs>

      <Paper withBorder radius="lg" p="md">
        <Title order={4} ta="center" mb="sm">{messages.leaderboard.titles[period]}</Title>
        {entries === null ? (
          <Center py="lg"><Loader size="sm" aria-label={messages.leaderboard.loading} /></Center>
        ) : entries.length === 0 ? (
          <Text ta="center" c="dimmed" py="lg">{messages.leaderboard.empty}</Text>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={50} />
                <Table.Th>{messages.leaderboard.name}</Table.Th>
                <Table.Th ta="right">{messages.leaderboard.score}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {entries.map((entry) => (
                <Table.Tr key={`${entry.rank}-${entry.playedAt}`}>
                  <Table.Td>{entry.rank}.</Table.Td>
                  <Table.Td>{entry.playerName}</Table.Td>
                  <Table.Td ta="right" fw={700}>{entry.score}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <Group justify="center" mt="md">
        <Button variant="default" onClick={onClose}>{messages.leaderboard.back}</Button>
      </Group>
    </Modal>
  )
}
