import { isToday, isYesterday, parseISO, startOfDay, differenceInDays } from 'date-fns';
import type { Problem } from '../store/useTrackerStore';

export function calculateStats(problems: Problem[], dailyTarget: number) {
  const total = problems.length;
  const completed = problems.filter(p => p.completed).length;
  const remaining = total - completed;
  const completionPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  const todayStr = new Date().toISOString().split('T')[0];
  
  // Find problems completed today
  const completedTodayCount = problems.filter(p => {
    if (!p.completedDate) return false;
    // Just simple date string match for local date (or parseISO + isToday)
    return isToday(parseISO(p.completedDate));
  }).length;

  const leetcodeTotal = problems.filter(p => p.leetcodeNumber !== null).length;
  const leetcodeCompleted = problems.filter(p => p.leetcodeNumber !== null && p.completed).length;
  const naTotal = total - leetcodeTotal;
  const naCompleted = completed - leetcodeCompleted;

  // Difficulty counts
  const easyTotal = problems.filter(p => p.difficulty === 'Easy').length;
  const easyCompleted = problems.filter(p => p.difficulty === 'Easy' && p.completed).length;
  const mediumTotal = problems.filter(p => p.difficulty === 'Medium').length;
  const mediumCompleted = problems.filter(p => p.difficulty === 'Medium' && p.completed).length;
  const hardTotal = problems.filter(p => p.difficulty === 'Hard').length;
  const hardCompleted = problems.filter(p => p.difficulty === 'Hard' && p.completed).length;

  // Attempting / in progress (has saved code or notes or ai intuition viewed, but not marked completed)
  const attemptingCount = problems.filter(p => !p.completed && ((p.savedCode && p.savedCode.trim().length > 0) || p.needsRevision)).length;

  // Streak calculation
  // Get all unique dates when a problem was completed
  const completedDates = Array.from(new Set(
    problems
      .filter(p => p.completedDate)
      .map(p => startOfDay(parseISO(p.completedDate!)).getTime())
  )).sort((a, b) => b - a); // descending order (newest first)

  let currentStreak = 0;
  let longestStreak = 0;

  if (completedDates.length > 0) {
    const todayTime = startOfDay(new Date()).getTime();
    const latestTime = completedDates[0];

    // Current streak
    if (latestTime === todayTime || isYesterday(latestTime)) {
      currentStreak = 1;
      let checkTime = latestTime;
      for (let i = 1; i < completedDates.length; i++) {
        const diff = differenceInDays(checkTime, completedDates[i]);
        if (diff === 1) {
          currentStreak++;
          checkTime = completedDates[i];
        } else if (diff === 0) {
          // Should not happen due to Set, but just in case
          continue;
        } else {
          break;
        }
      }
    }

    // Longest streak
    let tempStreak = 1;
    let tempCheckTime = completedDates[0];
    longestStreak = 1;
    for (let i = 1; i < completedDates.length; i++) {
      const diff = differenceInDays(tempCheckTime, completedDates[i]);
      if (diff === 1) {
        tempStreak++;
        tempCheckTime = completedDates[i];
      } else if (diff > 1) {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 1;
        tempCheckTime = completedDates[i];
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  return {
    total,
    completed,
    remaining,
    completionPercentage,
    completedTodayCount,
    leetcodeTotal,
    leetcodeCompleted,
    naTotal,
    naCompleted,
    easyTotal,
    easyCompleted,
    mediumTotal,
    mediumCompleted,
    hardTotal,
    hardCompleted,
    attemptingCount,
    currentStreak,
    longestStreak
  };
}
