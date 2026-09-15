// ================================
// HAUNTED FEST TICKET PAGE
// ================================


// Get the latest booking
const latestBooking =
    JSON.parse(localStorage.getItem("latestBooking"));


// If there is no booking
if (!latestBooking) {

    alert("No booking found.");

    window.location.href = "booking.html";

}


// Get all bookings
const bookings =
    JSON.parse(localStorage.getItem("hauntedBookings")) || [];


// Find the latest version of this booking
const currentBooking =
    bookings.find(function(booking) {

        return booking.bookingNumber ===
            latestBooking.bookingNumber;

    });


// Use the latest booking information
const bookingData =
    currentBooking || latestBooking;


// ================================
// DISPLAY BOOKING INFORMATION
// ================================

document.getElementById("bookingNumber").textContent =
    bookingData.bookingNumber;


document.getElementById("customerName").textContent =
    bookingData.name;


document.getElementById("customerPhone").textContent =
    bookingData.phone;


document.getElementById("ticketType").textContent =
    bookingData.ticketType
        .replace("-", " ")
        .toUpperCase();


document.getElementById("ticketQuantity").textContent =
    bookingData.quantity;


document.getElementById("ticketAmount").textContent =
    "KSh " +
    Number(bookingData.amount)
        .toLocaleString("en-KE");


document.getElementById("transactionCode").textContent =
    bookingData.transactionCode;


// ================================
// STATUS
// ================================

const statusElement =
    document.getElementById("ticketStatus");


const noticeElement =
    document.getElementById("ticketNotice");


const qrSection =
    document.getElementById("qrSection");


const qrContainer =
    document.getElementById("qrcode");


// Display status
if (statusElement) {

    statusElement.textContent =
        bookingData.status;

}


// ================================
// CONFIRMED BOOKING
// ================================

if (bookingData.status === "Confirmed") {


    // Change notice
    if (noticeElement) {

        noticeElement.innerHTML = `

            <strong>
                ✅ PAYMENT CONFIRMED
            </strong>

            <p>
                Your payment has been verified successfully.
                Your ticket is confirmed and can be used
                for entry at Haunted Fest.
            </p>

        `;

    }


    // Generate QR code
    if (
        qrContainer &&
        typeof QRCode !== "undefined"
    ) {

        qrContainer.innerHTML = "";


        new QRCode(qrContainer, {

            text: bookingData.bookingNumber,

            width: 180,

            height: 180

        });

    }

}


// ================================
// PENDING BOOKING
// ================================

else if (
    bookingData.status ===
    "Pending Verification"
) {


    // Hide QR code
    if (qrSection) {

        qrSection.style.display =
            "none";

    }


    // Pending notice
    if (noticeElement) {

        noticeElement.innerHTML = `

            <strong>
                ⚠️ PAYMENT VERIFICATION
            </strong>

            <p>
                Your booking is currently pending payment
                verification by the event organizer.
                This is not yet a confirmed entry ticket.
            </p>

        `;

    }

}


// ================================
// REJECTED BOOKING
// ================================

else if (
    bookingData.status === "Rejected"
) {


    // Hide QR code
    if (qrSection) {

        qrSection.style.display =
            "none";

    }


    // Rejected notice
    if (noticeElement) {

        noticeElement.innerHTML = `

            <strong>
                ❌ BOOKING REJECTED
            </strong>

            <p>
                Unfortunately, this booking has been rejected
                because the payment could not be verified.
                Please contact the event organizer if you
                believe this was an error.
            </p>

        `;

    }

}