/// <reference path="~/js/types/event-data-types.js" />

$(document).ready(function () {
    // ==========================================
    // Global Variables
    // ==========================================
    var eventDataElement = document.getElementById('eventDataScript');
    if (!eventDataElement) return;

    /** @type {EventData} */
    var eventData = JSON.parse(eventDataElement.textContent);
    var allGuests = [];
    var currentSelectedTableId = "all";
    var eventId = $("#currentEventId").val();

    console.log("eventData >>>", eventData);

    // Initialize Data - Updated for new DTO structure
    if (eventData.tables && eventData.tables.length > 0) {
        $.each(eventData.tables, function (i, table) {
            if (table.guestAssignments && table.guestAssignments.length > 0) {
                $.each(table.guestAssignments, function (j, assignment) {
                    // Map GuestAssignmentDto to a flat guest object for UI rendering
                    var guest = {
                        id: assignment.id,             // Assignment ID
                        guestId: assignment.guestId,   // Actual Guest ID
                        fullName: assignment.guestName,// Mapped from GuestName
                        phone: null,                   // Not in Assignment DTO, handle separately if needed
                        rsvpStatus: (assignment.rsvpStatus || '').trim(),
                        isCheckedIn: assignment.isCheckedIn, // Fixed typo from isCheckdIn
                        checkedInAt: assignment.checkedInAt,
                        tableId: assignment.tableId,
                        tableName: assignment.tableName
                    };

                    // Use guestId as unique identifier for deduplication
                    var exists = $.grep(allGuests, function (g) { return g.guestId === guest.guestId; }).length > 0;
                    if (!exists) allGuests.push(guest);
                });
            }
        });
    }

    // ==========================================
    // 1. Table Click Handler
    // ==========================================
    $(".table-btn").click(function () {
        var tableId = $(this).data("table-id");
        var tableName = $(this).data("table-name");
        currentSelectedTableId = tableId;
        //console.log("currentSelectedTableId >>>", currentSelectedTableId);

        $(".table-btn").removeClass("active");
        $(this).addClass("active");

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
    // 2. Feature: Create Table (Updated for new DTO)
    // ==========================================
    $("#btnSaveTable").click(function () {
        var tableName = $("#newTableName").val().trim();
        if (!tableName) {
            alert("Please enter table name.");
            return;
        }

        console.log("#btnSaveTable >>>", { Name: tableName, EventId: eventId });

        
        $.ajax({
            url: "/api/tables/create",
            type: "POST",
            data: {
                Name: tableName,
                EventId: parseInt(eventId)
            },
            success: function (response) {
                console.log("Create Table Response >>>", response);

                // API returns Result<TableDto> -> response.Data contains TableDto
                var newTable = response.Data;

                if (!newTable || !newTable.Id) {
                    alert("Error: Invalid response from server.");
                    return;
                }

                // Dynamically add new table button to container
                var newTableHtml = '<button type="button" class="btn btn-outline-primary m-1 table-btn" ' +
                    'data-table-id="' + newTable.Id + '" ' +
                    'data-table-name="' + escapeHtml(newTable.Name) + '">' +
                    escapeHtml(newTable.Name) +
                    ' <span class="badge bg-light text-dark ms-1">0 / ' + (newTable.Capacity || 4) + '</span>' +
                    '</button>';

                $("#tablesContainer").append(newTableHtml);

                // Clear input & close modal
                $("#newTableName").val("");
                $('#createTableModal').modal('hide');
                alert("Table created successfully!");
            },
            error: function (xhr, status, error) {
                console.error("Create Table Error >>>", xhr.responseText);
                var msg = "Error creating table.";
                try {
                    var errData = JSON.parse(xhr.responseText);
                    if (errData.Message) msg = errData.Message;
                } catch (e) { }
                alert(msg);
            }
        }); 
    });

    // ==========================================
    // 3. Feature: Create Guest
    // ==========================================
    $("#btnSaveGuest").click(function () {
        var fullName = $("#newGuestName").val().trim();
        if (!fullName) {
            alert("Please enter guest name.");
            return;
        }

        // TODO: Uncomment and adjust when API is ready
        
        $.ajax({
            url: "/api/guests/create",
            type: "POST",
            data: { FullName: fullName },
            success: function (response) {
                if (currentSelectedTableId === "all") renderGuestTable(allGuests);
                $("#newGuestName").val("");
                $('#createGuestModal').modal('hide');
                alert("Guest created successfully!");
            },
            error: function () { alert("Error creating guest."); }
        });
        
    });

    // ==========================================
    // 4. Feature: Assign Guest
    // ==========================================
    $('#assignGuestModal').on('shown.bs.modal', function () {
        if (currentSelectedTableId === "all") return;
        console.log("on");

        var $dropdown = $("#guestSelectDropdown");
        $dropdown.empty().append('<option value="">-- Loading... --</option>');

        if ($dropdown.hasClass("select2-hidden-accessible")) {
            $dropdown.select2('destroy');
        }

        $.ajax({
            url: "/api/guests/check-table/" + currentSelectedTableId,
            type: "GET",
            success: function (response) {
                console.log("/api/guests/check-table/ >>>", response);

                $dropdown.empty().append('<option value=""></option>');

                if (response && response.Data && response.Data.length > 0) {
                    $.each(response.Data, function (i, guest) {
                        // Updated to use GuestId and GuestName/FullName based on API response
                        // Assuming check-table returns GuestDto or similar with Id/FullName
                        var val = guest.Id || guest.GuestId || guest.id;
                        var text = guest.FullName || guest.GuestName || guest.fullName;
                        var phone = guest.Phone || guest.phone;

                        $dropdown.append($('<option>', {
                            value: val,
                            text: text + (phone ? ' (' + phone + ')' : '')
                        }));
                    });
                } else {
                    $dropdown.append('<option value="" disabled>No available guests found</option>');
                }

                $dropdown.select2({
                    placeholder: "Search for a guest...",
                    allowClear: true,
                    dropdownParent: $('#assignGuestModal')
                });
            },
            error: function () {
                $dropdown.empty().append('<option value="">Error loading guests</option>');
            }
        });
    });

    $("#btnAssignGuestSave").click(function () {
        var guestId = $("#guestSelectDropdown").val();
        if (!guestId) {
            alert("Please select a guest.");
            return;
        }

        // TODO: Uncomment when API is ready
        /*
        $.ajax({
            url: "/api/guests/assign",
            type: "POST",
            data: {
                GuestId: parseInt(guestId),      // Changed from Id to GuestId
                TableId: parseInt(currentSelectedTableId),
                EventId: parseInt(eventId)
            },
            success: function (response) {
                var idx = allGuests.findIndex(g => g.guestId == guestId);
                if (idx > -1) {
                    allGuests[idx].tableId = parseInt(currentSelectedTableId);
                    var tableBtn = $('.table-btn[data-table-id="' + currentSelectedTableId + '"]');
                    allGuests[idx].tableName = tableBtn.data("table-name");
                }
                var filtered = $.grep(allGuests, function (g) { return g.tableId == currentSelectedTableId; });
                renderGuestTable(filtered);
                $('#assignGuestModal').modal('hide');
                alert("Guest assigned successfully!");
            },
            error: function () { alert("Error assigning guest."); }
        });
        */
    });

    // ==========================================
    // 5. RSVP & CheckIn Handlers
    // ==========================================
    $(document).on("change", ".rsvp-select", function () {
        var guestId = $(this).data("guest-id");
        var newStatus = $(this).val();
        var tableId = $(this).attr("data-table-id");
        console.log("RSVP Update:", { guestId, newStatus, tableId });
        // TODO: Add AJAX call
    });

    $(document).on("change", ".checkin-toggle", function () {
        var guestId = $(this).data("guest-id");
        var isCheckedIn = $(this).is(":checked");
        var $checkbox = $(this);
        var row = $checkbox.closest("tr");
        var timeCell = row.find(".checked-in-at-cell");

        if (isCheckedIn) {
            row.addClass("table-success");
            timeCell.text(new Date().toLocaleString());
        } else {
            row.removeClass("table-success");
            timeCell.text('-');
        }
        // TODO: Add AJAX call
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
            // Use guestId for data attributes to match DTO
            var gid = guest.guestId || guest.id;

            var selectHtml = '<select class="form-select form-select-sm rsvp-select" data-guest-id="' + gid + '" data-table-id="' + guest.tableId + '">';
            $.each(rsvpOptions, function (i, status) {
                var selected = guest.rsvpStatus === status ? "selected" : "";
                selectHtml += '<option value="' + status + '" ' + selected + '>' + status + '</option>';
            });
            selectHtml += '</select>';

            // Fixed property name: isCheckedIn (was isCheckdIn)
            var checkInChecked = guest.isCheckedIn ? "checked" : "";
            var rowClass = guest.isCheckedIn ? "table-success" : "";

            var checkedInAtDisplay = guest.checkedInAt
                ? new Date(guest.checkedInAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : '-';

            // Fixed property name: fullName mapped from guestName in initialization
            var row = '<tr class="' + rowClass + '">' +
                '<td>' + (index + 1) + '</td>' +
                '<td>' + escapeHtml(guest.fullName) + '</td>' +
                '<td>' + escapeHtml(guest.phone || '-') + '</td>' +
                '<td>' + selectHtml + '</td>' +
                '<td class="text-center"><input type="checkbox" class="form-check-input checkin-toggle" data-guest-id="' + gid + '" data-table-id="' + guest.tableId + '" ' + checkInChecked + ' /></td>' +
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