// ======================================
// HAUNTED FEST ADMIN DASHBOARD
// ======================================


// ======================================
// PROTECT ADMIN DASHBOARD
// ======================================

async function checkAdminSession() {

    const {
        data: { session },
        error
    } = await supabaseClient.auth.getSession();

    if (error) {
        console.error("Session error:", error);
        window.location.href = "admin-login.html";
        return false;
    }

    if (!session) {
        window.location.href = "admin-login.html";
        return false;
    }

    console.log("Admin session active:", session.user.email);

    return true;
}


// ======================================
// BOOKINGS FROM SUPABASE
// ======================================

let bookings = [];


// ======================================
// LOAD BOOKINGS
// ======================================

async function loadBookings() {

    const { data, error } =
        await supabaseClient
            .from("bookings")
            .select("*")
            .order("created_at", { ascending: false });

    if (error) {

        console.error(
            "Could not load bookings:",
            error
        );

        alert(
            "Could not load bookings from the database."
        );

        return;
    }

    // Convert Supabase field names
    // to the names used by our dashboard


    bookings = data.map(function(booking) {

        return {

            id: booking.id,

            bookingNumber:
                booking.booking_number,

            name:
                booking.name,

            phone:
                booking.phone,

            email:
                booking.email,

            ticketType:
                booking.ticket_type,

            quantity:
                Number(booking.quantity),

            amount:
                Number(booking.amount),

            transactionCode:
                booking.transaction_code,

            status:
                booking.status,

            checkedIn:
                booking.checked_in,

            date:
                booking.created_at

        };

    });

    // Refresh dashboard


    updateStatistics();

    displayBookings(bookings);

    updateSalesReport();
}


// ======================================
// DISPLAY DASHBOARD STATISTICS
// ======================================

function updateStatistics() {

    // ==================================
    // TOTAL BOOKINGS
    // ==================================

    const totalBookingsElement =
        document.getElementById("totalBookings");

    if (totalBookingsElement) {

        totalBookingsElement.textContent =
            bookings.length;

    }


    // ==================================
    // EARLY BIRD SOLD
    // ==================================

    let earlyBirdSold = 0;

    bookings.forEach(function(booking) {

        if (
            booking.ticketType === "early-bird" &&
            booking.status !== "Rejected"
        ) {

            earlyBirdSold +=
                Number(booking.quantity);

        }

    });


    const earlyBirdElement =
        document.getElementById("earlyBirdSold");

    if (earlyBirdElement) {

        earlyBirdElement.textContent =
            earlyBirdSold + " / 50";

    }


    // ==================================
    // REGULAR SOLD
    // ==================================

    let regularSold = 0;

    bookings.forEach(function(booking) {

        if (
            booking.ticketType === "regular" &&
            booking.status !== "Rejected"
        ) {

            regularSold +=
                Number(booking.quantity);

        }

    });


    const regularElement =
        document.getElementById("regularSold");

    if (regularElement) {

        regularElement.textContent =
            regularSold + " / 50";

    }


    // ==================================
    // CONFIRMED ONLINE REVENUE
    // ==================================

    let totalRevenue = 0;

    bookings.forEach(function(booking) {

        if (booking.status === "Confirmed") {

            totalRevenue +=
                Number(booking.amount);

        }

    });


    const totalRevenueElement =
        document.getElementById("totalRevenue");

    if (totalRevenueElement) {

        totalRevenueElement.textContent =
            "KSh " +
            totalRevenue.toLocaleString("en-KE");

    }


    // ==================================
    // GATE SALES
    // ==================================

    const gateSales =
        JSON.parse(
            localStorage.getItem("hauntedGateSales")
        ) || [];


    let gateTicketsSold = 0;

    let gateRevenue = 0;


    gateSales.forEach(function(sale) {

        gateTicketsSold +=
            Number(sale.quantity);

        gateRevenue +=
            Number(sale.amount);

    });


    const gateTicketsElement =
        document.getElementById("gateTicketsSold");

    if (gateTicketsElement) {

        gateTicketsElement.textContent =
            gateTicketsSold;

    }


    const gateRevenueElement =
        document.getElementById("gateRevenue");

    if (gateRevenueElement) {

        gateRevenueElement.textContent =
            "KSh " +
            gateRevenue.toLocaleString("en-KE");

    }


    // ==================================
    // CHECKED-IN TICKETS
    // ==================================

    let checkedInTickets = 0;


    bookings.forEach(function(booking) {

        if (booking.checkedIn === true) {

            checkedInTickets +=
                Number(booking.quantity);

        }

    });


    const checkedInElement =
        document.getElementById(
            "checkedInTickets"
        );

    if (checkedInElement) {

        checkedInElement.textContent =
            checkedInTickets;

    }

}


