$(document).ready(function () {
    // ==========================================
    // 1. Parse Embedded Model Data (No API Call)
    // ==========================================
    var eventData = JSON.parse(document.getElementById('eventDataScript').textContent);
    var allGuests = [];

    // Flatten guests from all tables into a single array for easy filtering
    if (eventData.tables && eventData.tables.length > 0) {
        $.each(eventData.tables, function (i, table) {
            if (table.guests && table.guests.length > 0) {
                $.each(table.guests, function (j, guest) {
                    // Attach table info to guest for reference
                    guest.tableId = table.id;
                    guest.tableName = table.name;
                    // Trim RsvpStatus whitespace from backend
                    guest.rsvpStatus = (guest.rsvpStatus || '').trim();
                    allGuests.push(guest);
                });
            }
        });
    }

    // ==========================================
    // 2. Table Click Handler (Client-Side Filter)
    // ==========================================
    $(".table-btn").click(function () {
        var tableId = $(this).data("table-id");
        var tableName = $(this).data("table-name");

        // Update active button state
        $(".table-btn").removeClass("active");
        $(this).addClass("active");

        var filteredGuests;
        if (tableId === "all") {
            filteredGuests = allGuests;
        } else {
            filteredGuests = $.grep(allGuests, function (g) { return g.tableId == tableId; });
        }

        $("#guestListTitle").text(tableName);
        renderGuestTable(filteredGuests);
    });

    // Initial render: Show all guests on page load
    renderGuestTable(allGuests);

    // ==========================================
    // 3. Update RSVP (API Call Only on Change)
    // ==========================================
    $(document).on("change", ".rsvp-select", function () {
        var guestId = $(this).data("guest-id");
        var newStatus = $(this).val();
        var $select = $(this);
        var tableId = $(this).data("table-id");
        console.log(".rsvp-select >>>", { guestId, newStatus, tableId });

        $.ajax({
            url: "/api/guest/rsvp",
            type: "POST",
            data: {
                // Id RsvpStatus TableId
                Id: guestId,
                RsvpStatus: newStatus,
                TableId: tableId,
            },
            success: function (response) {
                console.log("rsvp response >>>", response);
                $select.addClass("border-success");
                setTimeout(function () { $select.removeClass("border-success"); }, 1500);
                // Update local data cache
                var cached = $.grep(allGuests, function (g) { return g.id == guestId; })[0];
                if (cached) cached.rsvpStatus = newStatus;
            },
            error: function (error) {
                console.log(error);
                alert("RSVP update လုပ်ရာတွင် အမှားရှိနေပါသည်။");
            }
        });
    });

    // ==========================================
    // 4. Update Check-In (API Call Only on Change)
    // ==========================================
    $(document).on("change", ".checkin-toggle", function () {
        var guestId = $(this).data("guest-id");
        var isCheckedIn = $(this).is(":checked");
        var $checkbox = $(this);
        var tableId = $(this).data("table-id");

        console.log(".checkin-toggle >>>", { guestId, isCheckedIn, tableId });

        $.ajax({
            url: "/api/guest/checkin",
            type: "POST",
            data: {
                // Id IsCheckdIn TableId
                Id: guestId,
                IsCheckdIn: isCheckedIn,
                TableId: tableId
            },
            success: function (response) {
                var row = $checkbox.closest("tr");
                var timeCell = row.find("td:last");
                // CheckedInAt column
                console.log("checkin response >>>", response);

                if (isCheckedIn) {
                    row.addClass("table-success");
                    // Update time immediately without page refresh
                    var now = new Date().toLocaleString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    });
                    timeCell.text(now);
                } else {
                    row.removeClass("table-success");
                    timeCell.text('-');

                }
                // Update local data cache
                var cached = $.grep(allGuests, function (g) { return g.id == guestId; })[0];
                if (cached) {
                    cached.isCheckdIn = isCheckedIn;
                    cached.checkedInAt = isCheckedIn ? new Date().toISOString() : null;
                }
            },
            error: function (error) {
                console.log(error);
                alert("Check-in update လုပ်ရာတွင် အမှားရှိနေပါသည်။");
                $checkbox.prop("checked", !isCheckedIn);
                // Revert on error
            }
        });
    });

    // ==========================================
    // Helper: Render Guest Table
    // ==========================================
    function renderGuestTable(guests) {
        var tbody = $("#guestTableBody");
        tbody.empty();

        if (!guests || guests.length === 0) {
            tbody.append('<tr><td colspan="5" class="text-center text-muted py-4">No guests found.</td></tr>');
            return;
        }

        var rsvpOptions = ['Pending', 'Confirmed', 'Declined', 'Waitlist'];

        $.each(guests, function (index, guest) {
            var selectHtml = '<select class="form-select form-select-sm rsvp-select" data-guest-id="' + guest.id + '" data-table-id="' + guest.tableId + '"' + '">';
            //
            $.each(rsvpOptions, function (i, status) {
                var selected = guest.rsvpStatus === status ? "selected" : "";
                selectHtml += '<option value="' + status + '" ' + selected + '>' + status + '</option>';
            });
            selectHtml += '</select>';

            var checkInChecked = guest.isCheckdIn ? "checked" : "";
            var rowClass = guest.isCheckdIn ? "table-success" : "";

            var checkedInAtDisplay = guest.checkedInAt
                ? new Date(guest.checkedInAt).toLocaleString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                })
                : '-';

            var row = '<tr class="' + rowClass + '">' +
                '<td>' + (index + 1) + '</td>' +
                '<td>' + escapeHtml(guest.fullName) + '</td>' +
                '<td>' + escapeHtml(guest.phone || '-') + '</td>' +
                '<td>' + selectHtml + '</td>' +
                '<td class="text-center"><input type="checkbox" class="form-check-input checkin-toggle" data-guest-id="' + guest.id + '" ' + '" data-table-id="' + guest.tableId + '"' + checkInChecked + ' /></td>' +
                '<td class="text-center small text-muted">' + checkedInAtDisplay + '</td>' +
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