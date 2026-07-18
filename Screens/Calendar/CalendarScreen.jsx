import { useEffect, useRef, useState } from "react";

import { useAction } from "../../../context/ActionContext";
import { useAuth } from "../../../context/AuthContext";
import { useTransaction } from "../../../context/TransactionContext";
import { useConfirm } from "../../../context/ConfirmContext";

import SapButton from "../../Common/SapButton";
import SapInput from "../../Common/SapInput";

import CalendarView from "./CalendarView";
import EventModal from "./EventModal";

import {
  getAllData,
  saveAllData,
  getTableData,
  generateNextNumber,
} from "../../../utils/storage";

import styles from "./CalendarScreen.module.css";

export const CalendarScreen = ({ mode = "create" }) => {
  const { registerAction, clearAction } = useAction();
  const { updateStatus, markAsSaved } = useTransaction();
  const {user} = useAuth();

  const { confirm } = useConfirm();
  const [events, setEvents] = useState([]);
  const [calendarId, setCalendarId] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const saveRef = useRef();
  const clearRef = useRef();
  const deleteRef = useRef();
  const printRef = useRef();

  /*
   LOAD EVENTS
  */

  useEffect(() => {
    const stored = getTableData("calendar_events") || [];

    setEvents(stored);
  }, []);

  /*
   SEARCH EXISTING EVENT
  */

  const handleAutoSearch = (value) => {
    setCalendarId(value);

    if (!value.trim()) {
      setSuggestions([]);

      setShowSuggestions(false);

      return;
    }

    const data = getTableData("calendar_events") || [];

    const search = value.toLowerCase();

    const result = data.filter(
      (item) =>
        item.calendarNumber?.toLowerCase().includes(search) ||
        item.title?.toLowerCase().includes(search),
    );

    setSuggestions(result.slice(0, 10));

    setShowSuggestions(result.length > 0);
  };

  const selectEvent = (item) => {
    setActiveEvent(item);

    setCalendarId(item.calendarNumber);

    setShowSuggestions(false);

    updateStatus(`${item.calendarNumber} loaded`, "success");
  };

  /*
    SAVE ALL
  */

  saveRef.current = () => {
    const allData = getAllData();

    allData.calendar_events = events;

    saveAllData(allData);

    updateStatus("Calendar saved successfully", "success");

    markAsSaved();
  };

  /*
    CLEAR
  */

  clearRef.current = () => {
    setEvents([]);

    setActiveEvent(null);

    setCalendarId("");

    setIsModalOpen(false);

    updateStatus("Calendar cleared", "info");
  };

  /*
    DELETE EVENT
  */

  deleteRef.current = async () => {
    if (!activeEvent) return;

    const verified = await confirm("Delete this event permanently?", "danger");

    if (!verified) return;

    const updated = events.filter((item) => item.id !== activeEvent.id);

    setEvents(updated);

    const allData = getAllData();

    allData.calendar_events = updated;

    saveAllData(allData);

    setActiveEvent(null);

    setIsModalOpen(false);

    updateStatus("Event deleted", "success");
  };

  /*
    PRINT
  */

  printRef.current = () => {
    const html = `

    <html>

    <body>

    <h2>
    Enterprise Calendar Report
    </h2>


    <table border="1"
    style="
    width:100%;
    border-collapse:collapse;
    ">


    <tr>

    <th>
    Number
    </th>

    <th>
    Title
    </th>

    <th>
    Date
    </th>

    <th>
    Description
    </th>


    </tr>


    ${events
      .map(
        (event) => `

      <tr>

      <td>
      ${event.calendarNumber}
      </td>


      <td>
      ${event.title}
      </td>


      <td>
      ${event.date}
      </td>


      <td>
      ${event.description || ""}
      </td>


      </tr>


      `,
      )
      .join("")}


    </table>


    </body>

    </html>

    `;

    const win = window.open("", "_blank");

    win.document.write(html);

    win.document.close();
  };

  /*
    REGISTER ACTIONS
  */

  useEffect(() => {
    registerAction("SAVE", () => saveRef.current?.());

    registerAction("CLEAR", () => clearRef.current?.());

    registerAction("DELETE", () => deleteRef.current?.());

    registerAction("PRINT", () => printRef.current?.());

    return () => {
      clearAction("SAVE");

      clearAction("CLEAR");

      clearAction("DELETE");

      clearAction("PRINT");
    };
  }, []);

  /*
    CREATE / UPDATE EVENT
  */

  const handleSaveEvent = (data) => {
    if (data.id) {
      setEvents((prev) =>
        prev.map((item) => (item.id === data.id ? data : item)),
      );

      updateStatus("Event updated", "success");
    } else {
      const calendarNumber = generateNextNumber(
        "calendar_events",
        "calendarNumber",
        "CAL",
      );

      const newEvent = {
        ...data,

        id: Date.now(),

        calendarNumber,

        createdBy: user?.fullName || "CURRENT_USER",

        createdOn: new Date().toISOString(),
      };

      setEvents((prev) => [...prev, newEvent]);

      updateStatus(`${calendarNumber} created`, "success");
    }

    setIsModalOpen(false);
  };

  const handleDayClick = (date) => {
    if (mode === "display") return;

    setSelectedDate(date);

    setActiveEvent(null);

    setIsModalOpen(true);
  };

  const handleEditEvent = (event, e) => {
    e.stopPropagation();

    if (mode === "display") return;

    setActiveEvent(event);

    setIsModalOpen(true);
  };

  const needsLoad = (mode === "change" || mode === "display") && !activeEvent;

  return (
    <div className={styles.screenWrapper}>
      <div className={styles.headerControl}>
        <h2 className={styles.titleHeading}>Enterprise Ledger Calendar</h2>

        {mode !== "display" && (
          <SapButton
            variant="primary"
            onClick={() => {
              setActiveEvent(null);

              setSelectedDate(new Date());

              setIsModalOpen(true);
            }}
          >
            + Add Event
          </SapButton>
        )}
      </div>

      {mode === "change" && !activeEvent ? (
        <div className={styles.loadBox}>
          <SapInput
            label="Calendar Number"
            value={calendarId}
            onChange={handleAutoSearch}
            placeholder="CAL000000001"
          />

          {showSuggestions && (
            <div className={styles.suggestions}>
              {suggestions.map((item) => (
                <div key={item.id} onClick={() => selectEvent(item)}>
                  <b>{item.calendarNumber}</b>

                  <br />

                  {item.title}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <CalendarView
          events={events}
          onDayClick={handleDayClick}
          onEventClick={handleEditEvent}
        />
      )}

      {isModalOpen && (
        <EventModal
          event={activeEvent}
          defaultDate={selectedDate}
          readOnly={mode === "display"}
          onClose={() => {
            setIsModalOpen(false);

            setActiveEvent(null);
          }}
          onSave={handleSaveEvent}
          onDelete={() => deleteRef.current()}
        />
      )}
    </div>
  );
};

export default CalendarScreen;
