/**
 * Deno CLI script to add reminders to Apple's Reminders app parsing the
 * due date with natural language.
 * Requires reminders-cli (https://github.com/keith/reminders-cli) to be
 * installed in order to run. Uses reminders-cli instead of Applescript/JXA
 * because reminders-cli is much faster.
 * Uses chrono-node (https://github.com/wanasit/chrono) to parse the date (which
 * in my opinion works better than reminders-cli's natural lanaguage parser).
 *
 * Example usage:
 * ```
 * quick-reminders add "Doctor appointment in 2 weeks at 5pm"
 * ```
 */
import chrono from "https://esm.sh/chrono-node";
import Denomander from "https://deno.land/x/denomander/mod.ts";
import { miniexec } from "https://deno.land/x/miniexec/mod.ts";
import * as Colors from "https://deno.land/std/fmt/colors.ts";
import { format } from "https://deno.land/std/datetime/mod.ts";

interface Arguments {
  text: string;
  list?: string;
  verbose?: boolean;
}

const program = new Denomander({
  app_name: "Quick Reminders",
  app_description: "Quickly add new reminders to Apple's Reminders app",
})

program.command("add [text]", "Add a new reminder")
  .option("-l, --list", "The reminder's list")
  .option("-v, --verbose", "Show verbose output")
  .parse(Deno.args);

async function run() {
  // Get input args.
  const args = program as unknown as Arguments;

  // Ensure reminders-cli is installed.
  try {
    await miniexec(`reminders`, { printOutput: args.verbose });
  } catch (_err) {
    console.log("_err", _err.message);
    throw new Error(
      `Reminders CLI doesn't seem to be installed. See https://github.com/keith/reminders-cli.`
    );
  }


  // Get default reminders list.
  // Since the reminders.app API doesn't expose the "default" list, we'll pick
  // the first one available from the list of reminders list (which follows the
  // order set in the Reminder app).
  const remindersCLIShowListsStdout = await miniexec("reminders show-lists", { printOutput: args.verbose });
  const availableReminderListNames = remindersCLIShowListsStdout.split("\n");
  const defaultReminderListName = availableReminderListNames[0];
  if (!defaultReminderListName) {
    throw new Error("Unable to load reminder lists");
  }
  if (args.list && !availableReminderListNames.includes(args.list)) {
    throw new Error(`The specified list does not exist: "${args.list}". Available lists: ${availableReminderListNames.join(", ")}`)
  }
  const reminderListName = args.list || defaultReminderListName;

  // Extract the natural-lanaguage date from the input string using chrono-node.
  const chronoParsingResult = chrono.parse(args.text)[0];
  const naturalLanguageDueDate = chronoParsingResult?.text || "";
  const reminderText = args.text.replace(naturalLanguageDueDate, "").trim();
  const reminderDueDate = chronoParsingResult?.start?.date();

  // Use reminders-cli to add the reminder to reminders.app.
  await miniexec(
    reminderDueDate
      ? `reminders add ${reminderListName} "${reminderText}" --due-date "${reminderDueDate}"`
      : `reminders add ${reminderListName} "${reminderText}"`
      , { printOutput: args.verbose });
  const prettyCheckMark = Colors.green("✔");
  const prettyReminderText = Colors.magenta(reminderText);
  const prettyReminderListName = Colors.magenta(reminderListName);
  if (reminderDueDate) {
    const prettyReminderDueDate = Colors.magenta(
      format(reminderDueDate, "yyyy-MM-dd HH:mm:ss")
    );
    console.log(
      `${prettyCheckMark} Added a new "${prettyReminderText}" reminder to the "${prettyReminderListName}" list with due date ${prettyReminderDueDate}`
    );
  } else {
    console.log(
      `${prettyCheckMark} Added a new "${prettyReminderText}" reminder to the "${prettyReminderListName}"`
    );
  }
}

try {
  await run();
} catch (err) {
  console.error(`${Colors.red("✘")} ${err?.message}`);
}
