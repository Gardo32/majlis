// Surah data with Arabic and English names
export const SURAHS = [
  { number: 1, arabic: "الفاتحة", english: "Al-Fatiha", juz: 1, pages: 1 },
  { number: 2, arabic: "البقرة", english: "Al-Baqarah", juz: 1, pages: 48 },
  { number: 3, arabic: "آل عمران", english: "Ali 'Imran", juz: 3, pages: 28 },
  { number: 4, arabic: "النساء", english: "An-Nisa", juz: 4, pages: 28 },
  { number: 5, arabic: "المائدة", english: "Al-Ma'idah", juz: 6, pages: 22 },
  { number: 6, arabic: "الأنعام", english: "Al-An'am", juz: 7, pages: 23 },
  { number: 7, arabic: "الأعراف", english: "Al-A'raf", juz: 8, pages: 26 },
  { number: 8, arabic: "الأنفال", english: "Al-Anfal", juz: 9, pages: 10 },
  { number: 9, arabic: "التوبة", english: "At-Tawbah", juz: 10, pages: 20 },
  { number: 10, arabic: "يونس", english: "Yunus", juz: 11, pages: 14 },
  { number: 11, arabic: "هود", english: "Hud", juz: 11, pages: 14 },
  { number: 12, arabic: "يوسف", english: "Yusuf", juz: 12, pages: 14 },
  { number: 13, arabic: "الرعد", english: "Ar-Ra'd", juz: 13, pages: 7 },
  { number: 14, arabic: "إبراهيم", english: "Ibrahim", juz: 13, pages: 7 },
  { number: 15, arabic: "الحجر", english: "Al-Hijr", juz: 14, pages: 6 },
  { number: 16, arabic: "النحل", english: "An-Nahl", juz: 14, pages: 16 },
  { number: 17, arabic: "الإسراء", english: "Al-Isra", juz: 15, pages: 12 },
  { number: 18, arabic: "الكهف", english: "Al-Kahf", juz: 15, pages: 12 },
  { number: 19, arabic: "مريم", english: "Maryam", juz: 16, pages: 8 },
  { number: 20, arabic: "طه", english: "Ta-Ha", juz: 16, pages: 10 },
  { number: 21, arabic: "الأنبياء", english: "Al-Anbiya", juz: 17, pages: 10 },
  { number: 22, arabic: "الحج", english: "Al-Hajj", juz: 17, pages: 10 },
  { number: 23, arabic: "المؤمنون", english: "Al-Mu'minun", juz: 18, pages: 9 },
  { number: 24, arabic: "النور", english: "An-Nur", juz: 18, pages: 10 },
  { number: 25, arabic: "الفرقان", english: "Al-Furqan", juz: 18, pages: 8 },
  { number: 26, arabic: "الشعراء", english: "Ash-Shu'ara", juz: 19, pages: 13 },
  { number: 27, arabic: "النمل", english: "An-Naml", juz: 19, pages: 10 },
  { number: 28, arabic: "القصص", english: "Al-Qasas", juz: 20, pages: 14 },
  { number: 29, arabic: "العنكبوت", english: "Al-'Ankabut", juz: 20, pages: 9 },
  { number: 30, arabic: "الروم", english: "Ar-Rum", juz: 21, pages: 8 },
  { number: 31, arabic: "لقمان", english: "Luqman", juz: 21, pages: 4 },
  { number: 32, arabic: "السجدة", english: "As-Sajdah", juz: 21, pages: 3 },
  { number: 33, arabic: "الأحزاب", english: "Al-Ahzab", juz: 21, pages: 13 },
  { number: 34, arabic: "سبأ", english: "Saba", juz: 22, pages: 7 },
  { number: 35, arabic: "فاطر", english: "Fatir", juz: 22, pages: 6 },
  { number: 36, arabic: "يس", english: "Ya-Sin", juz: 22, pages: 7 },
  { number: 37, arabic: "الصافات", english: "As-Saffat", juz: 23, pages: 9 },
  { number: 38, arabic: "ص", english: "Sad", juz: 23, pages: 6 },
  { number: 39, arabic: "الزمر", english: "Az-Zumar", juz: 23, pages: 11 },
  { number: 40, arabic: "غافر", english: "Ghafir", juz: 24, pages: 11 },
  { number: 41, arabic: "فصلت", english: "Fussilat", juz: 24, pages: 7 },
  { number: 42, arabic: "الشورى", english: "Ash-Shura", juz: 25, pages: 7 },
  { number: 43, arabic: "الزخرف", english: "Az-Zukhruf", juz: 25, pages: 8 },
  { number: 44, arabic: "الدخان", english: "Ad-Dukhan", juz: 25, pages: 4 },
  { number: 45, arabic: "الجاثية", english: "Al-Jathiyah", juz: 25, pages: 5 },
  { number: 46, arabic: "الأحقاف", english: "Al-Ahqaf", juz: 26, pages: 6 },
  { number: 47, arabic: "محمد", english: "Muhammad", juz: 26, pages: 5 },
  { number: 48, arabic: "الفتح", english: "Al-Fath", juz: 26, pages: 5 },
  { number: 49, arabic: "الحجرات", english: "Al-Hujurat", juz: 26, pages: 3 },
  { number: 50, arabic: "ق", english: "Qaf", juz: 26, pages: 3 },
  { number: 51, arabic: "الذاريات", english: "Adh-Dhariyat", juz: 26, pages: 4 },
  { number: 52, arabic: "الطور", english: "At-Tur", juz: 27, pages: 3 },
  { number: 53, arabic: "النجم", english: "An-Najm", juz: 27, pages: 3 },
  { number: 54, arabic: "القمر", english: "Al-Qamar", juz: 27, pages: 3 },
  { number: 55, arabic: "الرحمن", english: "Ar-Rahman", juz: 27, pages: 4 },
  { number: 56, arabic: "الواقعة", english: "Al-Waqi'ah", juz: 27, pages: 4 },
  { number: 57, arabic: "الحديد", english: "Al-Hadid", juz: 27, pages: 5 },
  { number: 58, arabic: "المجادلة", english: "Al-Mujadila", juz: 28, pages: 4 },
  { number: 59, arabic: "الحشر", english: "Al-Hashr", juz: 28, pages: 4 },
  { number: 60, arabic: "الممتحنة", english: "Al-Mumtahana", juz: 28, pages: 3 },
  { number: 61, arabic: "الصف", english: "As-Saf", juz: 28, pages: 2 },
  { number: 62, arabic: "الجمعة", english: "Al-Jumu'ah", juz: 28, pages: 2 },
  { number: 63, arabic: "المنافقون", english: "Al-Munafiqun", juz: 28, pages: 2 },
  { number: 64, arabic: "التغابن", english: "At-Taghabun", juz: 28, pages: 2 },
  { number: 65, arabic: "الطلاق", english: "At-Talaq", juz: 28, pages: 3 },
  { number: 66, arabic: "التحريم", english: "At-Tahrim", juz: 28, pages: 2 },
  { number: 67, arabic: "الملك", english: "Al-Mulk", juz: 29, pages: 3 },
  { number: 68, arabic: "القلم", english: "Al-Qalam", juz: 29, pages: 3 },
  { number: 69, arabic: "الحاقة", english: "Al-Haqqah", juz: 29, pages: 3 },
  { number: 70, arabic: "المعارج", english: "Al-Ma'arij", juz: 29, pages: 2 },
  { number: 71, arabic: "نوح", english: "Nuh", juz: 29, pages: 2 },
  { number: 72, arabic: "الجن", english: "Al-Jinn", juz: 29, pages: 2 },
  { number: 73, arabic: "المزمل", english: "Al-Muzzammil", juz: 29, pages: 2 },
  { number: 74, arabic: "المدثر", english: "Al-Muddaththir", juz: 29, pages: 3 },
  { number: 75, arabic: "القيامة", english: "Al-Qiyamah", juz: 29, pages: 2 },
  { number: 76, arabic: "الإنسان", english: "Al-Insan", juz: 29, pages: 2 },
  { number: 77, arabic: "المرسلات", english: "Al-Mursalat", juz: 29, pages: 2 },
  { number: 78, arabic: "النبأ", english: "An-Naba", juz: 30, pages: 2 },
  { number: 79, arabic: "النازعات", english: "An-Nazi'at", juz: 30, pages: 2 },
  { number: 80, arabic: "عبس", english: "'Abasa", juz: 30, pages: 1 },
  { number: 81, arabic: "التكوير", english: "At-Takwir", juz: 30, pages: 1 },
  { number: 82, arabic: "الانفطار", english: "Al-Infitar", juz: 30, pages: 1 },
  { number: 83, arabic: "المطففين", english: "Al-Mutaffifin", juz: 30, pages: 2 },
  { number: 84, arabic: "الانشقاق", english: "Al-Inshiqaq", juz: 30, pages: 1 },
  { number: 85, arabic: "البروج", english: "Al-Buruj", juz: 30, pages: 1 },
  { number: 86, arabic: "الطارق", english: "At-Tariq", juz: 30, pages: 1 },
  { number: 87, arabic: "الأعلى", english: "Al-A'la", juz: 30, pages: 1 },
  { number: 88, arabic: "الغاشية", english: "Al-Ghashiyah", juz: 30, pages: 1 },
  { number: 89, arabic: "الفجر", english: "Al-Fajr", juz: 30, pages: 2 },
  { number: 90, arabic: "البلد", english: "Al-Balad", juz: 30, pages: 1 },
  { number: 91, arabic: "الشمس", english: "Ash-Shams", juz: 30, pages: 1 },
  { number: 92, arabic: "الليل", english: "Al-Layl", juz: 30, pages: 1 },
  { number: 93, arabic: "الضحى", english: "Ad-Duha", juz: 30, pages: 1 },
  { number: 94, arabic: "الشرح", english: "Ash-Sharh", juz: 30, pages: 1 },
  { number: 95, arabic: "التين", english: "At-Tin", juz: 30, pages: 1 },
  { number: 96, arabic: "العلق", english: "Al-'Alaq", juz: 30, pages: 1 },
  { number: 97, arabic: "القدر", english: "Al-Qadr", juz: 30, pages: 1 },
  { number: 98, arabic: "البينة", english: "Al-Bayyinah", juz: 30, pages: 1 },
  { number: 99, arabic: "الزلزلة", english: "Az-Zalzalah", juz: 30, pages: 1 },
  { number: 100, arabic: "العاديات", english: "Al-'Adiyat", juz: 30, pages: 1 },
  { number: 101, arabic: "القارعة", english: "Al-Qari'ah", juz: 30, pages: 1 },
  { number: 102, arabic: "التكاثر", english: "At-Takathur", juz: 30, pages: 1 },
  { number: 103, arabic: "العصر", english: "Al-'Asr", juz: 30, pages: 1 },
  { number: 104, arabic: "الهمزة", english: "Al-Humazah", juz: 30, pages: 1 },
  { number: 105, arabic: "الفيل", english: "Al-Fil", juz: 30, pages: 1 },
  { number: 106, arabic: "قريش", english: "Quraysh", juz: 30, pages: 1 },
  { number: 107, arabic: "الماعون", english: "Al-Ma'un", juz: 30, pages: 1 },
  { number: 108, arabic: "الكوثر", english: "Al-Kawthar", juz: 30, pages: 1 },
  { number: 109, arabic: "الكافرون", english: "Al-Kafirun", juz: 30, pages: 1 },
  { number: 110, arabic: "النصر", english: "An-Nasr", juz: 30, pages: 1 },
  { number: 111, arabic: "المسد", english: "Al-Masad", juz: 30, pages: 1 },
  { number: 112, arabic: "الإخلاص", english: "Al-Ikhlas", juz: 30, pages: 1 },
  { number: 113, arabic: "الفلق", english: "Al-Falaq", juz: 30, pages: 1 },
  { number: 114, arabic: "الناس", english: "An-Nas", juz: 30, pages: 1 },
];

