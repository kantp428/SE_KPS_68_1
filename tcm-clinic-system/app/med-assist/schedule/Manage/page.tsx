"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight,
  Search, CalendarDays, Clock, User, CheckCircle2, XCircle, AlertCircle, Calendar
} from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────
type StaffInfo = {
  id: number
  first_name: string
  last_name: string
  staff_role: "DOCTOR" | "MED_ASSISTANT"
}

type WorkSchedule = {
  id: number
  staff_id: number
  date: string
  starttime: string
  endtime: string
  is_active: boolean
  staff: StaffInfo
}

type FormData = {
  staff_id: string
  date: string
  starttime: string
  endtime: string
  is_active: boolean
}

// ── แก้ as any: กำหนด type ให้ activeFilter ชัดเจน ─────────────────────────
type ActiveFilter = "" | "true" | "false"

const ACTIVE_FILTERS: { label: string; value: ActiveFilter }[] = [
  { label: "ทุกสถานะ", value: "" },
  { label: "ทำงาน",   value: "true" },
  { label: "หยุดงาน", value: "false" },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtTime = (t: string) => {
  const [h, m] = t.split(":").map(Number)
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}
const staffFullName = (s: StaffInfo) => `${s.first_name} ${s.last_name}`
const roleLabel = (r: string) => r === "DOCTOR" ? "แพทย์" : r === "MED_ASSISTANT" ? "ผู้ช่วยแพทย์" : r

const MONTH_TH      = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."]
const MONTH_TH_FULL = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
                       "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"]

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate()

// ใช้ local date เสมอ ป้องกัน UTC timezone shift
const fmtLocalDate = (d: Date) => {
  const y  = d.getFullYear()
  const m  = String(d.getMonth()+1).padStart(2,"0")
  const dd = String(d.getDate()).padStart(2,"0")
  return `${y}-${m}-${dd}`
}

const fmtDateTH = (d: string) => {
  const [y, m, day] = d.split("-")
  return `${parseInt(day)} ${MONTH_TH[parseInt(m)-1]} ${parseInt(y)+543}`
}

const getMonthStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)
const getMonthEnd   = (d: Date) => new Date(d.getFullYear(), d.getMonth()+1, 0)

