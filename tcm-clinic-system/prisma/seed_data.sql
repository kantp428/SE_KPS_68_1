-- TCM Clinic System Mockup Data (PostgreSQL)
-- Generated for prisma/schema.prisma
-- Quantity: ~20 records per table

TRUNCATE TABLE "work_schedule", "invoice_item", "treatment", "invoice", "appointment", "health_profile", "staff", "patient", "room", "service", "medicine", "account" RESTART IDENTITY CASCADE;

-- 1. account (45 records: 5 Admin, 10 Staff, 30 Patient)
INSERT INTO "account" (username, email, password_hash, account_role) VALUES
('admin01', 'admin01@tcm.com', '$2y$10$S9S.f2.h/S9S.f2.h/S9S.un8K.8K.8K.8K.8K.8K.8K.8K.8K.8K', 'ADMIN'),
('admin02', 'admin02@tcm.com', '$2y$10$S9S.f2.h/S9S.f2.h/S9S.un8K.8K.8K.8K.8K.8K.8K.8K.8K.8K', 'ADMIN'),
('doc_somsak', 'somsak@tcm.com', '$2y$10$S9S.f2.h/S9S.f2.h/S9S.un8K.8K.8K.8K.8K.8K.8K.8K.8K.8K', 'STAFF'),
('doc_virai', 'virai@tcm.com', '$2y$10$S9S.f2.h/S9S.f2.h/S9S.un8K.8K.8K.8K.8K.8K.8K.8K.8K.8K', 'STAFF'),
('doc_chai', 'chai@tcm.com', '$2y$10$S9S.f2.h/S9S.f2.h/S9S.un8K.8K.8K.8K.8K.8K.8K.8K.8K.8K', 'STAFF'),
('doc_malee', 'malee@tcm.com', '$2y$10$S9S.f2.h/S9S.f2.h/S9S.un8K.8K.8K.8K.8K.8K.8K.8K.8K.8K', 'STAFF'),
('doc_ananda', 'ananda@tcm.com', '$2y$10$S9S.f2.h/S9S.f2.h/S9S.un8K.8K.8K.8K.8K.8K.8K.8K.8K.8K', 'STAFF'),
('asst_nana', 'nana@tcm.com', '$2y$10$S9S.f2.h/S9S.f2.h/S9S.un8K.8K.8K.8K.8K.8K.8K.8K.8K.8K', 'STAFF'),
('asst_kwan', 'kwan@tcm.com', '$2y$10$S9S.f2.h/S9S.f2.h/S9S.un8K.8K.8K.8K.8K.8K.8K.8K.8K.8K', 'STAFF'),
('asst_joy', 'joy@tcm.com', '$2y$10$S9S.f2.h/S9S.f2.h/S9S.un8K.8K.8K.8K.8K.8K.8K.8K.8K.8K', 'STAFF'),
('asst_pim', 'pim@tcm.com', '$2y$10$S9S.f2.h/S9S.f2.h/S9S.un8K.8K.8K.8K.8K.8K.8K.8K.8K.8K', 'STAFF'),
('asst_note', 'note@tcm.com', '$2y$10$S9S.f2.h/S9S.f2.h/S9S.un8K.8K.8K.8K.8K.8K.8K.8K.8K.8K', 'STAFF');

-- Insert more patients
DO $$
BEGIN
    FOR i IN 1..30 LOOP
        INSERT INTO "account" (username, email, password_hash, account_role) 
        VALUES ('patient'||i, 'patient'||i||'@example.com', '$2y$10$S9S.f2.h/S9S.f2.h/S9S.un8K.8K.8K.8K.8K.8K.8K.8K.8K.8K', 'PATIENT');
    END LOOP;
END $$;

-- 2. staff (10 records)
INSERT INTO "staff" (first_name, last_name, gender, phone_number, staff_role, account_id) VALUES
('สมศักดิ์', 'ใจดี', 'MALE', '0811112222', 'DOCTOR', 3),
('วิไล', 'รักษ์ธรรม', 'FEMALE', '0811113333', 'DOCTOR', 4),
('ชัย', 'สถาพร', 'MALE', '0811114444', 'DOCTOR', 5),
('มาลี', 'ศรีสุข', 'FEMALE', '0811115555', 'DOCTOR', 6),
('อนันดา', 'เอเวอร์', 'MALE', '0811116666', 'DOCTOR', 7),
('นานา', 'จันทร์ขาว', 'FEMALE', '0821112222', 'MED_ASSISTANT', 8),
('ขวัญ', 'เรียม', 'FEMALE', '0821113333', 'MED_ASSISTANT', 9),
('จอย', 'สดใส', 'FEMALE', '0821114444', 'MED_ASSISTANT', 10),
('พิม', 'พรรณ', 'FEMALE', '0821115555', 'MED_ASSISTANT', 11),
('โน้ต', 'อุดม', 'MALE', '0821116666', 'MED_ASSISTANT', 12);

