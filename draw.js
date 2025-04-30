import { supabase } from './_supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { activityId } = req.body
  if (!activityId) return res.status(400).json({ error: 'Missing activityId' })

  const { data: activity, error: actErr } = await supabase
    .from('activities')
    .select('*')
    .eq('id', activityId)
    .single()

  if (actErr || !activity) return res.status(400).json({ error: 'Invalid activityId' })

  const { count: total } = await supabase
    .from('draw_records')
    .select('*', { count: 'exact', head: true })
    .eq('activity_id', activityId)

  const { count: wins } = await supabase
    .from('draw_records')
    .select('*', { count: 'exact', head: true })
    .eq('activity_id', activityId)
    .eq('draw_result', true)

  if (total >= activity.total_limit)
    return res.status(200).json({ result: false, reason: 'Max participants reached' })

  if (wins >= activity.win_limit)
    return res.status(200).json({ result: false, reason: 'Max winners reached' })

  const chance = activity.win_limit / activity.total_limit
  const result = Math.random() < chance

  const { error: insertErr } = await supabase.from('draw_records').insert({
    activity_id: activityId,
    draw_result: result
  })

  if (insertErr) return res.status(500).json({ error: 'Draw failed' })

  res.status(200).json({ result })
}
