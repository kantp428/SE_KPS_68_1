"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CalendarDays, Calendar, X, Clock, User } from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────
export type StaffInfo = {
  id:         number
  first_name: string
  last_name:  string
  staff_role: "DOCTOR" | "MED_ASSISTANT"
}

export type WorkSchedule = {
  id:        number
  staff_id:  number
  date:      string   // "YYYY-MM-DD"
  starttime: string   // "HH:mm:ss"
  endtime:   string   // "HH:mm:ss"
  is_active: boolean
  staff:     StaffInfo
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const staffFullName = (s: WorkSchedule) => `${s.staff.first_name} ${s.staff.last_name}`

const STAFF_COLORS = [
  { bg:"bg-blue-50",    border:"border-blue-300",    text:"text-blue-700",    dot:"#3b82f6" },
  { bg:"bg-emerald-50", border:"border-emerald-300", text:"text-emerald-700", dot:"#10b981" },
  { bg:"bg-violet-50",  border:"border-violet-300",  text:"text-violet-700",  dot:"#8b5cf6" },
  { bg:"bg-rose-50",    border:"border-rose-300",    text:"text-rose-700",    dot:"#f43f5e" },
  { bg:"bg-amber-50",   border:"border-amber-300",   text:"text-amber-700",   dot:"#f59e0b" },
  { bg:"bg-cyan-50",    border:"border-cyan-300",    text:"text-cyan-700",    dot:"#06b6d4" },
]
// assign color by staff_id (consistent across renders)
const getStyle = (staff_id: number) => STAFF_COLORS[(staff_id - 1) % STAFF_COLORS.length]

// ── Constants ─────────────────────────────────────────────────────────────────
const SLOT_START  = 8
const SLOT_END    = 18
const TOTAL_SLOTS = SLOT_END - SLOT_START
const LANE_H      = 36
const MIN_ROW_H   = 44
const DAY_COL_W   = 110

const HOURS = Array.from({ length: TOTAL_SLOTS }, (_, i) => SLOT_START + i)
const DAY_LABELS  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
const MONTH_NAMES = ["January","February","March","April","May","June",
                     "July","August","September","October","November","December"]
const MONTH_TH    = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
                     "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"]
const DAY_TH      = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"]

const ROLES = [
  { label: "ทั้งหมด",       value: "" },
  { label: "แพทย์",         value: "DOCTOR" },
  { label: "ผู้ช่วยแพทย์", value: "MED_ASSISTANT" },
]

