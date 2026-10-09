// Contact and seat-reservation forms. Both post to the workshop hub Worker
// (davidmcgilltech/davidmcgill-learn), which emails the message on. No email
// address appears anywhere on this site, so there is nothing for a scraper to
// harvest. Spam controls: Turnstile, a honeypot field, and server-side limits.

const LOCAL = ["localhost", "127.0.0.1"].includes(window.location.hostname);

const API_BASE = LOCAL ? "http://localhost:8787" : "https://learn.davidmcgill.tech";

// Public by design: the site key identifies the widget, the secret stays in the
// Worker. Locally, Cloudflare's always-pass test key is used.
const TURNSTILE_SITE_KEY = LOCAL ? "1x00000000000000000000AA" : "0x4AAAAAAFOZyEYsEm5u41DG";

const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

// ------------------------------------------------------------------ Turnstile

let turnstileLoading;

/** Load the Turnstile script once, the first time a form is used. */
function loadTurnstile() {
  turnstileLoading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TURNSTILE_SRC;
    script.async = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = () => reject(new Error("Verification could not load"));
    document.head.append(script);
  });
  return turnstileLoading;
}

// --------------------------------------------------------------------- helpers

function setStatus(node, message, kind) {
  node.textContent = message ?? "";
  node.className = `notice${kind ? ` ${kind}` : ""}`;
}

/** First invalid required field gets focus and aria-invalid. */
function firstInvalidField(form) {
  let first = null;
  for (const field of form.querySelectorAll("input[required], textarea[required]")) {
    const valid = field.value.trim() !== "" && field.checkValidity();
    field.toggleAttribute("aria-invalid", !valid);
    if (!valid && !first) first = field;
  }
  return first;
}

async function postJson(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? "Something went wrong. Try again, or message me on WhatsApp.");
  return data;
}

// ----------------------------------------------------------------- seat count

const seatsBox = document.querySelector("[data-seats]");
const seatRow = document.querySelector("[data-seat-row]");
const seatCount = document.querySelector("[data-seat-count]");
const reserveButton = document.querySelector("[data-form='reserve'] [data-submit]");

/** Draw one marker per seat. `mine` is the index of a seat just reserved. */
function drawSeats({ seatsTotal, seatsLeft }, mine = -1) {
  const taken = seatsTotal - seatsLeft;
  seatRow.replaceChildren(
    ...Array.from({ length: seatsTotal }, (_, i) => {
      const seat = document.createElement("span");
      seat.className = i === mine ? "seat mine" : i < taken ? "seat taken" : "seat";
      return seat;
    }),
  );
  seatRow.setAttribute("aria-label", `${taken} of ${seatsTotal} seats taken`);
  seatCount.textContent =
    seatsLeft === 0
      ? "The first group is full. You can still join the waitlist."
      : `${seatsLeft} of ${seatsTotal} seats left in the first group.`;
  if (reserveButton && mine === -1) {
    reserveButton.textContent = seatsLeft === 0 ? "Join the waitlist" : "Hold my seat";
  }
  seatsBox.hidden = false;
}

async function loadSeats(slug) {
  try {
    const res = await fetch(`${API_BASE}/api/public/workshops/${encodeURIComponent(slug)}`);
    if (!res.ok) return null;
    const info = await res.json();
    drawSeats(info);
    return info;
  } catch {
    // The seat row is an enhancement. If the count cannot load, the form still works.
    return null;
  }
}

// ----------------------------------------------------------------------- forms

function wireForm(form) {
  const kind = form.dataset.form;
  const status = form.querySelector("[data-status]");
  const button = form.querySelector("button[type='submit']");
  const slot = form.querySelector("[data-turnstile]");
  let widgetId = null;
  let seatInfo = null;

  if (kind === "reserve") {
    loadSeats(form.dataset.workshop).then((info) => {
      seatInfo = info;
    });
  }

  // Render the challenge when the visitor first touches the form, not on page load.
  const renderWidget = async () => {
    if (widgetId !== null) return;
    try {
      const turnstile = await loadTurnstile();
      if (widgetId === null) widgetId = turnstile.render(slot, { sitekey: TURNSTILE_SITE_KEY });
    } catch (error) {
      setStatus(status, `${error.message}. Message me on WhatsApp instead.`, "error");
    }
  };
  form.addEventListener("focusin", renderWidget, { once: true });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const invalid = firstInvalidField(form);
    if (invalid) {
      setStatus(status, "Fill in the highlighted fields.", "error");
      invalid.focus();
      return;
    }

    await renderWidget();
    const token = widgetId === null ? "" : window.turnstile.getResponse(widgetId);
    if (!token) {
      setStatus(status, "Complete the verification box above, then send again.", "error");
      return;
    }

    const body = Object.fromEntries(new FormData(form).entries());
    body.turnstileToken = token;
    delete body["cf-turnstile-response"];
    if (kind === "reserve") body.workshop = form.dataset.workshop;

    button.disabled = true;
    setStatus(status, "Sending…");
    try {
      if (kind === "reserve") {
        const result = await postJson("/api/public/reservations", body);
        const waitlisted = result.status === "waitlist";
        if (seatInfo && !waitlisted && seatInfo.seatsLeft > 0) {
          const mine = seatInfo.seatsTotal - seatInfo.seatsLeft;
          drawSeats({ seatsTotal: seatInfo.seatsTotal, seatsLeft: seatInfo.seatsLeft - 1 }, mine);
        }
        showDone(
          form,
          waitlisted ? "You are on the waitlist" : "Your seat is held",
          waitlisted
            ? "The first group is full. I will email you if a seat opens up or when the next date is set."
            : "Nothing to pay yet. Check your email: it has a link to your workshop hub, where you send me the tasks you want to work on.",
        );
      } else {
        await postJson("/api/public/contact", body);
        showDone(form, "Message sent", "I read every message myself and reply by email, usually within a business day.");
      }
    } catch (error) {
      setStatus(status, error.message, "error");
      window.turnstile?.reset(widgetId);
      button.disabled = false;
    }
  });
}

/** Swap the form for a confirmation and move focus to it for screen readers. */
function showDone(form, heading, detail) {
  const panel = document.createElement("div");
  panel.className = "notice ok done";
  panel.tabIndex = -1;
  panel.setAttribute("role", "status");
  const strong = document.createElement("strong");
  strong.textContent = heading;
  const text = document.createElement("p");
  text.textContent = detail;
  panel.append(strong, text);
  form.replaceWith(panel);
  panel.focus();
}

document.querySelectorAll("form[data-form]").forEach(wireForm);
