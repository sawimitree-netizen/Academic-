
import React from 'react';
import { 
  User, 
  BookOpen, 
  Target, 
  Lightbulb, 
  Clock, 
  MessageSquare,
  FileText
} from 'lucide-react';

export const DEPARTMENTS = [
  'ภาษาไทย',
  'คณิตศาสตร์',
  'วิทยาศาสตร์และเทคโนโลยี',
  'สังคมศึกษา ศาสนาและวัฒนธรรม',
  'สุขศึกษาและพลศึกษา',
  'ศิลปะ',
  'การงานอาชีพและเทคโนโลยี',
  'ภาษาต่างประเทศ'
];

export const EDUCATION_LEVELS = ['ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก'];

export const POSITIONS = [
  'ไม่มีวิทยฐานะ',
  'ครูชำนาญการ',
  'ครูชำนาญการพิเศษ'
];

export const DURATIONS = [
  'น้อยกว่า 4 ปี',
  '4 - 8 ปี',
  'มากกว่า 8 ปี'
];

export const ACADEMIC_STAGES = [
  'ยังไม่เริ่มดำเนินการ',
  'อยู่ระหว่างศึกษาหลักเกณฑ์ / ระเบียบ',
  'อยู่ระหว่างจัดทำโครงร่าง',
  'อยู่ระหว่างดำเนินการวิจัย / พัฒนา',
  'อยู่ระหว่างจัดทำรายงานฉบับสมบูรณ์',
  'เคยยื่นแล้วแต่ยังไม่ผ่าน'
];

export const TRAINING_NEED_LEVELS = [
  'ต้องการมาก',
  'ต้องการ',
  'ปานกลาง',
  'ต้องการน้อย',
  'ไม่ต้องการ'
];

export const TRAINING_REASONS = [
  'ต้องการความเข้าใจหลักเกณฑ์/แนวทางที่ถูกต้อง',
  'ต้องการคำแนะนำจากผู้เชี่ยวชาญ',
  'ต้องการตัวอย่างผลงานที่ผ่านการประเมิน',
  'ต้องการลดความผิดพลาดในการจัดทำผลงาน',
  'อื่น ๆ (โปรดระบุ)'
];

export const TRAINING_TOPICS = [
  'หลักเกณฑ์และวิธีการประเมินวิทยฐานะครูเชี่ยวชาญ',
  'การวิเคราะห์ตัวชี้วัดและองค์ประกอบการประเมิน',
  'การออกแบบและเขียนผลงานวิชาการ',
  'การทำวิจัยในชั้นเรียน / R&D / นวัตกรรม',
  'การเขียนรายงานผลงานให้ตรงเกณฑ์',
  'เทคนิคการจัดทำเอกสารและหลักฐานประกอบ',
  'แนวทางการประเมินผลงานจากคณะกรรมการ',
  'อื่น ๆ (โปรดระบุ)'
];

export const TRAINING_FORMATS = [
  'อบรมแบบ On-site',
  'อบรมแบบ Online',
  'Hybrid (ผสมผสาน)'
];

export const TRAINING_DURATIONS = [
  '1 วัน',
  '2 วัน',
  '3 วันขึ้นไป',
  'อบรมต่อเนื่องเป็นระยะ'
];

export const CONVENIENT_TIMES = [
  'วันราชการ',
  'วันหยุดราชการ',
  'หลังเวลาราชการ'
];

export const getIconByType = (type: string) => {
  switch (type) {
    case 'bio': return <User className="w-5 h-5" />;
    case 'stage': return <BookOpen className="w-5 h-5" />;
    case 'need': return <Target className="w-5 h-5" />;
    case 'topics': return <Lightbulb className="w-5 h-5" />;
    case 'format': return <Clock className="w-5 h-5" />;
    case 'suggestions': return <MessageSquare className="w-5 h-5" />;
    default: return <FileText className="w-5 h-5" />;
  }
};

export const INITIAL_SECTIONS = [
  { id: 'sec_1', title: 'ข้อมูลทั่วไปของผู้ตอบแบบสำรวจ', type: 'bio' as const },
  { id: 'sec_2', title: 'สถานภาพและความพร้อมในการทำผลงานวิชาการ', type: 'stage' as const },
  { id: 'sec_3', title: 'ความต้องการเข้าร่วมการอบรม', type: 'need' as const },
  { id: 'sec_4', title: 'หัวข้อการอบรมที่ต้องการ', type: 'topics' as const },
  { id: 'sec_5', title: 'รูปแบบและช่วงเวลาการอบรม', type: 'format' as const },
  { id: 'sec_6', title: 'ข้อเสนอแนะเพิ่มเติม', type: 'suggestions' as const },
];
