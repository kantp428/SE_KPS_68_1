"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppointment } from "@/hooks/useAppointment";
import { AppointmentSlot } from "@/types/appointment";
import { CalendarIcon, Clock, Loader2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AppointmentPage() {
    const router = useRouter();
    const { loading, error, fetchSlots, bookAppointment } = useAppointment();

    // ตั้งค่าเริ่มต้นเป็นวันที่ปัจจุบัน
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });

    const [slots, setSlots] = useState<AppointmentSlot[]>([]);
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ดึงข้อมูลเมื่อเปลี่ยนวันที่
    useEffect(() => {
        const loadSlots = async () => {
            if (!selectedDate) return;
            try {
                const data = await fetchSlots(selectedDate);
                setSlots(data.slots || []);
                setSelectedTime(""); // รีเซ็ตเวลาที่เลือกเมื่อเปลี่ยนวัน
            } catch (err) {
                // Error ถูกจัดการและโชว์ใน hook แล้วบางส่วน
                setSlots([]);
            }
        };

        loadSlots();
    }, [selectedDate, fetchSlots]);

    const handleBooking = async () => {
        if (!selectedDate || !selectedTime) {
            toast.error("กรุณาเลือกวันที่และเวลาที่ต้องการจอง");
            return;
        }

        try {
            setIsSubmitting(true);
            await bookAppointment({
                date: selectedDate,
                time: selectedTime,
            });
            toast.success("จองคิวสำเร็จ!");
            router.push("/patient"); // พาไปหน้าหลัก หรือหน้าประวัติการจอง
            router.refresh();
        } catch (err) {
            // ถ้าระบบโยน error ออกมา ให้หยุดการทำงานและให้ซับมิทใหม่ได้
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="bg-card rounded-xl border p-6 shadow-sm space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-primary">นัดหมายเข้ารับบริการ</h1>
                <p className="text-muted-foreground text-sm">เลือกวันและเวลาที่คุณสะดวกลงตารางนัดหมาย</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* ส่วนเลือกวันที่ */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-base font-semibold">
                                <CalendarIcon className="w-4 h-4 text-primary" />
                                เลือกวันที่
                            </Label>
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]} // อดีตห้ามจอง
                                className="w-full"
                            />
                        </div>

                        {loading && !isSubmitting && (
                            <div className="flex items-center justify-center py-8 text-primary">
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <span className="ml-2">กำลังโหลดตาราง...</span>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-start gap-2 bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ส่วนแสดงเวลา */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-card rounded-xl border p-6 shadow-sm min-h-[400px]">
                        <div className="flex items-center justify-between mb-6 border-b pb-4">
                            <Label className="flex items-center gap-2 text-base font-semibold">
                                <Clock className="w-4 h-4 text-primary" />
                                เลือกเวลา (1 สล็อต = 1 ชั่วโมง)
                            </Label>
                            <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                                {selectedDate ? new Date(selectedDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : "ยังไม่ได้เลือกวันที่"}
                            </span>
                        </div>

                        {!loading && slots.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                <CalendarIcon className="w-12 h-12 mb-2 opacity-20" />
                                <p>ไม่พบช่วงเวลาให้บริการในวันนี้</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {slots.map((slot) => {
                                    const isSelected = selectedTime === slot.time;

                                    return (
                                        <button
                                            key={slot.time}
                                            disabled={!slot.isAvailable || isSubmitting}
                                            onClick={() => setSelectedTime(slot.time)}
                                            className={`
                                                relative p-4 rounded-xl border flex flex-col items-center justify-center transition-all
                                                ${!slot.isAvailable
                                                    ? 'bg-muted/50 border-muted text-muted-foreground cursor-not-allowed hidden-opacity-50'
                                                    : isSelected
                                                        ? 'bg-primary border-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2'
                                                        : 'bg-card border-border hover:border-primary/50 hover:bg-primary/5 text-foreground'
                                                }
                                            `}
                                        >
                                            <span className="text-xl font-bold tracking-wider">{slot.time}</span>

                                            {!slot.isAvailable && slot.reason && (
                                                <span className="text-[10px] mt-1 text-center leading-tight opacity-70">
                                                    {slot.reason}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* ยืนยันการจอง */}
                        {selectedTime && (
                            <div className="mt-8 pt-6 border-t animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-primary/5 p-4 rounded-xl border border-primary/20">
                                    <div>
                                        <p className="font-semibold text-primary">สรุปการจองของคุณ</p>
                                        <p className="text-sm text-muted-foreground">
                                            วันที่ {new Date(selectedDate).toLocaleDateString('th-TH')} เวลา {selectedTime} - {parseInt(selectedTime.split(':')[0]) + 1}:00 น.
                                        </p>
                                    </div>
                                    <Button
                                        size="lg"
                                        onClick={handleBooking}
                                        disabled={isSubmitting}
                                        className="w-full sm:w-auto shadow-md"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                กำลังดำเนินการ...
                                            </>
                                        ) : (
                                            "ยืนยันการจองคิว"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
