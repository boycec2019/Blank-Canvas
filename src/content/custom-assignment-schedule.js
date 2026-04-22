(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const createElement =
    root.dom && typeof root.dom.createElement === "function"
      ? root.dom.createElement
      : (tagName, className, textContent) => {
          const element = document.createElement(tagName);
          if (className) {
            element.className = className;
          }
          if (textContent !== undefined) {
            element.textContent = textContent;
          }
          return element;
        };

  function formatDateKey(date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  }

  function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  function shiftMonth(date, delta) {
    return new Date(date.getFullYear(), date.getMonth() + delta, 1);
  }

  function buildCalendarDays(monthDate) {
    const monthStart = startOfMonth(monthDate);
    const gridStart = new Date(monthStart);
    const weekdayOffset = monthStart.getDay();
    gridStart.setDate(monthStart.getDate() - weekdayOffset);

    return Array.from({ length: 42 }, (_, index) => {
      const cellDate = new Date(gridStart);
      cellDate.setDate(gridStart.getDate() + index);
      return {
        dateValue: formatDateKey(cellDate),
        dayLabel: String(cellDate.getDate()),
        isOutsideMonth: cellDate.getMonth() !== monthStart.getMonth()
      };
    });
  }

  function getTimeSegments(value) {
    const normalized = root.customAssignmentForm.normalizeTimeInput(value);
    if (!normalized) {
      return {
        hour: "11",
        minute: "59",
        meridiem: "PM"
      };
    }

    const match = normalized.displayValue.match(/^(\d{1,2}):(\d{2})\s+(AM|PM)$/);
    return match
      ? {
          hour: match[1],
          minute: match[2],
          meridiem: match[3]
        }
      : {
          hour: "11",
          minute: "59",
          meridiem: "PM"
        };
  }

  function buildTimeDisplay(hour, minute, meridiem) {
    const normalizedHour = String(hour || "").trim();
    const normalizedMinute = String(minute || "").trim();
    const normalizedMeridiem = String(meridiem || "").trim().toUpperCase();
    if (!normalizedHour || !normalizedMinute || !normalizedMeridiem) {
      return "";
    }

    return `${normalizedHour}:${normalizedMinute} ${normalizedMeridiem}`;
  }

  function create(options = {}) {
    const onChange = typeof options.onChange === "function" ? options.onChange : () => {};
    let selectedDueDate = "";
    let calendarOpen = false;
    let visibleMonth = startOfMonth(new Date());

    const rootElement = createElement("div", "blank-canvas__custom-modal-schedule-body");
    const scheduleRow = createElement("div", "blank-canvas__custom-modal-schedule-row");

    const dateButton = createElement("button", "blank-canvas__custom-modal-date-trigger");
    dateButton.type = "button";
    dateButton.id = `${options.modalId}-date-button`;
    dateButton.setAttribute("aria-haspopup", "dialog");
    dateButton.setAttribute("aria-expanded", "false");

    const dateButtonCopy = createElement("span", "blank-canvas__custom-modal-date-copy");
    const dateButtonLabel = createElement("span", "blank-canvas__custom-modal-date-label", "Select a due date");
    const dateButtonMeta = createElement("span", "blank-canvas__custom-modal-date-meta", "");
    const dateButtonIcon = createElement("span", "blank-canvas__custom-modal-date-icon");
    dateButtonIcon.setAttribute("aria-hidden", "true");
    dateButtonCopy.append(dateButtonLabel, dateButtonMeta);
    dateButton.append(dateButtonCopy, dateButtonIcon);

    const timeField = createElement("div", "blank-canvas__custom-modal-time-field");
    const timeFieldGroup = createElement("div", "blank-canvas__custom-modal-time-group");

    const timeHourField = document.createElement("input");
    timeHourField.id = `${options.modalId}-time-hour`;
    timeHourField.name = "customAssignmentTimeHour";
    timeHourField.type = "text";
    timeHourField.inputMode = "numeric";
    timeHourField.autocomplete = "off";
    timeHourField.maxLength = 2;
    timeHourField.placeholder = "11";

    const timeSeparator = createElement("span", "blank-canvas__custom-modal-time-separator");
    timeSeparator.setAttribute("aria-hidden", "true");

    const timeMinuteField = document.createElement("input");
    timeMinuteField.id = `${options.modalId}-time-minute`;
    timeMinuteField.name = "customAssignmentTimeMinute";
    timeMinuteField.type = "text";
    timeMinuteField.inputMode = "numeric";
    timeMinuteField.autocomplete = "off";
    timeMinuteField.maxLength = 2;
    timeMinuteField.placeholder = "59";

    const timeMeridiemField = document.createElement("select");
    timeMeridiemField.className = "blank-canvas__custom-modal-meridiem";
    timeMeridiemField.id = `${options.modalId}-time-meridiem`;
    timeMeridiemField.name = "customAssignmentTimeMeridiem";
    timeMeridiemField.setAttribute("aria-label", "AM or PM");
    ["AM", "PM"].forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      timeMeridiemField.appendChild(option);
    });

    timeFieldGroup.append(timeHourField, timeSeparator, timeMinuteField, timeMeridiemField);
    timeField.appendChild(timeFieldGroup);
    scheduleRow.append(dateButton, timeField);

    const calendar = createElement("section", "blank-canvas__custom-modal-calendar");
    calendar.hidden = true;

    const calendarHeader = createElement("div", "blank-canvas__custom-modal-calendar-header");
    const previousMonth = createElement("button", "blank-canvas__custom-modal-calendar-nav", "‹");
    previousMonth.type = "button";
    previousMonth.setAttribute("aria-label", "Previous month");
    const monthLabel = createElement("h4", "blank-canvas__custom-modal-calendar-month");
    const nextMonth = createElement("button", "blank-canvas__custom-modal-calendar-nav", "›");
    nextMonth.type = "button";
    nextMonth.setAttribute("aria-label", "Next month");
    calendarHeader.append(previousMonth, monthLabel, nextMonth);

    const weekdayRow = createElement("div", "blank-canvas__custom-modal-calendar-weekdays");
    WEEKDAY_LABELS.forEach((weekday) => {
      weekdayRow.appendChild(createElement("span", "", weekday));
    });

    const dayGrid = createElement("div", "blank-canvas__custom-modal-calendar-days");
    calendar.append(calendarHeader, weekdayRow, dayGrid);
    rootElement.append(scheduleRow, calendar);

    function setMeridiemValue(nextValue) {
      const value = String(nextValue || "PM").toUpperCase() === "AM" ? "AM" : "PM";
      timeMeridiemField.value = value;
    }

    function updateDatePresentation() {
      dateButtonLabel.textContent = root.customAssignmentForm.formatDateButtonLabel(selectedDueDate);
      dateButtonMeta.textContent = "";
      dateButton.dataset.placeholder = selectedDueDate ? "false" : "true";
    }

    function setCalendarOpen(nextValue) {
      calendarOpen = Boolean(nextValue);
      calendar.hidden = !calendarOpen;
      dateButton.setAttribute("aria-expanded", String(calendarOpen));
    }

    function renderCalendar() {
      const month = visibleMonth instanceof Date ? visibleMonth : startOfMonth(new Date());
      const todayValue = formatDateKey(new Date());

      monthLabel.textContent = root.customAssignmentForm.formatMonthLabel(month);
      dayGrid.replaceChildren();

      buildCalendarDays(month).forEach((cell) => {
        const button = createElement("button", "blank-canvas__custom-modal-day", cell.dayLabel);
        button.type = "button";
        button.dataset.dateValue = cell.dateValue;
        button.setAttribute("aria-label", root.customAssignmentForm.formatDateButtonLabel(cell.dateValue));

        if (cell.isOutsideMonth) {
          button.classList.add("is-outside-month");
        }
        if (cell.dateValue === selectedDueDate) {
          button.classList.add("is-selected");
        }
        if (cell.dateValue === todayValue) {
          button.classList.add("is-today");
        }

        dayGrid.appendChild(button);
      });
    }

    function applyDraft(draft = {}) {
      selectedDueDate = draft.dueDate || "";
      visibleMonth = startOfMonth(
        root.customAssignmentForm.parseDateInputValue(selectedDueDate) || new Date()
      );

      const timeSegments = getTimeSegments(draft.dueTime || root.customAssignmentForm.DEFAULT_DUE_TIME);
      timeHourField.value = timeSegments.hour;
      timeMinuteField.value = timeSegments.minute;
      setMeridiemValue(timeSegments.meridiem);
      updateDatePresentation();
      renderCalendar();
      setCalendarOpen(false);
    }

    function readDraft() {
      return {
        dueDate: selectedDueDate,
        dueTime: buildTimeDisplay(
          timeHourField.value,
          timeMinuteField.value,
          timeMeridiemField.value
        )
      };
    }

    function getSnapshot() {
      return {
        selectedDueDate,
        timeValue: buildTimeDisplay(
          timeHourField.value,
          timeMinuteField.value,
          timeMeridiemField.value
        ),
        calendarOpen
      };
    }

    dateButton.addEventListener("click", () => {
      setCalendarOpen(!calendarOpen);
    });
    previousMonth.addEventListener("click", () => {
      visibleMonth = shiftMonth(visibleMonth, -1);
      renderCalendar();
    });
    nextMonth.addEventListener("click", () => {
      visibleMonth = shiftMonth(visibleMonth, 1);
      renderCalendar();
    });
    dayGrid.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-date-value]");
      if (!button) {
        return;
      }

      selectedDueDate = button.dataset.dateValue || "";
      updateDatePresentation();
      onChange();
      setCalendarOpen(false);
      renderCalendar();
    });
    timeMeridiemField.addEventListener("change", () => {
      setMeridiemValue(timeMeridiemField.value || "PM");
      onChange();
    });
    [timeHourField, timeMinuteField].forEach((field) => {
      field.addEventListener("input", () => {
        field.value = field.value.replace(/\D+/g, "").slice(0, 2);
        onChange();
      });
      field.addEventListener("change", onChange);
    });

    applyDraft();

    return {
      root: rootElement,
      applyDraft,
      closeCalendar() {
        setCalendarOpen(false);
      },
      destroy() {
        rootElement.remove();
      },
      getSnapshot,
      readDraft
    };
  }

  root.customAssignmentSchedule = {
    create
  };
})();
