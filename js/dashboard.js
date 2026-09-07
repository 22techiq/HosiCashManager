```javascript
/*
========================================================
MASC CLINIC DASHBOARD
========================================================
*/


const currentUser =
    getStoredUser();


if (
    !getToken() ||
    !currentUser
) {

    window.location.href =
        "index.html";

}


/*
========================================================
USER INFORMATION
========================================================
*/

document.getElementById(
    "userName"
).textContent =
    currentUser.name;


document.getElementById(
    "welcomeName"
).textContent =
    currentUser.name.split(" ")[0];


document.getElementById(
    "userRole"
).textContent =
    currentUser.role;


document.getElementById(
    "userAvatar"
).textContent =
    currentUser.name
        .charAt(0)
        .toUpperCase();


/*
========================================================
ADMIN ELEMENTS
========================================================
*/

if (
    currentUser.role !== "admin"
) {

    document
        .querySelectorAll(".admin-only")
        .forEach(element => {

            element.style.display =
                "none";

        });

}


/*
========================================================
DATE
========================================================
*/

document.getElementById(
    "currentDate"
).textContent =
    new Date().toLocaleDateString(
        "en-KE",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );


/*
========================================================
NAVIGATION
========================================================
*/

const navItems =
    document.querySelectorAll(
        ".nav-item"
    );


navItems.forEach(item => {

    item.addEventListener(
        "click",
        () => {

            switchSection(
                item.dataset.section
            );

        }
    );

});


document
    .querySelectorAll(
        "[data-section]"
    )
    .forEach(element => {

        element.addEventListener(
            "click",
            () => {

                if (
                    element.dataset.section
                ) {

                    switchSection(
                        element.dataset.section
                    );

                }

            }
        );

    });


function switchSection(section) {

    /*
     * Prevent unauthorized admin
     * sections from being opened.
     */

    if (
        ["users", "audit"].includes(section) &&
        currentUser.role !== "admin"
    ) {

        showToast(
            "Administrator access required.",
            "error"
        );

        return;

    }


    document
        .querySelectorAll(
            ".page-section"
        )
        .forEach(sectionElement => {

            sectionElement.classList.remove(
                "active"
            );

        });


    const target =
        document.getElementById(
            section + "Section"
        );


    if (target) {

        target.classList.add(
            "active"
        );

    }


    navItems.forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.section === section
        );

    });


    document
        .getElementById("sidebar")
        .classList.remove("open");


    document
        .getElementById("sidebarOverlay")
        .classList.remove("show");


    if (
        section === "collections"
    ) {

        loadCollections();

    }


    if (
        section === "reports"
    ) {

        loadReport();

    }


    if (
        section === "users"
    ) {

        loadUsers();

    }

}


/*
========================================================
DASHBOARD
========================================================
*/

async function loadDashboard() {

    const result =
        await apiRequest({

            action: "dashboard"

        });


    if (!result.success)
        return;


    document.getElementById(
        "todayTotal"
    ).textContent =
        money(result.today);


    document.getElementById(
        "monthTotal"
    ).textContent =
        money(result.month);


    document.getElementById(
        "yearTotal"
    ).textContent =
        money(result.year);


    document.getElementById(
        "transactionCount"
    ).textContent =
        result.transactions || 0;


    renderRecent(
        result.collections || []
    );

}


/*
========================================================
RECENT COLLECTIONS
========================================================
*/

function renderRecent(data) {

    const table =
        document.getElementById(
            "recentTable"
        );


    if (!data.length) {

        table.innerHTML = `
            <tr>
                <td colspan="6"
                    class="empty-row">
                    No collections recorded yet.
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML =
        data.map(item => `

        <tr>

            <td>${safe(item.date)}</td>

            <td>
                <span class="receipt">
                    ${safe(item.receipt)}
                </span>
            </td>

            <td>${safe(item.service)}</td>

            <td>
                <span class="payment-badge">
                    ${safe(item.payment)}
                </span>
            </td>

            <td class="amount">
                KSh ${money(item.amount)}
            </td>

            <td>${safe(item.cashier)}</td>

        </tr>

    `).join("");

}


/*
========================================================
COLLECTION FORM
========================================================
*/

const form =
    document.getElementById(
        "collectionForm"
    );


const formCard =
    document.getElementById(
        "collectionFormCard"
    );


