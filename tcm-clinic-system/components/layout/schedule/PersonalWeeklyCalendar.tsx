"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CalendarDays, Calendar, Clock, X } from "lucide-react"

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

// ── Constants ─────────────────────────────────────────────────────────────────
const SLOT_START  = 8
const SLOT_END    = 18
const TOTAL_SLOTS = SLOT_END - SLOT_START
const LANE_H      = 40
const DAY_COL_W   = 100

const HOURS          = Array.from({ length: TOTAL_SLOTS }, (_, i) => SLOT_START + i)
const DAY_LABELS     = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
const DAY_LABELS_TH  = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"]
const MONTH_NAMES    = ["January","February","March","April","May","June",
                        "July","August","September","October","November","December"]
const MONTH_NAMES_TH = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
                        "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"]

// ── Helpers ───────────────────────────────────────────────────────────────────
const parseTimeH  = (t: string) => { const [h,m]=t.split(":").map(Number); return h+m/60 }
const fmtTime     = (t: string) => { const [h,m]=t.split(":").map(Number); return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}` }
const parseDate   = (s: string) => { const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d) }
const isSameDay   = (a: Date, b: Date) => a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()
const addDays     = (d: Date, n: number) => { const x=new Date(d); x.setDate(x.getDate()+n); return x }
const getWeekStart = (d: Date) => { const x=new Date(d); x.setDate(x.getDate()-x.getDay()); x.setHours(0,0,0,0); return x }
const fmtMonthYear = (s: Date, e: Date) =>
  s.getMonth()===e.getMonth()
    ? `${MONTH_NAMES[s.getMonth()]} ${s.getFullYear()}`
    : `${MONTH_NAMES[s.getMonth()]} – ${MONTH_NAMES[e.getMonth()]} ${e.getFullYear()}`
const fmtFullDateTH = (d: Date) =>
  `วัน${DAY_LABELS_TH[d.getDay()]}ที่ ${d.getDate()} ${MONTH_NAMES_TH[d.getMonth()]} ${d.getFullYear()+543}`

// ── Layout ────────────────────────────────────────────────────────────────────
type LayoutItem = WorkSchedule & { laneIndex: number; totalLanes: number }

function layoutDay(events: WorkSchedule[]): LayoutItem[] {
  if (!events.length) return []
  const sorted = [...events].sort((a,b)=>parseTimeH(a.starttime)-parseTimeH(b.starttime))
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

// ── MiniCalendar ──────────────────────────────────────────────────────────────
function MiniCalendar({
  selected, onSelect, scheduleDates,
}: {
  selected: Date
  onSelect: (d: Date) => void
  scheduleDates: Set<string>
}) {
  const [view, setView] = useState(() => { const d=new Date(selected); d.setDate(1); return d })
  const today = new Date()
  const year = view.getFullYear(), month = view.getMonth()
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
        <span className="text-xs font-semibold">{MONTH_NAMES_TH[month]} {year+543}</span>
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

// ── DetailModal ───────────────────────────────────────────────────────────────
function DetailModal({ ev, onClose }: { ev: WorkSchedule; onClose: ()=>void }) {
  const dur = Math.round((parseTimeH(ev.endtime)-parseTimeH(ev.starttime))*60)
  const hrs = Math.floor(dur/60), mins = dur%60
  const durLabel = hrs > 0
    ? (mins > 0 ? `${hrs} ชม. ${mins} นาที` : `${hrs} ชม.`)
    : `${mins} นาที`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-sm mx-4 rounded-xl border border-border bg-card shadow-xl" onClick={e=>e.stopPropagation()}>
        <div className={`h-1.5 w-full rounded-t-xl ${ev.is_active?"bg-blue-100 border-b border-blue-200":"bg-red-50 border-b border-red-200"}`}/>
        <div className="flex items-start justify-between px-5 pt-4 pb-2">
          <p className="text-sm font-bold text-foreground">รายละเอียดตารางงาน</p>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4"/>
          </button>
        </div>
        <div className="px-5 pb-5 space-y-4">
          <div className={`rounded-lg px-4 py-3 ${ev.is_active?"bg-blue-50 border border-blue-200":"bg-red-50 border border-red-200"}`}>
            <p className={`text-base font-bold ${ev.is_active?"text-blue-800":"text-red-700"}`}>
              {fmtFullDateTH(parseDate(ev.date))}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Clock className={`w-3.5 h-3.5 ${ev.is_active?"text-blue-500":"text-red-400"}`}/>
              <p className={`text-sm font-semibold ${ev.is_active?"text-blue-700":"text-red-600"}`}>
                {fmtTime(ev.starttime)} – {fmtTime(ev.endtime)}
              </p>
              <span className={`text-xs ${ev.is_active?"text-blue-500":"text-red-400"}`}>· {durLabel}</span>
            </div>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium
            ${ev.is_active?"bg-green-50 border-green-200 text-green-700":"bg-red-50 border-red-200 text-red-600"}`}>
            <span className={`w-2 h-2 rounded-full ${ev.is_active?"bg-green-400":"bg-red-400"}`}/>
            {ev.is_active ? "ทำงาน" : "หยุดงาน"}
          </div>
          {ev.is_active && (
            <p className="text-xs text-muted-foreground">
              💡 หากต้องการเปลี่ยนแปลงตารางงาน กรุณาติดต่อผู้ดูแลระบบ
            </p>
          )}
        </div>
        <div className="border-t border-border px-5 py-3 flex justify-end">
          <Button size="sm" variant="outline" onClick={onClose} className="h-8 text-xs">ปิด</Button>
        </div>
      </div>
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface StaffWeeklyCalendarProps {
  staffId:    number
  staffName?: string
  /**
   * "staff"  (default) — แสดงครบ: สถานะทำงาน/หยุด, modal รายละเอียด, legend
   * "public"           — แสดงแค่ชื่อ + เวลา, ไม่มี modal, ไม่แสดงสถานะ
   */
  mode?: "staff" | "public"
}

