import { supabase } from './_supabase.js'

export default async function handler(req, res) {
  const activityId = req.query.activityId
  if (req.method !== 'POST' || !activityId) {
    return res.status(400).json({ error: 'Invalid request' })
  }

  const { data: activity, error: activityErr } = await supabase
    .from('activities')
    .select('*')
    .eq('id', activityId)
    .single()

  if (activityErr || !activity) {
    return res.status(400).json({ error: 'Invalid activityId' })
  }

  const { count: totalDraws } = await supabase
    .from('draw_records')
    .select('*', { count: 'exact', head: true })
    .eq('activity_id', activityId)

  const { count: winDraws } = await supabase
    .from('draw_records')
    .select('*', { count: 'exact', head: true })
    .eq('activity_id', activityId)
    .eq('draw_result', true)

  if (totalDraws >= activity.total_limit) {
    return res.status(400).json({ error: '抽签人数已满' })
  }

  const remainSlots = activity.win_limit - winDraws
  const remainPeople = activity.total_limit - totalDraws
  const winChance = remainSlots / remainPeople

  const draw_result = Math.random() < winChance

  const { data, error } = await supabase
    .from('draw_records')
    .insert([{ activity_id: activityId, draw_result }])
    .select()
    .single()

  if (error) {
    return res.status(500).json({ error: '数据库插入失败' })
  }

  res.status(200).json(data)
}
