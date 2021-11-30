# 🐇 Quick Reminders CLI

A tiny CLI to create new reminders in the Apple's Reminders app using a natural language parser. 

Quick Reminders is written in Deno and uses [`reminders-cli`](https://github.com/keith/reminders-cli) to communicate with the Reminders app.


## Usage

```
Commands:
add [text]            Add a new reminder

Options:
-h --help             Help Screen
-l --list             Target list for the reminder
-v --verbose          Show debugging output
```

If no list is specified, reminders will be added to the first available list. 

## Examples 

```bash
» quick-reminders add "Doctor appointment tomorrow"
✔ Added a new "Doctor appointment" reminder to the "Inbox" list with due date 2021-12-01 23:12:37
```

```bash
» quick-reminders add "Take the aspirin on monday at 2am"
✔ Added a new "Take the aspirin" reminder to the "Inbox" list with due date 2021-11-29 02:00:00
```

```bash
» quick-reminders add "Check the bank account in two weeks" --list=Finance
✔ Added a new "Check the bank account in two weeks" reminder to the "Finance" list with due date 2021-12-16 11:12:37
```

## Setup

With [Homebrew](https://docs.brew.sh/):
```bash
brew install mmazzarolo/formulae/quick-reminders-cli
```

Or from the [GitHub releases section](https://github.com/mmazzarolo/quick-reminders-cli/releases/latest):
```bash
tar -zxvf quick-reminders.tar.gz
mv quick-reminders /usr/local/bin
rm quick-reminders.tar.gz
```