-- 3. patient (20 records)
INSERT INTO "patient" (first_name, last_name, thai_id, birthdate, gender, phone_number, blood_group, chronic_disease, account_id) VALUES
('สมชาย', 'สายลม', '1100101111111', '1980-01-01', 'MALE', '0901111111', 'A', 'ไม่มี', 13),
('สมหญิง', 'ยอดดี', '1100101111112', '1985-05-12', 'FEMALE', '0901111112', 'B', 'เบาหวาน', 14),
('กิตติ', 'เก่งกาจ', '1100101111113', '1992-08-20', 'MALE', '0901111113', 'O', 'ไม่มี', 15),
('ดวงใจ', 'แสงดาว', '1100101111114', '1975-03-15', 'FEMALE', '0901111114', 'AB', 'ความดัน', 16),
('ประเสริฐ', 'เลิศล้ำ', '1100101111115', '1988-11-30', 'MALE', '0901111115', 'O', 'ภูมิแพ้', 17),
('วิภา', 'ปัญญา', '1100101111116', '1995-07-07', 'FEMALE', '0901111116', 'A', 'ไม่มี', 18),
('อานนท์', 'ผลดี', '1100101111117', '1982-12-25', 'MALE', '0901111117', 'B', 'ไม่มี', 19),
('สุนทรี', 'มีสุข', '1100101111118', '1960-04-10', 'FEMALE', '0901111118', 'O', 'ไขมันในเลือดสูง', 20),
('ไพโรจน์', 'รุ่งเรือง', '1100101111119', '1978-09-18', 'MALE', '0901111119', 'AB', 'ไม่มี', 21),
('กนกวรรณ', 'ขวัญใจ', '1100101111120', '1990-02-14', 'FEMALE', '0901111120', 'A', 'หอบหืด', 22),
('วีระ', 'พานิช', '1100101111121', '1984-06-22', 'MALE', '0901111121', 'B', 'ไม่มี', 23),
('ศิริพร', 'พรสวรรค์', '1100101111122', '1989-10-05', 'FEMALE', '0901111122', 'O', 'ไม่มี', 24),
('ธนา', 'วาทิน', '1100101111123', '1972-01-30', 'MALE', '0901111123', 'A', 'ไม่มี', 25),
('นารี', 'รัตนา', '1100101111124', '1998-04-14', 'FEMALE', '0901111124', 'AB', 'ไม่มี', 26),
('สุรชัย', 'สมบัติ', '1100101111125', '1981-08-08', 'MALE', '0901111125', 'O', 'ไม่มี', 27),
('จันทร์จิรา', 'ปันผล', '1100101111126', '1993-11-11', 'FEMALE', '0901111126', 'B', 'ไม่มี', 28),
('อาคม', 'คงกระพัน', '1100101111127', '1965-02-28', 'MALE', '0901111127', 'A', 'โรคหัวใจ', 29),
('เบญจมาศ', 'บานเย็น', '1100101111128', '1987-05-19', 'FEMALE', '0901111128', 'O', 'ไม่มี', 30),
('บุญส่ง', 'ตรงไป', '1100101111129', '1970-07-04', 'MALE', '0901111129', 'AB', 'ไม่มี', 31),
('มณี', 'เงินดี', '1100101111130', '1991-03-12', 'FEMALE', '0901111130', 'B', 'ไม่มี', 32);

-- 4. room (10 records)
INSERT INTO "room" (name, status) VALUES
('ห้องตรวจ 1', 'AVAILABLE'),
('ห้องตรวจ 2', 'AVAILABLE'),
('ห้องตรวจ 3', 'AVAILABLE'),
('ห้องฝังเข็ม A', 'AVAILABLE'),
('ห้องฝังเข็ม B', 'AVAILABLE'),
('ห้องนวดทุยหนา 1', 'AVAILABLE'),
('ห้องนวดทุยหนา 2', 'AVAILABLE'),
('ห้องครอบแก้ว', 'AVAILABLE'),
('ห้องทำกายภาพ', 'AVAILABLE'),
('ห้องสังเกตอาการ', 'AVAILABLE');

