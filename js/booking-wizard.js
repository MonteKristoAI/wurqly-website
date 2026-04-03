/* ============================================================
   WURQLY — Multi-Step Booking Wizard
   4 steps: Service → Details → Schedule → Contact
   ============================================================ */

// CONFIG
const BOOKING_WEBHOOK_URL = 'https://primary-production-5fdce.up.railway.app/webhook/wurqly-booking';

const SERVICES = [
  { id: 'maintenance', icon: '🔧', title: 'Preventive Maintenance', desc: 'Scheduled upkeep to prevent breakdowns' },
  { id: 'repair', icon: '⚡', title: 'Repair Services', desc: 'Fast diagnosis and reliable fixes' },
  { id: 'installation', icon: '🏗️', title: 'Installation', desc: 'Professional equipment setup' },
  { id: 'consultation', icon: '📋', title: 'Consultation', desc: 'Field service strategy review' }
];

const INDUSTRIES = [
  'Retail', 'Hospitality', 'Healthcare', 'Manufacturing',
  'Commercial Real Estate', 'Education', 'Government', 'Other'
];

let bookingData = { service: '', company: '', industry: '', size: '', date: '', time: '', timezone: '', firstName: '', lastName: '', email: '', phone: '', message: '' };
let bookingStep = 1;

function initBookingWizard() {
  const wizard = document.getElementById('booking-wizard');
  if (!wizard) return;
  renderBookingStep(1);
  updateStepIndicators();
}

function renderBookingStep(step) {
  bookingStep = step;
  const body = document.getElementById('booking-body');
  if (!body) return;

  document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
  const target = document.querySelector('[data-booking-step="' + step + '"]');
  if (target) target.classList.add('active');
  updateStepIndicators();

  if (step === 3 && !calendarInitialized) { initCalendar(); }
}

function updateStepIndicators() {
  document.querySelectorAll('.step-indicator').forEach((ind, i) => {
    const stepNum = i + 1;
    ind.classList.remove('active', 'completed');
    if (stepNum === bookingStep) ind.classList.add('active');
    if (stepNum < bookingStep) ind.classList.add('completed');
  });
}

function selectService(serviceId) {
  bookingData.service = serviceId;
  document.querySelectorAll('.service-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.service === serviceId);
  });
  setTimeout(() => renderBookingStep(2), 300);
}

function bookingNext() {
  if (bookingStep === 2) {
    const company = document.getElementById('booking-company');
    const industry = document.getElementById('booking-industry');
    const size = document.getElementById('booking-size');
    if (company && !company.value.trim()) { showFieldError(company, 'Company name is required'); return; }
    bookingData.company = company ? company.value : '';
    bookingData.industry = industry ? industry.value : '';
    bookingData.size = size ? size.value : '';
    renderBookingStep(3);
  } else if (bookingStep === 3) {
    const date = document.getElementById('booking-date');
    const time = document.getElementById('booking-time');
    if (!date || !date.value || !time || !time.value) {
      // Highlight the calendar area
      const panel = document.querySelector('.cal-layout');
      if (panel) { panel.style.outline = '2px solid #EF4444'; panel.style.borderRadius = 'var(--radius-lg)'; setTimeout(() => panel.style.outline = '', 2000); }
      return;
    }
    bookingData.date = date.value;
    bookingData.time = time.value;
    bookingData.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    renderBookingStep(4);
  }
}

function bookingBack() {
  if (bookingStep > 1) renderBookingStep(bookingStep - 1);
}

function submitBooking() {
  const firstName = document.getElementById('booking-firstname');
  const lastName = document.getElementById('booking-lastname');
  const email = document.getElementById('booking-email');
  const phone = document.getElementById('booking-phone');
  const message = document.getElementById('booking-message');

  if (email && !isValidEmail(email.value)) { showFieldError(email, 'Please enter a valid email'); return; }
  if (firstName && !firstName.value.trim()) { showFieldError(firstName, 'First name is required'); return; }

  bookingData.firstName = firstName ? firstName.value : '';
  bookingData.lastName = lastName ? lastName.value : '';
  bookingData.email = email ? email.value : '';
  bookingData.phone = phone ? phone.value : '';
  bookingData.message = message ? message.value : '';
  bookingData.timestamp = new Date().toISOString();
  bookingData.source = 'wurqly-website';

  fetch(BOOKING_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData)
  }).catch(() => {});

  renderBookingStep(5);
}

function showFieldError(input, message) {
  input.style.borderColor = '#EF4444';
  input.focus();
  // Add error text below field
  let errorEl = input.parentElement.querySelector('.field-error');
  if (!errorEl) {
    errorEl = document.createElement('p');
    errorEl.className = 'field-error';
    errorEl.style.cssText = 'color:#EF4444;font-size:0.8125rem;margin-top:0.25rem;font-weight:500;';
    input.parentElement.appendChild(errorEl);
  }
  errorEl.textContent = message || 'This field is required';
  errorEl.style.display = 'block';
  // Clear on input
  input.addEventListener('input', function handler() {
    input.style.borderColor = '';
    if (errorEl) errorEl.style.display = 'none';
    input.removeEventListener('input', handler);
  }, { once: true });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ============================================================
   Calendly-Style Calendar
   ============================================================ */
let calendarInitialized = false;
let calCurrentMonth, calCurrentYear, calSelectedDate = null, calSelectedTime = null;

const CAL_TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'
];

