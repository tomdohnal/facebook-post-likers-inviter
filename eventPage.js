chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	switch (request.todo) {
		case "SHOW_PAGE_ACTION":
			chrome.tabs.query({active: true, currentWindow: true}, function  (tabs) {
				chrome.pageAction.show(tabs[0].id);
			});

			break;
		case "SHOW_DIALOG_NOT_OPEN_NOTIFICATION":
			var notificationOptions = {
				type: 'basic',
				iconUrl: 'icon48.png',
				title: 'Open post likers dialog',
				message: 'Open the dialog with the list of the post likers so that we can invite them. If you don\'t now how, click the "I need more instructions" link in this extesion\'s windows.',
			};

			chrome.notifications.create('DIALOG_NOT_OPEN', notificationOptions);

			break;
		case "SHOW_NO_UNINVITED_LIKERS_NOTIFICATION":
			var notificationOptions = {
				type: 'basic',
				iconUrl: 'icon48.png',
				title: 'Everyone invited',
				message: 'Everyone who could be invited has been invited. Create a new post and get new likers!',
			};

			chrome.notifications.create('NO_UNINVITED_LIKERS', notificationOptions);

			break;
		case "SHOW_500_INVITATIONS_PER_DAY_LIMIT_REACHED_NOTIFICATION":
			var notificationOptions = {
				type: 'basic',
				iconUrl: 'icon48.png',
				title: 'Daily limit reached',
				message: 'It looks like you\'ve reached the Facebook\'s 500-invitations-per-day limit.'
			};

			chrome.notifications.create('limitReached', notificationOptions);

			break;
	}
});
