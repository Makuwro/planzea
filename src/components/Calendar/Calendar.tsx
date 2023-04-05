import React, { useEffect, useRef, useState } from "react";
import Client from "../../client/Client";
import styles from "./Calendar.module.css";

interface HourMinute {
  hour: number;
  minute: number;
}

export default function Calendar({client}: {client: Client}) {

  const [timeArrays, setTimeArrays] = useState<number[][]>([]);
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {

    setTimeout(() => setDate(new Date()), 1000);

  }, [date]);

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

  const [minuteSpacing] = useState<number>(30);
  const [timeLists, setTimeLists] = useState<React.ReactElement[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<{startTime: HourMinute; endTime: HourMinute} | null>(null);

  useEffect(() => {

    const intervals = 60 / minuteSpacing;
    const hours = [];
    for (let x = 0; 1 >= x; x++) {

      for (let hour = 0; 12 > hour; hour++) {

        const blocks = [];
        for (let interval = 0; intervals > interval; interval++) {

          const startHour = (x === 1 ? 12 : 0) + hour;
          let endHour = startHour;
          let endMinute = (interval + 1) * minuteSpacing;
          if (endMinute === 60) {

            endHour += 1;
            endMinute = 0;

          }
          
          const startMinute = interval * minuteSpacing;
          const isWithin = selectedTimeRange && selectedTimeRange.startTime.hour <= startHour && selectedTimeRange.endTime.hour >= endHour && selectedTimeRange.startTime.minute <= startMinute;

          blocks.push(
            <li className={isWithin ? styles.backgroundSelected : undefined} onClick={() => setSelectedTimeRange({startTime: {hour: startHour, minute: startMinute}, endTime: {hour: endHour, minute: endMinute}})} key={interval} />
          );

        }

        hours.push(
          <li key={`${x}.${hour}`}>
            <span>{hour === 0 ? 12 : hour} {x === 0 ? "AM" : "PM"}</span>
            <ul>
              {blocks}
            </ul>
          </li>
        );

      }
      
    }

    setTimeLists(hours);

  }, [minuteSpacing, selectedTimeRange]);

  // Configure the current time bar.
  const today = new Date(date);
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const timeListContainerRef = useRef<HTMLUListElement>(null);

  return (
    <main id={styles.calendar}>
      <section id={styles.smallCalendar}>
        <section id={styles.eventButtonContainer}>
          <button>New event</button>
        </section>
        <button id={styles.month}>{["January", "February", "March", "April"][date.getMonth()]} <span>{date.getFullYear()}</span></button>
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
                      <button id={isSelectedDateToday ? styles.today : undefined} className={!isSelectedDateInMonth ? styles.dateOutsideMonth : undefined}>
                        {selectedDate.getDate()}
                      </button>
                    </li>
                  );

                })}
              </ul>
            ))
          }
        </section>
      </section> 
      <section id={styles.schedule}>
        <section className={styles.selectedDate}>
          <label className={styles.dayName}>{["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()]}</label>
          <label className={styles.dateNumber}>{date.getDate()}</label>
        </section>
        <section id={styles.allDay}>
          <label>All day</label>
          <section>
            <p>No planned events</p>
          </section>
        </section>
        <section id={styles.timeEvents}>
          <section id={styles.timeOverlay}>
            <section id={styles.currentTimeBar} style={{top: ((date.getTime() - today.getTime()) / (tomorrow.getTime() - today.getTime())) * (timeListContainerRef.current?.scrollHeight ?? 0)}} />
          </section>
          <ul id={styles.timeLists} ref={timeListContainerRef}>
            {timeLists}
          </ul>
        </section>
      </section>
    </main>
  );

}