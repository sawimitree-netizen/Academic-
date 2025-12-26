
export interface SurveySection {
  id: string;
  title: string;
  type: 'bio' | 'stage' | 'need' | 'topics' | 'format' | 'suggestions' | 'custom';
}

export interface SurveyData {
  fullName: string;
  department: string;
  educationLevel: string;
  currentPosition: string;
  durationInPosition: string;
  currentStage: string;
  trainingNeed: string;
  reasons: string[];
  otherReason: string;
  requestedTopics: string[];
  otherTopic: string;
  preferredFormat: string;
  preferredDuration: string;
  preferredTime: string;
  suggestions: string;
  submittedAt?: string;
}

export interface SurveyConfig {
  mainTitle: string;
  subTitle: string;
  schoolName: string;
  sections: SurveySection[];
  departments: string[];
  educationLevels: string[];
  positions: string[];
  durations: string[];
  academicStages: string[];
  trainingNeedLevels: string[];
  trainingReasons: string[];
  trainingTopics: string[];
  trainingFormats: string[];
  trainingDurations: string[];
  convenientTimes: string[];
}

export interface AppSettings {
  totalExpected: number;
}

export interface FormError {
  [key: string]: string;
}
