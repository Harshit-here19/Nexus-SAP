import { useEffect, useState } from "react";

import SapModal from "../../Common/SapModal";
import SapButton from "../../Common/SapButton";
import SapInput from "../../Common/SapInput";

import { INITIAL_CALENDAR } from "./CalendarConstants";

import styles from "./EventModal.module.css";

const EventModal = ({
  event,
  defaultDate,
  onClose,
  onSave,
  onDelete,
  readOnly = false,
}) => {
  const [formData, setFormData] = useState(INITIAL_CALENDAR);

  /*
   * INITIALIZE FORM
   */
  useEffect(() => {
    if (event) {
      setFormData({
        ...INITIAL_CALENDAR,
        ...event,
      });

      return;
    }

    if (defaultDate) {
      const adjustedDate = new Date(
        defaultDate.getTime() - defaultDate.getTimezoneOffset() * 60000,
      );

      setFormData({
        ...INITIAL_CALENDAR,
        date: adjustedDate.toISOString().split("T")[0],
      });
    }
  }, [event, defaultDate]);

  /*
   * CHANGE HANDLER
   */
  const handleChange = (field, value) => {
    if (readOnly) return;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /*
   * SAVE
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (readOnly) return;

    if (!formData.title.trim()) return;

    if (!formData.date) return;

    onSave({
      ...(event && { id: event.id }),
      ...formData,
    });
  };

  return (
    <SapModal
      isOpen={true}
      onClose={onClose}
      title={
        readOnly
          ? "Display Calendar Event"
          : event
            ? "Modify Calendar Event"
            : "Create Calendar Event"
      }
      width="600px"
      footer={
        <div className={styles.actionBlock}>
          {event && !readOnly && (
            <SapButton
              type="korean-delete"
              className="sapButton danger"
              onClick={() => onDelete(event.id)}
            >
              Delete Event
            </SapButton>
          )}

          <div className={styles.rightActions}>
            <SapButton type="korean-close" onClick={onClose}>
              Close
            </SapButton>

            {!readOnly && (
              <SapButton
                type="korean-save"
                form="calendar-event-form"
                className="sapButton"
                onClick={handleSubmit}
              >
                Save Event
              </SapButton>
            )}
          </div>
        </div>
      }
    >
      <form id="calendar-event-form" onSubmit={handleSubmit}>
        <div className={styles.fieldRow}>
          <SapInput
            label="Event Title"
            value={formData.title}
            disabled={readOnly}
            onChange={(value) => handleChange("title", value)}
            placeholder="Enter event title"
            required
          />
        </div>

        <div className={styles.fieldRow}>
          <SapInput
            label="Date"
            type="date"
            value={formData.date}
            disabled={readOnly}
            onChange={(value) => handleChange("date", value)}
            required
          />
        </div>

        <div className={styles.fieldRow}>
          <SapInput
            label="Description"
            value={formData.description}
            disabled={readOnly}
            onChange={(value) => handleChange("description", value)}
            placeholder="Enter description"
          />
        </div>
      </form>
    </SapModal>
  );
};

export default EventModal;