document
    .getElementById(
        "newCollectionButton"
    )
    .addEventListener(
        "click",
        openCollectionForm
    );


document
    .getElementById(
        "cancelCollection"
    )
    .addEventListener(
        "click",
        closeCollectionForm
    );


document
    .getElementById(
        "closeCollectionForm"
    )
    .addEventListener(
        "click",
        closeCollectionForm
    );


function openCollectionForm() {

    form.reset();


    document.getElementById(
        "collectionId"
    ).value = "";


    document.getElementById(
        "collectionDate"
    ).value =
        new Date()
            .toISOString()
            .split("T")[0];


    formCard.classList.remove(
        "hidden"
    );


    formCard.scrollIntoView({
        behavior: "smooth"
    });

}


function closeCollectionForm() {

    formCard.classList.add(
        "hidden"
    );

}


form.addEventListener(
    "submit",
    saveCollection
);


async function saveCollection(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "collectionId"
        ).value;


    const payload = {

        patient:
            document.getElementById(
                "patient"
            ).value.trim(),

        receipt:
            document.getElementById(
                "receipt"
            ).value.trim(),

        service:
            document.getElementById(
                "service"
            ).value,

        amount:
            document.getElementById(
                "amount"
            ).value,

        payment:
            document.getElementById(
                "payment"
            ).value,

        date:
            document.getElementById(
                "collectionDate"
            ).value,

        notes:
            document.getElementById(
                "notes"
            ).value.trim()

    };


    let action =
        id
            ? "editCollection"
            : "addCollection";


    if (id) {

        payload.id = id;

    }


    const button =
        document.getElementById(
            "saveCollectionButton"
        );


    button.disabled = true;

    button.innerHTML =
        `<span class="spinner"></span> Saving...`;


    const result =
        await apiRequest({

            action: action,

            ...payload

        });


    button.disabled = false;

    button.innerHTML =
        `<i class="fa-solid fa-check"></i>
         Save Collection`;


    if (result.success) {

        showToast(
            result.message ||
            "Collection saved successfully."
        );


        closeCollectionForm();

        loadDashboard();

        loadCollections();

    } else {

        showToast(
            result.message ||
            "Unable to save collection.",
            "error"
        );

    }

}


/*
========================================================
COLLECTION FILTER
========================================================
*/

document
    .getElementById(
        "applyFilter"
    )
    .addEventListener(
        "click",
        loadCollections
    );


async function loadCollections() {

    const filter =
        document.getElementById(
            "collectionFilter"
        ).value;


    const from =
        document.getElementById(
            "filterFrom"
        ).value;


    const to =
        document.getElementById(
            "filterTo"
        ).value;


    const result =
        await apiRequest({

            action: "getCollections",

            filter: filter,

            from: from,

            to: to

        });


    if (!result.success)
        return;


    document.getElementById(
        "filteredCount"
    ).textContent =
        result.count || 0;


    document.getElementById(
        "filteredTotal"
    ).textContent =
        "KSh " +
        money(result.total);


    renderCollections(
        result.collections || []
    );

}


