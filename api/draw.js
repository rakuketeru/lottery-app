import { supabase } from './_supabase'

export default async function handler(req, res) {
  const { activityId, userId } = req.query
  if (!activityId || !userId) {
    return res.status(400).json({ error: 'Missing activityId or userId' })
  }

  // 查重
  const { data: existing, error: checkErr } = await supabase
    .from('draw_records')
    .select('*')
    .eq('activity_id', activityId)
    .eq('user_id', userId)
    .maybeSingle()

  if (checkErr) return res.status(500).json({ error: 'Check failed' })
  if (existing) return res.status(200).json({ result: existing.draw_result, duplicate: true })

  // 抽奖逻辑
  const { count: total } = await supabase
    .from('draw_records')
    .select('*', { count: 'exact', head: true })
    .eq('activity_id', activityId)

  const { data: activity } = await supabase
    .from('activities')
    .select('*')
    .eq('id', activityId)
    .maybeSingle()

  if (!activity) return res.status(400).json({ error: 'Invalid activity' })

  const winCount = await supabase
    .from('draw_records')
    .select('*', { count: 'exact', head: true })
    .eq('activity_id', activityId)
    .eq('draw_result', true)

  const remaining = activity.total_limit - total
  const remainingWins = activity.win_limit - winCount.count
  const chance = remainingWins / remaining

  const result = Math.random() < chance

  const { error: insertErr } = await supabase
    .from('draw_records')
    .insert([{ activity_id: activityId, user_id: userId, draw_result: result }])

  if (insertErr) return res.status(500).json({ error: 'Insert failed' })

  res.status(200).json({ result, duplicate: false })
}