// ── Main Component (export) ───────────────────────────────────────────────────
export default function StaffWeeklyCalendar({ staffId, staffName: nameProp, mode = "staff" }: StaffWeeklyCalendarProps) {
  const [weekStart,  setWeekStart]  = useState(() => getWeekStart(new Date()))
  const [selected,   setSelected]   = useState<WorkSchedule | null>(null)
  const [showCal,    setShowCal]    = useState(false)
  const [schedules,  setSchedules]  = useState<WorkSchedule[]>([])
  const [loading,    setLoading]    = useState(false)
  const [staffName,  setStaffName]  = useState(nameProp ?? "")

  const today    = new Date()
  const weekDays = Array.from({length:7},(_,i)=>addDays(weekStart,i))
  const weekEnd  = weekDays[6]

  const prevWeek = () => setWeekStart(d=>addDays(d,-7))
  const nextWeek = () => setWeekStart(d=>addDays(d, 7))
  const goToday  = () => { setWeekStart(getWeekStart(today)); setShowCal(false) }
  const pickDate = (d: Date) => { setWeekStart(getWeekStart(d)); setShowCal(false) }

  // ── fetch ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const from = weekStart.toISOString().slice(0,10)
        const to   = addDays(weekStart,6).toISOString().slice(0,10)
        const p    = new URLSearchParams({
          staff_id:  String(staffId),
          date_from: from,
          date_to:   to,
          limit:     "100",
        })
        const res  = await fetch(`/api/work-schedule?${p}`)
        const json = await res.json()
        const data: WorkSchedule[] = json.data ?? []
        setSchedules(data)
        if (!nameProp && data.length > 0 && data[0].staff) {
          setStaffName(`${data[0].staff.first_name} ${data[0].staff.last_name}`)
        }
      } catch(e) {
        console.error(e)
        setSchedules([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [weekStart, staffId])

  // ── derived ─────────────────────────────────────────────────────────────────
  const weekSchedules  = schedules.filter(s => weekDays.some(d => isSameDay(parseDate(s.date), d)))
  const activeCount    = weekSchedules.filter(s=>s.is_active).length
  const inactiveCount  = weekSchedules.filter(s=>!s.is_active).length
  const totalMins      = weekSchedules.filter(s=>s.is_active)
    .reduce((acc,s)=>acc+Math.round((parseTimeH(s.endtime)-parseTimeH(s.starttime))*60), 0)
  const totalHrs       = Math.floor(totalMins/60)
  const remMins        = totalMins % 60

  const dayLayouts     = weekDays.map(day => layoutDay(schedules.filter(s => isSameDay(parseDate(s.date), day))))
  const daySchedules   = weekDays.map(day => schedules.filter(s => isSameDay(parseDate(s.date), day)))
  const scheduleDates  = new Set(schedules.filter(s=>s.is_active).map(s=>s.date))
  const gridCols       = `${DAY_COL_W}px repeat(${TOTAL_SLOTS}, 1fr)`

  // role label
  const firstStaff = schedules[0]?.staff
  const roleLabel  = firstStaff?.staff_role === "DOCTOR" ? "แพทย์" : firstStaff?.staff_role === "MED_ASSISTANT" ? "ผู้ช่วยแพทย์" : ""

  return (
    <div className="space-y-4">

      {/* staff name banner */}
      {staffName && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-base">
            {staffName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-tight">{staffName}</p>
            {roleLabel && mode === "staff" && (
              <p className="text-xs text-muted-foreground mt-0.5">{roleLabel}</p>
            )}
          </div>
          {mode === "staff" && (
            <div className="ml-auto text-right">
              <p className="text-[10px] text-muted-foreground">Staff ID</p>
              <p className="text-xs font-semibold text-foreground">#{staffId}</p>
            </div>
          )}
        </div>
      )}

      {/* summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="border border-border px-4 py-3">
          <p className="text-xs text-muted-foreground font-medium">วันทำงานสัปดาห์นี้</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {activeCount}<span className="text-sm font-normal text-muted-foreground ml-1">วัน</span>
          </p>
        </Card>
        <Card className="border border-border px-4 py-3">
          <p className="text-xs text-muted-foreground font-medium">ชั่วโมงรวม</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {totalHrs}<span className="text-sm font-normal text-muted-foreground ml-1">ชม.</span>
            {remMins>0&&<span className="text-sm font-normal text-muted-foreground"> {remMins} น.</span>}
          </p>
        </Card>
        {mode === "staff" && (
          <Card className="border border-border px-4 py-3 col-span-2 sm:col-span-1">
            <p className="text-xs text-muted-foreground font-medium">วันหยุด / หยุดงาน</p>
            <p className={`text-2xl font-bold mt-1 ${inactiveCount > 0 ? "text-red-500" : "text-foreground"}`}>
              {inactiveCount}<span className="text-sm font-normal text-muted-foreground ml-1">วัน</span>
            </p>
          </Card>
        )}
      </div>

      {/* calendar card */}
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
              const maxLanes  = layout.length ? Math.max(...layout.map(e=>e.totalLanes)) : 1
              const rowH      = Math.max(maxLanes * LANE_H, LANE_H)

              return (
                <div key={di}
                  style={{ display:"grid", gridTemplateColumns: gridCols }}
                  className={`border-b border-border ${isWeekend?"bg-muted/10":""}`}>

                  {/* day label */}
                  <div style={{ height: rowH }}
                    className={`border-r border-border flex items-center justify-center px-2 gap-2
                      ${isWeekend?"bg-muted/30":"bg-muted/10"}`}>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold
                      ${isToday
                        ? "bg-primary text-primary-foreground"
                        : isWeekend ? "bg-muted text-muted-foreground"
                        : "text-foreground"}`}>
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
                      parseTimeH(ev.starttime) >= hour && parseTimeH(ev.starttime) < hour+1
                    )
                    return (
                      <div key={hi} className="relative border-l border-border" style={{ height: rowH }}>
                        {startHere.map(ev=>{
                          const startH   = parseTimeH(ev.starttime)
                          const endH     = parseTimeH(ev.endtime)
                          const duration = endH - startH
                          const GAP      = 2
                          return (
                            <div key={ev.id}
                              onClick={mode==="staff" ? ()=>setSelected(ev) : undefined}
                              className={`absolute rounded border overflow-hidden z-10
                                flex items-center gap-1.5 px-2
                                transition-all hover:brightness-95 hover:shadow-md hover:z-20
                                ${mode==="staff"?"cursor-pointer":"cursor-default"}
                                ${mode==="public"
                                  ? "bg-blue-50 border-blue-300 text-blue-700"
                                  : ev.is_active
                                    ? "bg-blue-50 border-blue-300 text-blue-700"
                                    : "bg-red-50 border-red-300 text-red-500"}`}
                              style={{
                                top:    ev.laneIndex * LANE_H + GAP,
                                height: LANE_H - GAP * 2,
                                left:   `calc(${(startH-hour)*100}% + 1px)`,
                                width:  `calc(${duration*100}% - 3px)`,
                              }}>
                              <span className="w-2 h-2 rounded-full shrink-0 bg-blue-400"/>
                              <span className="truncate text-[11px] font-semibold leading-none">
                                {staffName || `Staff #${ev.staff_id}`}
                              </span>
                              <span className="shrink-0 text-[10px] opacity-60 whitespace-nowrap ml-0.5">
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
        {mode === "staff" && (
          <div className="flex items-center gap-4 border-t border-border px-4 py-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400"/>ทำงาน
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400"/>หยุดงาน
            </span>
            <span className="flex items-center gap-1.5 ml-auto">
              กดที่กะงานเพื่อดูรายละเอียด
            </span>
          </div>
        )}
      </Card>

      {mode === "staff" && selected && <DetailModal ev={selected} onClose={()=>setSelected(null)}/>}
    </div>
  )
}