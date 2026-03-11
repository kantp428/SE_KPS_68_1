import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Stethoscope, Leaf, Activity } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-sky-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="w-full p-4 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-50 border-b border-sky-100">
        <div className="text-xl font-bold tracking-tight text-sky-900 flex items-center gap-2">
          <Leaf className="h-6 w-6 text-emerald-600" />
          TCM Clinic System
        </div>
        <Link href="/adminlogin">
          <Button variant="outline" className="text-sky-700 border-sky-200 hover:bg-sky-100">
            สำหรับเจ้าหน้าที่ (Admin)
          </Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-8 mt-10 md:mt-20">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold text-sky-950 tracking-tight">
            ยินดีต้อนรับสู่ <br />
            <span className="text-emerald-600">คลินิกแพทย์แผนจีน</span>
          </h1>
          <p className="text-lg md:text-xl text-sky-800">
            ระบบจัดการคลินิกและบริการทางการแพทย์ที่ทันสมัย รวดเร็ว และปลอดภัย
          </p>
          <div className="pt-6">
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all bg-emerald-600 hover:bg-emerald-700 text-white rounded-full">
                เข้าสู่ระบบสำหรับคนไข้ <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Mock Services Section (Scrollable) */}
      <section className="bg-white/80 py-20 px-8 mt-20">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-sky-900">บริการของเรา (Our Services)</h2>
            <p className="text-sky-600">เรามีบริการทางการแพทย์แผนจีนที่หลากหลายเพื่อสุขภาพที่ดีของคุณ</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-sky-50 space-y-4 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600">
                <Stethoscope className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-sky-900">ตรวจสุขภาพแนวทางจีน</h3>
              <p className="text-sky-700 leading-relaxed text-sm">แมะชีพจร ดูลิ้น และวินิจฉัยโรคตามหลักการแพทย์แผนจีนโบราณ ผสมผสานวิทยาการสมัยใหม่</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-sky-50 space-y-4 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                <Leaf className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-sky-900">ยาสมุนไพรจีน</h3>
              <p className="text-sky-700 leading-relaxed text-sm">จัดตำรับยาสมุนไพรเฉพาะบุคคลตามอาการและธาตุของร่างกาย ปลอดภัยและได้มาตรฐาน</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-sky-50 space-y-4 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-sky-900">ฝังเข็มและครอบแก้ว</h3>
              <p className="text-sky-700 leading-relaxed text-sm">บรรเทาอาการปวด ฟื้นฟูระบบประสาท และปรับการไหลเวียนของเลือดด้วยวิธีธรรมชาติบำบัด</p>
            </div>
          </div>

          {/* More Mock Content for scrolling */}
          <div className="pt-20 space-y-8 text-sky-800">
            <h3 className="text-2xl font-semibold text-center text-sky-900">ทำไมถึงต้องเลือกเรา?</h3>
            <div className="space-y-4 text-center max-w-2xl mx-auto pb-20">
              <p>คลินิกของเราให้ความสำคัญกับการรักษาที่ต้นเหตุของโรค ไม่ใช่เพียงบรรเทาอาการ เรามีทีมแพทย์ผู้เชี่ยวชาญที่มีประสบการณ์ยาวนาน</p>
              <p>เครื่องมือที่สะอาด ได้มาตรฐาน ควบคู่กับสมุนไพรคุณภาพสูงที่คุณสามารถวางใจได้</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sky-900 text-sky-100 py-8 text-center text-sm">
        <p>© 2026 TCM Clinic System. All rights reserved.</p>
      </footer>
    </div>
  );
}
