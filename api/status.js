import { supabase } from './_supabase'

export default async function handler(req, res) {
  const activityId = req.query.activityId
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

  res.status(200).json({
    title: activity.title,
    total_limit: activity.total_limit,
    win_limit: activity.win_limit,
    total,
    win: wins
  })
}
