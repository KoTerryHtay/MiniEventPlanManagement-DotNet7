/// <reference path="~/js/types/event-data-types.js" />
$(document).ready(function () {
    // ==========================================
    // Global Variables (UNCHANGED)
    // ==========================================
    var eventDataElement = document.getElementById('eventDataScript');
    if (!eventDataElement) return;
    /** @type {EventData} */
    var eventData = JSON.parse(eventDataElement.textContent);
    var allGuests = [];
    var currentSelectedTableId = "all";
    var eventId = $("#currentEventId").val();
    console.log("eventData >>>", eventData);

    // Initialize Data - Updated for new DTO structure (UNCHANGED LOGIC)
    if (eventData.tables && eventData.tables.length > 0) {
        $.each(eventData.tables, function (i, table) {
            if (table.guestAssignments && table.guestAssignments.length > 0) {
                $.each(table.guestAssignments, function (j, assignment) {
                    var guest = {
                        id: assignment.id,
                        guestId: assignment.guestId,
                        fullName: assignment.guestName,
                        phone: null,
                        rsvpStatus: (assignment.rsvpStatus || '').trim(),
                        isCheckedIn: assignment.isCheckedIn,
                        checkedInAt: assignment.checkedInAt,
                        tableId: assignment.tableId,
                        tableName: assignment.tableName
                    };
                    var exists = $.grep(allGuests, function (g) { return g.guestId === guest.guestId; }).length > 0;
                    if (!exists) allGuests.push(guest);
                });
            }
        });
    }

    // ==========================================
    // 1. Table Click Handler (LOGIC UNCHANGED, UI UPDATED)
    // ==========================================
    $(".table-btn").click(function () {
        var tableId = $(this).data("table-id");
        var tableName = $(this).data("table-name");
        currentSelectedTableId = tableId;

        // Update Active State Classes (Tailwind)
        $(".table-btn")
            .removeClass("bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600 ring-offset-2")
            .addClass("bg-white text-gray-700 border border-gray-300 hover:bg-gray-50");

        $(this)
            .removeClass("bg-white text-gray-700 border border-gray-300 hover:bg-gray-50")
            .addClass("bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600 ring-offset-2");

        if (tableId === "all") {
            $("#btnAssignGuest").addClass("hidden").removeClass("flex");
        } else {
            $("#btnAssignGuest").removeClass("hidden").addClass("flex");
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

    // Initial Render
    renderGuestTable(allGuests);

    // ==========================================
    // 2. Feature: Create Table (AJAX UNCHANGED, UI UPDATED)
    // ==========================================
    $("#btnSaveTable").click(function () {
        var tableName = $("#newTableName").val().trim();
        if (!tableName) {
            Swal.fire({ icon: 'warning', title: 'Warning', text: 'Please enter table name.' });
            return;
        }

        $.ajax({
            url: "/api/tables/create",
            type: "POST",
            data: { Name: tableName, EventId: parseInt(eventId) },
            success: function (response) {
                var newTable = response.Data;
                if (!newTable || !newTable.Id) {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Invalid response from server.' });
                    return;
                }

                // Tailwind Styled Table Button
                var newTableHtml = '<button type="button" class="table-btn px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 m-1" ' +
                    'data-table-id="' + newTable.Id + '" ' +
                    'data-table-name="' + escapeHtml(newTable.Name) + '">' +
                    escapeHtml(newTable.Name) +
                    ' <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">0 / ' + (newTable.Capacity || 4) + '</span>' +
                    '</button>';

                $("#tablesContainer").append(newTableHtml);
                $("#newTableName").val("");

                // Close Modal (Assuming custom modal helper or keeping BS modal logic if mixed)
                if (typeof closeModal !== 'undefined') closeModal('createTableModal');
                else $('#createTableModal').modal('hide');

                Swal.fire({ icon: 'success', title: 'Created!', text: 'Table created successfully.', timer: 1500, showConfirmButton: false });
            },
            error: function (xhr, status, error) {
                var msg = "Error creating table.";
                try { var errData = JSON.parse(xhr.responseText); if (errData.Message) msg = errData.Message; } catch (e) { }
                Swal.fire({ icon: 'error', title: 'Error', text: msg });
            }
        });
    });

    // ==========================================
    // 3. Feature: Create Guest (AJAX UNCHANGED)
    // ==========================================
    $("#btnSaveGuest").click(function () {
        var fullName = $("#newGuestName").val().trim();
        if (!fullName) {
            Swal.fire({ icon: 'warning', title: 'Warning', text: 'Please enter guest name.' });
            return;
        }

        $.ajax({
            url: "/api/guests/create",
            type: "POST",
            data: { FullName: fullName },
            success: function (response) {
                if (response.IsSuccess) {
                    Swal.fire({ icon: 'success', title: 'Guest Created!', text: 'The guest has been created successfully.', confirmButtonColor: '#4f46e5', timer: 2000, showConfirmButton: false });
                    // Note: Original code had location.href commented out. Keeping as is.
                    if (currentSelectedTableId === "all") renderGuestTable(allGuests);
                    $("#newGuestName").val("");
                    if (typeof closeModal !== 'undefined') closeModal('createGuestModal');
                    else $('#createGuestModal').modal('hide');
                    return;
                }
                if (currentSelectedTableId === "all") renderGuestTable(allGuests);
                $("#newGuestName").val("");
                if (typeof closeModal !== 'undefined') closeModal('createGuestModal');
                else $('#createGuestModal').modal('hide');
                Swal.fire({ icon: 'success', title: 'Success', text: 'Guest created successfully!' });
            },
            error: function () { Swal.fire({ icon: 'error', title: 'Error', text: 'Error creating guest.' }); }
        });
    });

    // ==========================================
    // 4. Feature: Assign Guest (AJAX UNCHANGED)
    // ==========================================
    // Note: Using 'shown.bs.modal' event still works if you trigger it manually in openModal() helper
    $('#assignGuestModal').on('shown.bs.modal', function () {
        if (currentSelectedTableId === "all") return;

        var $dropdown = $("#guestSelectDropdown");
        $dropdown.empty().append('<option value="">-- Loading... --</option>');
        if ($dropdown.hasClass("select2-hidden-accessible")) {
            $dropdown.select2('destroy');
        }

        $.ajax({
            url: "/api/guests/check-event/" + eventId,
            type: "GET",
            success: function (response) {
                $dropdown.empty().append('<option value=""></option>');
                if (response && response.Data && response.Data.length > 0) {
                    $.each(response.Data, function (i, guest) {
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

                // Select2 with Tailwind-friendly dropdownParent
                $dropdown.select2({
                    placeholder: "Search for a guest...",
                    allowClear: true,
                    dropdownParent: $('#assignGuestModal'),
                    // Optional: Add custom classes to Select2 container via adapter or CSS
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
            Swal.fire({ icon: 'warning', title: 'Warning', text: 'Please select a guest.' });
            return;
        }

        $.ajax({
            url: "/api/guests/assign",
            type: "POST",
            data: {
                Id: parseInt(guestId),
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

                if (typeof closeModal !== 'undefined') closeModal('assignGuestModal');
                else $('#assignGuestModal').modal('hide');

                Swal.fire({ icon: 'success', title: 'Assigned!', text: 'Guest assigned successfully.', timer: 1500, showConfirmButton: false })
                    .then(() => { window.location.href = `/events/${eventId}`; });
            },
            error: function () { Swal.fire({ icon: 'error', title: 'Error', text: 'Error assigning guest.' }); }
        });
    });

    // ==========================================
    // 5. RSVP & CheckIn Handlers (AJAX UNCHANGED, UI FEEDBACK UPDATED)
    // ==========================================
    $(document).on("change", ".rsvp-select", function () {
        var guestId = $(this).data("guest-id");
        var newStatus = $(this).val();
        var $select = $(this);
        var tableId = $(this).attr("data-table-id");

        $.ajax({
            url: "/api/guest/rsvp",
            type: "POST",
            data: { Id: guestId, RsvpStatus: newStatus, TableId: tableId },
            success: function (response) {
                // Visual feedback via Tailwind classes
                $select.addClass("ring-2 ring-green-500 border-transparent");
                setTimeout(function () { $select.removeClass("ring-2 ring-green-500 border-transparent"); }, 1500);

                var cached = $.grep(allGuests, function (g) { return g.id == guestId; })[0];
                if (cached) cached.rsvpStatus = newStatus;

                window.location.href = `/events/${eventId}`;
            },
            error: function (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'RSVP update လုပ်ရာတွင် အမှားရှိနေပါသည်။' });
            }
        });
    });

    $(document).on("change", ".checkin-toggle", function () {
        var guestId = $(this).data("guest-id");
        var isCheckedIn = $(this).is(":checked");
        var $checkbox = $(this);
        var row = $checkbox.closest("tr");
        var timeCell = row.find(".checked-in-at-cell");
        var tableId = $(this).data("table-id");

        // Optimistic UI Update
        if (isCheckedIn) {
            row.addClass("bg-green-50/60");
            timeCell.text(new Date().toLocaleString());
        } else {
            row.removeClass("bg-green-50/60");
            timeCell.text('-');
        }

        $.ajax({
            url: "/api/guest/checkin",
            type: "POST",
            data: { Id: guestId, IsCheckdIn: isCheckedIn, TableId: tableId },
            success: function (response) {
                if (isCheckedIn) {
                    row.addClass("bg-green-50/60");
                    var now = new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                    timeCell.text(now);
                } else {
                    row.removeClass("bg-green-50/60");
                    timeCell.text('-');
                }
                var cached = $.grep(allGuests, function (g) { return g.id == guestId; })[0];
                if (cached) {
                    cached.isCheckdIn = isCheckedIn;
                    cached.checkedInAt = isCheckedIn ? new Date().toISOString() : null;
                }
                window.location.href = `/events/${eventId}`;
            },
            error: function (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Check-in update လုပ်ရာတွင် အမှားရှိနေပါသည်။' });
                $checkbox.prop("checked", !isCheckedIn); // Revert
                if (!isCheckedIn) row.removeClass("bg-green-50/60");
                else row.addClass("bg-green-50/60");
            }
        });
    });

    // ==========================================
    // Helper: Render Guest Table (TAILWIND UPDATED)
    // ==========================================
    function renderGuestTable(guests) {
        var tbody = $("#guestTableBody");
        tbody.empty();
        if (!guests || guests.length === 0) {
            tbody.append('<tr><td colspan="6" class="px-6 py-12 text-center text-gray-400 text-sm">No guests found.</td></tr>');
            return;
        }

        var rsvpOptions = ['Pending', 'Confirmed', 'Declined', 'Waitlist'];

        $.each(guests, function (index, guest) {
            var gid = guest.guestId || guest.id;

            // Premium Select Styling
            var selectHtml = '<select class="rsvp-select block w-full rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow cursor-pointer" data-guest-id="' + gid + '" data-table-id="' + guest.tableId + '">';
            $.each(rsvpOptions, function (i, status) {
                var selected = guest.rsvpStatus === status ? "selected" : "";
                // Color coding options could be done via JS on change, keeping simple for now
                selectHtml += '<option value="' + status + '" ' + selected + '>' + status + '</option>';
            });
            selectHtml += '</select>';

            var checkInChecked = guest.isCheckedIn ? "checked" : "";
            var rowClass = guest.isCheckedIn ? "bg-green-50/60 transition-colors duration-300" : "hover:bg-gray-50 transition-colors duration-200";
            var checkedInAtDisplay = guest.checkedInAt
                ? new Date(guest.checkedInAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : '<span class="text-gray-300">-</span>';

            // Custom Checkbox Styling (Tailwind)
            var checkboxHtml = '<input type="checkbox" class="checkin-toggle h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer transition-colors" data-guest-id="' + gid + '" data-table-id="' + guest.tableId + '" ' + checkInChecked + ' />';

            var row = '<tr class="' + rowClass + ' border-b border-gray-100 last:border-0">' +
                '<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">' + (index + 1) + '</td>' +
                '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">' + escapeHtml(guest.fullName) + '</td>' +
                '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">' + escapeHtml(guest.phone || '-') + '</td>' +
                '<td class="px-6 py-4 whitespace-nowrap text-sm">' + selectHtml + '</td>' +
                '<td class="px-6 py-4 whitespace-nowrap text-center">' + checkboxHtml + '</td>' +
                '<td class="px-6 py-4 whitespace-nowrap text-center text-xs text-gray-500 checked-in-at-cell font-mono">' + checkedInAtDisplay + '</td>' +
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