-- 5. service (8 records)
INSERT INTO "service" (name, price, duration_minute) VALUES
('ตรวจวินิจฉัย (Initial Consultation)', 300.00, 20),
('ฝังเข็ม (Acupuncture)', 500.00, 45),
('ครอบแก้ว (Cupping)', 350.00, 30),
('นวดทุยหนา (Tuina)', 600.00, 60),
('กัวซา (Gua Sha)', 300.00, 30),
('อบสมุนไพร (Herbal Steam)', 400.00, 40),
('ฝังเข็มร่วมกับกระตุ้นไฟฟ้า', 700.00, 45),
('พอกยาสมุนไพร', 450.00, 30);

-- 6. medicine (20 records)
INSERT INTO "medicine" (name, description, price) VALUES
('ปาเจินถัง (Ba Zhen Tang)', 'บำรุงเลือดและลมปราณ', 250.00),
('กุ้ยผีถัง (Gui Pi Tang)', 'บำรุงม้าม บำรุงเลือด ช่วยการนอนหลับ', 280.00),
('เซียวเหยาซ่าน (Xiao Yao San)', 'ระบายตับ แก้เครียด ประจำเดือนไม่ปกติ', 220.00),
('ลิ่วเว่ยตี้หวงหวัน (Liu Wei Di Huang Wan)', 'บำรุงยินของตับและไต', 300.00),
('ปู่จงอี้ชี่ถัง (Bu Zhong Yi Qi Tang)', 'บำรุงลมปราณส่วนกลาง แก้เหนื่อยล้า', 260.00),
('จินกุ้ยเซิ่นชี่หวัน (Jin Gui Shen Qi Wan)', 'บำรุงหยางของไต', 320.00),
('อิ๋นเฉียวซ่าน (Yin Qiao San)', 'แก้หวัดลมร้อน เจ็บคอ', 150.00),
('เก๋อกินทาง (Ge Gen Tang)', 'แก้ปวดต้นคอ หวัดลมหนาว', 180.00),
('เสวียฟู่จู้อวี๋ถัง (Xue Fu Zhu Yu Tang)', 'สลายเลือดคั่ง แก้เจ็บหน้าอก', 350.00),
('หลงต่านเสียกันถัง (Long Dan Xie Gan Tang)', 'ระบายความร้อนตับและถุงน้ำดี', 240.00),
('อวี้ผิงเฟิงซ่าน (Yu Ping Feng San)', 'เสริมภูมิคุ้มกัน ป้องกันหวัด', 200.00),
('เทียนหมาโกวเถิงอิ่น (Tian Ma Gou Teng Yin)', 'สยบลมตับ ลดความดัน แก้เวียนหัว', 380.00),
('ผิงเว่ยซ่าน (Ping Wei San)', 'ลดความชื้นในม้ามและกระเพาะ', 190.00),
('อู่หลิงซ่าน (Wu Ling San)', 'ขับปัสสาวะ ลดอาการบวมน้ำ', 210.00),
('ชวนซยุงฉาเตี่ยวซ่าน (Chuan Xiong Cha Tiao San)', 'แก้ปวดหัวจากลมภายนอก', 160.00),
('เซิงไม่ส่าน (Sheng Mai San)', 'บำรุงยินและลมปราณหัวใจ', 270.00),
('ซิ่งซูซ่าน (Xing Su San)', 'แก้ไอจากลมแล้ง', 140.00),
('ป้านเซี่ยโฮ่วพัวถัง (Ban Xia Hou Po Tang)', 'แก้ลมปราณติดขัดที่คอ (ความรู้สึกติดคอ)', 230.00),
('เป่าเหอหวัน (Bao He Wan)', 'ช่วยย่อยอาหาร แก้ท้องอืด', 130.00),
('ฟู่จื่อหลี่จงหวัน (Fu Zi Li Zhong Wan)', 'บำรุงหยางกระเพาะและม้าม แก้ท้องเสียจากความเย็น', 290.00);

