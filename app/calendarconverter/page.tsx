// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Sun, Moon, ChevronsUpDown, Check } from "lucide-react";

// Ethiopian month names
const ETHIOPIAN_MONTHS = [
  "Meskerem",
  "Tikimit",
  "Hidar",
  "Tahesas",
  "Tir",
  "Yekatit",
  "Megabit",
  "Miazia",
  "Genbot",
  "Sene",
  "Hamle",
  "Nehase",
  "Pagume",
];

// Gregorian month names
const GREGORIAN_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Check if a Gregorian year is a leap year
const isGregorianLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

// Check if an Ethiopian year is a leap year
const isEthiopianLeapYear = (year: number): boolean => {
  return year % 4 === 3;
};

// Convert Gregorian date to Ethiopian date
const gregorianToEthiopian = (
  date: Date
): { year: number; month: number; day: number } => {
  const gregDate = new Date(date);
  const gregYear = gregDate.getFullYear();
  const gregMonth = gregDate.getMonth();
  const gregDay = gregDate.getDate();

  // Calculate the difference in years
  let ethYear = gregYear - 8;
  if (gregMonth < 8 || (gregMonth === 8 && gregDay < 11)) {
    ethYear--;
  }

  // Calculate the difference in days
  const gregEpoch = new Date(gregYear, gregMonth, gregDay);
  const ethEpoch = new Date(ethYear + 8, 8, 11); // September 11 in Gregorian
  const diffDays = Math.floor(
    (gregEpoch.getTime() - ethEpoch.getTime()) / (1000 * 60 * 60 * 24)
  );

  let ethMonth = Math.floor(diffDays / 30);
  let ethDay = (diffDays % 30) + 1;

  // Handle Pagume (13th month)
  if (ethMonth === 12) {
    const leap = isEthiopianLeapYear(ethYear);
    if (ethDay > (leap ? 6 : 5)) {
      ethMonth = 0;
      ethDay = ethDay - (leap ? 6 : 5);
      ethYear++;
    }
  }

  return { year: ethYear, month: ethMonth, day: ethDay };
};

// Convert Ethiopian date to Gregorian date
const ethiopianToGregorian = (
  ethYear: number,
  ethMonth: number,
  ethDay: number
): Date => {
  // Calculate the Gregorian year
  let gregYear = ethYear + 8;
  if (ethMonth < 0 || ethMonth > 12) {
    throw new Error("Invalid Ethiopian month");
  }

  // Handle Pagume (13th month)
  if (ethMonth === 12) {
    const leap = isEthiopianLeapYear(ethYear);
    if (ethDay > (leap ? 6 : 5)) {
      throw new Error("Invalid day for Pagume");
    }
  }

  // Calculate the total days from Meskerem 1
  let totalDays = ethMonth * 30 + ethDay - 1;

  // Calculate the Gregorian date starting from September 11
  const gregDate = new Date(gregYear, 8, 11); // September 11
  gregDate.setDate(gregDate.getDate() + totalDays);

  return gregDate;
};