const CAL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function initCalendar() {
  const now = new Date();
  calCurrentMonth = now.getMonth();
  calCurrentYear = now.getFullYear();
  calendarInitialized = true;

  // Set timezone label
  const tzLabel = document.getElementById('cal-tz-label');
  if (tzLabel) {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    tzLabel.textContent = 'Times shown in ' + tz.replace(/_/g, ' ');
  }

  // Nav buttons
  document.getElementById('cal-prev').addEventListener('click', () => {
    calCurrentMonth--;
    if (calCurrentMonth < 0) { calCurrentMonth = 11; calCurrentYear--; }
    renderCalendar();
  });
  document.getElementById('cal-next').addEventListener('click', () => {
    calCurrentMonth++;
    if (calCurrentMonth > 11) { calCurrentMonth = 0; calCurrentYear++; }
    renderCalendar();
  });

  renderCalendar();
}

function renderCalendar() {
  const label = document.getElementById('cal-month-label');
  const grid = document.getElementById('cal-days');
  if (!label || !grid) return;

  label.textContent = CAL_MONTHS[calCurrentMonth] + ' ' + calCurrentYear;

  const today = new Date();
  today.setHours(0,0,0,0);

  const firstDay = new Date(calCurrentYear, calCurrentMonth, 1).getDay();
  const daysInMonth = new Date(calCurrentYear, calCurrentMonth + 1, 0).getDate();

  // Disable prev button if current month
  const prevBtn = document.getElementById('cal-prev');
  if (prevBtn) {
    const isCurrentMonth = calCurrentYear === today.getFullYear() && calCurrentMonth === today.getMonth();
    prevBtn.disabled = isCurrentMonth;
    prevBtn.style.opacity = isCurrentMonth ? '0.3' : '1';
  }

  let html = '';

  // Empty cells for days before 1st
  for (let i = 0; i < firstDay; i++) {
    html += '<span class="cal-day cal-day-empty"></span>';
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(calCurrentYear, calCurrentMonth, d);
    date.setHours(0,0,0,0);
    const isPast = date < today;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isToday = date.getTime() === today.getTime();
    const isSelected = calSelectedDate && date.getTime() === calSelectedDate.getTime();
    const isDisabled = isPast || isWeekend;

    let cls = 'cal-day';
    if (isDisabled) cls += ' cal-day-disabled';
    if (isToday) cls += ' cal-day-today';
    if (isSelected) cls += ' cal-day-selected';

    const dateStr = calCurrentYear + '-' + String(calCurrentMonth + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    html += '<button class="' + cls + '" data-date="' + dateStr + '" ' + (isDisabled ? 'disabled' : '') + '>' + d + '</button>';
  }

  grid.innerHTML = html;

  // Add click handlers
  grid.querySelectorAll('.cal-day:not(.cal-day-disabled):not(.cal-day-empty)').forEach(btn => {
    btn.addEventListener('click', () => {
      const parts = btn.dataset.date.split('-');
      calSelectedDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      calSelectedDate.setHours(0,0,0,0);
      calSelectedTime = null;
      document.getElementById('booking-date').value = btn.dataset.date;
      document.getElementById('booking-time').value = '';
      updateContinueBtn();
      renderCalendar();
      renderTimeSlots();
    });
  });
}

function renderTimeSlots() {
  const header = document.getElementById('cal-times-header');
  const grid = document.getElementById('cal-times-grid');
  if (!header || !grid) return;

  if (!calSelectedDate) {
    header.textContent = 'Select a date first';
    grid.innerHTML = '<p class="cal-times-empty">Pick a date from the calendar to see available times.</p>';
    return;
  }

  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  header.textContent = dayNames[calSelectedDate.getDay()] + ', ' + monthNames[calSelectedDate.getMonth()] + ' ' + calSelectedDate.getDate();

  let html = '';
  CAL_TIME_SLOTS.forEach(slot => {
    const timeVal = convertTo24(slot);
    const isSelected = calSelectedTime === timeVal;
    html += '<button class="cal-time-slot' + (isSelected ? ' cal-time-selected' : '') + '" data-time="' + timeVal + '">' + slot + '</button>';
  });
  grid.innerHTML = html;

  grid.querySelectorAll('.cal-time-slot').forEach(btn => {
    btn.addEventListener('click', () => {
      calSelectedTime = btn.dataset.time;
      document.getElementById('booking-time').value = calSelectedTime;
      updateContinueBtn();
      // Update visual
      grid.querySelectorAll('.cal-time-slot').forEach(b => b.classList.remove('cal-time-selected'));
      btn.classList.add('cal-time-selected');
    });
  });
}

function convertTo24(timeStr) {
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
}

function updateContinueBtn() {
  const btn = document.getElementById('cal-continue-btn');
  if (btn) {
    btn.disabled = !(calSelectedDate && calSelectedTime);
  }
}

document.addEventListener('DOMContentLoaded', initBookingWizard);
