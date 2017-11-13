1) Adding created timestamp and last modified timestamp for each entry (default to be same as when the entry is created), 
either as extra columns in the table or tooltip for each entry, 
or another more novel way. The choice is yours but there must be at least 1 way. 
WW: Created timestamp will display in the right hand side of the to do list. 
However the last modified timestamp will display in edit mode.

2) Adding body text to the note, as an extra field. Let us restrict to a text of up to 140 alphanumeric characters 
(only 1-9, a-z, A-Z are allowed)? 
WW: The validation functions are in the validation.js. 

3) You should sanitise the body text before saving so that it contains strictly 1 space 
between each words and each word contains no more than 30 characters. 
If there are more than 1 spaces, truncate to 1. 
If there are any words longer than 30 characters, trim them to the first 30 characters. 
E.g.  "the fox" would be unchanged "the  123456789012345678901234567890 1" would be "the 123456789012345678901234567890" 
WW: The sanitise functions are in the sanitizer.js.

4) Restriction of deletion of entries to only those that are marked as 'completed'. 
If user tries to delete an incomplete entry, he/she should see an error message that 
they must first mark the entry as complete before deleting. Usage of a warning/error popup to inform user, 
user can click on an 'X' sign to close it or press Escape. 
Alert() is not allowed. The popup should fade away by itself in 3 seconds if left alone. 
WW: Modified the UX to display the delete icon for entry that marked as completed. This will eliminated the need 
to check and alert user.

5) Add a search box to filter out entries with either name or description containing the search query. 
You should start filtering if the search query is at least 3 characters. 
Any queries less than 3 charcters should return the whole list. Hint: Keypress event and setInterval 
E.g. Entry A has name 'meet a friend' and description 'bugis mrt. 7.30pm' 
Entry B has name 'swimming' and description 'toa payoh swimming cplx. 8am' .... among other entries 
 
Typing 'fr' should show the whole list Typing 'friend' should filter to a subset with entry A but not B 
Typing 'swim' should filter to a subset with entry B but not A 
Typing 'shopping' should filter to a subset  with neither A nor B 
Emptying the search box should show the whole list again
WW: Added a new filterBy function in TodoList collection. Called the filterBy function by filterOnPress in AppView.

6) Saved history of CRUD actions done on the entries (created, mark as complete/incomplete, modify name, delete). 
How you want to display it is entirely up to you
WW: auditingService.js to save the history of CRUD actions. It will display as activities in the right hand side of the screen.

7) However you like, but please indicate any JavaScript MVC frameworks or libraries that you use.
WW: Using moment.js to format the created/last updated dates.