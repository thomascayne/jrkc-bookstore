// config/keep-alive-config.ts

export type KeepAliveConfig = typeof keepAliveConfig

export const keepAliveConfig = {

    // the call to the database will be made to this table
    table: 'keep-alive',

    // Column that will be queried with a random string
    column: 'name',

    // Configuration for actions taken on the database
    allowInsertionAndDeletion: true, // Set this to false unless you're using a 'keep-alive'-dedicated table
    disableRandomStringQuery: false, // Set this to true if allowInsertionAndDeletion is true. Otherwise, no db actions taken
    sizeBeforeDeletions: 10, // Max size of table before any deletions start (if allowInsertionAndDeletion is true)

    consoleLogOnError: true,

    otherEndpoints: [
        
    ],

    // Cron schedule from environment variable
    cronSchedule: process.env.CRON_SCHEDULE || '* 4 * * *' // default to every 4 daily
}