-- 7. health_profile (20 records)
INSERT INTO "health_profile" (patient_id, weight, height, bp, vitals, symptoms, date_time) VALUES
(1, 70.5, 175.0, 120, '{"temp": 36.5, "pulse": 72}', 'ปวดหลังส่วนล่าง', NOW() - INTERVAL '10 days'),
(2, 55.2, 160.0, 135, '{"temp": 36.8, "pulse": 80}', 'ปวดประจำเดือน', NOW() - INTERVAL '9 days'),
(3, 68.0, 172.0, 118, '{"temp": 36.4, "pulse": 68}', 'นอนไม่หลับ', NOW() - INTERVAL '8 days'),
(4, 62.3, 158.0, 145, '{"temp": 36.7, "pulse": 82}', 'เวียนศีรษะ', NOW() - INTERVAL '7 days'),
(5, 80.1, 180.0, 125, '{"temp": 36.6, "pulse": 75}', 'ภูมิแพ้อากาศ', NOW() - INTERVAL '6 days'),
(6, 48.5, 155.0, 110, '{"temp": 36.5, "pulse": 70}', 'ท้องอืด อาหารไม่ย่อย', NOW() - INTERVAL '5 days'),
(7, 75.0, 178.0, 122, '{"temp": 36.4, "pulse": 74}', 'ปวดบ่าไหล่', NOW() - INTERVAL '4 days'),
(8, 60.0, 162.0, 150, '{"temp": 36.8, "pulse": 85}', 'มือเท้าชา', NOW() - INTERVAL '3 days'),
(9, 85.4, 175.0, 130, '{"temp": 36.6, "pulse": 78}', 'เจ็บเข่า', NOW() - INTERVAL '2 days'),
(10, 52.0, 159.0, 115, '{"temp": 36.5, "pulse": 72}', 'ไอเรื้อรัง', NOW() - INTERVAL '1 day'),
(11, 72.0, 170.0, 128, '{"temp": 36.6, "pulse": 76}', 'ปวดคอ', NOW()),
(12, 58.0, 163.0, 112, '{"temp": 36.4, "pulse": 70}', 'ใจสั่น', NOW()),
(13, 78.5, 176.0, 140, '{"temp": 36.7, "pulse": 80}', 'หน้ามืด', NOW()),
(14, 47.0, 157.0, 105, '{"temp": 36.5, "pulse": 65}', 'อ่อนเพลีย', NOW()),
(15, 65.0, 168.0, 120, '{"temp": 36.6, "pulse": 74}', 'ปวดกระเพาะ', NOW()),
(16, 54.0, 161.0, 125, '{"temp": 36.8, "pulse": 78}', 'คันตามผิวหนัง', NOW()),
(17, 90.0, 182.0, 155, '{"temp": 36.9, "pulse": 88}', 'หอบเหนื่อย', NOW()),
(18, 50.5, 158.0, 118, '{"temp": 36.5, "pulse": 72}', 'ปวดไมเกรน', NOW()),
(19, 73.0, 174.0, 132, '{"temp": 36.6, "pulse": 76}', 'ท้องผูก', NOW()),
(20, 56.5, 164.0, 122, '{"temp": 36.7, "pulse": 74}', 'ตาแห้ง', NOW());

-- 8. appointment (20 records)
INSERT INTO "appointment" (patient_id, datetime, status) VALUES
(1, CURRENT_DATE + INTERVAL '1 day 09:00:00', 'CONFIRMED'),
(2, CURRENT_DATE + INTERVAL '1 day 10:00:00', 'CONFIRMED'),
(3, CURRENT_DATE + INTERVAL '1 day 11:00:00', 'CONFIRMED'),
(4, CURRENT_DATE + INTERVAL '1 day 13:00:00', 'CONFIRMED'),
(5, CURRENT_DATE + INTERVAL '1 day 14:00:00', 'CONFIRMED'),
(6, CURRENT_DATE + INTERVAL '2 days 09:00:00', 'CONFIRMED'),
(7, CURRENT_DATE + INTERVAL '2 days 10:00:00', 'CONFIRMED'),
(8, CURRENT_DATE + INTERVAL '2 days 11:00:00', 'CONFIRMED'),
(9, CURRENT_DATE + INTERVAL '2 days 13:00:00', 'CONFIRMED'),
(10, CURRENT_DATE + INTERVAL '2 days 14:00:00', 'CONFIRMED'),
(11, CURRENT_DATE + INTERVAL '3 days 09:00:00', 'CONFIRMED'),
(12, CURRENT_DATE + INTERVAL '3 days 10:00:00', 'CONFIRMED'),
(13, CURRENT_DATE + INTERVAL '3 days 11:00:00', 'CONFIRMED'),
(14, CURRENT_DATE + INTERVAL '3 days 13:00:00', 'CONFIRMED'),
(15, CURRENT_DATE + INTERVAL '3 days 14:00:00', 'CONFIRMED'),
(16, CURRENT_DATE + INTERVAL '4 days 09:00:00', 'CONFIRMED'),
(17, CURRENT_DATE + INTERVAL '4 days 10:00:00', 'CONFIRMED'),
(18, CURRENT_DATE + INTERVAL '4 days 11:00:00', 'CONFIRMED'),
(19, CURRENT_DATE + INTERVAL '4 days 13:00:00', 'CONFIRMED'),
(20, CURRENT_DATE + INTERVAL '4 days 14:00:00', 'CONFIRMED');

