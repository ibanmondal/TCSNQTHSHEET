export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface ProblemData {
  id: number;
  title: string;
  category: string;
  difficulty: Difficulty;
  leetcodeNumber: number | null;
  leetcodeTitle: string | null;
  leetcodeUrl: string | null;
}

export const masterProblemList: ProblemData[] = [
  // CATEGORY 1 — PROBLEMS ON ARRAYS
  { id: 1, title: "Find the smallest number in an array", category: "Arrays", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 2, title: "Find the largest number in an array", category: "Arrays", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 3, title: "Second Smallest and Second Largest element in an array", category: "Arrays", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 4, title: "Reverse a given array", category: "Arrays", difficulty: "Easy", leetcodeNumber: 344, leetcodeTitle: "Reverse String", leetcodeUrl: "https://leetcode.com/problems/reverse-string/" },
  { id: 5, title: "Count frequency of each element in an array", category: "Arrays", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 6, title: "Rearrange array in increasing-decreasing order", category: "Arrays", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 7, title: "Calculate sum of the elements of the array", category: "Arrays", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 8, title: "Rotate array by K elements - Block Swap Algorithm", category: "Arrays", difficulty: "Medium", leetcodeNumber: 189, leetcodeTitle: "Rotate Array", leetcodeUrl: "https://leetcode.com/problems/rotate-array/" },
  { id: 9, title: "Average of all elements in an array", category: "Arrays", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 10, title: "Find the median of the given array", category: "Arrays", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 11, title: "Remove duplicates from a sorted array", category: "Arrays", difficulty: "Easy", leetcodeNumber: 26, leetcodeTitle: "Remove Duplicates from Sorted Array", leetcodeUrl: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/" },
  { id: 12, title: "Remove duplicates from unsorted array", category: "Arrays", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 13, title: "Adding Element in an array", category: "Arrays", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 14, title: "Find all repeating elements in an array", category: "Arrays", difficulty: "Medium", leetcodeNumber: 442, leetcodeTitle: "Find All Duplicates in an Array", leetcodeUrl: "https://leetcode.com/problems/find-all-duplicates-in-an-array/" },
  { id: 15, title: "Find all non-repeating elements in an array", category: "Arrays", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 16, title: "Find all symmetric pairs in array", category: "Arrays", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 17, title: "Maximum product subarray in an array", category: "Arrays", difficulty: "Medium", leetcodeNumber: 152, leetcodeTitle: "Maximum Product Subarray", leetcodeUrl: "https://leetcode.com/problems/maximum-product-subarray/" },
  { id: 18, title: "Replace each element of the array by its rank in the array", category: "Arrays", difficulty: "Easy", leetcodeNumber: 1331, leetcodeTitle: "Rank Transform of an Array", leetcodeUrl: "https://leetcode.com/problems/rank-transform-of-an-array/" },
  { id: 19, title: "Sorting elements of an array by frequency", category: "Arrays", difficulty: "Easy", leetcodeNumber: 1636, leetcodeTitle: "Sort Array by Increasing Frequency", leetcodeUrl: "https://leetcode.com/problems/sort-array-by-increasing-frequency/" },
  { id: 20, title: "Rotation of elements of array- left and right", category: "Arrays", difficulty: "Medium", leetcodeNumber: 189, leetcodeTitle: "Rotate Array", leetcodeUrl: "https://leetcode.com/problems/rotate-array/" },
  { id: 21, title: "Finding equilibrium index of an array", category: "Arrays", difficulty: "Easy", leetcodeNumber: 724, leetcodeTitle: "Find Pivot Index", leetcodeUrl: "https://leetcode.com/problems/find-pivot-index/" },
  { id: 22, title: "Finding Circular rotation of an array by K positions", category: "Arrays", difficulty: "Medium", leetcodeNumber: 189, leetcodeTitle: "Rotate Array", leetcodeUrl: "https://leetcode.com/problems/rotate-array/" },
  { id: 23, title: "Sort an array according to the order defined by another array", category: "Arrays", difficulty: "Medium", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 24, title: "Search an element in an array", category: "Arrays", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 25, title: "Check if Array is a subset of another array or not", category: "Arrays", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },

  // CATEGORY 2 — PROBLEMS ON NUMBERS
  { id: 26, title: "Check if a number is palindrome or not", category: "Numbers", difficulty: "Easy", leetcodeNumber: 9, leetcodeTitle: "Palindrome Number", leetcodeUrl: "https://leetcode.com/problems/palindrome-number/" },
  { id: 27, title: "Find all Palindrome numbers in a given range", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 28, title: "Check if a number is prime or not", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 29, title: "Prime numbers in a given range", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 30, title: "Check if a number is armstrong number of not", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 31, title: "Check if a number is perfect number", category: "Numbers", difficulty: "Easy", leetcodeNumber: 507, leetcodeTitle: "Perfect Number", leetcodeUrl: "https://leetcode.com/problems/perfect-number/" },
  { id: 32, title: "Even or Odd", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 33, title: "Check weather a given number is positive or negative", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 34, title: "Sum of first N natural numbers", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 35, title: "Find Sum of AP Series", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 36, title: "Program to find sum of GP Series", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 37, title: "Greatest of two numbers", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 38, title: "Greatest of three numbers", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 39, title: "Leap Year or not", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 40, title: "Reverse digits of a number", category: "Numbers", difficulty: "Medium", leetcodeNumber: 7, leetcodeTitle: "Reverse Integer", leetcodeUrl: "https://leetcode.com/problems/reverse-integer/" },
  { id: 41, title: "Maximum and Minimum digit in a number", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 42, title: "Print Fibonacci upto Nth Term", category: "Numbers", difficulty: "Easy", leetcodeNumber: 509, leetcodeTitle: "Fibonacci Number", leetcodeUrl: "https://leetcode.com/problems/fibonacci-number/" },
  { id: 43, title: "Factorial of a number", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 44, title: "Power of a number", category: "Numbers", difficulty: "Medium", leetcodeNumber: 50, leetcodeTitle: "Pow(x, n)", leetcodeUrl: "https://leetcode.com/problems/powx-n/" },
  { id: 45, title: "Factors of a given number", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 46, title: "Print all prime factors of the given number", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 47, title: "Check if a number is a strong number or not", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 48, title: "Check if a Number is Automorphic", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 49, title: "GCD of two numbers", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 50, title: "LCM of two numbers", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 51, title: "Check if a number is Harshad number", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 52, title: "Check if the number is abundant number or not", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 53, title: "Sum of digits of a number", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 54, title: "Sum of numbers in the given range", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 55, title: "Permutations in which N people can occupy R seats in a classroom", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 56, title: "Program to add two fractions", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 57, title: "Replace all 0s with 1s in a given integer", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 58, title: "Can a number be expressed as a sum of two prime numbers", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 59, title: "Calculate the area of circle", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 60, title: "Program to find roots of a Quadratic Equation", category: "Numbers", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },

  // CATEGORY 3 — PROBLEMS ON NUMBER SYSTEM
  { id: 61, title: "Convert Binary to Decimal", category: "Number System", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 62, title: "Convert binary to octal", category: "Number System", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 63, title: "Decimal to Binary conversion", category: "Number System", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 64, title: "Convert decimal to octal", category: "Number System", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 65, title: "Convert octal to binary", category: "Number System", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 66, title: "Convert octal to decimal", category: "Number System", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 67, title: "Convert digits/numbers to words", category: "Number System", difficulty: "Hard", leetcodeNumber: 273, leetcodeTitle: "Integer to English Words", leetcodeUrl: "https://leetcode.com/problems/integer-to-english-words/" },

  // CATEGORY 4 — PROBLEMS ON SORTING
  { id: 68, title: "Bubble Sort Algorithm", category: "Sorting", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 69, title: "Selection Sort Algorithm", category: "Sorting", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 70, title: "Insertion Sort Algorithm", category: "Sorting", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 71, title: "Quick Sort Algorithm", category: "Sorting", difficulty: "Medium", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 72, title: "Merge sort algorithm", category: "Sorting", difficulty: "Medium", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },

  // CATEGORY 5 — PROBLEMS ON STRING
  { id: 73, title: "Check if a given string is palindrome or not", category: "String", difficulty: "Easy", leetcodeNumber: 125, leetcodeTitle: "Valid Palindrome", leetcodeUrl: "https://leetcode.com/problems/valid-palindrome/" },
  { id: 74, title: "Count number of vowels, consonants, spaces in String", category: "String", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 75, title: "Find the ASCII value of a character", category: "String", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 76, title: "Remove all vowels from the string", category: "String", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 77, title: "Remove spaces from a string", category: "String", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 78, title: "Remove characters from a string except alphabets", category: "String", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 79, title: "Reverse a String", category: "String", difficulty: "Easy", leetcodeNumber: 344, leetcodeTitle: "Reverse String", leetcodeUrl: "https://leetcode.com/problems/reverse-string/" },
  { id: 80, title: "Remove brackets from an algebraic expression", category: "String", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 81, title: "Sum of the numbers in a String", category: "String", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 82, title: "Capitalize first and last character of each word", category: "String", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 83, title: "Calculate frequency of characters in a string", category: "String", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 84, title: "Find Non-repeating characters of a String", category: "String", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 85, title: "Check if two strings are anagram of each other", category: "String", difficulty: "Easy", leetcodeNumber: 242, leetcodeTitle: "Valid Anagram", leetcodeUrl: "https://leetcode.com/problems/valid-anagram/" },
  { id: 86, title: "Count common sub-sequence in two strings", category: "String", difficulty: "Hard", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 87, title: "Check if two strings match where one string contains wildcard characters", category: "String", difficulty: "Hard", leetcodeNumber: 44, leetcodeTitle: "Wildcard Matching", leetcodeUrl: "https://leetcode.com/problems/wildcard-matching/" },
  { id: 88, title: "Return maximum occurring character in the input string", category: "String", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 89, title: "Remove all duplicates from the input string.", category: "String", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 90, title: "Print all the duplicates in the input string.", category: "String", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 91, title: "Remove characters from first string present in the second string", category: "String", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 92, title: "Change every letter with the next lexicographic alphabet in the given string", category: "String", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 93, title: "Write a program to find the largest word in a given string.", category: "String", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 94, title: "Write a program to sort characters in a string", category: "String", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 95, title: "Count number of words in a given string", category: "String", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 96, title: "Write a program to find a word in a given string which has the highest number of repeated letters", category: "String", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 97, title: "Change case of each character in a string", category: "String", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 98, title: "Concatenate one string to another", category: "String", difficulty: "Easy", leetcodeNumber: null, leetcodeTitle: null, leetcodeUrl: null },
  { id: 99, title: "Write a program to find a substring within a string. If found display its starting position", category: "String", difficulty: "Easy", leetcodeNumber: 28, leetcodeTitle: "Find the Index of the First Occurrence in a String", leetcodeUrl: "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/" },
  { id: 100, title: "Reverse words in a string", category: "String", difficulty: "Medium", leetcodeNumber: 151, leetcodeTitle: "Reverse Words in a String", leetcodeUrl: "https://leetcode.com/problems/reverse-words-in-a-string/" }
];
