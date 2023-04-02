import React, { useEffect, useState } from "react";
import Client from "../../client/Client";
import styles from "./Calendar.module.css";

export default function Calendar({client}: {client: Client}) {

  const [timeArrays, setTimeArrays] = useState<number[][]>([]);
  const date = new Date();

  useEffect(() => {

    // Find the first Sunday of the month, or the last Sunday of last month.
    const firstDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const selectedDate = new Date(firstDate);
    selectedDate.setDate(selectedDate.getDate() - selectedDate.getDay());

    // Add six weeks of numbers to the array.
    const newDayArrays = [];
    for (let week = 0; 6 > week; week++) {

      const dayArray = [];
      for (let day = 0; 7 > day; day++) {

        dayArray.push(selectedDate.getTime());
        selectedDate.setDate(selectedDate.getDate() + 1);

      }
      newDayArrays.push(dayArray);

    }

    // Save the array to the state.
    setTimeArrays(newDayArrays);

  }, []);

  const [startTime, setStartTime] = useState<number | null>(null);
  const [selectedTimes, setSelectedTimes] = useState<number[]>([]);

  return (
    <main id={styles.calendar}>
      <button>{["January", "February", "March", "April"][date.getMonth()]} <span>{date.getFullYear()}</span></button>
      <ul id={styles.labels}>
        {
          ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((letter) => <li key={letter}>{letter}</li>)
        }
      </ul>
      <section id={styles.days}>
        {
          timeArrays.map((array, index) => (
            <ul key={index}>
              {array.map((number) => {

                const selectedDate = new Date(number);
                const isSelectedDateToday = selectedDate.getFullYear() === date.getFullYear() && selectedDate.getMonth() === date.getMonth() && selectedDate.getDate() === date.getDate();
                const isSelectedDateInMonth = selectedDate.getMonth() === date.getMonth();

                return (
                  <li key={number}>
                    <button id={isSelectedDateToday ? styles.today : undefined} className={!isSelectedDateInMonth ? styles.dateOutsideMonth : undefined} onMouseEnter={() => {

                      if (selectedTimes[0]) {

                        setSelectedTimes([...selectedTimes, number]);

                      }

                    }} onMouseDown={() => {

                      if (!startTime) {

                        setStartTime(number);

                      }

                      setSelectedTimes([...selectedTimes, number]);

                    }}>
                      {selectedDate.getDate()}
                    </button>
                  </li>
                );

              })}
            </ul>
          ))
        }
      </section>
    </main>
  );

}