// ── Toast ─────────────────────────────────────────────────────────────────────
type Toast = { id: number; type: "success" | "error"; message: string }
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg text-sm font-medium
            pointer-events-auto animate-in slide-in-from-right-5 duration-300
            ${t.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"}`}>
          {t.type === "success"
            ? <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600"/>
            : <XCircle className="w-4 h-4 shrink-0 text-red-500"/>}
          {t.message}
          <button onClick={() => onRemove(t.id)} className="ml-2 opacity-60 hover:opacity-100">
            <X className="w-3.5 h-3.5"/>
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({
  title, message, onConfirm, onCancel
}: {
  title: string; message: string; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 rounded-xl border border-border bg-card shadow-xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="w-5 h-5 text-red-600"/>
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">{title}</p>
            <p className="text-xs text-muted-foreground mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={onCancel}>ยกเลิก</Button>
          <Button size="sm"
            className="bg-red-600 hover:bg-red-700 text-white border-0"
            onClick={onConfirm}>
            ลบ
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── MiniCalendar ──────────────────────────────────────────────────────────────
function MiniCalendar({
  selected, onSelect, scheduleDates, viewMonth, onViewMonthChange,
}: {
  selected: Date | null
  onSelect: (d: Date) => void
  scheduleDates: Set<string>
  viewMonth: Date
  onViewMonthChange: (d: Date) => void
}) {
  const today = new Date()
  const year  = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const first = new Date(year, month, 1).getDay()
  const days  = new Date(year, month+1, 0).getDate()
  const cells = [...Array(first).fill(null), ...Array.from({length: days}, (_,i) => i+1)]
  while (cells.length % 7 !== 0) cells.push(null)

  const prevMonth = () => {
    const x = new Date(viewMonth); x.setMonth(x.getMonth()-1); onViewMonthChange(x)
  }
  const nextMonth = () => {
    const x = new Date(viewMonth); x.setMonth(x.getMonth()+1); onViewMonthChange(x)
  }

  return (
    <div className="w-full select-none">
      {/* nav */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="rounded p-1 hover:bg-muted transition-colors">
          <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground"/>
        </button>
        <span className="text-xs font-semibold">{MONTH_TH_FULL[month]} {year+543}</span>
        <button onClick={nextMonth} className="rounded p-1 hover:bg-muted transition-colors">
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground"/>
        </button>
      </div>
      {/* day headers */}
      <div className="grid grid-cols-7 mb-1">
        {["อา","จ","อ","พ","พฤ","ศ","ส"].map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground">{d}</div>
        ))}
      </div>
      {/* cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i}/>
          const date    = new Date(year, month, day)
          const dateStr = fmtLocalDate(date)
          const isToday = isSameDay(date, today)
          const isSel   = selected ? isSameDay(date, selected) : false
          const hasDot  = scheduleDates.has(dateStr)
          return (
            <button key={i} onClick={() => onSelect(date)}
              className={`relative mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors
                ${isSel
                  ? "bg-primary text-primary-foreground"
                  : isToday
                  ? "border border-primary text-primary"
                  : "hover:bg-muted text-foreground"}`}>
              {day}
              {hasDot && !isSel && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary opacity-70"/>
              )}
            </button>
          )
        })}
      </div>
      {/* วันนี้ shortcut */}
      <div className="mt-2 border-t border-border pt-2">
        <button
          onClick={() => { onSelect(today); onViewMonthChange(getMonthStart(today)) }}
          className="w-full rounded-md py-1 text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors">
          วันนี้
        </button>
      </div>
    </div>
  )
}

// ── Date Picker Field (popup) ─────────────────────────────────────────────────
function DatePickerField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const today    = new Date()
  const initDate = value ? new Date(value + "T00:00:00") : new Date()
  const [view, setView] = useState(() => { const d=new Date(initDate); d.setDate(1); return d })
  const selected = value ? new Date(value + "T00:00:00") : null

  const year  = view.getFullYear()
  const month = view.getMonth()
  const first = new Date(year,month,1).getDay()
  const days  = new Date(year,month+1,0).getDate()
  const cells = [...Array(first).fill(null), ...Array.from({length:days},(_,i)=>i+1)]
  while (cells.length%7!==0) cells.push(null)

  const displayVal = value
    ? (() => { const [y,m,d]=value.split("-"); return `${parseInt(d)} ${MONTH_TH_FULL[parseInt(m)-1]} ${parseInt(y)+543}` })()
    : "เลือกวันที่"

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
        <CalendarDays className="w-3.5 h-3.5 text-muted-foreground"/> วันที่
      </label>
      <div className="relative">
        <button type="button" onClick={()=>setOpen(v=>!v)}
          className={`w-full flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm transition-colors
            ${open ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-muted-foreground/40"}
            ${value ? "text-foreground" : "text-muted-foreground"}`}>
          <span>{displayVal}</span>
          <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0"/>
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={()=>setOpen(false)}/>
            <div className="absolute left-0 top-[calc(100%+6px)] z-40 w-72 rounded-xl border border-border bg-card shadow-xl p-4 select-none">
              <div className="flex items-center justify-between mb-3">
                <button type="button"
                  onClick={()=>setView(d=>{const x=new Date(d);x.setMonth(x.getMonth()-1);return x})}
                  className="flex h-7 w-7 items-center justify-center rounded hover:bg-muted transition-colors">
                  <ChevronLeft className="w-4 h-4 text-muted-foreground"/>
                </button>
                <span className="text-sm font-semibold text-foreground">
                  {MONTH_TH_FULL[month]} {year+543}
                </span>
                <button type="button"
                  onClick={()=>setView(d=>{const x=new Date(d);x.setMonth(x.getMonth()+1);return x})}
                  className="flex h-7 w-7 items-center justify-center rounded hover:bg-muted transition-colors">
                  <ChevronRight className="w-4 h-4 text-muted-foreground"/>
                </button>
              </div>
              <div className="grid grid-cols-7 mb-1">
                {["อา","จ","อ","พ","พฤ","ศ","ส"].map(d=>(
                  <div key={d} className="text-center text-[11px] font-medium text-muted-foreground py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {cells.map((day,i)=>{
                  if (!day) return <div key={i} className="h-8"/>
                  const date    = new Date(year,month,day)
                  const dateStr = fmtLocalDate(date)
                  const isToday = isSameDay(date,today)
                  const isSel   = selected ? isSameDay(date,selected) : false
                  return (
                    <button type="button" key={i}
                      onClick={()=>{ onChange(dateStr); setOpen(false) }}
                      className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors
                        ${isSel ? "bg-primary text-primary-foreground"
                          : isToday ? "border border-primary text-primary"
                          : "hover:bg-muted text-foreground"}`}>
                      {day}
                    </button>
                  )
                })}
              </div>
              <div className="mt-3 border-t border-border pt-3">
                <button type="button"
                  onClick={()=>{ onChange(fmtLocalDate(new Date())); setOpen(false) }}
                  className="w-full rounded-md py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors">
                  วันนี้
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Form Modal ────────────────────────────────────────────────────────────────
function FormModal({
  mode, initial, staffList, onSave, onClose, loading,
}: {
  mode: "create" | "edit"
  initial?: WorkSchedule
  staffList: StaffInfo[]
  onSave: (data: FormData) => Promise<void>
  onClose: () => void
  loading: boolean
}) {
  const [form, setForm] = useState<FormData>({
    staff_id:  initial ? String(initial.staff_id) : "",
    date:      initial?.date ?? "",
    starttime: initial ? fmtTime(initial.starttime) : "09:00",
    endtime:   initial ? fmtTime(initial.endtime) : "17:00",
    is_active: initial?.is_active ?? true,
  })
  const [err, setErr] = useState("")

  const set = (k: keyof FormData, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (mode === "create" && !form.staff_id) {
      setErr("กรุณาเลือกเจ้าหน้าที่"); return
    }
    if (!form.date || !form.starttime || !form.endtime) {
      setErr("กรุณากรอกข้อมูลให้ครบทุกช่อง"); return
    }
    if (form.starttime >= form.endtime) {
      setErr("เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น"); return
    }
    setErr("")
    await onSave(form)
  }

  const fieldCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-md mx-4 rounded-xl border border-border bg-card shadow-xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">
            {mode === "create" ? "เพิ่มตารางงานใหม่" : "แก้ไขตารางงาน"}
          </h2>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4"/>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {mode === "create" ? (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-muted-foreground"/> เจ้าหน้าที่
              </label>
              <select value={form.staff_id} onChange={e => set("staff_id", e.target.value)} className={fieldCls}>
                <option value="">-- เลือกเจ้าหน้าที่ --</option>
                {staffList.map(s => (
                  <option key={s.id} value={s.id}>
                    {staffFullName(s)} ({roleLabel(s.staff_role)})
                  </option>
                ))}
              </select>
            </div>
          ) : initial?.staff && (
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                {initial.staff.first_name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{staffFullName(initial.staff)}</p>
                <p className="text-xs text-muted-foreground">{roleLabel(initial.staff.staff_role)}</p>
              </div>
            </div>
          )}

          <DatePickerField value={form.date} onChange={v => set("date", v)}/>

          <div className="grid grid-cols-2 gap-3">
            {(["starttime","endtime"] as const).map((key, ki) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  {ki === 0 && <Clock className="w-3.5 h-3.5 text-muted-foreground"/>}
                  {ki === 0 ? "เวลาเริ่ม" : "เวลาสิ้นสุด"}
                </label>
                <select value={form[key]} onChange={e => set(key, e.target.value)} className={fieldCls}>
                  {Array.from({length: 24}, (_, h) =>
                    [0, 30].map(m => {
                      const hh = String(h).padStart(2,"0")
                      const mm = String(m).padStart(2,"0")
                      const val = `${hh}:${mm}`
                      return <option key={val} value={val}>{val}</option>
                    })
                  )}
                </select>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">สถานะกะงาน</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {form.is_active ? "ทำงาน — กะนี้เปิดใช้งาน" : "หยุดงาน — กะนี้ถูกปิดใช้งาน"}
              </p>
            </div>
            <button
              onClick={() => set("is_active", !form.is_active)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${form.is_active ? "bg-primary" : "bg-muted-foreground/30"}`}>
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform
                ${form.is_active ? "translate-x-6" : "translate-x-1"}`}/>
            </button>
          </div>

          {err && (
            <p className="text-xs text-red-600 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0"/>{err}
            </p>
          )}
        </div>
        <div className="flex gap-2 justify-end px-6 py-4 border-t border-border">
          <Button size="sm" variant="outline" onClick={onClose} disabled={loading}>ยกเลิก</Button>
          <Button size="sm" onClick={handleSubmit} disabled={loading}>
            {loading ? "กำลังบันทึก..." : mode === "create" ? "เพิ่มตารางงาน" : "บันทึกการแก้ไข"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ScheduleManagePage() {
  const [schedules,    setSchedules]    = useState<WorkSchedule[]>([])
  const [staffList,    setStaffList]    = useState<StaffInfo[]>([])
  const [loading,      setLoading]      = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [search,       setSearch]       = useState("")
  const [roleFilter,   setRoleFilter]   = useState("")
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("")   // ✅ ไม่ใช้ any แล้ว
  const [page,         setPage]         = useState(1)
  const [total,        setTotal]        = useState(0)
  const [formMode,     setFormMode]     = useState<"create"|"edit"|null>(null)
  const [editing,      setEditing]      = useState<WorkSchedule | null>(null)
  const [confirmId,    setConfirmId]    = useState<number | null>(null)
  const [toasts,       setToasts]       = useState<Toast[]>([])

  // ── MiniCalendar state ───────────────────────────────────────────────────────
  const [showCal,          setShowCal]          = useState(false)
  const [selectedDate,     setSelectedDate]     = useState<Date | null>(() => new Date())
  const [calViewMonth,     setCalViewMonth]     = useState(() => getMonthStart(new Date()))
  const [monthDotDates,    setMonthDotDates]    = useState<Set<string>>(new Set())

  const today = new Date()
  const LIMIT = 10

  // ── toast helpers ────────────────────────────────────────────────────────────
  const addToast = (type: Toast["type"], message: string) => {
    const id = Date.now()
    setToasts(t => [...t, { id, type, message }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }
  const removeToast = (id: number) => setToasts(t => t.filter(x => x.id !== id))

  // ── fetch staff list ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/work-schedule?limit=200")
      .then(r => r.json())
      .then(j => {
        const data: WorkSchedule[] = j.data ?? []
        const map = new Map<number, StaffInfo>()
        data.forEach(s => { if (s.staff && !map.has(s.staff_id)) map.set(s.staff_id, s.staff) })
        setStaffList(Array.from(map.values()).sort((a,b) => a.id - b.id))
      })
      .catch(() => {})
  }, [])

  // ── fetch schedules ──────────────────────────────────────────────────────────
  const fetchSchedules = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
      if (roleFilter)   p.set("role", roleFilter)
      if (activeFilter) p.set("is_active", activeFilter)
      // ถ้าเลือกวันจาก MiniCalendar ให้ filter วันนั้น
      if (selectedDate) {
        const ds = fmtLocalDate(selectedDate)
        p.set("date_from", ds)
        p.set("date_to",   ds)
      }
      const res  = await fetch(`/api/work-schedule?${p}`)
      const json = await res.json()
      setSchedules(json.data ?? [])
      setTotal(json.pagination?.total ?? 0)
    } catch {
      addToast("error", "โหลดข้อมูลไม่สำเร็จ")
    } finally {
      setLoading(false)
    }
  }, [page, roleFilter, activeFilter, selectedDate])

  useEffect(() => { fetchSchedules() }, [fetchSchedules])

  // ── fetch dot dates รายเดือน ──────────────────────────────────────────────
  useEffect(() => {
    const loadMonth = async () => {
      try {
        const from = fmtLocalDate(getMonthStart(calViewMonth))
        const to   = fmtLocalDate(getMonthEnd(calViewMonth))
        const p    = new URLSearchParams({ date_from: from, date_to: to, limit: "500" })
        const res  = await fetch(`/api/work-schedule?${p}`)
        const json = await res.json()
        const data: WorkSchedule[] = json.data ?? []
        setMonthDotDates(new Set(data.filter(s => s.is_active).map(s => s.date)))
      } catch {
        setMonthDotDates(new Set())
      }
    }
    loadMonth()
  }, [calViewMonth])

  // ── create ───────────────────────────────────────────────────────────────────
  const handleCreate = async (data: FormData) => {
    setSaving(true)
    try {
      const res = await fetch("/api/work-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staff_id:  parseInt(data.staff_id),
          date:      data.date,
          starttime: data.starttime + ":00",
          endtime:   data.endtime + ":00",
          is_active: data.is_active,
        }),
      })
      if (!res.ok) throw new Error()
      addToast("success", "เพิ่มตารางงานสำเร็จ")
      setFormMode(null)
      fetchSchedules()
    } catch {
      addToast("error", "เพิ่มตารางงานไม่สำเร็จ")
    } finally {
      setSaving(false)
    }
  }

  // ── update ───────────────────────────────────────────────────────────────────
  const handleUpdate = async (data: FormData) => {
    if (!editing) return
    setSaving(true)
    try {
      const res = await fetch(`/api/work-schedule/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date:      data.date,
          starttime: data.starttime + ":00",
          endtime:   data.endtime + ":00",
          is_active: data.is_active,
        }),
      })
      if (!res.ok) throw new Error()
      addToast("success", "แก้ไขตารางงานสำเร็จ")
      setFormMode(null)
      setEditing(null)
      fetchSchedules()
    } catch {
      addToast("error", "แก้ไขตารางงานไม่สำเร็จ")
    } finally {
      setSaving(false)
    }
  }

  // ── delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (confirmId === null) return
    try {
      const res = await fetch(`/api/work-schedule/${confirmId}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      addToast("success", "ลบตารางงานสำเร็จ")
      setConfirmId(null)
      fetchSchedules()
    } catch {
      addToast("error", "ลบตารางงานไม่สำเร็จ")
    }
  }

  // ── client-side search filter ─────────────────────────────────────────────
  const filtered = schedules.filter(s => {
    if (!search) return true
    const name = staffFullName(s.staff).toLowerCase()
    return name.includes(search.toLowerCase()) || s.date.includes(search)
  })

  const totalPages = Math.ceil(total / LIMIT)

  // ── pick date จาก MiniCalendar ────────────────────────────────────────────
  const pickDate = (d: Date) => {
    setSelectedDate(d)
    setCalViewMonth(getMonthStart(d))
    setPage(1)
    setShowCal(false)
  }
  const clearDate = () => {
    setSelectedDate(null)
    setPage(1)
  }
  const goToday = () => {
    pickDate(today)
  }

  return (
    <div className="space-y-6 p-6">

      {/* header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">จัดการตารางงาน</h1>
          <p className="text-sm text-muted-foreground mt-0.5">เพิ่ม แก้ไข และลบตารางการทำงานของเจ้าหน้าที่</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormMode("create") }} className="gap-2">
          <Plus className="w-4 h-4"/> เพิ่มตารางงาน
        </Button>
      </div>

      {/* filters */}
      <Card className="border border-border bg-card px-4 py-3">
        <div className="flex flex-wrap gap-3 items-center">

          {/* search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ"
              className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {/* role filter */}
          <div className="flex items-center gap-1.5">
            {[
              { label: "ทุก Role", value: "" },
              { label: "แพทย์",   value: "DOCTOR" },
              { label: "ผู้ช่วย", value: "MED_ASSISTANT" },
            ].map(r => (
              <button key={r.value} onClick={() => { setRoleFilter(r.value); setPage(1) }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors
                  ${roleFilter === r.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:bg-muted"}`}>
                {r.label}
              </button>
            ))}
          </div>

          {/* active filter ✅ ไม่มี as any แล้ว */}
          <div className="flex items-center gap-1.5">
            {ACTIVE_FILTERS.map(r => (
              <button key={r.value}
                onClick={() => { setActiveFilter(r.value); setPage(1) }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors
                  ${activeFilter === r.value
                    ? r.value === "false"
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:bg-muted"}`}>
                {r.label}
              </button>
            ))}
          </div>

          {/* ── MiniCalendar + ปุ่มวันนี้ ─────────────────────────────────── */}
          <div className="flex items-center gap-1.5 ml-auto">

            {/* ปุ่มวันนี้ */}
            <Button size="sm" variant="outline" className="h-8 gap-1.5 px-3 text-xs" onClick={goToday}>
              <CalendarDays className="w-3.5 h-3.5"/> วันนี้
            </Button>

            {/* ปุ่มเลือกวันที่ + popup MiniCalendar */}
            <div className="relative">
              <Button size="sm" variant="outline"
                className={`h-8 gap-1.5 px-3 text-xs ${selectedDate ? "border-primary text-primary" : ""}`}
                onClick={() => setShowCal(v => !v)}>
                <Calendar className="w-3.5 h-3.5"/>
                {selectedDate
                  ? fmtDateTH(fmtLocalDate(selectedDate))
                  : "เลือกวันที่"}
              </Button>

              {/* clear selected date */}
              {selectedDate && (
                <button
                  onClick={clearDate}
                  className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] hover:bg-primary/80 transition-colors">
                  <X className="w-2.5 h-2.5"/>
                </button>
              )}

              {showCal && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowCal(false)}/>
                  <div className="absolute right-0 top-10 z-40 w-64 rounded-xl border border-border bg-card shadow-xl p-4">
                    <MiniCalendar
                      selected={selectedDate}
                      onSelect={pickDate}
                      scheduleDates={monthDotDates}
                      viewMonth={calViewMonth}
                      onViewMonthChange={setCalViewMonth}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <span className="text-xs text-muted-foreground">{total} รายการ</span>
        </div>
      </Card>

      {/* selected date badge */}
      {selectedDate && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary px-3 py-1 text-xs font-medium">
            <CalendarDays className="w-3 h-3"/>
            แสดงวันที่: {fmtDateTH(fmtLocalDate(selectedDate))}
          </span>
          <button onClick={clearDate} className="text-xs text-muted-foreground hover:text-foreground underline transition-colors">
            ล้างตัวกรอง
          </button>
        </div>
      )}

      {/* table */}
      <Card className="border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">เจ้าหน้าที่</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">ตำแหน่ง</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">วันที่</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">เวลา</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">สถานะ</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-muted-foreground text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"/>
                      กำลังโหลด...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-muted-foreground text-sm">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => (
                  <tr key={s.id}
                    className={`border-b border-border/50 transition-colors hover:bg-muted/30
                      ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {s.staff.first_name.charAt(0)}
                        </div>
                        <span className="font-medium text-foreground">{staffFullName(s.staff)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium
                        ${s.staff.staff_role === "DOCTOR"
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : "bg-violet-50 border-violet-200 text-violet-700"}`}>
                        {roleLabel(s.staff.staff_role)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground">{fmtDateTH(s.date)}</td>
                    <td className="px-4 py-3 text-foreground font-mono text-xs">
                      {fmtTime(s.starttime)} – {fmtTime(s.endtime)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium
                        ${s.is_active
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-red-50 border-red-200 text-red-600"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.is_active ? "bg-green-500" : "bg-red-400"}`}/>
                        {s.is_active ? "ทำงาน" : "หยุดงาน"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => { setEditing(s); setFormMode("edit") }}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                          <Pencil className="w-3.5 h-3.5"/>
                        </button>
                        <button
                          onClick={() => setConfirmId(s.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">หน้า {page} จาก {totalPages}</p>
            <div className="flex gap-1.5">
              <Button size="icon" variant="outline" className="h-8 w-8"
                disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4"/>
              </Button>
              <Button size="icon" variant="outline" className="h-8 w-8"
                disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4"/>
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* form modal */}
      {formMode && (
        <FormModal
          mode={formMode}
          initial={formMode === "edit" ? editing ?? undefined : undefined}
          staffList={staffList}
          onSave={formMode === "create" ? handleCreate : handleUpdate}
          onClose={() => { setFormMode(null); setEditing(null) }}
          loading={saving}
        />
      )}

      {/* confirm delete */}
      {confirmId !== null && (
        <ConfirmDialog
          title="ยืนยันการลบ"
          message="ตารางงานนี้จะถูกลบถาวร ไม่สามารถกู้คืนได้"
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast}/>
    </div>
  )
}