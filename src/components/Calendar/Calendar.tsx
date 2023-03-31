import React, { useEffect, useState } from "react";
import Client from "../../client/Client";

export default function Calendar({client}: {client: Client}) {

  const [dayArrays, setDayArrays] = useState<number[][]>([]);

  useEffect(() => {

    // Find the first Sunday of the month, or the last Sunday of last month.
    const date = new Date();
    const firstDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const selectedDate = new Date(firstDate);
    selectedDate.setDate(selectedDate.getDate() - selectedDate.getDay());

    // Add six weeks of numbers to the array.
    const newDayArrays = [];
    for (let week = 0; 6 > week; week++) {

      const dayArray = [];
      for (let day = 0; 7 > day; day++) {

        dayArray.push(selectedDate.getDate());
        selectedDate.setDate(selectedDate.getDate() + 1);

      }
      newDayArrays.push(dayArray);

    }

    // Save the array to the state.
    setDayArrays(newDayArrays);

  }, []);

  return (
    <main>
      <button>{["January", "February", "March", "April"][new Date().getMonth()]} {new Date().getFullYear()}</button>
      <ul>
        {
          ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((letter) => <li key={letter}>{letter}</li>)
        }
      </ul>
      <section>
        {
          dayArrays.map((array, index) => (
            <ul key={index}>
              {array.map((number) => (
                <li key={number}>
                  <button>
                    {number}
                  </button>
                </li>
              ))}
            </ul>
          ))
        }
      </section>
    </main>
  );

}