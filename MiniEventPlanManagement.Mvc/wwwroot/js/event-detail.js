$(document).ready(function () {
    // ==========================================
    // Global Variables
    // ==========================================
    var eventDataElement = document.getElementById('eventDataScript');
    if (!eventDataElement) return;

    var eventData = JSON.parse(eventDataElement.textContent);
    var allGuests = [];
    var currentSelectedTableId = "all"; // Track currently viewed table
    var eventId = $("#currentEventId").val();

    // Initialize Data
    if (eventData.tables && eventData.tables.length > 0) {
        $.each(eventData.tables, function (i, table) {
            if (table.guests && table.guests.length > 0) {
                $.each(table.guests, function (j, guest) {
                    guest.tableId = table.id;
                    guest.tableName = table.name;
                    guest.rsvpStatus = (guest.rsvpStatus || '').trim();

                    var exists = $.grep(allGuests, function (g) { return g.id === guest.id; }).length > 0;
                    if (!exists) allGuests.push(guest);
                });
            }
        });
    }

    // ==========================================
    // 1. Table Click Handler (Updated)
    // ==========================================
    $(".table-btn").click(function () {
        var tableId = $(this).data("table-id");
        var tableName = $(this).data("table-name");
        currentSelectedTableId = tableId; // Update global state

        $(".table-btn").removeClass("active");
        $(this).addClass("active");

        // Show/Hide Assign Button based on selection
        if (tableId === "all") {
            $("#btnAssignGuest").hide();
        } else {
            $("#btnAssignGuest").show();
        }

        var filteredGuests;
        if (tableId === "all") {
            filteredGuests = allGuests;
        } else {
            filteredGuests = $.grep(allGuests, function (g) { return g.tableId == tableId; });
        }

        $("#guestListTitle").text(tableName);
        renderGuestTable(filteredGuests);
    });

    renderGuestTable(allGuests);

    // ==========================================
    // 2. Feature: Create Guest
    // ==========================================
    $("#btnSaveGuest").click(function () {
        var fullName = $("#newGuestName").val().trim();
        if (!fullName) {
            alert("Please enter guest name.");
            return;
        }

        console.log("fullName >>>", fullName);

        /*
        $.ajax({
            url: "/api/guests/create",
            type: "POST",
            data: {
                FullName: fullName
            }, // Only FullName needed as per request
            success: function (response) {
                // Assuming response returns the created Guest object or at least Id
                // If API doesn't return full object, we might need to construct it or reload
                // Here assuming response has Id, FullName etc. or we construct a temp one

                var newGuest = {
                    id: response.id || Date.now(), // Fallback ID if not returned
                    fullName: fullName,
                    phone: null,
                    rsvpStatus: "Pending",
                    isCheckdIn: false,
                    checkedInAt: null,
                    tableId: null, // Not assigned yet
                    tableName: null
                };

                // If API returns the full object, use it:
                if (response.Data) newGuest = response.Data;

                allGuests.push(newGuest);

                // Re-render if viewing "All"
                if (currentSelectedTableId === "all") {
                    renderGuestTable(allGuests);
                }

                $("#newGuestName").val("");
                $('#createGuestModal').modal('hide');
                alert("Guest created successfully!");
            },
            error: function (error) {
                console.log(error);
                alert("Error creating guest.");
            }
        }); */
    });

    // ==========================================
    // 3. Feature: Assign Guest (With Search & Check)
    // ==========================================

    // When Assign Modal Opens -> Load Unassigned Guests
    $('#assignGuestModal').on('shown.bs.modal', function () {
        if (currentSelectedTableId === "all") return;

        var $dropdown = $("#guestSelectDropdown");
        $dropdown.empty().append('<option value="">-- Loading... --</option>');

        // Disable select2 temporarily if initialized
        if ($dropdown.hasClass("select2-hidden-accessible")) {
            $dropdown.select2('destroy');
        }

        // API: Check guests NOT in this table
        $.ajax({
            url: "/api/guests/check-table/" + currentSelectedTableId,
            type: "GET",
            success: function (response) {
                $dropdown.empty().append('<option value=""></option>'); // Placeholder for Select2

                console.log("assignGuestModal >>>", response)

                if (response && response.Data.length > 0) {
                    $.each(response.Data, function (i, guest) {
                        /*
                        {
                            "Id": 2,
                            "FullName": "Guest 2",
                            "Phone": null,
                            "RsvpStatus": "Pending   ",
                            "IsCheckdIn": false,
                            "CheckedInAt": null,
                            "TableId": 2,
                            "EventId": 2,
                            "Event": null,
                            "Table": null
                        }
                        */

                        console.log("guest >>>", guest);
                        $dropdown.append($('<option>', {
                            value: guest.Id,
                            text: guest.FullName + (guest.Phone ? ' (' + guest.Phone + ')' : '')
                        }));
                    });
                } else {
                    $dropdown.append('<option value="" disabled>No available guests found</option>');
                }

                // Initialize Select2 for Search functionality
                $dropdown.select2({
                    placeholder: "Search for a guest...",
                    allowClear: true,
                    dropdownParent: $('#assignGuestModal') // Important for Modal z-index
                });
            },
            error: function (error) {
                console.log(error);
                $dropdown.empty().append('<option value="">Error loading guests</option>');
            }
        });
    });

    // Save Assignment
    $("#btnAssignGuestSave").click(function () {
        var guestId = $("#guestSelectDropdown").val();

        if (!guestId) {
            alert("Please select a guest.");
            return;
        }
        console.log("#btnAssignGuestSave >>>", { guestId, currentSelectedTableId, eventId });
        /*
        $.ajax({
            url: "/api/guests/assign",
            type: "POST",
            data: {
                Id: parseInt(guestId),
                TableId: parseInt(currentSelectedTableId),
                EventId: parseInt(eventId)
            },
            success: function (response) {
                // Update Local Data
                var guestIndex = allGuests.findIndex(g => g.id == guestId);
                if (guestIndex > -1) {
                    allGuests[guestIndex].tableId = parseInt(currentSelectedTableId);
                    // Find table name
                    var tableBtn = $('.table-btn[data-table-id="' + currentSelectedTableId + '"]');
                    allGuests[guestIndex].tableName = tableBtn.data("table-name");
                }

                // Re-render current view
                var filteredGuests = $.grep(allGuests, function (g) { return g.tableId == currentSelectedTableId; });
                renderGuestTable(filteredGuests);

                $('#assignGuestModal').modal('hide');
                alert("Guest assigned successfully!");
            },
            error: function (error) {
                console.log(error);
                alert("Error assigning guest.");
            }
        }); */
    });

    // ==========================================
    // 4. Feature: Create Table
    // ==========================================
    $("#btnSaveTable").click(function () {
        var tableName = $("#newTableName").val().trim();
        if (!tableName) {
            alert("Please enter table name.");
            return;
        }
        console.log("#btnSaveTable >>>", { tableName, eventId });
        /*
        $.ajax({
            url: "/api/tables/create",
            type: "POST",
            data: {
                Name: tableName,
                EventId: parseInt(eventId)
            },
            success: function (response) {
                // Option 1: Reload Page (Simplest & Safest for UI consistency)
                // location.reload();

                // Option 2: Dynamic DOM Update (Better UX)
                // Assuming response contains the new Table object { id, name, capacity... }
                const newTable = response.Data;
                var newTableHtml = '<button type="button" class="btn btn-outline-primary m-1 table-btn" ' +
                    'data-table-id="' + newTable.id + '" data-table-name="' + newTable.name + '">' +
                    newTable.name + ' <span class="badge bg-light text-dark ms-1">0 / ' + (newTable.capacity || 4) + '</span>' +
                    '</button>';

                $("#tablesContainer").append(newTableHtml);

                // Update Count in Header (Optional logic needed here)

                $("#newTableName").val("");
                $('#createTableModal').modal('hide');
                alert("Table created successfully!");
            },
            error: function (error) {
                console.log(error);
                alert("Error creating table.");
            }
        }); */
    });

    // ==========================================
    // Existing: RSVP & CheckIn Logic (Keep from previous step)
    // ==========================================
    $(document).on("change", ".rsvp-select", function () {
        // ... (Previous RSVP Code) ...
        var guestId = $(this).data("guest-id");
        var newStatus = $(this).val();
        var tableId = $(this).attr("data-table-id");
        console.log("RSVP Update:", { guestId, newStatus, tableId });
        // Add AJAX call here if needed
    });

    $(document).on("change", ".checkin-toggle", function () {
        // ... (Previous CheckIn Code) ...
        var guestId = $(this).data("guest-id");
        var isCheckedIn = $(this).is(":checked");
        var $checkbox = $(this);
        var tableId = $(this).attr("data-table-id");

        // Visual Update
        var row = $checkbox.closest("tr");
        var timeCell = row.find(".checked-in-at-cell");
        if (isCheckedIn) {
            row.addClass("table-success");
            timeCell.text(new Date().toLocaleString());
        } else {
            row.removeClass("table-success");
            timeCell.text('-');
        }

        // Add AJAX call here if needed
    });

    // ==========================================
    // Helper: Render Guest Table
    // ==========================================
    function renderGuestTable(guests) {
        var tbody = $("#guestTableBody");
        tbody.empty();

        if (!guests || guests.length === 0) {
            tbody.append('<tr><td colspan="6" class="text-center text-muted py-4">No guests found.</td></tr>');
            return;
        }

        var rsvpOptions = ['Pending', 'Confirmed', 'Declined', 'Waitlist'];

        $.each(guests, function (index, guest) {
            var selectHtml = '<select class="form-select form-select-sm rsvp-select" data-guest-id="' + guest.id + '" data-table-id="' + guest.tableId + '">';
            $.each(rsvpOptions, function (i, status) {
                var selected = guest.rsvpStatus === status ? "selected" : "";
                selectHtml += '<option value="' + status + '" ' + selected + '>' + status + '</option>';
            });
            selectHtml += '</select>';

            var checkInChecked = guest.isCheckdIn ? "checked" : "";
            var rowClass = guest.isCheckdIn ? "table-success" : "";

            var checkedInAtDisplay = guest.checkedInAt
                ? new Date(guest.checkedInAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : '-';

            var row = '<tr class="' + rowClass + '">' +
                '<td>' + (index + 1) + '</td>' +
                '<td>' + escapeHtml(guest.fullName) + '</td>' +
                '<td>' + escapeHtml(guest.phone || '-') + '</td>' +
                '<td>' + selectHtml + '</td>' +
                '<td class="text-center"><input type="checkbox" class="form-check-input checkin-toggle" data-guest-id="' + guest.id + '" data-table-id="' + guest.tableId + '" ' + checkInChecked + ' /></td>' +
                '<td class="text-center small text-muted checked-in-at-cell">' + checkedInAtDisplay + '</td>' +
                '</tr>';

            tbody.append(row);
        });
    }

    function escapeHtml(text) {
        if (!text) return '';
        var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, function (m) { return map[m]; });
    }
});