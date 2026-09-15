// ================================
// HAUNTED FEST TICKET PAGE
// ================================


// Get the latest booking saved on this device
const latestBooking =
    JSON.parse(localStorage.getItem("latestBooking"));


// If there is no booking
if (!latestBooking) {

    alert("No booking found.");

    window.location.href = "booking.html";

}


// ================================
// DISPLAY BASIC BOOKING INFORMATION
// ================================

document.getElementById("bookingNumber").textContent =
    latestBooking.bookingNumber;

document.getElementById("customerName").textContent =
    latestBooking.name;

document.getElementById("customerPhone").textContent =
    latestBooking.phone;

document.getElementById("ticketType").textContent =
    latestBooking.ticketType
        .replace("-", " ")
        .toUpperCase();

document.getElementById("ticketQuantity").textContent =
    latestBooking.quantity;

document.getElementById("ticketAmount").textContent =
    "KSh " +
    Number(latestBooking.amount)
        .toLocaleString("en-KE");

document.getElementById("transactionCode").textContent =
    latestBooking.transactionCode;


// ================================
// ELEMENTS
// ================================

const statusElement =
    document.getElementById("ticketStatus");

const noticeElement =
    document.getElementById("ticketNotice");

const qrSection =
    document.getElementById("qrSection");

const qrContainer =
    document.getElementById("qrcode");


// ================================
// DISPLAY TICKET STATUS
// ================================

function displayTicketStatus(status) {

    if (statusElement) {

        statusElement.textContent = status;

    }


    // ================================
    // CONFIRMED
    // ================================

    if (status === "Confirmed") {

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


        // Show QR code
        if (qrSection) {

            qrSection.style.display = "";

        }


        // Generate QR code
        if (
            qrContainer &&
            typeof QRCode !== "undefined"
        ) {

            qrContainer.innerHTML = "";

            new QRCode(qrContainer, {

                text: latestBooking.bookingNumber,

                width: 180,

                height: 180

            });

        }

    }


    // ================================
    // PENDING
    // ================================

    else if (
        status === "Pending Verification"
    ) {

        if (qrSection) {

            qrSection.style.display = "none";

        }


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
    // REJECTED
    // ================================

    else if (status === "Rejected") {

        if (qrSection) {

            qrSection.style.display = "none";

        }


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

}


// ================================
// GET REAL STATUS FROM SUPABASE
// ================================

async function checkBookingStatus() {

    try {

        const { data, error } =
            await supabaseClient
                .from("bookings")
                .select("status")
                .eq(
                    "booking_number",
                    latestBooking.bookingNumber
                )
                .single();


        if (error) {

            console.error(
                "Ticket status error:",
                error
            );

            // Fall back to local status
            displayTicketStatus(
                latestBooking.status
            );

            return;

        }


        if (data) {

            // Use the REAL status from Supabase
            displayTicketStatus(data.status);

        }

    }

    catch (error) {

        console.error(
            "Unexpected ticket error:",
            error
        );

        // Fall back to local status
        displayTicketStatus(
            latestBooking.status
        );

    }

}


// ================================
// START
// ================================

displayTicketStatus(
    latestBooking.status
);

checkBookingStatus();