// Juz names with Arabic and English transliterations
export const JUZ_NAMES = [
  { number: 1, arabic: "الم", english: "Alif Lam Mim" },
  { number: 2, arabic: "سَيَقُولُ", english: "Sayaqul" },
  { number: 3, arabic: "تِلْكَ الرُّسُلُ", english: "Tilkal Rusul" },
  { number: 4, arabic: "لَنْ تَنَالُوا", english: "Lan Tana Lu" },
  { number: 5, arabic: "وَالْمُحْصَنَاتُ", english: "Wal Muhsanat" },
  { number: 6, arabic: "لَا يُحِبُّ اللَّهُ", english: "La Yuhibbullah" },
  { number: 7, arabic: "وَإِذَا سَمِعُوا", english: "Wa Idha Sami'u" },
  { number: 8, arabic: "وَلَوْ أَنَّنَا", english: "Wa Law Annana" },
  { number: 9, arabic: "قَالَ الْمَلَأُ", english: "Qalal Mala" },
  { number: 10, arabic: "وَاعْلَمُوا", english: "Wa'lamu" },
  { number: 11, arabic: "يَعْتَذِرُونَ", english: "Ya'tadhirun" },
  { number: 12, arabic: "وَمَا مِنْ دَابَّةٍ", english: "Wa Ma Min Dabbah" },
  { number: 13, arabic: "وَمَا أُبَرِّئُ", english: "Wa Ma Ubarri" },
  { number: 14, arabic: "رُبَمَا", english: "Rubama" },
  { number: 15, arabic: "سُبْحَانَ الَّذِي", english: "Subhanallazi" },
  { number: 16, arabic: "قَالَ أَلَمْ", english: "Qala Alam" },
  { number: 17, arabic: "اقْتَرَبَ لِلنَّاسِ", english: "Iqtaraba Linnas" },
  { number: 18, arabic: "قَدْ أَفْلَحَ", english: "Qad Aflaha" },
  { number: 19, arabic: "وَقَالَ الَّذِينَ", english: "Wa Qalallazina" },
  { number: 20, arabic: "أَمَّنْ خَلَقَ", english: "Amman Khalaqa" },
  { number: 21, arabic: "اتْلُ مَا أُوحِيَ", english: "Utlu Ma Uhiya" },
  { number: 22, arabic: "وَمَنْ يَقْنُتْ", english: "Wa Man Yaqnut" },
  { number: 23, arabic: "وَمَا لِيَ", english: "Wa Mali" },
  { number: 24, arabic: "فَمَنْ أَظْلَمُ", english: "Faman Azlam" },
  { number: 25, arabic: "إِلَيْهِ يُرَدُّ", english: "Ilayhi Yuraddu" },
  { number: 26, arabic: "حم", english: "Ha Mim" },
  { number: 27, arabic: "قَالَ فَمَا خَطْبُكُمْ", english: "Qala Fama Khatbukum" },
  { number: 28, arabic: "قَدْ سَمِعَ اللَّهُ", english: "Qad Sami Allahu" },
  { number: 29, arabic: "تَبَارَكَ الَّذِي", english: "Tabarakallazi" },
  { number: 30, arabic: "عَمَّ يَتَسَاءَلُونَ", english: "Amma Yatasaalun" },
];

