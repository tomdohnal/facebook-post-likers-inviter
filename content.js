chrome.runtime.sendMessage({ todo: "SHOW_PAGE_ACTION" });

var newInvites = [];
var prevDailyInvitesCount;

function getInviteButtons () {
	var inviteButtonSelectors = 'a._42ft._4jy0._4jy3._517h._51sy:not(._59pe):not(.hidden_elem):not(.addLocation):not(.editPhoto):not(.fbPhotosPhotoActionsTag):not(.layerCancel)';

	var buttons = Array.prototype.slice.call(document.querySelectorAll(inviteButtonSelectors));

	if (buttons.length > 0) {
		return buttons.filter(function (button) {
			var ajax = button.getAttribute("ajaxify");

			if (ajax != null && ajax.indexOf("/invite/") >= 0) {
				return button;
			}
		});
	}

	return [];
}

function isLikersDialogOpen () {
	return document.querySelectorAll("._2pi9._2pie").length > 0
}

function getNumberOfListItems () {
	return document.querySelectorAll("._5i_q").length;
}

function notifyDialogNotOpen () {
	chrome.runtime.sendMessage({ todo: "SHOW_DIALOG_NOT_OPEN_NOTIFICATION" });
}

function nobodyToInvite () {
	logInvitations();
	notifyNoUninvitedLikers();
} 

function resetNewInvites () {
	newInvites = [];
}

function notifyNoUninvitedLikers () {
	chrome.runtime.sendMessage({ todo: "SHOW_NO_UNINVITED_LIKERS_NOTIFICATION" });
}

function isSeeMoreButton () {
	return document.querySelectorAll("#reaction_profile_pager:not(.alocal_saving) > div > a").length > 0;
}

function isLoadingSeeMoreButton () {
	return document.querySelectorAll("#reaction_profile_pager.alocal_saving > div > a").length > 0;
}

function clickSeeMoreButton () {
	document.querySelector("#reaction_profile_pager > div > a").click();
}

function waitToLoadAndHandleInvitingAgain (prevNumberOfListItems) {
	return tickTack = setInterval(function () {
		if (prevNumberOfListItems < getNumberOfListItems() || (!isSeeMoreButton() && !isLoadingSeeMoreButton())) {
			clearInterval(tickTack);
			
			handlePostLikersInviting();
		}
	}, 10);
}

function is500InvitationsPerDayLimitReached() {
	return (prevDailyInvitesCount + newInvites.length) >= 500;
}

function notify500InvitationsPerDayLimitReached () {
	chrome.runtime.sendMessage({ todo: "SHOW_500_INVITATIONS_PER_DAY_LIMIT_REACHED_NOTIFICATION" });
}

function logInvitations () {
	chrome.storage.local.get('invites', function (storage) {
		var updatedInvites = storage.invites ? storage.invites.concat(newInvites) : newInvites;

		chrome.storage.local.set({ 'invites': updatedInvites }, function () {
			// sends a message to popup.js to update stats
			chrome.runtime.sendMessage({ todo: "UPDATE_INVITE_STATS" });
		});

		resetNewInvites();
	});
}

function handlePostLikersInviting () {
	var inviteButtons = getInviteButtons();

	if (inviteButtons.length == 0) {
		if (isSeeMoreButton()) {
			var prevNumberOfListItems = getNumberOfListItems();
			clickSeeMoreButton();

			return waitToLoadAndHandleInvitingAgain(prevNumberOfListItems);
		}

		return nobodyToInvite();
	}
	
	for (var i = 0; i < inviteButtons.length; i++) {
		var ajax = inviteButtons[i].getAttribute("ajaxify");

		if (ajax != null && ajax.indexOf("/invite/") >= 0) {
			if (is500InvitationsPerDayLimitReached()) {
				return notify500InvitationsPerDayLimitReached();
			}

			inviteButtons[i].click();
			
			newInvites.push(Date.now());
		}
	}

	if (isSeeMoreButton()) {
		var prevNumberOfListItems = getNumberOfListItems();
		clickSeeMoreButton();
		
		return waitToLoadAndHandleInvitingAgain(prevNumberOfListItems);
	}
	return nobodyToInvite();
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.todo == "INVITE_POST_LIKERS") {
		if (! isLikersDialogOpen()) {
			return notifyDialogNotOpen();
		}

		// we have to set the number of invited persons per day variable as we will check if it reached the limit
		chrome.storage.local.get('invites', function (storage) {
			prevDailyInvitesCount = storage.invites ? storage.invites.filter(function (invite) {
				return invite > (Date.now() - 24 * 60 * 60 * 1000);
			}).length : 0;
		});

		return handlePostLikersInviting();
	}
});
