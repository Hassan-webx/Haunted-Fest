// ================================
// HAUNTED FEST BOOKING SYSTEM
// ================================

const ticketPrices = {
    "early-bird": 500,
    "regular": 750
};


// ================================
// GET ELEMENTS
// ================================

const ticketType = document.getElementById("ticketType");
const quantity = document.getElementById("quantity");
const totalAmount = document.getElementById("totalAmount");
const bookingForm = document.getElementById("bookingForm");


// ================================
// READ TICKET FROM HOMEPAGE
// ================================

const urlParams = new URLSearchParams(window.location.search);

const selectedFromHomepage = urlParams.get("ticket");

if (
    selectedFromHomepage === "early-bird" ||
    selectedFromHomepage === "regular"
) {
    ticketType.value = selectedFromHomepage;
}


// ================================
// CALCULATE TOTAL
// ================================

function calculateTotal() {

    const selectedTicket = ticketType.value;
    const numberOfTickets = Number(quantity.value);

    if (
        !selectedTicket ||
        numberOfTickets < 1
    ) {
        totalAmount.textContent = "KSh 0";
        return;
    }

    const price = ticketPrices[selectedTicket];

    if (!price) {
        totalAmount.textContent = "KSh 0";
        return;
    }

    const total = price * numberOfTickets;

    totalAmount.textContent =
        "KSh " +
        total.toLocaleString("en-KE");
}


// ================================
// TOTAL EVENTS
// ================================

ticketType.addEventListener(
    "change",
    calculateTotal
);

quantity.addEventListener(
    "input",
    calculateTotal
);

calculateTotal();


// ================================
// BOOKING SUBMISSION
// ================================

bookingForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        console.log("Booking form submitted");


        // ================================
        // GET FORM VALUES
        // ================================

        const name =
            document
                .getElementById("fullName")
                .value
                .trim();

        const phone =
            document
                .getElementById("phone")
                .value
                .trim();

        const email =
            document
                .getElementById("email")
                .value
                .trim();

        const selectedTicket =
            ticketType.value;

        const numberOfTickets =
            Number(quantity.value);

        const transactionCode =
            document
                .getElementById("transactionCode")
                .value
                .trim();


        // ================================
        // VALIDATION
        // ================================

        if (
            !name ||
            !phone ||
            !selectedTicket ||
            numberOfTickets < 1 ||
            !transactionCode
        ) {

            alert(
                "Please fill in all required fields."
            );

            return;
        }


        // ================================
        // GATE TICKET
        // ================================

        if (selectedTicket === "gate") {

            alert(
                "Gate tickets are available at the event venue on the event day."
            );

            return;
        }


        // ================================
        // CHECK SUPABASE CONNECTION
        // ================================

        if (
            typeof supabaseClient ===
            "undefined"
        ) {

            console.error(
                "supabaseClient is not defined."
            );

            alert(
                "Database connection is not available. Please refresh the page."
            );

            return;
        }


        // ================================
        // CALCULATE TOTAL
        // ================================

        const total =
            ticketPrices[selectedTicket] *
            numberOfTickets;


        // ================================
        // GENERATE BOOKING NUMBER
        // ================================

        const bookingNumber =
            "HF-" +
            Date.now()
                .toString()
                .slice(-6);


        console.log(
            "Submitting booking:",
            bookingNumber
        );


        // ================================
        // INSERT INTO SUPABASE
        // ================================

        const { error: insertError } =
    await supabaseClient
        .from("bookings")
        .insert([
            {
                booking_number:
                    bookingNumber,

                name:
                    name,

                phone:
                    phone,

                email:
                    email,

                ticket_type:
                    selectedTicket,

                quantity:
                    numberOfTickets,

                amount:
                    total,

                transaction_code:
                    transactionCode,

                status:
                    "Pending Verification",

                checked_in:
                    false
            }
        ]);


        // ================================
        // HANDLE INSERT ERROR
        // ================================

        if (insertError) {

            console.error(
                "SUPABASE BOOKING ERROR:",
                insertError
            );

            alert(
                "BOOKING ERROR:\n\n" +
                insertError.message +
                "\n\nCode: " +
                (insertError.code || "N/A")
            );

            return;
        }


        // ================================
        // SUCCESS
        // ================================

        console.log(
            "Booking successfully saved:",
            bookingNumber
        );


        // ================================
        // CREATE LOCAL BOOKING COPY
        // ================================

        const booking = {

            bookingNumber:
                bookingNumber,

            name:
                name,

            phone:
                phone,

            email:
                email,

            ticketType:
                selectedTicket,

            quantity:
                numberOfTickets,

            amount:
                total,

            transactionCode:
                transactionCode,

            status:
                "Pending Verification",

            checkedIn:
                false,

            date:
                new Date().toISOString()
        };


        // ================================
        // SAVE FOR TICKET PAGE
        // ================================

        localStorage.setItem(
            "latestBooking",
            JSON.stringify(booking)
        );


        // ================================
        // SUCCESS MESSAGE
        // ================================

        alert(
            "Booking submitted successfully!"
        );


        // ================================
        // GO TO TICKET PAGE
        // ================================

        window.location.href =
            "ticket.html";
    }
);