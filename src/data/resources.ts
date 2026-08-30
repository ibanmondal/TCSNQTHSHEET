export type ResourceCategory = 
  | 'Quantitative Aptitude' 
  | 'Technical & Coding' 
  | 'Verbal Ability' 
  | 'Previous Year Papers' 
  | 'Model & Practice Papers';

export interface ResourceItem {
  id: number;
  title: string;
  fileName: string;
  category: ResourceCategory;
  type: 'pdf' | 'docx';
  sizeBytes: number;
  sizeFormatted: string;
  isPopular?: boolean;
}

const rawResources: Array<{ name: string; length: number }> = [
  { name: "Pro TCS Technical Paid Paper.pdf", length: 263824 },
  { name: "TCS Answer(1).pdf", length: 276375 },
  { name: "TCS Answer.pdf", length: 276375 },
  { name: "TCS Aptitude Paid.pdf", length: 5705713 },
  { name: "TCS Ninja - Quantitative Aptitude_2(1).docx", length: 552843 },
  { name: "TCS Ninja - Quantitative Aptitude_2.docx", length: 552843 },
  { name: "TCS Ninja - Quantitative Aptitude_3(R)(1).docx", length: 601290 },
  { name: "TCS Ninja - Quantitative Aptitude_3(R).docx", length: 601290 },
  { name: "TCS Ninja - Quantitative Aptitude_4(1).docx", length: 449982 },
  { name: "TCS Ninja - Quantitative Aptitude_4.docx", length: 449982 },
  { name: "TCS Ninja - Quantitative Aptitude_5(1).docx", length: 254254 },
  { name: "TCS Ninja - Quantitative Aptitude_5.docx", length: 254254 },
  { name: "TCS Ninja - Quantitative Aptitude_6.docx", length: 2066915 },
  { name: "TCS Ninja - Verbal Ability_2(1).docx", length: 250390 },
  { name: "TCS Ninja - Verbal Ability_2.docx", length: 250390 },
  { name: "TCS Ninja - Verbal Ability_3(1).docx", length: 248995 },
  { name: "TCS Ninja - Verbal Ability_3.docx", length: 248995 },
  { name: "TCS Ninja - Verbal Ability_4(1).docx", length: 248460 },
  { name: "TCS Ninja - Verbal Ability_4.docx", length: 248460 },
  { name: "TCS Ninja - Verbal Ability_5(R)(1).docx", length: 547108 },
  { name: "TCS Ninja - Verbal Ability_5(R).docx", length: 547108 },
  { name: "TCS Ninja - Verbal Ability_6(R).docx", length: 1043445 },
  { name: "TCS Ninja Most Repeated Questions from past years.pdf", length: 476791 },
  { name: "tcs paper 2015.pdf", length: 486760 },
  { name: "TCS PDF 2..pdf", length: 875795 },
  { name: "tcs placement paper 2013.pdf", length: 542444 },
  { name: "TCS Placement Paper.pdf", length: 2269877 },
  { name: "TCS Placement Papers 1.pdf", length: 465046 },
  { name: "TCS Placement Papers 10.pdf", length: 869801 },
  { name: "TCS Placement Papers 11.pdf", length: 621599 },
  { name: "TCS Placement Papers 2.pdf", length: 309508 },
  { name: "tcs placement papers 2014.pdf", length: 371703 },
  { name: "TCS Placement Papers 3.pdf", length: 245662 },
  { name: "TCS Placement Papers 4.pdf", length: 318184 },
  { name: "TCS Placement Papers 5.pdf", length: 271107 },
  { name: "TCS QUESTION.pdf", length: 2581820 },
  { name: "TCS Technical Paid Paper GOOD.pdf", length: 190457 },
  { name: "TCS Technical Questions GOOD.pdf", length: 500832 },
  { name: "TCS Technical Questions.docx", length: 28770 },
  { name: "TCS-Arthematic-Placement-Papers.pdf", length: 140376 },
  { name: "TCS-Coding-Programming-Questions.pdf", length: 426533 },
  { name: "TCS-Model-Question-Papers.pdf", length: 144858 },
  { name: "tcs-ninja-quants-primer.pdf", length: 532222 },
  { name: "tcs-nrr.pdf", length: 739569 },
  { name: "TCS-Placement-Aptitude-Papers.pdf", length: 120995 },
  { name: "TCS-Placement-Coding-Papers.pdf", length: 133265 },
  { name: "TCS-Placement-Email-Writing-Papers.pdf", length: 118237 },
  { name: "Tcs-Placement-Papers-1.pdf", length: 296917 },
  { name: "Tcs-Placement-Papers-2.pdf", length: 296917 },
  { name: "TCS-Placement-Papers.pdf", length: 15203 },
  { name: "TCS-Previous-Year-Placement-Question-Paper.pdf", length: 126374 },
  { name: "TCS-Sample-paper.pdf", length: 297957 },
  { name: "TCS17-02T.docx", length: 246014 },
  { name: "TCS17-03T.docx", length: 247023 },
  { name: "TCS17-04T(R).docx", length: 357951 },
  { name: "TCS17-05T.docx", length: 989437 },
  { name: "TCS17-06T.docx", length: 282955 },
  { name: "tcsaptitude.pdf", length: 295328 },
  { name: "tcspattern.pdf", length: 221493 },
  { name: "tcsplacement-paper-2010.pdf", length: 13574 },
  { name: "TCS_02T.docx", length: 243776 },
  { name: "TCS_03T.docx", length: 244449 },
  { name: "TCS_04C.docx", length: 242993 },
  { name: "TCS_05C.docx", length: 243205 },
  { name: "TCS_06C.docx", length: 243228 },
  { name: "TCS_Placement_Papers_with_Answers_Technical_Round_Kolkata_,_13_Jan (2).pdf", length: 303497 },
  { name: "TCS_Placement_Papers_with_Answers_Technical_Round_Kolkata_,_13_Jan.pdf", length: 303497 },
  { name: "TCS_Previous_Year_Paper.pdf", length: 140312 },
  { name: "TCS_Quantitative_Aptitude_Question_Paper_www_matterhere_com_NRR.pdf", length: 67851 }
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function cleanTitle(fileName: string): string {
  return fileName
    .replace(/\.pdf$/i, '')
    .replace(/\.docx$/i, '')
    .replace(/_/g, ' ')
    .replace(/www matterhere com/gi, '')
    .trim();
}

function getCategory(fileName: string): ResourceCategory {
  const lower = fileName.toLowerCase();
  if (lower.includes('verbal') || lower.includes('email-writing') || lower.includes('email writing')) {
    return 'Verbal Ability';
  }
  if (lower.includes('technical') || lower.includes('coding') || lower.includes('programming') || lower.includes('answer')) {
    return 'Technical & Coding';
  }
  if (lower.includes('quants') || lower.includes('quantitative') || lower.includes('aptitude') || lower.includes('arthematic')) {
    return 'Quantitative Aptitude';
  }
  if (lower.includes('2010') || lower.includes('2013') || lower.includes('2014') || lower.includes('2015') || lower.includes('previous-year') || lower.includes('previous year') || lower.includes('most repeated') || lower.includes('placement papers') || lower.includes('placement paper') || lower.includes('placement_papers')) {
    return 'Previous Year Papers';
  }
  return 'Model & Practice Papers';
}

export const resourcesList: ResourceItem[] = rawResources.map((item, index) => {
  const isDocx = item.name.toLowerCase().endsWith('.docx');
  const cat = getCategory(item.name);
  const isPopular = item.length > 500000 || item.name.toLowerCase().includes('paid') || item.name.toLowerCase().includes('most repeated');
  
  return {
    id: index + 1,
    title: cleanTitle(item.name),
    fileName: item.name,
    category: cat,
    type: isDocx ? 'docx' : 'pdf',
    sizeBytes: item.length,
    sizeFormatted: formatBytes(item.length),
    isPopular
  };
});