// ======================================
// DISPLAY BOOKINGS
// ======================================

function displayBookings(bookingsToDisplay) {

    const table =
        document.getElementById("bookingsTable");


    if (!table) {
        return;
    }


    table.innerHTML = "";


    // ==================================
    // NO BOOKINGS
    // ==================================

    if (bookingsToDisplay.length === 0) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="text-align:center;"
                >

                    No bookings found.

                </td>

            </tr>

        `;

        return;
    }


    // ==================================
    // DISPLAY EACH BOOKING
    // ==================================

    bookingsToDisplay.forEach(function(booking) {

        const row =
            document.createElement("tr");


        const ticketName =
            booking.ticketType
                .replace("-", " ")
                .toUpperCase();


        let actionHTML = "";


        if (
            booking.status ===
            "Pending Verification"
        ) {

            actionHTML = `

                <button
                    onclick="approveBooking('${booking.bookingNumber}')"
                >
                    Approve
                </button>

                <button
                    onclick="rejectBooking('${booking.bookingNumber}')"
                >
                    Reject
                </button>

            `;

        } else {

            actionHTML =
                booking.status;

        }


        row.innerHTML = `

            <td>
                ${booking.bookingNumber}
            </td>

            <td>
                ${booking.name}
                <br>
                <small>
                    ${booking.phone}
                </small>
            </td>

            <td>
                ${ticketName}
            </td>

            <td>
                ${booking.quantity}
            </td>

            <td>
                KSh
                ${Number(booking.amount)
                    .toLocaleString("en-KE")}
            </td>

            <td>
                ${booking.transactionCode}
            </td>

            <td>
                ${booking.status}
            </td>

            <td>
                ${actionHTML}
            </td>

        `;


        table.appendChild(row);

    });

}


// ======================================
// APPROVE BOOKING
// ======================================

async function approveBooking(bookingNumber) {

    const booking =
        bookings.find(function(item) {

            return (
                item.bookingNumber ===
                bookingNumber
            );

        });


    if (!booking) {

        alert("Booking not found.");

        return;

    }


    if (
        booking.status !==
        "Pending Verification"
    ) {

        alert(
            "This booking has already been processed."
        );

        return;

    }


    const confirmation =
        confirm(
            "Confirm M-Pesa payment for booking " +
            bookingNumber +
            "?"
        );


    if (!confirmation) {

        return;

    }


    // ==================================
    // UPDATE SUPABASE
    // ==================================

    const { error } =
        await supabaseClient
            .from("bookings")
            .update({
                status: "Confirmed"
            })
            .eq(
                "booking_number",
                bookingNumber
            );


    if (error) {

        console.error(
            "Approval error:",
            error
        );

        alert(
            "Could not confirm this booking."
        );

        return;

    }


    // ==================================
    // REFRESH DASHBOARD
    // ==================================

    await loadBookings();


    alert(
        "Booking " +
        bookingNumber +
        " has been confirmed."
    );

}


// ======================================
// REJECT BOOKING
// ======================================

async function rejectBooking(bookingNumber) {

    const booking =
        bookings.find(function(item) {

            return (
                item.bookingNumber ===
                bookingNumber
            );

        });


    if (!booking) {

        alert("Booking not found.");

        return;

    }


    if (
        booking.status !==
        "Pending Verification"
    ) {

        alert(
            "This booking has already been processed."
        );

        return;

    }


    const confirmation =
        confirm(
            "Are you sure you want to reject booking " +
            bookingNumber +
            "?"
        );


    if (!confirmation) {

        return;

    }


    // ==================================
    // UPDATE SUPABASE
    // ==================================

    const { error } =
        await supabaseClient
            .from("bookings")
            .update({
                status: "Rejected"
            })
            .eq(
                "booking_number",
                bookingNumber
            );


    if (error) {

        console.error(
            "Rejection error:",
            error
        );

        alert(
            "Could not reject this booking."
        );

        return;

    }


    // ==================================
    // REFRESH DASHBOARD
    // ==================================

    await loadBookings();


    alert(
        "Booking " +
        bookingNumber +
        " has been rejected."
    );

}


// ======================================
// SEARCH BOOKINGS
// ======================================

const searchInput =
    document.getElementById(
        "searchBookings"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        function() {

            const searchValue =
                searchInput.value
                    .toLowerCase()
                    .trim();


            const filteredBookings =
                bookings.filter(
                    function(booking) {

                        return (

                            String(
                                booking.name || ""
                            )
                                .toLowerCase()
                                .includes(
                                    searchValue
                                )

                            ||

                            String(
                                booking.phone || ""
                            )
                                .toLowerCase()
                                .includes(
                                    searchValue
                                )

                            ||

                            String(
                                booking.bookingNumber || ""
                            )
                                .toLowerCase()
                                .includes(
                                    searchValue
                                )

                            ||

                            String(
                                booking.transactionCode || ""
                            )
                                .toLowerCase()
                                .includes(
                                    searchValue
                                )

                        );

                    }
                );


            displayBookings(
                filteredBookings
            );

        }
    );

}


// ======================================
// LOGOUT
// ======================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function() {

            const { error } =
                await supabaseClient.auth.signOut();


            if (error) {

                console.error(
                    "Logout error:",
                    error
                );

                alert(
                    "Could not log out. Please try again."
                );

                return;

            }


            window.location.href =
                "admin-login.html";

        }
    );

}


// ======================================
// EVENT DAY CHECK-IN
// ======================================

const checkinSearch =
    document.getElementById(
        "checkinSearch"
    );


const checkinBtn =
    document.getElementById(
        "checkinBtn"
    );


const checkinResult =
    document.getElementById(
        "checkinResult"
    );


if (checkinBtn) {

    checkinBtn.addEventListener(
        "click",
        function() {

            const searchValue =
                checkinSearch.value
                    .toLowerCase()
                    .trim();


            if (!searchValue) {

                checkinResult.innerHTML = `

                    <div class="checkin-card">

                        <p class="checkin-warning">

                            Please enter a booking
                            number, phone number
                            or customer name.

                        </p>

                    </div>

                `;

                return;

            }


            // ==================================
            // FIND BOOKING
            // ==================================

            const booking =
                bookings.find(
                    function(item) {

                        return (

                            String(
                                item.bookingNumber || ""
                            )
                                .toLowerCase()
                                .includes(
                                    searchValue
                                )

                            ||

                            String(
                                item.phone || ""
                            )
                                .toLowerCase()
                                .includes(
                                    searchValue
                                )

                            ||

                            String(
                                item.name || ""
                            )
                                .toLowerCase()
                                .includes(
                                    searchValue
                                )

                        );

                    }
                );


            // ==================================
            // NOT FOUND
            // ==================================

            if (!booking) {

                checkinResult.innerHTML = `

                    <div class="checkin-card">

                        <p class="checkin-error">

                            ❌ Booking not found.

                        </p>

                    </div>

                `;

                return;

            }


            // ==================================
            // PAYMENT NOT CONFIRMED
            // ==================================

            if (
                booking.status !==
                "Confirmed"
            ) {

                checkinResult.innerHTML = `

                    <div class="checkin-card">

                        <p class="checkin-error">

                            ❌ ENTRY NOT ALLOWED

                        </p>

                        <p>

                            Booking:

                            <strong>
                                ${booking.bookingNumber}
                            </strong>

                        </p>

                        <p>

                            Status:

                            <strong>
                                ${booking.status}
                            </strong>

                        </p>

                        <p style="margin-top:10px;">

                            Only confirmed bookings
                            can be checked in.

                        </p>

                    </div>

                `;

                return;

            }


            // ==================================
            // ALREADY CHECKED IN
            // ==================================

            if (
                booking.checkedIn === true
            ) {

                checkinResult.innerHTML = `

                    <div class="checkin-card">

                        <p class="checkin-error">

                            🚫 ALREADY CHECKED IN

                        </p>


                        <div class="checkin-details">

                            <div class="checkin-detail">

                                <span>
                                    BOOKING NUMBER
                                </span>

                                <strong>
                                    ${booking.bookingNumber}
                                </strong>

                            </div>


                            <div class="checkin-detail">

                                <span>
                                    CUSTOMER
                                </span>

                                <strong>
                                    ${booking.name}
                                </strong>

                            </div>

                        </div>


                        <p>

                            This ticket has already
                            been used for entry.

                        </p>

                    </div>

                `;

                return;

            }


            // ==================================
            // VALID BOOKING
            // ==================================

            const ticketName =
                booking.ticketType
                    .replace("-", " ")
                    .toUpperCase();


            checkinResult.innerHTML = `

                <div class="checkin-card">

                    <p class="checkin-success">

                        ✅ VALID TICKET

                    </p>


                    <div class="checkin-details">


                        <div class="checkin-detail">

                            <span>
                                BOOKING NUMBER
                            </span>

                            <strong>
                                ${booking.bookingNumber}
                            </strong>

                        </div>


                        <div class="checkin-detail">

                            <span>
                                CUSTOMER
                            </span>

                            <strong>
                                ${booking.name}
                            </strong>

                        </div>


                        <div class="checkin-detail">

                            <span>
                                PHONE
                            </span>

                            <strong>
                                ${booking.phone}
                            </strong>

                        </div>


                        <div class="checkin-detail">

                            <span>
                                TICKET TYPE
                            </span>

                            <strong>
                                ${ticketName}
                            </strong>

                        </div>


                        <div class="checkin-detail">

                            <span>
                                QUANTITY
                            </span>

                            <strong>
                                ${booking.quantity}
                            </strong>

                        </div>


                        <div class="checkin-detail">

                            <span>
                                PAYMENT
                            </span>

                            <strong>
                                CONFIRMED
                            </strong>

                        </div>


                    </div>


                    <div class="checkin-action">

                        <button
                            type="button"
                            class="booking-submit"
                            onclick="completeCheckIn('${booking.bookingNumber}')"
                        >

                            ✅ ADMIT ATTENDEE

                        </button>

                    </div>

                </div>

            `;

        }
    );

}


// ======================================
// COMPLETE CHECK-IN
// ======================================

async function completeCheckIn(
    bookingNumber
) {

    const booking =
        bookings.find(function(item) {

            return (
                item.bookingNumber ===
                bookingNumber
            );

        });


    if (!booking) {

        alert("Booking not found.");

        return;

    }


    if (
        booking.status !==
        "Confirmed"
    ) {

        alert(
            "This booking is not confirmed."
        );

        return;

    }


    if (
        booking.checkedIn === true
    ) {

        alert(
            "This ticket has already been checked in."
        );

        return;

    }


    // ==================================
    // UPDATE SUPABASE
    // ==================================

    const { error } =
        await supabaseClient
            .from("bookings")
            .update({
                checked_in: true
            })
            .eq(
                "booking_number",
                bookingNumber
            );


    if (error) {

        console.error(
            "Check-in error:",
            error
        );

        alert(
            "Could not complete check-in."
        );

        return;

    }


    // ==================================
    // SHOW SUCCESS
    // ==================================

    checkinResult.innerHTML = `

        <div class="checkin-card">

            <p class="checkin-success">

                🎉 ATTENDEE ADMITTED

            </p>


            <div class="checkin-details">


                <div class="checkin-detail">

                    <span>
                        BOOKING NUMBER
                    </span>

                    <strong>
                        ${booking.bookingNumber}
                    </strong>

                </div>


                <div class="checkin-detail">

                    <span>
                        CUSTOMER
                    </span>

                    <strong>
                        ${booking.name}
                    </strong>

                </div>


                <div class="checkin-detail">

                    <span>
                        TICKET TYPE
                    </span>

                    <strong>
                        ${booking.ticketType
                            .replace("-", " ")
                            .toUpperCase()}
                    </strong>

                </div>


                <div class="checkin-detail">

                    <span>
                        QUANTITY
                    </span>

                    <strong>
                        ${booking.quantity}
                    </strong>

                </div>


            </div>


            <p class="checkin-success">

                ✅ Check-in completed successfully.

            </p>

        </div>

    `;


    // ==================================
    // REFRESH DASHBOARD DATA
    // ==================================

  await  loadBookings();

}


// ======================================
// SALES REPORT
// ======================================

function updateSalesReport() {

    // ==================================
    // GATE SALES
    // ==================================

    const gateSales =
        JSON.parse(
            localStorage.getItem(
                "hauntedGateSales"
            )
        ) || [];


    // ==================================
    // ONLINE SALES
    // ==================================

    let onlineTickets = 0;

    let onlineRevenue = 0;

    let checkedInTickets = 0;

    let earlyBirdSold = 0;

    let regularSold = 0;


    bookings.forEach(function(booking) {


        // ==============================
        // TICKET COUNTS
        // ==============================

        if (
            booking.status !==
            "Rejected"
        ) {

            if (
                booking.ticketType ===
                "early-bird"
            ) {

                earlyBirdSold +=
                    Number(booking.quantity);

            }


            if (
                booking.ticketType ===
                "regular"
            ) {

                regularSold +=
                    Number(booking.quantity);

            }

        }


        // ==============================
        // CONFIRMED ONLINE SALES
        // ==============================

        if (
            booking.status ===
            "Confirmed"
        ) {

            onlineTickets +=
                Number(booking.quantity);

            onlineRevenue +=
                Number(booking.amount);

        }


        // ==============================
        // CHECKED IN
        // ==============================

        if (
            booking.checkedIn === true
        ) {

            checkedInTickets +=
                Number(booking.quantity);

        }

    });


    // ==================================
    // GATE SALES TOTALS
    // ==================================

    let gateTicketsSold = 0;

    let gateRevenue = 0;


    gateSales.forEach(function(sale) {

        gateTicketsSold +=
            Number(sale.quantity);

        gateRevenue +=
            Number(sale.amount);

    });


    // ==================================
    // TOTALS
    // ==================================

    const totalTicketsSold =
        onlineTickets +
        gateTicketsSold;


    const totalRevenue =
        onlineRevenue +
        gateRevenue;


    // ==================================
    // DISPLAY REPORT
    // ==================================

    const reportOnlineTickets =
        document.getElementById(
            "reportOnlineTickets"
        );

    if (reportOnlineTickets) {

        reportOnlineTickets.textContent =
            onlineTickets;

    }


    const reportGateTickets =
        document.getElementById(
            "reportGateTickets"
        );

    if (reportGateTickets) {

        reportGateTickets.textContent =
            gateTicketsSold;

    }


    const reportTotalTickets =
        document.getElementById(
            "reportTotalTickets"
        );

    if (reportTotalTickets) {

        reportTotalTickets.textContent =
            totalTicketsSold;

    }


    const reportOnlineRevenue =
        document.getElementById(
            "reportOnlineRevenue"
        );

    if (reportOnlineRevenue) {

        reportOnlineRevenue.textContent =
            "KSh " +
            onlineRevenue.toLocaleString(
                "en-KE"
            );

    }


    const reportGateRevenue =
        document.getElementById(
            "reportGateRevenue"
        );

    if (reportGateRevenue) {

        reportGateRevenue.textContent =
            "KSh " +
            gateRevenue.toLocaleString(
                "en-KE"
            );

    }


    const reportTotalRevenue =
        document.getElementById(
            "reportTotalRevenue"
        );

    if (reportTotalRevenue) {

        reportTotalRevenue.textContent =
            "KSh " +
            totalRevenue.toLocaleString(
                "en-KE"
            );

    }


    const reportCheckedIn =
        document.getElementById(
            "reportCheckedIn"
        );

    if (reportCheckedIn) {

        reportCheckedIn.textContent =
            checkedInTickets;

    }


    const reportEarlyRemaining =
        document.getElementById(
            "reportEarlyRemaining"
        );

    if (reportEarlyRemaining) {

        reportEarlyRemaining.textContent =
            Math.max(
                0,
                50 - earlyBirdSold
            );

    }


    const reportRegularRemaining =
        document.getElementById(
            "reportRegularRemaining"
        );

    if (reportRegularRemaining) {

        reportRegularRemaining.textContent =
            Math.max(
                0,
                50 - regularSold
            );

    }

}


// ======================================
// GATE TICKET SALES
// ======================================

const gateSaleForm =
    document.getElementById(
        "gateSaleForm"
    );


const gateQuantity =
    document.getElementById(
        "gateQuantity"
    );


const gateSaleTotal =
    document.getElementById(
        "gateSaleTotal"
    );


const GATE_TICKET_PRICE = 1000;


// ======================================
// CALCULATE GATE SALE TOTAL
// ======================================

if (
    gateQuantity &&
    gateSaleTotal
) {

    gateQuantity.addEventListener(
        "input",
        function() {

            const quantity =
                Number(
                    gateQuantity.value
                );


            const total =
                GATE_TICKET_PRICE *
                quantity;


            gateSaleTotal.textContent =
                "KSh " +
                total.toLocaleString(
                    "en-KE"
                );

        }
    );

}


// ======================================
// RECORD GATE SALE
// ======================================

if (gateSaleForm) {

    gateSaleForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const customerName =
                document.getElementById(
                    "gateCustomerName"
                )
                    .value
                    .trim();


            const customerPhone =
                document.getElementById(
                    "gateCustomerPhone"
                )
                    .value
                    .trim();


            const quantity =
                Number(
                    document.getElementById(
                        "gateQuantity"
                    ).value
                );


            const paymentMethod =
                document.getElementById(
                    "gatePaymentMethod"
                ).value;


            if (
                !customerName ||
                !customerPhone ||
                quantity < 1 ||
                !paymentMethod
            ) {

                alert(
                    "Please fill in all gate sale details."
                );

                return;

            }


            const total =
                GATE_TICKET_PRICE *
                quantity;


            // ==============================
            // GET EXISTING GATE SALES
            // ==============================

            let gateSales =
                JSON.parse(
                    localStorage.getItem(
                        "hauntedGateSales"
                    )
                ) || [];


            // ==============================
            // CREATE GATE SALE
            // ==============================

            const gateSale = {

                saleNumber:
                    "GATE-" +
                    Date.now()
                        .toString()
                        .slice(-6),

                customerName:
                    customerName,

                customerPhone:
                    customerPhone,

                quantity:
                    quantity,

                amount:
                    total,

                paymentMethod:
                    paymentMethod,

                date:
                    new Date()
                        .toISOString()

            };


            // ==============================
            // SAVE SALE
            // ==============================

            gateSales.push(
                gateSale
            );


            localStorage.setItem(
                "hauntedGateSales",
                JSON.stringify(
                    gateSales
                )
            );


            // ==============================
            // CLEAR FORM
            // ==============================

            gateSaleForm.reset();


            gateQuantity.value = 1;


            gateSaleTotal.textContent =
                "KSh 1,000";


            // ==============================
            // UPDATE DASHBOARD
            // ==============================

            updateStatistics();

            updateSalesReport();


            alert(

                "Gate sale recorded successfully.\n\n" +

                "Sale Number: " +
                gateSale.saleNumber +

                "\nTickets: " +
                quantity +

                "\nAmount: KSh " +
                total.toLocaleString(
                    "en-KE"
                )

            );

        }
    );

}


// ======================================
// START ADMIN DASHBOARD
// ======================================

async function startAdminDashboard() {

    const authenticated =
        await checkAdminSession();


    if (!authenticated) {

        return;

    }


    await loadBookings();

}


// ======================================
// START
// ======================================

startAdminDashboard();