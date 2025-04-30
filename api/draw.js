import { supabase } from './_supabase'

export default async function handler(req, res) {
  console.log('🎯 DRAW REQUEST METHOD:', req.method)
  console.log('📨 DRAW REQUEST BODY:', req.body)

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' })
  }

  const { activityId, uid } = req.body

  if (!activityId || !uid) {
    return res.status(400).json({ error: 'Missing activityId or uid' })
  }

  // ✅ 检查是否已抽签
  const { data: existing, error: existErr } = await supabase
    .from('draw_records')
    .select('*')
    .eq('activity_id', activityId)
    .eq('uid', uid)
    .maybeSingle()

  if (existing) {
    console.log('⚠️ Already drawn:', existing)
    return res.status(200).json({ alreadyDrawn: true, draw_result: existing.draw_result })
  }

  // ✅ 查询活动
  const { data: activity, error: actErr } = await supabase
    .from('activities')
    .select('*')
    .eq('id', activityId)
    .single()

  if (!activity || actErr) {
    console.error('❌ Activity not found or error:', actErr)
    return res.status(400).json({ error: 'Invalid activityId' })
  }

  // ✅ 查询已抽签人数
  const { count: total } = await supabase
    .from('draw_records')
    .select('*', { count: 'exact', head: true })
    .eq('activity_id', activityId)

  // ✅ 查询已中签人数
  const { count: wins } = await supabase
    .from('draw_records')
    .select('*', { count: 'exact', head: true })
    .eq('activity_id', activityId)
    .eq('draw_result', true)

  if (total >= activity.total_limit) {
    console.log('⚠️ Total draw limit reached')
    return res.status(403).json({ error: '抽签人数已达上限' })
  }

  // ✅ 计算当前中奖率
  const currentWinRate = (activity.win_limit - wins) / (activity.total_limit - total)
  const drawResult = Math.random() < currentWinRate
  console.log('🎲 DRAW RESULT:', drawResult, 'Win rate:', currentWinRate)

  // ✅ 插入抽签记录
  const { data: inserted, error: insertErr } = await supabase
    .from('draw_records')
    .insert({
      activity_id: activityId,
      uid: uid,
      draw_result: drawResult,
    })
    .select() // 必须加，确保插入的字段都生效

  if (insertErr) {
    console.error('❌ Insert error:', insertErr)
    return res.status(500).json({ error: '插入失败', detail: insertErr.message })
  }

  console.log('✅ Inserted draw record:', inserted)

  return res.status(200).json({ alreadyDrawn: false, draw_result: drawResult })
}
