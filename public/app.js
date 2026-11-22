
// ==========================================
// IPT1 - Campus Event Registration System
// Frontend JavaScript
// ==========================================

// Get HTML elements
const form = document.querySelector("#registration-form");
const nameInput = document.querySelector("#name");
const sectionInput = document.querySelector("#section");
const eventInput = document.querySelector("#event");

const submitButton = document.querySelector("#submit-button");
const refreshButton = document.querySelector("#refresh-button");

const formMessage = document.querySelector("#form-message");
const listMessage = document.querySelector("#list-message");
const registrationList = document.querySelector("#registration-list");

// Display messages
function showMessage(element, message, type = "") {
  element.textContent = message;
  element.className = `message ${type}`;
}

// Create a table cell safely
function makeCell(value) {
  const cell = document.createElement("td");
  cell.textContent = String(value);
  return cell;
}

// Display all registrations in the table
function renderRegistrations(registrations) {
  registrationList.replaceChildren();

  if (!Array.isArray(registrations)) {
    showMessage(listMessage, "Invalid registration data.", "error");
    return;
  }

  if (registrations.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 5;
    cell.textContent = "No registrations yet.";

    row.appendChild(cell);
    registrationList.appendChild(row);
    return;
  }

  registrations.forEach((registration) => {
    const row = document.createElement("tr");

    row.appendChild(makeCell(registration.id));
    row.appendChild(makeCell(registration.name));
    row.appendChild(makeCell(registration.section));
    row.appendChild(makeCell(registration.event));

    const actionCell = document.createElement("td");
    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.dataset.id = registration.id;
    deleteButton.className = "delete-button";

    actionCell.appendChild(deleteButton);
    row.appendChild(actionCell);

    registrationList.appendChild(row);
  });
}

// GET: Load all registrations from the server
async function loadRegistrations() {
  showMessage(listMessage, "Loading registrations...");
  refreshButton.disabled = true;

  try {
    const response = await fetch("/api/events");

    if (!response.ok) {
      throw new Error(
        `Unable to load registrations. HTTP ${response.status}`
      );
    }

    const registrations = await response.json();

    renderRegistrations(registrations);

    showMessage(
      listMessage,
      `${registrations.length} registration(s) found.`,
      "success"
    );

  } catch (error) {
    showMessage(listMessage, error.message, "error");

  } finally {
    refreshButton.disabled = false;
  }
}

// POST: Add a new registration
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const registration = {
    name: nameInput.value.trim(),
    section: sectionInput.value.trim(),
    event: eventInput.value.trim()
  };

  if (
    !registration.name ||
    !registration.section ||
    !registration.event
  ) {
    showMessage(
      formMessage,
      "Please complete all fields.",
      "error"
    );
    return;
  }

  submitButton.disabled = true;
  showMessage(formMessage, "Submitting registration...");

  try {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(registration)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || `Request failed. HTTP ${response.status}`
      );
    }

    showMessage(
      formMessage,
      `Registration added successfully for ${result.name}!`,
      "success"
    );

    form.reset();

    await loadRegistrations();

  } catch (error) {
    showMessage(formMessage, error.message, "error");

  } finally {
    submitButton.disabled = false;
  }
});

// DELETE: Remove a registration
registrationList.addEventListener("click", async (e) => {
  const button = e.target.closest("button[data-id]");

  if (!button) {
    return;
  }

  const id = button.dataset.id;

  button.disabled = true;
  showMessage(listMessage, "Deleting registration...");

  try {
    const response = await fetch(
      `/api/events/${encodeURIComponent(id)}`,
      {
        method: "DELETE"
      }
    );

    if (response.status === 404) {
      throw new Error(
        "Registration not found. Please refresh the list."
      );
    }

    if (!response.ok) {
      throw new Error(`Delete failed. HTTP ${response.status}`);
    }

    showMessage(
      formMessage,
      "Registration deleted successfully!",
      "success"
    );

    await loadRegistrations();

  } catch (error) {
    showMessage(listMessage, error.message, "error");

  } finally {
    button.disabled = false;
  }
});

// Refresh button
refreshButton.addEventListener("click", loadRegistrations);

// Load registrations when the page opens
loadRegistrations();