function renderCollections(data) {

    const table =
        document.getElementById(
            "collectionsTable"
        );


    if (!data.length) {

        table.innerHTML = `
            <tr>
                <td colspan="8"
                    class="empty-row">
                    No collections found.
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML =
        data.map(item => `

        <tr>

            <td>${safe(item.date)}</td>

            <td>
                <span class="receipt">
                    ${safe(item.receipt)}
                </span>
            </td>

            <td>${safe(item.patient)}</td>

            <td>${safe(item.service)}</td>

            <td>
                <span class="payment-badge">
                    ${safe(item.payment)}
                </span>
            </td>

            <td class="amount">
                KSh ${money(item.amount)}
            </td>

            <td>${safe(item.cashier)}</td>

            <td>

                <div class="table-actions">

                    <button
                        class="table-btn edit"
                        onclick='editRecord(${JSON.stringify(item)})'>

                        <i class="fa-solid fa-pen"></i>

                    </button>


                    ${
                        currentUser.role === "admin"
                        ? `

                        <button
                            class="table-btn delete"
                            onclick="requestDelete('${item.id}')">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                        `
                        : ""
                    }

                </div>

            </td>

        </tr>

    `).join("");

}


/*
========================================================
EDIT
========================================================
*/

function editRecord(item) {

    document.getElementById(
        "collectionId"
    ).value =
        item.id;


    document.getElementById(
        "patient"
    ).value =
        item.patient || "";


    document.getElementById(
        "receipt"
    ).value =
        item.receipt || "";


    document.getElementById(
        "service"
    ).value =
        item.service || "";


    document.getElementById(
        "amount"
    ).value =
        item.amount || "";


    document.getElementById(
        "payment"
    ).value =
        item.payment || "";


    document.getElementById(
        "collectionDate"
    ).value =
        item.date || "";


    document.getElementById(
        "notes"
    ).value =
        item.notes || "";


    formCard.classList.remove(
        "hidden"
    );


    formCard.scrollIntoView({
        behavior: "smooth"
    });

}


/*
========================================================
DELETE
========================================================
*/

let deleteId = null;


function requestDelete(id) {

    if (
        currentUser.role !== "admin"
    ) {

        showToast(
            "Only administrators can delete records.",
            "error"
        );

        return;

    }


    deleteId = id;


    document
        .getElementById(
            "confirmModal"
        )
        .classList.remove(
            "hidden"
        );

}


document
    .getElementById(
        "cancelDelete"
    )
    .addEventListener(
        "click",
        () => {

            deleteId = null;

            document
                .getElementById(
                    "confirmModal"
                )
                .classList.add(
                    "hidden"
                );

        }
    );


document
    .getElementById(
        "confirmDelete"
    )
    .addEventListener(
        "click",
        async () => {

            if (!deleteId)
                return;


            const result =
                await apiRequest({

                    action:
                        "deleteCollection",

                    id:
                        deleteId

                });


            document
                .getElementById(
                    "confirmModal"
                )
                .classList.add(
                    "hidden"
                );


            deleteId = null;


            if (result.success) {

                showToast(
                    "Collection deleted successfully."
                );

                loadCollections();
                loadDashboard();

            } else {

                showToast(
                    result.message ||
                    "Delete failed.",
                    "error"
                );

            }

        }
    );


/*
========================================================
REPORTS
========================================================
*/

let selectedReportFilter =
    "daily";


document
    .querySelectorAll(
        ".report-tab"
    )
    .forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".report-tab"
                    )
                    .forEach(t =>
                        t.classList.remove(
                            "active"
                        )
                    );


                tab.classList.add(
                    "active"
                );


                selectedReportFilter =
                    tab.dataset.filter;

            }
        );

    });


document
    .getElementById(
        "applyReport"
    )
    .addEventListener(
        "click",
        loadReport
    );


async function loadReport() {

    const result =
        await apiRequest({

            action:
                "getCollections",

            filter:
                selectedReportFilter,

            from:
                document.getElementById(
                    "reportFrom"
                ).value,

            to:
                document.getElementById(
                    "reportTo"
                ).value

        });


    if (!result.success)
        return;


    document.getElementById(
        "reportTotal"
    ).textContent =
        "KSh " +
        money(result.total);


    renderReportTable(
        result.collections || []
    );


    renderChart(
        result.collections || []
    );

}


function renderReportTable(data) {

    const table =
        document.getElementById(
            "reportTable"
        );


    if (!data.length) {

        table.innerHTML = `
            <tr>
                <td colspan="6"
                    class="empty-row">
                    No data found for this period.
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML =
        data.map(item => `

        <tr>

            <td>${safe(item.date)}</td>

            <td>${safe(item.receipt)}</td>

            <td>${safe(item.service)}</td>

            <td>${safe(item.payment)}</td>

            <td class="amount">
                KSh ${money(item.amount)}
            </td>

            <td>${safe(item.cashier)}</td>

        </tr>

    `).join("");

}


/*
========================================================
CHART
========================================================
*/

let chart = null;


function renderChart(data) {

    const canvas =
        document.getElementById(
            "collectionChart"
        );


    if (chart) {

        chart.destroy();

    }


    const grouped = {};


    data.forEach(item => {

        if (
            !grouped[item.date]
        ) {

            grouped[item.date] = 0;

        }


        grouped[item.date] +=
            Number(item.amount) || 0;

    });


    chart =
        new Chart(canvas, {

            type: "line",

            data: {

                labels:
                    Object.keys(grouped),

                datasets: [{

                    label:
                        "Collections",

                    data:
                        Object.values(grouped),

                    tension: 0.4,

                    fill: true

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio:
                    false,

                plugins: {

                    legend: {
                        display: false
                    }

                },

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            callback:
                                value =>
                                "KSh " +
                                Number(value)
                                    .toLocaleString()

                        }

                    }

                }

            }

        });

}


