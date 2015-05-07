#Branch2 Ionic Test


##Instructions
This task is based on a simplified version of a typical project at Branch2. You will need to develop an app using Ionic Framework that meets the following requirements:

- [x] Users have accounts and can log in
- [x] Users set goals for themselves with two parts - the name of the activity, and how many times per day they would like to complete this. (See mockup in goal-tracking.png)
- [x] Users can track how many times they have completed that activity that day. (See mockup in goal-tracking.png).
- [x] Use of a backend API such as FireBase is required. FireBase is recommended but not required, and if you choose to use another backend technology please communicate that in the README.md file for the project. Include any other needed info in the README as well.

This is purposely an open-ended task, and you should feel free to implement it however you choose. The mockups are only to communicate functionality and are not how the final product needs to look, feel free to change the UI as you wish.

Please build this app and commit your code when finished.

##Bonus points:

Pick and choose any additional bonus tasks you would like to add, these are in no particular order.

 - [x] Add any additional styles you wish, in order to improve the UI
 - [ ] Implement other ways of defining and tracking goals. Be creative.
 - [ ] Implement a graph of the user's progress over time. Feel free to load your backend with historical data. Use of D3.js is recommended but not required.
 - [ ] If a user has multiple goals, try to find correlations between their performance on one goal and their performance on another to create an insight such as "When you drink 5 glasses of water per day you are less likely to eat cake." Display these insights in the app somewhere.

---------------------------

##Running The App
1. ``npm install``
2. ``ionic platform add ios``
3. ``ionic serve`` to run in the browser or ``ionic build ios`` + ``ionic emulate ios`` to run in iphone emulator
4. Create a new user, or just log in with email: "demo@demo.com", password: "demo"


##Enhancement List
* Implement a slidebox on the goal details view so user can swipe between goal details/editing and one or more graphs of the user's progress over time (D3 line graph of percentage of target reached each day, pie chart showing portion of days with no progress, some progress, progress that met or exceeded target).
* Progress meter for each goal in goal list view using D3
* Only cumulative progress is stored for each day that there is activity.  This is all that is needed for the app requirements and the enhancements above, but if more fine-grained analytics are required in the future it may become necessary to record more information for each instance of progress on a goal.
* Perform some filtering on goals that have been completed for the day.  Either moving them to the bottom, lowering their opacity, or turning them green could work


##Known Issues
* ng-class directive to turn login screen icons red on incorrect email or password are having no effect
* Styles for new goal "Save" button should match those for the "Delete" button on the edit goal form (currently "Save" is a button-block and "Delete" is a button-clear)
* Long goal names are getting left aligned on details nav bar
* Login and Signup views should have an indicator that lets the user know that they can swipe back to the welcome screen
* Edit goal form should either save each field as soon as it is changed and show a transient success message to the user letting them know their changes were persisted, or saving should require an explicit action.  Currently it is not intuitive that changes are saved by tapping to go back to the goals list
* It would probably make more sense to reverse the nesting of or denormalize the goals and users in the Firebase database, especially if any data other than goals needed to be stored for users.  Since Firebase is handling auth there is no current need for storing more user information, so usernames are just keys in the goals collection.  