-- 9. treatment (20 records)
INSERT INTO "treatment" (health_profile_id, patient_id, doctor_id, service_id, room_id, treatment_status, start_at, end_at) VALUES
(1, 1, 1, 2, 4, 'COMPLETED', NOW() - INTERVAL '10 days 1 hour', NOW() - INTERVAL '10 days'),
(2, 2, 2, 3, 8, 'COMPLETED', NOW() - INTERVAL '9 days 1 hour', NOW() - INTERVAL '9 days'),
(3, 3, 3, 4, 6, 'COMPLETED', NOW() - INTERVAL '8 days 1 hour', NOW() - INTERVAL '8 days'),
(4, 4, 4, 7, 5, 'COMPLETED', NOW() - INTERVAL '7 days 1 hour', NOW() - INTERVAL '7 days'),
(5, 5, 5, 5, 10, 'COMPLETED', NOW() - INTERVAL '6 days 1 hour', NOW() - INTERVAL '6 days'),
(6, 6, 1, 1, 1, 'COMPLETED', NOW() - INTERVAL '5 days 1 hour', NOW() - INTERVAL '5 days'),
(7, 7, 2, 2, 4, 'COMPLETED', NOW() - INTERVAL '4 days 1 hour', NOW() - INTERVAL '4 days'),
(8, 8, 3, 3, 8, 'COMPLETED', NOW() - INTERVAL '3 days 1 hour', NOW() - INTERVAL '3 days'),
(9, 9, 4, 4, 6, 'COMPLETED', NOW() - INTERVAL '2 days 1 hour', NOW() - INTERVAL '2 days'),
(10, 10, 5, 1, 2, 'COMPLETED', NOW() - INTERVAL '1 day 1 hour', NOW() - INTERVAL '1 day'),
(11, 11, 1, 2, 4, 'IN_PROGRESS', NOW() - INTERVAL '30 minutes', NULL),
(12, 12, 2, 4, 6, 'IN_PROGRESS', NOW() - INTERVAL '20 minutes', NULL),
(13, 13, 3, 3, 8, 'FOLLOW_UP', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days - 30 minutes'),
(14, 14, 4, 1, 3, 'COMPLETED', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours 30 minutes'),
(15, 15, 5, 8, 9, 'COMPLETED', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours 30 minutes'),
(16, 16, 1, 5, 10, 'COMPLETED', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours 30 minutes'),
(17, 17, 2, 7, 5, 'COMPLETED', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '5 hours 30 minutes'),
(18, 18, 3, 2, 4, 'COMPLETED', NOW() - INTERVAL '7 hours', NOW() - INTERVAL '6 hours 30 minutes'),
(19, 19, 4, 3, 8, 'COMPLETED', NOW() - INTERVAL '8 hours', NOW() - INTERVAL '7 hours 30 minutes'),
(20, 20, 5, 4, 7, 'COMPLETED', NOW() - INTERVAL '9 hours', NOW() - INTERVAL '8 hours 30 minutes');

-- 10. invoice (20 records)
INSERT INTO "invoice" (patient_id, total_amount, status, created_at) VALUES
(1, 750.00, 'PAID', NOW() - INTERVAL '10 days'),
(2, 630.00, 'PAID', NOW() - INTERVAL '9 days'),
(3, 880.00, 'PAID', NOW() - INTERVAL '8 days'),
(4, 1000.00, 'PAID', NOW() - INTERVAL '7 days'),
(5, 500.00, 'PAID', NOW() - INTERVAL '6 days'),
(6, 450.00, 'PAID', NOW() - INTERVAL '5 days'),
(7, 750.00, 'PAID', NOW() - INTERVAL '4 days'),
(8, 560.00, 'PAID', NOW() - INTERVAL '3 days'),
(9, 950.00, 'UNPAID', NOW() - INTERVAL '2 days'),
(10, 300.00, 'UNPAID', NOW() - INTERVAL '1 day'),
(14, 450.00, 'PAID', NOW() - INTERVAL '2 hours'),
(15, 600.00, 'PAID', NOW() - INTERVAL '3 hours'),
(16, 500.00, 'PAID', NOW() - INTERVAL '4 hours'),
(17, 1050.00, 'UNPAID', NOW() - INTERVAL '5 hours'),
(18, 700.00, 'PAID', NOW() - INTERVAL '6 hours'),
(19, 510.00, 'PAID', NOW() - INTERVAL '7 hours'),
(20, 920.00, 'UNPAID', NOW() - INTERVAL '8 hours'),
(11, 0.00, 'UNPAID', NOW()),
(12, 0.00, 'UNPAID', NOW()),
(13, 350.00, 'UNPAID', NOW() - INTERVAL '2 days');

-- 11. invoice_item (approx 40 records)
INSERT INTO "invoice_item" (invoice_id, medicine_id, treatment_id, quantity, unit_price) VALUES
(1, NULL, 1, 1, 500.00), (1, 1, NULL, 1, 250.00),
(2, NULL, 2, 1, 350.00), (2, 3, NULL, 1, 280.00),
(3, NULL, 3, 1, 600.00), (3, 4, NULL, 1, 280.00),
(4, NULL, 4, 1, 700.00), (4, 12, NULL, 1, 300.00),
(5, NULL, 5, 1, 300.00), (5, 11, NULL, 1, 200.00),
(6, NULL, 6, 1, 300.00), (6, 7, NULL, 1, 150.00),
(7, NULL, 7, 1, 500.00), (7, 1, NULL, 1, 250.00),
(8, NULL, 8, 1, 350.00), (8, 14, NULL, 1, 210.00),
(9, NULL, 9, 1, 600.00), (9, 9, NULL, 1, 350.00),
(10, NULL, 10, 1, 300.00),
(11, NULL, 14, 1, 300.00), (11, 7, NULL, 1, 150.00),
(12, NULL, 15, 1, 450.00), (12, 7, NULL, 1, 150.00),
(13, NULL, 16, 1, 300.00), (13, 11, NULL, 1, 200.00),
(14, NULL, 17, 1, 700.00), (14, 12, NULL, 1, 350.00),
(15, NULL, 18, 1, 500.00), (15, 11, NULL, 1, 200.00),
(16, NULL, 19, 1, 350.00), (16, 15, NULL, 1, 160.00),
(17, NULL, 20, 1, 600.00), (17, 6, NULL, 1, 320.00),
(20, NULL, 13, 1, 350.00);

-- 12. work_schedule (20 records - 5 doctors for 4 days)
INSERT INTO "work_schedule" (staff_id, date, starttime, endtime, is_active) VALUES
(1, CURRENT_DATE, '09:00:00', '17:00:00', true),
(1, CURRENT_DATE + 1, '09:00:00', '17:00:00', true),
(1, CURRENT_DATE + 2, '09:00:00', '17:00:00', true),
(1, CURRENT_DATE + 3, '09:00:00', '17:00:00', true),
(2, CURRENT_DATE, '09:00:00', '17:00:00', true),
(2, CURRENT_DATE + 1, '09:00:00', '17:00:00', true),
(2, CURRENT_DATE + 2, '09:00:00', '17:00:00', true),
(2, CURRENT_DATE + 3, '09:00:00', '17:00:00', true),
(3, CURRENT_DATE, '09:00:00', '17:00:00', true),
(3, CURRENT_DATE + 1, '09:00:00', '17:00:00', true),
(3, CURRENT_DATE + 2, '09:00:00', '17:00:00', true),
(3, CURRENT_DATE + 3, '09:00:00', '17:00:00', true),
(4, CURRENT_DATE, '09:00:00', '17:00:00', true),
(4, CURRENT_DATE + 1, '09:00:00', '17:00:00', true),
(4, CURRENT_DATE + 2, '09:00:00', '17:00:00', true),
(4, CURRENT_DATE + 3, '09:00:00', '17:00:00', true),
(5, CURRENT_DATE, '09:00:00', '17:00:00', true),
(5, CURRENT_DATE + 1, '09:00:00', '17:00:00', true),
(5, CURRENT_DATE + 2, '09:00:00', '17:00:00', true),
(5, CURRENT_DATE + 3, '09:00:00', '17:00:00', true);