export function getSurahByNumber(number: number) {
  return SURAHS.find((s) => s.number === number);
}

export function getSurahByEnglishName(name: string) {
  return SURAHS.find((s) => s.english.toLowerCase() === name.toLowerCase());
}

export function getSurahByArabicName(name: string) {
  return SURAHS.find((s) => s.arabic === name);
}

export function getJuzRange(surahNumber: number): { start: number; end: number } {
  const surah = getSurahByNumber(surahNumber);
  if (!surah) return { start: 1, end: 1 };
  
  // Simplified - in reality, some surahs span multiple juz
  return { start: surah.juz, end: surah.juz };
}

// Get juz name by number
export function getJuzName(juzNumber: number): { arabic: string; english: string } | null {
  return JUZ_NAMES.find((j) => j.number === juzNumber) || null;
}

// Get all surahs that appear in a juz range
export function getSurahsInJuzRange(juzStart: number, juzEnd: number): Array<{
  number: number;
  arabic: string;
  english: string;
  juz: number;
}> {
  const surahs = SURAHS.filter(
    (s) => s.juz >= juzStart && s.juz <= juzEnd
  );
  return surahs;
}

// Get primary surah for display (first surah in the juz range)
export function getPrimarySurahForJuzRange(juzStart: number, juzEnd: number): {
  arabic: string;
  english: string;
} {
  const surahs = getSurahsInJuzRange(juzStart, juzEnd);
  if (surahs.length === 0) {
    return { arabic: "القرآن الكريم", english: "Al-Quran" };
  }
  
  // If multiple surahs, show the range or first one
  if (surahs.length === 1) {
    return { arabic: surahs[0].arabic, english: surahs[0].english };
  }
  
  // For multiple surahs, show first to last
  const first = surahs[0];
  const last = surahs[surahs.length - 1];
  return {
    arabic: `${first.arabic} - ${last.arabic}`,
    english: `${first.english} - ${last.english}`,
  };
}
