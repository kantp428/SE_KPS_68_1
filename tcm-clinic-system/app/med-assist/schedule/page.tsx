// วางที่: app/docter/schedule/staff_mode/page.tsx
import PersonalWeeklyCalendar from "@/components/layout/schedule/PersonalWeeklyCalendar"

// ── เปลี่ยน STAFF_ID ให้ตรงกับ staff ที่ login ─────────────────────────────
// TODO: ดึงจาก session/token แทน hardcode
const STAFF_ID = 1

export default function StaffSchedulePage() {
  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="font-sans text-2xl font-bold tracking-tight">ตารางงานของฉัน</h1>
        <p className="text-sm text-muted-foreground mt-0.5">ตารางการทำงานประจำสัปดาห์</p>
      </div>

      <PersonalWeeklyCalendar staffId={STAFF_ID} />
    </div>
  )
}