/*
========================================================
ADMIN PDF
========================================================
*/

document
    .getElementById(
        "pdfButton"
    )
    .addEventListener(
        "click",
        generatePDF
    );


async function generatePDF() {

    /*
     * Frontend check.
     *
     * Backend ALSO checks the role.
     */

    if (
        currentUser.role !== "admin"
    ) {

        showToast(
            "Administrator privileges required.",
            "error"
        );

        return;

    }


    const button =
        document.getElementById(
            "pdfButton"
        );


    button.disabled = true;

    button.innerHTML =
        `<span class="spinner"></span>
         Generating...`;


    const result =
        await apiRequest({

            action:
                "generatePDF",

            filter:
                selectedReportFilter,

            from:
                document.getElementById(
                    "reportFrom"
                ).value,

            to:
                document.getElementById(
                    "reportTo"
                ).value

        });


    button.disabled = false;

    button.innerHTML =
        `<i class="fa-solid fa-file-pdf"></i>
         Download PDF`;


    if (result.success) {

        showToast(
            "PDF report generated successfully."
        );


        /*
         * Open only the URL returned by
         * the authenticated backend.
         */

        if (result.url) {

            window.open(
                result.url,
                "_blank"
            );

        }

    } else {

        showToast(
            result.message ||
            "Unable to generate PDF.",
            "error"
        );

    }

}


/*
========================================================
USERS
========================================================
*/

async function loadUsers() {

    if (
        currentUser.role !== "admin"
    )
        return;


    const result =
        await apiRequest({

            action:
                "getUsers"

        });


    if (!result.success)
        return;


    const table =
        document.getElementById(
            "usersTable"
        );


    table.innerHTML =
        result.users.map(user => `

        <tr>

            <td>${safe(user.username)}</td>

            <td>${safe(user.name)}</td>

            <td>
                <span class="role-badge">
                    ${safe(user.role)}
                </span>
            </td>

            <td>

                <span class="
                    ${user.active
                        ? "active-badge"
                        : "inactive-badge"}
                ">

                    ${user.active
                        ? "Active"
                        : "Inactive"}

                </span>

            </td>

        </tr>

    `).join("");

}


/*
========================================================
MOBILE SIDEBAR
========================================================
*/

document
    .getElementById(
        "menuButton"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "sidebar"
                )
                .classList.toggle(
                    "open"
                );


            document
                .getElementById(
                    "sidebarOverlay"
                )
                .classList.toggle(
                    "show"
                );

        }
    );


document
    .getElementById(
        "sidebarOverlay"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "sidebar"
                )
                .classList.remove(
                    "open"
                );


            document
                .getElementById(
                    "sidebarOverlay"
                )
                .classList.remove(
                    "show"
                );

        }
    );


/*
========================================================
LOGOUT
========================================================
*/

document
    .getElementById(
        "logoutButton"
    )
    .addEventListener(
        "click",
        performLogout
    );


/*
========================================================
INACTIVITY HANDLING
========================================================
*/

let lastActivity =
    Date.now();


const ACTIVITY_TIMEOUT =
    14 * 60 * 1000;


[
    "mousemove",
    "mousedown",
    "keydown",
    "touchstart",
    "scroll"
].forEach(event => {

    document.addEventListener(
        event,
        () => {

            lastActivity =
                Date.now();

        },
        { passive: true }
    );

});


setInterval(() => {

    if (
        Date.now() -
        lastActivity >
        ACTIVITY_TIMEOUT
    ) {

        performLogout();

    }

}, 30000);


/*
========================================================
HELPERS
========================================================
*/

function money(value) {

    return Number(value || 0)
        .toLocaleString(
            "en-KE",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


function safe(value) {

    if (
        value === null ||
        value === undefined
    )
        return "";


    return String(value)
        .replace(
            /[&<>"']/g,
            char => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[char])
        );

}


/*
========================================================
INITIALIZE
========================================================
*/

loadDashboard();

loadCollections();
```
