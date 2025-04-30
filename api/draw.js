import { supabase } from './_supabase'

export default async function handler(req, res) {
  const activityId = req.query.activityId
  const uid = req.query.uid

  if (!activityId || !uid) {
    return res.status(400).json({ error: 'Missing activityId or uid' })
  }

  // 查询是否已抽签
  const { data: existing } = await supabase
    .from('draw_records')
    .select('*')
    .eq('activity_id', activityId)
    .eq('uid', uid)
    .single()

  if (existing) {
    return res.status(200).json({
      alreadyDrawn: true,
      draw_result: existing.draw_result
    })
  }

  // 查询活动信息
  const { data: activity, error: actErr } = await supabase
    .from('activities')
    .select('*')
    .eq('id', activityId)
    .single()

  if (!activity || actErr) {
    return res.status(400).json({ error: 'Invalid activityId' })
  }

  const { count: total } = await supabase
    .from('draw_records')
    .select('*', { count: 'exact', head: true })
    .eq('activity_id', activityId)

  const { count: wins } = await supabase
    .from('draw_records')
    .select('*', { count: 'exact', head: true })
    .eq('activity_id', activityId)
    .eq('draw_result', true)

  if (total >= activity.total_limit) {
    return res.status(403).json({ error: '抽签人数已达上限' })
  }

  const currentWinRate = (activity.win_limit - wins) / (activity.total_limit - total)
  const win = Math.random() < currentWinRate

  const { error: insertErr } = await supabase
    .from('draw_records')
    .insert({ activity_id: activityId, uid, draw_result: win })

  if (insertErr) {
    // 处理并发冲突（如果重复插入失败）
    if (insertErr.message.includes('duplicate key')) {
      const { data: retryRecord } = await supabase
        .from('draw_records')
        .select('*')
        .eq('activity_id', activityId)
        .eq('uid', uid)
        .single()

      return res.status(200).json({
        alreadyDrawn: true,
        draw_result: retryRecord?.draw_result ?? false
      })
    }

    return res.status(500).json({ error: '插入记录失败', detail: insertErr.message })
  }

  return res.status(200).json({ alreadyDrawn: false, draw_result: win })
}