// ── Date helpers ──────────────────────────────────────────────────────────────
const parseTimeH  = (t: string) => { const [h,m] = t.split(":").map(Number); return h + m/60 }
const fmtTime     = (t: string) => { const [h,m] = t.split(":").map(Number); return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}` }
const parseDate   = (s: string) => { const [y,m,d] = s.split("-").map(Number); return new Date(y,m-1,d) }
const isSameDay   = (a: Date, b: Date) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate()
const addDays     = (d: Date, n: number) => { const x=new Date(d); x.setDate(x.getDate()+n); return x }
const getWeekStart = (d: Date) => { const x=new Date(d); x.setDate(x.getDate()-x.getDay()); x.setHours(0,0,0,0); return x }
const fmtMonthYear = (s: Date, e: Date) =>
  s.getMonth()===e.getMonth()
    ? `${MONTH_NAMES[s.getMonth()]} ${s.getFullYear()}`
    : `${MONTH_NAMES[s.getMonth()]} – ${MONTH_NAMES[e.getMonth()]} ${e.getFullYear()}`
const fmtFullDateTH = (d: Date) =>
  `วัน${DAY_TH[d.getDay()]}ที่ ${d.getDate()} ${MONTH_TH[d.getMonth()]} ${d.getFullYear()+543}`

// ── Layout (overlap lanes) ────────────────────────────────────────────────────
type LayoutItem = WorkSchedule & { laneIndex: number; totalLanes: number }

function layoutDay(events: WorkSchedule[]): LayoutItem[] {
  if (!events.length) return []
  const sorted = [...events].sort((a,b) => parseTimeH(a.starttime)-parseTimeH(b.starttime))
  const lanes: WorkSchedule[][] = []
  for (const ev of sorted) {
    let placed = false
    for (const lane of lanes) {
      if (parseTimeH(ev.starttime) >= parseTimeH(lane[lane.length-1].endtime)) {
        lane.push(ev); placed=true; break
      }
    }
    if (!placed) lanes.push([ev])
  }
  const result: LayoutItem[] = []
  for (let li=0; li<lanes.length; li++) {
    for (const ev of lanes[li]) {
      const evS = parseTimeH(ev.starttime), evE = parseTimeH(ev.endtime)
      const concurrent = lanes.filter(lane =>
        lane.some(x => parseTimeH(x.starttime)<evE && parseTimeH(x.endtime)>evS)
      ).length
      result.push({ ...ev, laneIndex: li, totalLanes: concurrent })
    }
  }
  return result
}

// ── Mini Calendar ─────────────────────────────────────────────────────────────
function MiniCalendar({
  selected, onSelect, scheduleDates,
}: {
  selected: Date
  onSelect: (d: Date) => void
  scheduleDates: Set<string>
}) {
  const [view, setView] = useState(() => { const d=new Date(selected); d.setDate(1); return d })
  const today = new Date()
  const year  = view.getFullYear(), month = view.getMonth()
  const first = new Date(year,month,1).getDay()
  const days  = new Date(year,month+1,0).getDate()
  const cells = [...Array(first).fill(null), ...Array.from({length:days},(_,i)=>i+1)]
  while (cells.length%7!==0) cells.push(null)

  return (
    <div className="w-full select-none">
      <div className="flex items-center justify-between mb-2">
        <button onClick={()=>setView(d=>{const x=new Date(d);x.setMonth(x.getMonth()-1);return x})}
          className="rounded p-1 hover:bg-muted transition-colors">
          <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground"/>
        </button>
        <span className="text-xs font-semibold">{MONTH_TH[month]} {year+543}</span>
        <button onClick={()=>setView(d=>{const x=new Date(d);x.setMonth(x.getMonth()+1);return x})}
          className="rounded p-1 hover:bg-muted transition-colors">
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground"/>
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {["อา","จ","อ","พ","พฤ","ศ","ส"].map(d=>(
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day,i)=>{
          if (!day) return <div key={i}/>
          const date    = new Date(year,month,day)
          const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`
          const isToday = isSameDay(date,today)
          const isSel   = isSameDay(date,selected)
          return (
            <button key={i} onClick={()=>onSelect(date)}
              className={`relative mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors
                ${isSel?"bg-primary text-primary-foreground":isToday?"border border-primary text-primary":"hover:bg-muted text-foreground"}`}>
              {day}
              {scheduleDates.has(dateStr)&&!isSel&&(
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary opacity-70"/>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Role label helper ─────────────────────────────────────────────────────────
const ROLE_LABEL: Record<string, { label: string; color: string }> = {
  DOCTOR:        { label: "แพทย์",          color: "bg-blue-50 border-blue-200 text-blue-700" },
  MED_ASSISTANT: { label: "ผู้ช่วยแพทย์",  color: "bg-violet-50 border-violet-200 text-violet-700" },
}
const getRoleDisplay = (role: string) =>
  ROLE_LABEL[role] ?? { label: role, color: "bg-muted border-border text-muted-foreground" }

// ── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({ ev, onClose }: { ev: WorkSchedule; onClose: ()=>void }) {
  const st   = getStyle(ev.staff_id)
  const dur  = Math.round((parseTimeH(ev.endtime)-parseTimeH(ev.starttime))*60)
  const role = getRoleDisplay(ev.staff.staff_role)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-sm mx-4 rounded-xl border border-border bg-card shadow-xl" onClick={e=>e.stopPropagation()}>
        <div className={`h-1.5 w-full rounded-t-xl ${st.bg} border-b ${st.border}`}/>
        <div className="flex items-start justify-between px-5 pt-4 pb-3">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">รายละเอียดตารางงาน</p>
            <h2 className={`text-lg font-bold ${st.text}`}>{staffFullName(ev)}</h2>
            <span className={`inline-flex items-center mt-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${role.color}`}>
              {role.label}
            </span>
          </div>
          <button onClick={onClose} className="mt-0.5 rounded-md p-1 text-muted-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4"/>
          </button>
        </div>
        <div className="px-5 pb-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground"/>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">วันที่</p>
              <p className="text-sm font-semibold text-foreground">{fmtFullDateTH(parseDate(ev.date))}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
              <Clock className="w-3.5 h-3.5 text-muted-foreground"/>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">เวลา</p>
              <p className="text-sm font-semibold text-foreground">
                {fmtTime(ev.starttime)} – {fmtTime(ev.endtime)}
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">({dur} นาที)</span>
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
              <User className="w-3.5 h-3.5 text-muted-foreground"/>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">ผู้รับผิดชอบ</p>
              <p className="text-sm font-semibold text-foreground">
                {staffFullName(ev)}
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">(staff_id: {ev.staff_id})</span>
              </p>
            </div>
          </div>
          <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium
            ${ev.is_active?"bg-green-50 border-green-300 text-green-700":"bg-red-50 border-red-300 text-red-700"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${ev.is_active?"bg-green-500":"bg-red-500"}`}/>
            {ev.is_active?"ทำงาน":"หยุดงาน"}
          </div>
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground space-y-0.5">
            <p><span className="font-medium text-foreground">staff_id:</span> {ev.staff_id}</p>
            <p><span className="font-medium text-foreground">date:</span> {ev.date}</p>
            <p><span className="font-medium text-foreground">starttime:</span> {ev.starttime}</p>
            <p><span className="font-medium text-foreground">endtime:</span> {ev.endtime}</p>
          </div>
        </div>
        <div className="border-t border-border px-5 py-3 flex justify-end">
          <Button size="sm" variant="outline" onClick={onClose} className="h-8 text-xs">ปิด</Button>
        </div>
      </div>
    </div>
  )
}

// ── WeeklyCalendar Component (export) ─────────────────────────────────────────
export default function WeeklyCalendar() {
  const [weekStart,    setWeekStart]    = useState(() => getWeekStart(new Date()))
  const [selected,     setSelected]     = useState<WorkSchedule | null>(null)
  const [showCal,      setShowCal]      = useState(false)
  const [selectedRole, setSelectedRole] = useState("")
  const [schedules,    setSchedules]    = useState<WorkSchedule[]>([])
  const [loading,      setLoading]      = useState(false)

  const today    = new Date()
  const weekDays = Array.from({length:7},(_,i)=>addDays(weekStart,i))
  const weekEnd  = weekDays[6]

  const prevWeek = () => setWeekStart(d=>addDays(d,-7))
  const nextWeek = () => setWeekStart(d=>addDays(d, 7))
  const goToday  = () => { setWeekStart(getWeekStart(today)); setShowCal(false) }
  const pickDate = (d: Date) => { setWeekStart(getWeekStart(d)); setShowCal(false) }

  // ── fetch API ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const from = weekStart.toISOString().slice(0,10)
        const to   = addDays(weekStart,6).toISOString().slice(0,10)
        const p    = new URLSearchParams({ date_from: from, date_to: to, limit: "200" })
        if (selectedRole) p.set("role", selectedRole)

        const res  = await fetch(`/api/work-schedule?${p}`)
        const json = await res.json()
        setSchedules(json.data ?? [])
      } catch(e) {
        console.error(e)
        setSchedules([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [weekStart, selectedRole])

  // ── layout ──────────────────────────────────────────────────────────────────
  const dayLayouts = weekDays.map(day =>
    layoutDay(schedules.filter(s => s.is_active && isSameDay(parseDate(s.date), day)))
  )
  const rowHeights = dayLayouts.map(layout => {
    const max = layout.length ? Math.max(...layout.map(e=>e.totalLanes)) : 1
    return Math.max(max * LANE_H, MIN_ROW_H)
  })
  const visibleStaff = Array.from(
    new Map(weekDays.flatMap((_,di)=>dayLayouts[di]).map(s=>[s.staff_id,s])).values()
  )
  const scheduleDates = new Set(schedules.filter(s=>s.is_active).map(s=>s.date))
  const gridCols = `${DAY_COL_W}px repeat(${TOTAL_SLOTS}, 1fr)`

  return (
    <div className="space-y-4 p-6">

      {/* header + role filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-sans text-2xl font-bold tracking-tight">ตารางงานประจำสัปดาห์</h1>
        <div className="flex items-center gap-1.5">
          {ROLES.map(r => (
            <button key={r.value} onClick={()=>setSelectedRole(r.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors
                ${selectedRole===r.value
                  ?"bg-primary text-primary-foreground border-primary"
                  :"bg-card text-muted-foreground border-border hover:bg-muted"}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="rounded-md border border-border bg-card overflow-hidden">

        {/* toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={prevWeek}>
              <ChevronLeft className="w-4 h-4"/>
            </Button>
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={nextWeek}>
              <ChevronRight className="w-4 h-4"/>
            </Button>
            <Button size="sm" variant="outline" className="h-8 gap-1.5 px-3 text-xs" onClick={goToday}>
              <CalendarDays className="w-3.5 h-3.5"/>วันนี้
            </Button>
          </div>
          <span className="text-sm font-semibold text-foreground">{fmtMonthYear(weekStart,weekEnd)}</span>
          <div className="relative">
            <Button size="sm" variant="outline" className="h-8 gap-1.5 px-3 text-xs" onClick={()=>setShowCal(v=>!v)}>
              <Calendar className="w-3.5 h-3.5"/>เลือกวันที่
            </Button>
            {showCal && (
              <div className="absolute right-0 top-10 z-40 w-64 rounded-xl border border-border bg-card shadow-xl p-4">
                <MiniCalendar selected={weekStart} onSelect={pickDate} scheduleDates={scheduleDates}/>
              </div>
            )}
          </div>
        </div>

        {/* loading */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"/>
            กำลังโหลดข้อมูล...
          </div>
        )}

        {/* grid */}
        <div className={loading ? "opacity-40 pointer-events-none" : ""}>
          <div>
            {/* hour header */}
            <div style={{ display:"grid", gridTemplateColumns: gridCols }}
              className="border-b border-border bg-muted/50 sticky top-0 z-20">
              <div className="border-r border-border"/>
              {HOURS.map(h=>(
                <div key={h} className="border-l border-border px-1 py-2 text-center text-xs font-medium text-muted-foreground">
                  {String(h).padStart(2,"0")}:00
                </div>
              ))}
            </div>

            {/* day rows */}
            {weekDays.map((day,di)=>{
              const isToday   = isSameDay(day,today)
              const isWeekend = day.getDay()===0||day.getDay()===6
              const layout    = dayLayouts[di]
              const rowH      = rowHeights[di]

              return (
                <div key={di}
                  style={{ display:"grid", gridTemplateColumns: gridCols }}
                  className={`border-b border-border ${isWeekend?"bg-muted/10":""}`}>

                  {/* day label */}
                  <div style={{ height: rowH, minHeight: MIN_ROW_H }}
                    className={`border-r border-border flex items-center justify-center px-2 gap-2
                      ${isWeekend?"bg-muted/30":"bg-muted/10"}`}>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold
                      ${isToday?"bg-primary text-primary-foreground":isWeekend?"text-muted-foreground/40":"text-foreground"}`}>
                      {day.getDate()}
                    </span>
                    <div className="flex flex-col leading-tight min-w-0">
                      <span className={`text-[11px] font-semibold uppercase tracking-wide truncate
                        ${isWeekend?"text-muted-foreground/50":"text-foreground"}`}>
                        {DAY_LABELS[day.getDay()]}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60 truncate">
                        {MONTH_NAMES[day.getMonth()].slice(0,3)} {day.getFullYear()}
                      </span>
                    </div>
                  </div>

                  {/* hour cells */}
                  {HOURS.map((hour,hi)=>{
                    const startHere = layout.filter(ev =>
                      parseTimeH(ev.starttime)>=hour && parseTimeH(ev.starttime)<hour+1
                    )
                    return (
                      <div key={hi}
                        className="relative border-l border-border hover:bg-muted/20 transition-colors"
                        style={{ height: rowH, minHeight: MIN_ROW_H }}>
                        {startHere.map(ev=>{
                          const st        = getStyle(ev.staff_id)
                          const startH    = parseTimeH(ev.starttime)
                          const endH      = parseTimeH(ev.endtime)
                          const duration  = endH - startH
                          const GAP       = 2
                          const laneTopPx = ev.laneIndex * LANE_H + GAP
                          const laneHPx   = LANE_H - GAP * 2
                          const offsetPct = (startH - hour) * 100
                          const widthPct  = duration * 100
                          return (
                            <div key={ev.id}
                              onClick={()=>setSelected(ev)}
                              className={`absolute rounded border cursor-pointer overflow-hidden z-10
                                flex items-center gap-1.5 px-2
                                transition-all hover:brightness-95 hover:shadow-md hover:z-20
                                ${st.bg} ${st.border} ${st.text}`}
                              style={{
                                top:    laneTopPx,
                                height: laneHPx,
                                left:   `calc(${offsetPct}% + 1px)`,
                                width:  `calc(${widthPct}% - 3px)`,
                              }}>
                              <span className="w-2 h-2 rounded-full shrink-0" style={{background:st.dot}}/>
                              <span className="truncate text-[11px] font-semibold leading-none">
                                {staffFullName(ev)}
                              </span>
                              <span className="shrink-0 text-[10px] opacity-60 whitespace-nowrap">
                                {fmtTime(ev.starttime)}–{fmtTime(ev.endtime)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* legend */}
        {!loading && visibleStaff.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
            {visibleStaff.map(s=>{
              const st = getStyle(s.staff_id)
              return (
                <div key={s.staff_id}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-medium ${st.bg} ${st.border} ${st.text}`}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{background:st.dot}}/>
                  {staffFullName(s)}
                  <span className="opacity-60">· {getRoleDisplay(s.staff.staff_role).label}</span>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {selected && <DetailModal ev={selected} onClose={()=>setSelected(null)}/>}
    </div>
  )
}