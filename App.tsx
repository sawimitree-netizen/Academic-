
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  CheckCircle, 
  Send, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  BarChart3,
  Settings as SettingsIcon,
  ClipboardList,
  Users,
  PieChart,
  Trash2,
  BrainCircuit,
  TrendingUp,
  Plus,
  Edit2,
  X,
  Save,
  ChevronDown,
  ChevronUp,
  Layout,
  Lock,
  Unlock,
  FileText,
  Copy,
  GripVertical,
  Settings2,
  Target,
  Lightbulb,
  Clock,
  MessageSquare,
  RefreshCw,
  CloudCheck,
  Search,
  Filter,
  UserCheck,
  Quote
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { 
  DEPARTMENTS, 
  EDUCATION_LEVELS, 
  POSITIONS, 
  DURATIONS, 
  ACADEMIC_STAGES, 
  TRAINING_NEED_LEVELS, 
  TRAINING_REASONS, 
  TRAINING_TOPICS, 
  TRAINING_FORMATS, 
  TRAINING_DURATIONS, 
  CONVENIENT_TIMES, 
  getIconByType,
  INITIAL_SECTIONS
} from './constants';
import { SurveyData, AppSettings, SurveyConfig, SurveySection } from './types';

// Declaration for SweetAlert2 from CDN
declare const Swal: any;