export default function CalendarConverter() {
  const [darkMode, setDarkMode] = useState(false);
  const [conversionDirection, setConversionDirection] = useState<
    "greg-to-eth" | "eth-to-greg"
  >("greg-to-eth");
  const [gregorianDate, setGregorianDate] = useState<Date>(new Date());
  const [ethiopianDate, setEthiopianDate] = useState(
    gregorianToEthiopian(new Date())
  );
  const [inputDate, setInputDate] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    day: new Date().getDate(),
  });
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  // Toggle dark mode

  // Update Ethiopian date when Gregorian date changes
  useEffect(() => {
    if (conversionDirection === "greg-to-eth") {
      const newDate = new Date(inputDate.year, inputDate.month, inputDate.day);
      setGregorianDate(newDate);
      setEthiopianDate(gregorianToEthiopian(newDate));
    }
  }, [inputDate, conversionDirection]);

  // Update Gregorian date when Ethiopian date changes
  useEffect(() => {
    if (conversionDirection === "eth-to-greg") {
      try {
        const newDate = ethiopianToGregorian(
          inputDate.year,
          inputDate.month,
          inputDate.day
        );
         
        setGregorianDate(newDate);
        setEthiopianDate(gregorianToEthiopian(newDate));
      } catch (error) {
        console.error("Invalid Ethiopian date");


      }
    }
  }, [inputDate, conversionDirection]);

  // Handle date input changes
  const handleInputChange = (
    field: "year" | "month" | "day",
    value: number
  ) => {
    setInputDate((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Toggle conversion direction
  const toggleConversionDirection = () => {
    setConversionDirection((prev) =>
      prev === "greg-to-eth" ? "eth-to-greg" : "greg-to-eth"
    );
    // Reset input date to the current converted date
    if (conversionDirection === "greg-to-eth") {
      setInputDate({
        year: ethiopianDate.year,
        month: ethiopianDate.month,
        day: ethiopianDate.day,
      });
    } else {
      setInputDate({
        year: gregorianDate.getFullYear(),
        month: gregorianDate.getMonth(),
        day: gregorianDate.getDate(),

      });

    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300'}`}>
      {/* Navbar */}
      <nav className=" dark:bg-gray-800 shadow-md py-4 px-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-xl font-bold">Calendar Converter</h1>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Conversion Toggle */}
          <div className="flex justify-center mb-8">
            <motion.button
              onClick={toggleConversionDirection}
              className="relative flex items-center px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-full shadow-lg font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">
                {conversionDirection === "greg-to-eth"
                  ? "Gregorian to Ethiopian"
                  : "Ethiopian to Gregorian"}
              </span>
              <ChevronsUpDown className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Converter Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-6 md:p-8">
              {/* Input Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                  {conversionDirection === "greg-to-eth"
                    ? "Gregorian Date"
                    : "Ethiopian Date"}

                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Year Input */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Year
                    </label>
                    <input
                      type="number"
                      value={inputDate.year}
                      onChange={(e) =>
                        handleInputChange("year", parseInt(e.target.value) || 0)
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  {/* Month Input */}
                  <div className="relative">
                    <label className="block text-sm font-medium mb-1">
                      Month
                    </label>
                    <button
                      onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                      className="w-full px-4 py-2 border rounded-lg flex justify-between items-center dark:bg-gray-700 dark:border-gray-600"
                    >
                      <span>
                        {conversionDirection === "greg-to-eth"
                          ? GREGORIAN_MONTHS[inputDate.month]
                          : ETHIOPIAN_MONTHS[inputDate.month]}
                      </span>
                      <ChevronsUpDown className="h-4 w-4" />
                    </button>

                    <AnimatePresence>
                      {showMonthDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg rounded-lg py-1 max-h-60 overflow-auto"
                        >
                          {(conversionDirection === "greg-to-eth"
                            ? GREGORIAN_MONTHS
                            : ETHIOPIAN_MONTHS
                          ).map((month, index) => (
                            <button
                              key={month}
                              onClick={() => {
                                handleInputChange("month", index);
                                setShowMonthDropdown(false);
                              }}
                              className={`w-full px-4 py-2 text-left flex items-center justify-between ${
                                inputDate.month === index
                                  ? "bg-blue-100 dark:bg-blue-900"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-600"
                              }`}
                            >
                              <span>{month}</span>
                              {inputDate.month === index && (
                                <Check className="h-4 w-4" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Day Input */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Day
                    </label>
                    <input
                      type="number"
                      value={inputDate.day}
                      onChange={(e) =>
                        handleInputChange("day", parseInt(e.target.value) || 0)
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      min="1"
                      max={
                        conversionDirection === "greg-to-eth"
                          ? inputDate.month === 1 // February
                            ? isGregorianLeapYear(inputDate.year)
                              ? 29
                              : 28
                            : [3, 5, 8, 10].includes(inputDate.month)
                            ? 30
                            : 31
                          : inputDate.month === 12 // Pagume
                          ? isEthiopianLeapYear(inputDate.year)
                            ? 6
                            : 5
                          : 30
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Result Section */}
              <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {conversionDirection === "greg-to-eth"
                    ? "Ethiopian Date"
                    : "Gregorian Date"}
                </h2>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={conversionDirection}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {conversionDirection === "greg-to-eth" ? (
                      <>
                        <div className="text-2xl font-bold">
                          {ethiopianDate.day}{" "}
                          {ETHIOPIAN_MONTHS[ethiopianDate.month]}{" "}
                          {ethiopianDate.year}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300">
                          {formatDate(gregorianDate)}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">
                          {formatDate(gregorianDate)}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300">
                          {ethiopianDate.day}{" "}
                          {ETHIOPIAN_MONTHS[ethiopianDate.month]}{" "}
                          {ethiopianDate.year}
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Information Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-4">About the Calendars</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                The <span className="font-medium">Ethiopian calendar</span> is
                the principal calendar used in Ethiopia and is approximately 7-8
                years behind the Gregorian calendar. It has 13 months - 12
                months of 30 days each and a 13th month of 5 or 6 days.
              </p>
              <p>
                The <span className="font-medium">Gregorian calendar</span> is
                the calendar used in most of the world. It was introduced in
                October 1582 by Pope Gregory XIII as a modification of the
                Julian calendar.
              </p>
              <p>
                New Year in the Ethiopian calendar is celebrated on{" "}
                <span className="font-medium">September 11</span>
                (or September 12 in leap years) in the Gregorian calendar.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
