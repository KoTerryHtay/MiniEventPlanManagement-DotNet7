/**
 * @typedef {Object} GuestAssignment
 * @property {number} id
 * @property {number} guestId
 * @property {string} guestName
 * @property {number} eventId
 * @property {string} eventName
 * @property {number} tableId
 * @property {string} tableName
 * @property {string} rsvpStatus
 * @property {boolean} isCheckedIn
 * @property {string|null} checkedInAt
 */

/**
 * @typedef {Object} EventTable
 * @property {number} id
 * @property {string} name
 * @property {number} capacity
 * @property {GuestAssignment[]} guestAssignments
 */

/**
 * @typedef {Object} EventData
 * @property {number} id
 * @property {string} name
 * @property {string} eventDate
 * @property {string} createdDate
 * @property {EventTable[]} tables
 */