const STORAGE_KEY = 'kru_survey_data_v1';
const SETTINGS_KEY = 'kru_survey_settings_v1';
const CONFIG_KEY = 'kru_survey_config_v1';
const SECURITY_CODE = '2521';
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxL5ca5nTcXmC0LPWffsVwo5puUaT6DQFrYV6Dt1Tp9Q_nvUL6T2lCNSlZTIQRfOEE/exec';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'survey' | 'report' | 'settings'>('survey');
  const [step, setStep] = useState(1);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [filterDept, setFilterDept] = useState<string>('ทั้งหมด');

  const [formData, setFormData] = useState<SurveyData>({
    fullName: '',
    department: '',
    educationLevel: '',
    currentPosition: '',
    durationInPosition: '',
    currentStage: '',
    trainingNeed: '',
    reasons: [],
    otherReason: '',
    requestedTopics: [],
    otherTopic: '',
    preferredFormat: '',
    preferredDuration: '',
    preferredTime: '',
    suggestions: ''
  });
  
  const [submissions, setSubmissions] = useState<SurveyData[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ totalExpected: 0 });
  
  const [surveyConfig, setSurveyConfig] = useState<SurveyConfig>({
    mainTitle: 'แบบสำรวจความต้องการเข้าร่วมการอบรม',
    subTitle: '“การทำผลงานวิชาการเพื่อขอมีหรือเลื่อนวิทยฐานะครูเชี่ยวชาญ”',
    schoolName: 'โรงเรียนหนองบัวแดงวิทยา',
    sections: INITIAL_SECTIONS,
    departments: DEPARTMENTS,
    educationLevels: EDUCATION_LEVELS,
    positions: POSITIONS,
    durations: DURATIONS,
    academicStages: ACADEMIC_STAGES,
    trainingNeedLevels: TRAINING_NEED_LEVELS,
    trainingReasons: TRAINING_REASONS,
    trainingTopics: TRAINING_TOPICS,
    trainingFormats: TRAINING_FORMATS,
    trainingDurations: TRAINING_DURATIONS,
    convenientTimes: CONVENIENT_TIMES
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Filtered respondents for the report in settings
  const filteredSubmissions = useMemo(() => {
    if (filterDept === 'ทั้งหมด') return submissions;
    return submissions.filter(s => s.department === filterDept);
  }, [submissions, filterDept]);

  // Extract suggestions for Section 6 reporting in Settings
  const suggestionList = useMemo(() => {
    return submissions
      .filter(s => s.suggestions && s.suggestions.trim() !== '')
      .map(s => ({
        text: s.suggestions,
        name: s.fullName,
        dept: s.department
      }));
  }, [submissions]);

  // Sync with Google Sheets
  const syncWithCloud = useCallback(async (showToast = false) => {
    setIsSyncing(true);
    try {
      const response = await fetch(WEB_APP_URL);
      const cloudData = await response.json();
      if (Array.isArray(cloudData)) {
        setSubmissions(cloudData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData));
        if (showToast) {
          Swal.fire({
            icon: 'success',
            title: 'ข้อมูลเป็นปัจจุบันแล้ว',
            timer: 1000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) setSubmissions(JSON.parse(savedData));
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    syncWithCloud();
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    const savedConfig = localStorage.getItem(CONFIG_KEY);
    if (savedConfig) setSurveyConfig(JSON.parse(savedConfig));
  }, [syncWithCloud]);

  const saveToLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: keyof SurveyData, value: string) => {
    setFormData(prev => {
      const currentValues = prev[name] as string[];
      if (currentValues.includes(value)) {
        return { ...prev, [name]: currentValues.filter(v => v !== value) };
      } else {
        return { ...prev, [name]: [...currentValues, value] };
      }
    });
  };

  const validateStep = (currentStep: number): boolean => {
    const section = surveyConfig.sections[currentStep - 1];
    if (!section) return true;
    switch (section.type) {
      case 'bio': return !!(formData.fullName && formData.department && formData.educationLevel && formData.currentPosition && formData.durationInPosition);
      case 'stage': return !!formData.currentStage;
      case 'need': return !!(formData.trainingNeed && formData.reasons.length > 0);
      case 'topics': return formData.requestedTopics.length > 0;
      case 'format': return !!(formData.preferredFormat && formData.preferredDuration && formData.preferredTime);
      default: return true;
    }
  };

  const generatePersonalAiInsight = async (data: SurveyData) => {
    setIsGeneratingAi(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `วิเคราะห์ความพร้อมครูเชี่ยวชาญ: ชื่อ ${data.fullName}, กลุ่มสาระ ${data.department}, ขั้นตอน: ${data.currentStage}. ให้คำแนะนำ 3 ข้อ สั้นๆ ที่เป็นประโยชน์และให้กำลังใจ`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setAiInsight(response.text || "บันทึกข้อมูลเรียบร้อย ขอบคุณสำหรับความร่วมมือ");
    } catch (error) {
      setAiInsight("บันทึกข้อมูลเรียบร้อย ขอบคุณสำหรับความร่วมมือครับ/ค่ะ");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newSubmission = { ...formData, submittedAt: new Date().toISOString() };
    try {
      await fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubmission)
      });
      const newSubmissions = [newSubmission, ...submissions];
      setSubmissions(newSubmissions);
      saveToLocal(STORAGE_KEY, newSubmissions);
      setIsSubmitting(false);
      setIsSubmitted(true);
      generatePersonalAiInsight(newSubmission);
      setTimeout(() => syncWithCloud(), 2000);
    } catch (error) {
      console.error('Submit failed:', error);
      Swal.fire({
        icon: 'error',
        title: 'การส่งข้อมูลขัดข้อง',
        text: 'แต่ระบบได้บันทึกข้อมูลไว้ในเครื่องของคุณแล้ว',
        confirmButtonColor: '#3b82f6'
      });
      const newSubmissions = [newSubmission, ...submissions];
      setSubmissions(newSubmissions);
      saveToLocal(STORAGE_KEY, newSubmissions);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  const calculateStats = useMemo(() => {
    const total = submissions.length;
    if (total === 0) return null;
    const getFrequency = (key: keyof SurveyData) => {
      const freq: Record<string, number> = {};
      submissions.forEach(s => {
        const val = s[key];
        if (typeof val === 'string' && val) freq[val] = (freq[val] || 0) + 1;
        else if (Array.isArray(val)) val.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
      });
      return freq;
    };
    return {
      department: getFrequency('department'),
      educationLevel: getFrequency('educationLevel'),
      currentPosition: getFrequency('currentPosition'),
      durationInPosition: getFrequency('durationInPosition'),
      currentStage: getFrequency('currentStage'),
      trainingNeed: getFrequency('trainingNeed'),
      requestedTopics: getFrequency('requestedTopics'),
      preferredFormat: getFrequency('preferredFormat'),
      preferredDuration: getFrequency('preferredDuration'),
      preferredTime: getFrequency('preferredTime'),
    };
  }, [submissions]);

  const resetForm = () => {
    setFormData({
      fullName: '', department: '', educationLevel: '', currentPosition: '', durationInPosition: '',
      currentStage: '', trainingNeed: '', reasons: [], otherReason: '', requestedTopics: [],
      otherTopic: '', preferredFormat: '', preferredDuration: '', preferredTime: '', suggestions: ''
    });
    setStep(1); setIsSubmitted(false); setAiInsight(null);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (codeInput === SECURITY_CODE) {
      setIsUnlocked(true);
      Swal.fire({
        icon: 'success',
        title: 'รหัสถูกต้อง',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      Swal.fire({ icon: 'error', title: 'รหัสไม่ถูกต้อง', confirmButtonColor: '#3b82f6' });
      setCodeInput('');
    }
  };

  const handleSaveConfig = (sectionName: string) => {
    saveToLocal(CONFIG_KEY, surveyConfig);
    saveToLocal(SETTINGS_KEY, settings);
    Swal.fire({
      icon: 'success',
      title: 'บันทึกสำเร็จ',
      text: `ส่วน "${sectionName}" บันทึกแล้ว`,
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  };

  const handleClearAllData = async () => {
    const result = await Swal.fire({
      title: 'ยืนยันลบข้อมูลทั้งหมด?',
      text: 'ข้อมูลทั้งหมดใน Google Sheets และในเครื่องจะถูกลบออกอย่างถาวร!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'ลบข้อมูลทั้งหมด',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      setIsClearing(true);
      try {
        // ส่งคำสั่งล้างข้อมูลไปยัง Google Apps Script
        await fetch(WEB_APP_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'clearAll' })
        });

        // ล้างข้อมูลในฝั่งแอปพลิเคชัน
        setSubmissions([]);
        localStorage.removeItem(STORAGE_KEY);
        
        Swal.fire({ 
          title: 'ล้างข้อมูลสำเร็จ', 
          text: 'ข้อมูลในระบบและ Google Sheet ของคุณว่างเปล่าแล้ว',
          icon: 'success', 
          timer: 2000, 
          showConfirmButton: false 
        });
      } catch (error) {
        console.error('Clear data failed:', error);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถติดต่อ Google Sheet ได้ โปรดลองอีกครั้ง',
          confirmButtonColor: '#3b82f6'
        });
      } finally {
        setIsClearing(false);
      }
    }
  };

  const effectiveTotal = settings.totalExpected > 0 ? settings.totalExpected : submissions.length;
  const progressPercent = effectiveTotal > 0 ? ((submissions.length / effectiveTotal) * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto max-w-5xl px-4 py-4 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src="https://img5.pic.in.th/file/secure-sv1/nw_logo-removebg.png" alt="Logo" className="h-14 w-auto drop-shadow-sm" />
            <div className="flex flex-col">
              <h1 className="font-black text-slate-800 text-base md:text-lg leading-tight">{surveyConfig.mainTitle}</h1>
              <p className="text-blue-600 text-[10px] md:text-xs font-bold leading-tight line-clamp-1">{surveyConfig.subTitle}</p>
              <p className="text-slate-400 text-[9px] md:text-[10px] font-medium tracking-wide uppercase">{surveyConfig.schoolName}</p>
            </div>
          </div>
          <nav className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
            <button onClick={() => setActiveTab('survey')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'survey' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <ClipboardList className="w-4 h-4" /><span>แบบสำรวจ</span>
            </button>
            <button onClick={() => setActiveTab('report')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'report' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <BarChart3 className="w-4 h-4" /><span>รายงาน</span>
            </button>
            <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <SettingsIcon className="w-4 h-4" /><span>ตั้งค่า</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        {activeTab === 'survey' && (
          isSubmitted ? (
            <div className="animate-in zoom-in duration-300 bg-white rounded-3xl shadow-xl p-8 text-center space-y-6">
              <div className="flex justify-center"><div className="bg-green-100 p-4 rounded-full"><CheckCircle className="w-16 h-16 text-green-600" /></div></div>
              <h2 className="text-3xl font-bold text-slate-800">ส่งข้อมูลเรียบร้อย!</h2>
              <p className="text-slate-600">ขอบคุณสำหรับข้อมูลที่มีค่า ข้อมูลของคุณถูกส่งไปยัง Google Sheets แล้ว</p>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-left space-y-4">
                <div className="flex items-center gap-2 text-blue-700 font-bold"><BrainCircuit className="w-5 h-5" /><span>AI แนะนำเส้นทางความสำเร็จ</span></div>
                {isGeneratingAi ? <div className="flex items-center gap-2 text-slate-400 italic"><Loader2 className="w-4 h-4 animate-spin" />กำลังประมวลผล...</div> : <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">{aiInsight}</div>}
              </div>
              <button onClick={resetForm} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all">ทำใหม่</button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="px-2 pt-4">
                <div className="flex justify-between mb-3 overflow-x-auto pb-2 gap-4 no-scrollbar">
                  {surveyConfig.sections.map((section, idx) => {
                    const sectionId = idx + 1;
                    return (
                      <div key={section.id} className={`flex flex-col items-center gap-1 flex-shrink-0 ${step >= sectionId ? 'text-blue-600' : 'text-slate-300'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${step >= sectionId ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white'}`}>
                          {step > sectionId ? <CheckCircle className="w-5 h-5" /> : getIconByType(section.type)}
                        </div>
                        <span className="text-[10px] font-bold uppercase hidden sm:block whitespace-nowrap">ตอนที่ {sectionId}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(step / surveyConfig.sections.length) * 100}%` }} />
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="p-6 md:p-10">
                  <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                    <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">{step}</span>
                    {surveyConfig.sections[step-1]?.title || 'ส่วนที่ ' + step}
                  </h3>

                  {surveyConfig.sections[step-1]?.type === 'bio' && (
                    <div className="space-y-8">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อ - สกุล</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="ใส่ชื่อและนามสกุล" className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">กลุ่มสาระการเรียนรู้</label>
                        <select name="department" value={formData.department} onChange={handleInputChange} className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none">
                          <option value="">เลือกกลุ่มสาระฯ</option>
                          {surveyConfig.departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <RadioGroup label="ระดับการศึกษา" name="educationLevel" options={surveyConfig.educationLevels} selectedValue={formData.educationLevel} onChange={handleInputChange} />
                      <RadioGroup label="วิทยฐานะปัจจุบัน" name="currentPosition" options={surveyConfig.positions} selectedValue={formData.currentPosition} onChange={handleInputChange} />
                      <RadioGroup label="ระยะเวลาในการดำรงวิทยฐานะปัจจุบัน" name="durationInPosition" options={surveyConfig.durations} selectedValue={formData.durationInPosition} onChange={handleInputChange} />
                    </div>
                  )}

                  {surveyConfig.sections[step-1]?.type === 'stage' && <RadioGroup label="ปัจจุบันท่านอยู่ในขั้นตอนใดของการทำผลงานวิชาการ" name="currentStage" options={surveyConfig.academicStages} selectedValue={formData.currentStage} onChange={handleInputChange} />}
                  
                  {surveyConfig.sections[step-1]?.type === 'need' && (
                    <div className="space-y-8">
                      <RadioGroup label="ท่านมีความต้องการเข้าร่วมการอบรมหรือไม่" name="trainingNeed" options={surveyConfig.trainingNeedLevels} selectedValue={formData.trainingNeed} onChange={handleInputChange} />
                      <CheckboxGroup label="เหตุผลสำคัญในการเข้าร่วมการอบรม (เลือกได้มากกว่า 1 ข้อ)" options={surveyConfig.trainingReasons} selectedValues={formData.reasons} onChange={(v) => handleCheckboxChange('reasons', v)} />
                      {formData.reasons.includes('อื่น ๆ (โปรดระบุ)') && (
                        <input type="text" name="otherReason" value={formData.otherReason} onChange={handleInputChange} placeholder="โปรดระบุเหตุผล..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none ml-8 w-[calc(100%-32px)]" />
                      )}
                    </div>
                  )}

                  {surveyConfig.sections[step-1]?.type === 'topics' && (
                    <div className="space-y-8">
                      <CheckboxGroup label="หัวข้อที่ท่านต้องการให้จัดอบรม (เลือกได้มากกว่า 1 ข้อ)" options={surveyConfig.trainingTopics} selectedValues={formData.requestedTopics} onChange={(v) => handleCheckboxChange('requestedTopics', v)} />
                      {formData.requestedTopics.includes('อื่น ๆ (โปรดระบุ)') && (
                        <input type="text" name="otherTopic" value={formData.otherTopic} onChange={handleInputChange} placeholder="โปรดระบุหัวข้อ..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none ml-8 w-[calc(100%-32px)]" />
                      )}
                    </div>
                  )}

                  {surveyConfig.sections[step-1]?.type === 'format' && (
                    <div className="space-y-8">
                      <RadioGroup label="รูปแบบการอบรมที่ท่านต้องการ" name="preferredFormat" options={surveyConfig.trainingFormats} selectedValue={formData.preferredFormat} onChange={handleInputChange} />
                      <RadioGroup label="ระยะเวลาการอบรมที่เหมาะสม" name="preferredDuration" options={surveyConfig.trainingDurations} selectedValue={formData.preferredDuration} onChange={handleInputChange} />
                      <RadioGroup label="ช่วงเวลาที่สะดวกเข้าร่วมอบรม" name="preferredTime" options={surveyConfig.convenientTimes} selectedValue={formData.preferredTime} onChange={handleInputChange} />
                    </div>
                  )}

                  {surveyConfig.sections[step-1]?.type === 'suggestions' && (
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-700">ข้อเสนอแนะเพิ่มเติม</label>
                      <textarea name="suggestions" value={formData.suggestions} onChange={handleInputChange} rows={8} placeholder="พิมพ์ข้อความที่นี่..." className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none transition-all resize-none shadow-inner" />
                    </div>
                  )}

                  {surveyConfig.sections[step-1]?.type === 'custom' && (
                    <div className="space-y-4 text-center py-12">
                      <div className="flex justify-center mb-4"><div className="bg-slate-50 p-6 rounded-3xl"><FileText className="w-12 h-12 text-slate-300" /></div></div>
                      <p className="text-slate-500 font-medium">ส่วนเพิ่มเติมแบบอิสระ</p>
                      <p className="text-xs text-slate-400 mt-2 italic px-8">คุณสามารถเพิ่มฟิลด์ข้อมูลได้ในการตั้งค่าระบบ</p>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between">
                  <button type="button" onClick={() => setStep(s => Math.max(1, s - 1))} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${step === 1 ? 'invisible' : 'text-slate-500 hover:bg-slate-200'}`}>
                    <ChevronLeft className="w-4 h-4" /> ย้อนกลับ
                  </button>
                  {step < surveyConfig.sections.length ? (
                    <button type="button" onClick={() => validateStep(step) ? setStep(s => Math.min(surveyConfig.sections.length, s + 1)) : alert('กรุณาระบุข้อมูลให้ครบถ้วน')} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all">
                      ถัดไป <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2 bg-green-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg active:scale-95 disabled:opacity-50 transition-all">
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> ส่งข้อมูล</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        )}

        {activeTab === 'report' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                สรุปผลแบบสำรวจ (ตอนที่ 1-5)
                {isSyncing ? <Loader2 className="w-5 h-5 animate-spin text-blue-500" /> : <CloudCheck className="w-5 h-5 text-green-500" />}
              </h2>
              <button 
                onClick={() => syncWithCloud(true)} 
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                ดึงข้อมูลล่าสุด
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard icon={<Users className="text-blue-600" />} label="ผู้ตอบทั้งหมด" value={submissions.length} total={settings.totalExpected || submissions.length} subLabel={settings.totalExpected > 0 ? "จากเป้าหมาย" : "จากผู้ตอบจริง"} />
              <StatCard icon={<TrendingUp className="text-green-600" />} label="ความคืบหน้า" value={`${progressPercent}%`} subLabel="อัตราการตอบกลับ" />
              <StatCard icon={<PieChart className="text-purple-600" />} label="ความต้องการสูงสุด" value={calculateStats ? Object.entries(calculateStats.trainingNeed).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || '-' : '-'} subLabel="ระดับความต้องการ" />
            </div>
            {calculateStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Section 1: Bio */}
                <ChartSection title="ตอนที่ 1: จำนวนผู้ตอบแยกตามกลุ่มสาระฯ" data={calculateStats.department} total={submissions.length} />
                <ChartSection title="ตอนที่ 1: ระดับวุฒิการศึกษา" data={calculateStats.educationLevel} total={submissions.length} />
                <ChartSection title="ตอนที่ 1: วิทยฐานะปัจจุบัน" data={calculateStats.currentPosition} total={submissions.length} />
                <ChartSection title="ตอนที่ 1: ระยะเวลาในตำแหน่งปัจจุบัน" data={calculateStats.durationInPosition} total={submissions.length} />
                
                {/* Section 2: Stage */}
                <ChartSection title="ตอนที่ 2: ขั้นตอนการทำผลงานวิชาการ" data={calculateStats.currentStage} total={submissions.length} />
                
                {/* Section 3: Need */}
                <ChartSection title="ตอนที่ 3: ระดับความต้องการเข้าอบรม" data={calculateStats.trainingNeed} total={submissions.length} />
                
                {/* Section 4: Topics */}
                <div className="md:col-span-2">
                  <ChartSection title="ตอนที่ 4: หัวข้อการอบรมที่ต้องการ" data={calculateStats.requestedTopics} total={submissions.length} />
                </div>
                
                {/* Section 5: Format & Time */}
                <ChartSection title="ตอนที่ 5: รูปแบบการอบรมที่ต้องการ" data={calculateStats.preferredFormat} total={submissions.length} />
                <ChartSection title="ตอนที่ 5: ระยะเวลาการอบรมที่เหมาะสม" data={calculateStats.preferredDuration} total={submissions.length} />
                <div className="md:col-span-2">
                  <ChartSection title="ตอนที่ 5: ช่วงเวลาที่สะดวกเข้าร่วมอบรม" data={calculateStats.preferredTime} total={submissions.length} />
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl text-center border-2 border-dashed border-slate-200">
                <ClipboardList className="w-16 h-16 text-slate-200 mx-auto mb-4" /><p className="text-slate-400 font-medium">ยังไม่มีข้อมูล</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          !isUnlocked ? (
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-8 md:p-12 animate-in zoom-in duration-300 border border-slate-100 mt-12">
              <div className="flex justify-center mb-6">
                <div className="bg-blue-50 p-4 rounded-full text-blue-600 shadow-inner">
                  <Lock className="w-12 h-12" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-center text-slate-800 mb-2">ระบบจัดการแบบสำรวจ</h3>
              <p className="text-slate-500 text-center mb-8 font-medium">กรุณาระบุรหัสผ่านเข้าใช้งาน</p>
              <form onSubmit={handleUnlock} className="space-y-4">
                <input 
                  type="password" 
                  value={codeInput} 
                  onChange={(e) => setCodeInput(e.target.value)} 
                  placeholder="รหัสผ่าน" 
                  autoFocus
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none text-center text-2xl font-black tracking-widest transition-all shadow-sm"
                />
                <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-lg active:scale-95 transition-all">
                  เข้าสู่ระบบ
                </button>
              </form>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600"><Unlock className="w-6 h-6" /></div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">ตั้งค่าแบบสำรวจ</h2>
                </div>
                <button onClick={() => setIsUnlocked(false)} className="text-slate-400 hover:text-red-500 font-bold text-sm flex items-center gap-2 transition-colors">
                  <Lock className="w-4 h-4" /> ล็อกระบบ
                </button>
              </div>

              {/* ส่วนรายงานรายชื่อผู้ตอบแบบสำรวจ */}
              <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden group transition-all hover:shadow-xl">
                <div className="p-8 border-b border-slate-50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600"><UserCheck className="w-6 h-6" /></div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">รายชื่อผู้ตอบแบบสำรวจ</h3>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">List of respondents and department filtering</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-100">
                      <Filter className="w-4 h-4 text-slate-400" />
                      <select 
                        value={filterDept} 
                        onChange={(e) => setFilterDept(e.target.value)}
                        className="bg-transparent text-sm font-bold text-slate-600 outline-none cursor-pointer"
                      >
                        <option value="ทั้งหมด">กรอง: ทั้งหมด</option>
                        {surveyConfig.departments.map(d => (
                          <option key={d} value={d}>กลุ่มสาระฯ {d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="p-0 overflow-x-auto max-h-96 overflow-y-auto custom-scrollbar">
                  {filteredSubmissions.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-white shadow-sm z-10">
                        <tr className="bg-slate-50/50">
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">ลำดับ</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">ชื่อ - สกุล</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">กลุ่มสาระการเรียนรู้</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">วันที่ส่ง</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredSubmissions.map((sub, idx) => (
                          <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                            <td className="px-8 py-4 text-sm font-medium text-slate-400">{idx + 1}</td>
                            <td className="px-8 py-4 text-sm font-bold text-slate-700">{sub.fullName}</td>
                            <td className="px-8 py-4">
                              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase">
                                {sub.department}
                              </span>
                            </td>
                            <td className="px-8 py-4 text-xs text-slate-400 font-medium">
                              {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('th-TH', { 
                                day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' 
                              }) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-12 text-center">
                      <Search className="w-12 h-12 text-slate-100 mx-auto mb-3" />
                      <p className="text-slate-400 font-medium">ไม่พบข้อมูลผู้ตอบในกลุ่มสาระฯ นี้</p>
                    </div>
                  )}
                </div>
                
                <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center px-8">
                  <div className="text-xs font-bold text-slate-500">
                    แสดงผลเฉพาะกลุ่มสาระฯ: <span className="text-indigo-600">{filterDept}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400">พบทั้งหมด</span>
                    <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm font-black shadow-sm shadow-indigo-200">
                      {filteredSubmissions.length} <span className="text-[10px] font-normal opacity-80">คน</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-lg p-8 border border-slate-100 group transition-all hover:shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Layout className="w-5 h-5 text-blue-500" />จัดการหัวข้อและชื่อหน่วยงาน</h3>
                  <button onClick={() => handleSaveConfig('หัวข้อ')} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-md active:scale-95 transition-all">
                    <Save className="w-4 h-4" /> บันทึก
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">หัวข้อหลัก</label>
                    <input type="text" value={surveyConfig.mainTitle} onChange={(e) => setSurveyConfig(prev => ({ ...prev, mainTitle: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">หัวข้อย่อย</label>
                    <input type="text" value={surveyConfig.subTitle} onChange={(e) => setSurveyConfig(prev => ({ ...prev, subTitle: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อโรงเรียน / หน่วยงาน</label>
                    <input type="text" value={surveyConfig.schoolName} onChange={(e) => setSurveyConfig(prev => ({ ...prev, schoolName: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-lg p-8 border border-slate-100 group transition-all hover:shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><PieChart className="w-5 h-5 text-blue-500" />เป้าหมายการสำรวจ</h3>
                  <button onClick={() => handleSaveConfig('เป้าหมาย')} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-md active:scale-95 transition-all">
                    <Save className="w-4 h-4" /> บันทึก
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">จำนวนผู้ตอบเป้าหมาย (Expected Respondents)</label>
                  <div className="flex items-center gap-4">
                    <input type="number" value={settings.totalExpected || ''} placeholder="เช่น 100" onChange={(e) => setSettings({ totalExpected: parseInt(e.target.value) || 0 })} className="flex-grow px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-bold text-lg transition-all" />
                    <span className="text-slate-400 font-medium">คน</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400 italic">*หากระบุเป็น 0 ระบบจะคำนวณร้อยละโดยใช้จำนวนผู้ที่ตอบเข้ามาจริง</p>
                </div>
              </div>

              {/* ส่วนรายงานสรุปตอนที่ 6 (ข้อเสนอแนะเพิ่มเติม) */}
              <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden group transition-all hover:shadow-xl">
                <div className="p-8 border-b border-slate-50 flex items-center gap-3">
                  <div className="bg-amber-50 p-2 rounded-xl text-amber-600"><MessageSquare className="w-6 h-6" /></div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">สรุปตอนที่ 6: ข้อเสนอแนะเพิ่มเติม</h3>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">Section 6 summary and feedback details</p>
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  {suggestionList.length > 0 ? (
                    <div className="space-y-4">
                      {suggestionList.map((item, idx) => (
                        <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative group/msg transition-all hover:border-amber-200 hover:bg-white shadow-sm hover:shadow-md">
                          <Quote className="absolute top-4 right-4 w-6 h-6 text-slate-200 group-hover/msg:text-amber-100 transition-colors" />
                          <p className="text-slate-700 text-sm leading-relaxed pr-8 whitespace-pre-wrap">{item.text}</p>
                          <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">จาก:</span>
                            <span className="text-[11px] font-bold text-slate-600">{item.name}</span>
                            <span className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 rounded-full text-slate-400 font-bold uppercase">
                              กลุ่มสาระฯ {item.dept}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <MessageSquare className="w-12 h-12 text-slate-100 mx-auto mb-3" />
                      <p className="text-slate-400 font-medium">ยังไม่มีข้อเสนอแนะเพิ่มเติมจากผู้ตอบแบบสำรวจ</p>
                    </div>
                  )}
                </div>
                <div className="bg-slate-50 p-4 border-t border-slate-100 px-8 text-right">
                  <span className="text-xs font-medium text-slate-400">พบข้อเสนอแนะทั้งหมด </span>
                  <span className="text-sm font-black text-amber-600">{suggestionList.length} ข้อความ</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-lg p-8 border border-slate-100">
                <h4 className="text-sm font-bold text-red-600 mb-4 flex items-center gap-2"><Trash2 className="w-4 h-4" />พื้นที่อันตราย</h4>
                <button 
                  onClick={handleClearAllData} 
                  disabled={isClearing} 
                  className="w-full py-4 border-2 border-red-100 text-red-600 rounded-2xl font-bold hover:bg-red-50 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isClearing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Trash2 className="w-5 h-5" /> ล้างข้อมูลแบบสำรวจทั้งหมด</>}
                </button>
              </div>
            </div>
          )
        )}
      </main>

      <footer className="py-12 px-4 text-center space-y-2 text-slate-400 text-xs">
        <p className="font-semibold uppercase tracking-widest text-slate-300">{surveyConfig.schoolName}</p>
        <p>Copyright © 2025 by Kru Sawitree Mitreepan</p>
        <p className="mt-2 opacity-30">Academic Performance Survey System v2.3.0 (Full Data Lifecycle)</p>
      </footer>
    </div>
  );
};

// --- Helper Components ---

const StatCard = ({ icon, label, value, subLabel, total }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-2 hover:shadow-md transition-all">
    <div className="p-3 bg-slate-50 rounded-2xl mb-2">{icon}</div>
    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    <div className="text-3xl font-black text-slate-800">{value}</div>
    <div className="text-[10px] text-slate-400 font-medium">{subLabel} {total > 0 && <b>{total} คน</b>}</div>
  </div>
);

const ChartSection = ({ title, data, total }: any) => {
  const sortedData = Object.entries(data as Record<string, number>).sort((a, b) => (b[1] as number) - (a[1] as number));
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-all">
      <h4 className="font-bold text-slate-800 mb-6 border-b border-slate-50 pb-4 flex justify-between items-center">
        {title}
        <BarChart3 className="w-4 h-4 text-slate-200" />
      </h4>
      <div className="space-y-4 flex-grow">
        {sortedData.length > 0 ? sortedData.map(([label, count]) => {
          const percentage = total > 0 ? ((count as number) / total * 100).toFixed(1) : "0.0";
          return (
            <div key={label} className="space-y-1.5">
              <div className="flex justify-between text-[11px] md:text-xs font-bold"><span className="text-slate-600 truncate mr-2">{label}</span><span className="text-blue-600 flex-shrink-0">{count} คน ({percentage}%)</span></div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${percentage}%` }} /></div>
            </div>
          );
        }) : (
          <div className="h-full flex flex-col items-center justify-center py-6">
             <Search className="w-8 h-8 text-slate-100 mb-2" />
             <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">No Data Available</p>
          </div>
        )}
      </div>
    </div>
  );
};

const RadioGroup = ({ label, name, options, selectedValue, onChange }: any) => (
  <div>
    <label className="block text-sm font-bold text-slate-700 mb-4">{label}</label>
    <div className="grid grid-cols-1 gap-3">
      {options.map((opt: string) => (
        <label key={opt} className={`flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all hover:bg-slate-50 ${selectedValue === opt ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-50' : 'border-slate-100'}`}>
          <div className="relative flex items-center justify-center">
            <input type="radio" name={name} value={opt} checked={selectedValue === opt} onChange={onChange} className="peer appearance-none w-5 h-5 rounded-full border-2 border-slate-300 checked:border-blue-600 cursor-pointer transition-all" />
            <div className="absolute w-2.5 h-2.5 rounded-full bg-blue-600 scale-0 peer-checked:scale-100 transition-transform" />
          </div>
          <span className="ml-4 text-slate-700 font-bold text-sm md:text-base leading-tight">{opt}</span>
        </label>
      ))}
    </div>
  </div>
);

const CheckboxGroup = ({ label, options, selectedValues, onChange }: any) => (
  <div>
    <label className="block text-sm font-bold text-slate-700 mb-4">{label}</label>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {options.map((opt: string) => (
        <label key={opt} className={`flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all hover:bg-slate-50 ${selectedValues.includes(opt) ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-50' : 'border-slate-100'}`}>
          <div className="relative flex items-center justify-center">
            <input type="checkbox" checked={selectedValues.includes(opt)} onChange={() => onChange(opt)} className="peer appearance-none w-5 h-5 rounded border-2 border-slate-300 checked:border-blue-600 checked:bg-blue-600 cursor-pointer transition-all" />
            <CheckCircle className="absolute w-3.5 h-3.5 text-white scale-0 peer-checked:scale-100 transition-transform" />
          </div>
          <span className="ml-4 text-slate-700 font-bold text-sm leading-snug">{opt}</span>
        </label>
      ))}
    </div>
  </div>
);

export default App;
