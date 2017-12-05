function onInvitePostLikersButtonClick () {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { todo: 'INVITE_POST_LIKERS' });
	});
}

function displayInviteStats () {	
	chrome.storage.local.get('invites', function (storage) {
		var dailyInvites = storage.invites && storage.invites.filter(function (invite) {
			return invite > (Date.now() - 24 * 60 * 60 * 1000);
		}).length;

		document.getElementById('dailyInvites').innerHTML = dailyInvites || 0;

		document.getElementById('totalInvites').innerHTML = storage.invites.length || 0;
		
	});
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.todo == "UPDATE_INVITE_STATS") {
		displayInviteStats();
	}
});

function onDOMContentLoaded () {
	document.getElementById('invitePostLikersButton').addEventListener('click', onInvitePostLikersButtonClick);
	displayInviteStats();
}

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
